// src/components/UploadPage.jsx (UPDATED)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UploadPage.css";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const MAX_SIZE_MB = 8;
const ACCEPTED = [".pdf", ".docx", ".txt"];

function humanFile(f) {
  if (!f) return "";
  const mb = (f.size / (1024 * 1024)).toFixed(2);
  return `${f.name} • ${mb} MB`;
}

const UploadPage = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null); // 1. RE-ADD STATE for the JD file
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [hint, setHint] = useState("");

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
  
  const onResumeChange = (e) => {
    const f = e.target.files?.[0];
    const msg = validateFile(f);
    if (msg) return setErrMsg(msg);
    setErrMsg("");
    setResumeFile(f);
  };
  
  // 2. CREATE HANDLER for the JD file input
  const onJdFileChange = (e) => {
    const f = e.target.files?.[0];
    const msg = validateFile(f);
    if (msg) return setErrMsg(msg);
    setErrMsg("");
    setJdFile(f);
    setJdText(""); // Clear text input if a file is chosen
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    // 3. UPDATE LOGIC to check for either file or text
    if (!resumeFile) {
      return setErrMsg("Please upload your resume.");
    }
    if (!jdFile && jdText.trim() === "") {
      return setErrMsg("Please upload a Job Description file or paste the text.");
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    
    // Append either the file or the text, whichever is provided
    if (jdFile) {
      formData.append("jd_file", jdFile);
    } else {
      formData.append("jd_text", jdText.trim());
    }

    setLoading(true);
    setHint("Uploading and analyzing... this may take a moment.");

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Analysis failed (${res.status})`);
      }

      const analysisResult = await res.json();

      const user = auth.currentUser;
      if (user) {
        const resultRef = doc(db, "users", user.uid, "results", new Date().toISOString());
        await setDoc(resultRef, {
          ...analysisResult,
          created_at: serverTimestamp(),
        });
      }

      navigate("/dashboard/history", { state: { result: analysisResult } });

    } catch (err) {
      console.error("❌ Analysis error:", err);
      setErrMsg(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
      setHint("");
    }
  };

  return (
    <div className="upload-page-container">
        <div className="upload-header">
            <h1>New Analysis</h1>
            <p className="subtitle">Provide your resume and a job description to get started.</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit} noValidate>
            <div className="upload-grid">
                {/* --- Resume Card --- */}
                <div className="upload-card">
                    <label className="field-label">1. Your Resume <span className="req">*</span></label>
                    <div className="dropzone" onClick={() => document.getElementById('resume-input').click()}>
                        <input type="file" id="resume-input" hidden onChange={onResumeChange} accept={ACCEPTED.join(",")} />
                        <p>{resumeFile ? humanFile(resumeFile) : "Click to upload a file"}</p>
                        <span className="dropzone-hint">{ACCEPTED.join(" / ")} up to {MAX_SIZE_MB}MB</span>
                    </div>
                </div>
               {/* --- Job Description Card (Updated) --- */}
<div className="upload-card">
    <label className="field-label">2. Job Description <span className="req">*</span></label>
    
    {/* This dropzone will be disabled if text is entered below */}
    <div 
        className={`dropzone ${jdText ? 'is-disabled' : ''}`} 
        onClick={jdText ? undefined : () => document.getElementById('jd-file-input').click()}
    >
        <input 
            type="file" 
            id="jd-file-input" 
            hidden 
            onChange={onJdFileChange} 
            accept={ACCEPTED.join(",")} 
            disabled={!!jdText} // Also disable the input itself
        />
        <p>{jdFile ? humanFile(jdFile) : (jdText ? 'Using text pasted below' : 'Click to upload a file')}</p>
        <span className="dropzone-hint">(Optional) Upload a PDF, DOCX, or TXT file</span>
    </div>

    <div className="or-separator">OR</div>

    <textarea
        id="jd-text"
        className="textarea"
        rows={8}
        // Placeholder text changes based on whether a file is selected
        placeholder={jdFile ? "Job description file is selected." : "Paste the full job description here..."}
        value={jdText}
        onChange={(e) => {
            setJdText(e.target.value);
            setJdFile(null); // Clear file input if text is entered
        }}
        // Textarea is disabled if a file is uploaded
        disabled={!!jdFile}
    />
</div>
</div>
            
            {errMsg && <div className="alert alert--error">{errMsg}</div>}
            {hint && !errMsg && <div className="alert alert--hint">{hint}</div>}

            <div className="actions-bar">
                <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? "Analyzing…" : "Analyze Now"}
                </button>
            </div>
        </form>
    </div>
  );
};

export default UploadPage;