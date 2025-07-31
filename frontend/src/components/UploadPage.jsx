import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadPage.css';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

import {
  initializeModel,
  analyzeWithGemini,
  parseGeminiResponse,
  getLearningResourcesFromGemini
} from '../components/geminiService'; // ✅ Corrected path to utils

const UploadPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeModel();
  }, []);

  const handleResumeChange = (e) => setResumeFile(e.target.files[0]);
  const handleJdFileChange = (e) => setJdFile(e.target.files[0]);
  const handleJDTextChange = (e) => setJdText(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile || (!jdFile && jdText.trim() === '')) {
      alert('Please upload a resume and either a JD file or paragraph.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    if (jdFile) formData.append('jd_file', jdFile);
    if (jdText.trim()) formData.append('jd_text', jdText.trim());

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const resumeText = data.resume || '';
      const jdFullText = data.job_description || '';

      const llmResponse = await analyzeWithGemini(resumeText, jdFullText);
      const parsed = parseGeminiResponse(llmResponse);
      if (!parsed) throw new Error('Failed to parse Gemini output');

      const learningResources = await getLearningResourcesFromGemini(parsed.missing_keywords);

      // Save in Firestore
      const user = auth.currentUser;
      if (user) {
        const resultRef = doc(
          db,
          'users',
          user.uid,
          'results',
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

      // Show result
      navigate('/result', {
        state: {
          result: {
            resume: resumeText,
            job_description: jdFullText,
            match_percentage: parsed.score,
            missing_skills: parsed.missing_keywords,
            suggestions: parsed.suggestions,
            learning_resources: learningResources,
          },
        },
      });

    } catch (err) {
      console.error('❌ Error during analysis:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Resume & JD Analyzer</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Upload Resume (.pdf/.docx):
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
        </label>
        <label>
          Upload Job Description File (optional):
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleJdFileChange} />
        </label>
        <label>
          Or paste Job Description paragraph:
          <textarea placeholder="Paste job description..." value={jdText} onChange={handleJDTextChange}></textarea>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing with Gemini...' : 'Analyze'}
        </button>
      </form>
      {loading && <p>Please wait... analyzing...</p>}
    </div>
  );
};

export default UploadPage;
