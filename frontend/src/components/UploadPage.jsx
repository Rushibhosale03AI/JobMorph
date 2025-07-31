// src/components/UploadPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UploadPage.css";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

import {
  initializeModel,
  analyzeWithGemini,
  parseGeminiResponse,
  getLearningResourcesFromGemini,
} from "../components/geminiService"; // 

const MAX_SIZE_MB = 8; // limit large PDFs/DOCX
const ACCEPTED = [".pdf", ".docx"]; // (we ignore .doc because parsing is unreliable)

function humanFile(f) {
  if (!f) return "";
  const mb = (f.size / (1024 * 1024)).toFixed(2);
  return `${f.name} • ${mb} MB`;
}

const UploadPage = () => {
  const navigate = useNavigate();

  // form state
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [hint, setHint] = useState("");

  const dropRefResume = useRef(null);
  const dropRefJD = useRef(null);

  useEffect(() => {
    // warm the model on first visit
    initializeModel().catch(() => {});
  }, []);

  // ----- validators -----
  const validateFile = (file) => {
    if (!file) return "No file selected.";
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ACCEPTED.includes(ext)) {
      return `Unsupported type: ${ext}. Please upload ${ACCEPTED.join(", ")}.`;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_SIZE_MB) {
      return `File too large: ${mb.toFixed(1)}MB (max ${MAX_SIZE_MB}MB).`;
    }
    return "";
  };

  // ----- file handlers -----
  const onResumeChange = (e) => {
    const f = e.target.files?.[0];
    const msg = validateFile(f);
    if (msg) return setErrMsg(msg);
    setErrMsg("");
    setResumeFile(f);
  };

  const onJDFileChange = (e) => {
    const f = e.target.files?.[0];
    const msg = validateFile(f);
    if (msg) return setErrMsg(msg);
    setErrMsg("");
    setJdFile(f);
  };

  // drag & drop helpers
  const makeDnd = (setter) => (ev) => {
    ev.preventDefault();
    if (ev.type === "dragenter" || ev.type === "dragover") return;
    const f = ev.dataTransfer.files?.[0];
    const msg = validateFile(f);
    if (msg) return setErrMsg(msg);
    setErrMsg("");
    setter(f);
  };

  // ----- submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    if (!resumeFile) {
      setErrMsg("Please upload your resume (.pdf or .docx).");
      return;
    }
    if (!jdFile && jdText.trim() === "") {
      setErrMsg("Upload a JD file or paste the JD text.");
      return;
    }

    // build form
    const formData = new FormData();
    formData.append("resume", resumeFile);
    if (jdFile) formData.append("jd_file", jdFile);
    if (jdText.trim()) formData.append("jd_text", jdText.trim());

    setLoading(true);
    setHint("Extracting text…");

    try {
      // 1) extract text via Flask
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }
      const data = await res.json();
      const resumeText = data.resume || "";
      const jdFullText = data.job_description || "";

      if (!resumeText.trim()) {
        throw new Error("Could not extract text from resume.");
      }
      if (!jdFullText.trim()) {
        throw new Error("Could not extract/paste JD text.");
      }

      // 2) LLM analysis
      setHint("Analyzing with Gemini…");
      const llm = await analyzeWithGemini(resumeText, jdFullText);
      const parsed = parseGeminiResponse(llm);
      if (!parsed) throw new Error("Failed to parse Gemini output.");

      // 3) optional learning resources
      setHint("Finding learning resources…");
      const learningResources = await getLearningResourcesFromGemini(
        parsed.missing_keywords || []
      );

      // 4) persist for signed-in users
      const user = auth.currentUser;
      if (user) {
        const resultRef = doc(
          db,
          "users",
          user.uid,
          "results",
          new Date().toISOString()
        );
        await setDoc(resultRef, {
          resume: resumeText,
          job_description: jdFullText,
          match_percentage: parsed.score,
          missing_skills: parsed.missing_keywords,
          suggestions: parsed.suggestions,
          learning_resources: learningResources,
          created_at: new Date(),
        });
      }

      // 5) route to result
      navigate("/dashboard", {
        state: {
          result: {
            resume: resumeText,
            job_description: jdFullText,
            match_percentage: parsed.score,
            missing_keywords: parsed.missing_keywords,
            suggestions: parsed.suggestions,
            learning_resources: learningResources,
          },
        },
      });
    } catch (err) {
      console.error("❌ Analysis error:", err);
      setErrMsg(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
      setHint("");
    }
  };

  const resumeHelp = useMemo(
    () => (resumeFile ? humanFile(resumeFile) : "Drop or select .pdf / .docx"),
    [resumeFile]
  );
  const jdHelp = useMemo(
    () =>
      jdFile
        ? humanFile(jdFile)
        : "Drop a JD file (.pdf/.docx) or paste the JD below",
    [jdFile]
  );

  return (
    <div className="upload">
      <header className="upload__header">
        <h1>Resume & JD Analyzer</h1>
        <p className="muted">
          Upload your resume and a job description. We’ll compute your match
          score and list missing skills.
        </p>
      </header>

      <form className="card upload__form" onSubmit={handleSubmit} noValidate>
        {/* Resume dropzone */}
        <label className="field__label">Resume (PDF/DOCX) <span className="req">*</span></label>
        <div
          className={`dropzone ${resumeFile ? "dropzone--filled" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={makeDnd(setResumeFile)}
          ref={dropRefResume}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            id="resume-input"
            onChange={onResumeChange}
            hidden
          />
          <p className="dropzone__hint">{resumeHelp}</p>
          <div className="dropzone__actions">
            <label htmlFor="resume-input" className="btn btn--ghost">
              Choose file
            </label>
            {resumeFile && (
              <button
                type="button"
                className="btn btn--text"
                onClick={() => setResumeFile(null)}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* JD file dropzone */}
        <label className="field__label">Job Description File (optional)</label>
        <div
          className={`dropzone ${jdFile ? "dropzone--filled" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={makeDnd(setJdFile)}
          ref={dropRefJD}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            id="jd-input"
            onChange={onJDFileChange}
            hidden
          />
          <p className="dropzone__hint">{jdHelp}</p>
          <div className="dropzone__actions">
            <label htmlFor="jd-input" className="btn btn--ghost">
              Choose file
            </label>
            {jdFile && (
              <button
                type="button"
                className="btn btn--text"
                onClick={() => setJdFile(null)}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* JD textarea */}
        <label className="field__label">Or paste Job Description</label>
        <textarea
          className="textarea"
          rows={8}
          placeholder="Paste the job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />

        {errMsg && <div className="alert alert--error">⚠ {errMsg}</div>}
        {hint && !errMsg && <div className="alert alert--hint">{hint}</div>}

        <div className="actions">
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <p className="micro muted">
          Max file size {MAX_SIZE_MB}MB. Supported: {ACCEPTED.join(", ")}.
        </p>
      </form>
    </div>
  );
};

export default UploadPage;
