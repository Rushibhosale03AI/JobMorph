import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [liveJobs, setLiveJobs] = useState([]); // ✅ Moved inside App()

  // ✅ useEffect for fetching live jobs
  useEffect(() => {
    fetch("http://127.0.0.1:5000/jobs?keyword=react developer")
      .then((res) => res.json())
      .then((data) => setLiveJobs(data))
      .catch((err) => console.error(err));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);
    setStatus("Uploading...");

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(data.message);
      if (data.analysis) setAnalysis(data.analysis);
      if (data.job_matches) setJobMatches(data.job_matches);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed.");
    }
  };

  return (
    <div className="App">
      <h1>AI Resume Analyzer</h1>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload Resume</button>
      </form>

      <p>{status}</p>

      {analysis && (
        <div className="result">
          <h3>Resume Analysis:</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}

      {jobMatches.length > 0 && (
        <div className="result">
          <h3>Top Job Matches:</h3>
          <ul>
            {jobMatches.map((job, index) => (
              <li key={index}>
                <strong>{job.title}</strong> (Score: {job.score})<br />
                <em>{job.description}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {liveJobs.length > 0 && (
        <div className="result">
          <h3>Live Job Openings</h3>
          <ul>
            {liveJobs.map((job, index) => (
              <li key={index}>
                <strong>{job.title}</strong> at {job.company}<br />
                <em>{job.description}</em><br />
                📍 {job.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
