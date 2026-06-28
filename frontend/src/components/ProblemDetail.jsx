import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function ProblemDetail({ problemId, userId, onBack }) {
  const [problem, setProblem] = useState(null);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatFreq = (val) => {
    const pct = val * 100;
    if (pct === 0) return '0%';
    if (pct < 1) return '< 1%';
    return `${pct.toFixed(0)}%`;
  };

  // Fetch problem details
  const fetchProblemDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problems/${problemId}?userId=${userId}`);
      const data = await res.json();
      setProblem(data);
    } catch (err) {
      console.error('Error fetching problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  // Toggle problem completion status
  const toggleCompletion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
      });
      if (response.ok) {
        const data = await response.json();
        // If transitioning from incomplete to complete, show the success modal!
        if (data.completed) {
          setShowSuccessModal(true);
        }
        setProblem(prev => ({ ...prev, completed: data.completed }));
      }
    } catch (err) {
      console.error('Error toggling completion status:', err);
    }
  };

  if (loading || !problem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'white' }}>
        <p style={{ fontSize: '18px' }}>Parsing problem specs...</p>
      </div>
    );
  }

  const totalCompanyMentions = problem.companies.length;

  return (
    <div className="details-container">
      {/* Header Back Button Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </button>

        {/* Mark completed button */}
        <button
          className={`solve-toggle-btn ${problem.completed ? 'completed' : ''}`}
          onClick={toggleCompletion}
        >
          {problem.completed ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Solved
            </>
          ) : (
            'Mark as Solved'
          )}
        </button>
      </div>

      {/* Problem Title */}
      <div className="details-title-row">
        <h2 className="details-title">
          {problem.id}. {problem.title}
        </h2>
      </div>

      {/* Problem Metadata Row */}
      <div className="details-meta-row">
        <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Acceptance: <strong>{problem.acceptance}</strong>
        </span>

        {/* Companies Dropdown */}
        <div className="companies-dropdown-container">
          <button
            className="companies-dropdown-trigger"
            onClick={() => setCompaniesOpen(!companiesOpen)}
          >
            <span>Companies ({totalCompanyMentions})</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ transform: companiesOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {companiesOpen && (
            <div className="companies-dropdown-menu">
              {problem.companies.map((comp, idx) => (
                <div key={idx} className="company-metric-row">
                  <span className="company-metric-name">{comp.name}</span>
                  <span className="company-metric-freq">
                    Freq: {formatFreq(comp.frequency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {problem.leetcodeLink && (
          <a
            href={problem.leetcodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="leetcode-link-btn"
          >
            <span>LeetCode Source</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>

      {/* Problem Description */}
      <div className="problem-body">
        {problem.description.split('\n\n').map((para, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
        ))}
      </div>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="example-section">
          {problem.examples.map((ex, idx) => (
            <div className="example-card" key={idx}>
              <div className="example-title">Example {idx + 1}</div>
              <div className="example-box">
                <strong>Input:</strong> {ex.input}
                <br />
                <strong>Output:</strong> {ex.output}
                {ex.explanation && (
                  <>
                    <br />
                    <strong>Explanation:</strong> {ex.explanation}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div style={{ paddingBottom: '30px' }}>
          <h3 className="example-title" style={{ marginBottom: '12px' }}>Constraints:</h3>
          <ul className="constraints-list">
            {problem.constraints.map((cons, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: cons.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
            ))}
          </ul>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-success">✓</div>
            <h3 className="modal-title">Solved!</h3>
            <p className="modal-message">
              You have successfully completed this problem. It is now logged in your real activity dashboard and contributes to your streak!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>
                Keep Reading
              </button>
              <button
                className="modal-close-btn"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                onClick={onBack}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
