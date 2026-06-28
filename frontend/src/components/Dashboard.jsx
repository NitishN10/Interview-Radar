import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function Dashboard({ user, onSelectProblem }) {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [company, setCompany] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'history'

  const formatFreq = (val) => {
    const pct = val * 100;
    if (pct === 0) return '0%';
    if (pct < 1) return '< 1%';
    return `${pct.toFixed(0)}%`;
  };

  // Fetch all dashboard stats & problems list
  const fetchData = async () => {
    try {
      // 1. Fetch Stats & filters
      const statsRes = await fetch(`${API_BASE_URL}/api/user/dashboard?userId=${user.id}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Problems List based on current filters
      const probsRes = await fetch(
        `${API_BASE_URL}/api/problems?userId=${user.id}&search=${encodeURIComponent(search)}&difficulty=${difficulty}&company=${company}`
      );
      const probsData = await probsRes.json();
      setProblems(probsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchData();
  }, [search, difficulty, company]);

  const handleToggleCompletion = async (problemId, e) => {
    e.stopPropagation(); // Avoid opening details when clicking checkbox
    try {
      const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        // Reload list and stats to update UI instantly
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling problem completion:', err);
    }
  };

  // Generate date array for the streak contribution heat map (LeetCode past 1 year grouped by month)
  const getLeetcodeMonthsData = () => {
    const monthsData = [];
    const today = new Date();
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 12 months, ending with current month
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, monthIdx, day));
      }
      
      monthsData.push({
        name: monthsList[monthIdx],
        year,
        monthIdx,
        days
      });
    }
    return monthsData;
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'white' }}>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Syncing dashboard...</p>
      </div>
    );
  }

  // Calculate percentages for SVG circle
  const solvedCount = stats?.solvedCount || 0;
  const totalCount = stats?.totalCount || 0;
  const percentage = totalCount > 0 ? (solvedCount / totalCount) : 0;
  
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage * circumference);

  const leetcodeMonths = getLeetcodeMonthsData();

  return (
    <div className="dashboard-container">
      {/* Main Panel */}
      <div className="dashboard-main">
        {/* Heat Map Section */}
        <div className="heatmap-card">
          <div className="heatmap-header">
            <h3 className="stat-title">Activity Timeline</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Completed problems log
            </span>
          </div>

          <div className="leetcode-heatmap-wrapper">
            <div className="leetcode-heatmap-container">
              <div 
                className="heatmap-days-labels" 
                style={{ 
                  height: '94px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  padding: '2px 0' 
                }}
              >
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>
              
              <div className="leetcode-heatmap-months-container">
                {leetcodeMonths.map((m, mIdx) => {
                  const dummyCount = m.days[0].getDay();
                  const dummyCells = Array.from({ length: dummyCount });
                  
                  return (
                    <div key={mIdx} className="leetcode-month-block">
                      <div className="leetcode-month-grid">
                        {/* Dummy cells offset */}
                        {dummyCells.map((_, dIdx) => (
                          <div key={`dummy-${dIdx}`} className="heatmap-cell-dummy" />
                        ))}
                        
                        {/* Actual days */}
                        {m.days.map((date, dIdx) => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const dateStr = `${year}-${month}-${day}`;
                          
                          const count = stats?.activityMap?.[dateStr] || 0;
                          const level = count > 0 ? 1 : 0;
                          
                          const formattedDate = date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                          const tooltipText = `${count} submission${count === 1 ? '' : 's'} on ${formattedDate}`;
                          
                          return (
                            <div
                              key={`day-${dIdx}`}
                              className="heatmap-cell"
                              data-level={level}
                              title={tooltipText}
                            />
                          );
                        })}
                      </div>
                      <div className="leetcode-month-label">{m.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation buttons */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore Problems
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Solved History ({stats?.solvedHistory?.length || 0})
          </button>
        </div>

        {/* Render Tab Contents */}
        {activeTab === 'explore' ? (
          <>
            {/* Filters */}
            <div className="filters-row">
              <div className="search-input-container">
                <span className="search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  className="search-input-field"
                  placeholder="Search problems by title or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                className="filter-select"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="All">All Companies</option>
                {stats?.companiesList?.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Problems List Table */}
            <div className="problems-card">
              {problems.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No problems found matching search criteria.
                </div>
              ) : (
                <table className="problems-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">Status</th>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Title</th>
                      <th>Companies</th>
                      <th style={{ width: '120px' }}>Acceptance</th>
                      <th style={{ width: '120px' }}>Difficulty</th>
                      <th style={{ width: '140px' }}>Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((prob) => (
                      <tr key={prob.id} onClick={() => onSelectProblem(prob.id)}>
                        <td className="checkbox-cell">
                          <div
                            className={`custom-checkbox ${prob.completed ? 'checked' : ''}`}
                            onClick={(e) => handleToggleCompletion(prob.id, e)}
                          />
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                          {prob.id}
                        </td>
                        <td className="prob-title-cell">
                          {prob.title}
                        </td>
                        <td>
                          <div className="companies-tags">
                            {prob.companies.slice(0, 3).map((c, i) => (
                              <span key={i} className="company-tag">
                                {c.name}
                              </span>
                            ))}
                            {prob.companies.length > 3 && (
                              <span className="company-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary-light)' }}>
                                +{prob.companies.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {prob.acceptance}
                        </td>
                        <td>
                          <span className={`difficulty-badge ${prob.difficulty.toLowerCase()}`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td>
                          <div className="frequency-container">
                            <span className="frequency-num">{formatFreq(prob.frequency)}</span>
                            <div className="frequency-bar-bg">
                              <div
                                className="frequency-bar-fill"
                                style={{ width: `${(prob.frequency * 100) < 1 && prob.frequency > 0 ? 1 : prob.frequency * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* Solved History list */
          <div className="problems-card">
            {!stats?.solvedHistory || stats.solvedHistory.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚀</div>
                <h4 style={{ color: 'white', marginBottom: '8px', fontSize: '16px' }}>No problems solved yet</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  Start practicing today! Choose any problem from the Explore tab and mark it as completed.
                </p>
                <button
                  className="auth-submit-btn"
                  style={{ marginTop: 0, padding: '10px 20px', fontSize: '14px' }}
                  onClick={() => setActiveTab('explore')}
                >
                  Explore Problems
                </button>
              </div>
            ) : (
              <table className="problems-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>ID</th>
                    <th>Title</th>
                    <th style={{ width: '150px' }}>Difficulty</th>
                    <th>Solved Date</th>
                    <th style={{ width: '140px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.solvedHistory.map((item) => (
                    <tr key={item.id} onClick={() => onSelectProblem(item.id)}>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {item.id}
                      </td>
                      <td className="prob-title-cell">
                        {item.title}
                      </td>
                      <td>
                        <span className={`difficulty-badge ${item.difficulty.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(item.completedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td>
                        <button
                          className="companies-dropdown-trigger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={(e) => { e.stopPropagation(); onSelectProblem(item.id); }}
                        >
                          View Spec
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div className="side-panel">
        {/* Streak Counter */}
        <div className="streak-card">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <span className="streak-count">{stats?.streak || 0} Days</span>
            <span className="streak-label">Current Active Streak</span>
          </div>
        </div>

        {/* Circular progress wheel */}
        <div className="stat-card">
          <div className="progress-header">
            <h3 className="stat-title">Solved Problems</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {totalCount > 0 ? ((solvedCount / totalCount) * 100).toFixed(0) : 0}% Done
            </span>
          </div>

          <div className="progress-circle-container">
            <svg width="120" height="120">
              <circle
                className="progress-ring-bg"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
                strokeWidth={strokeWidth}
              />
              <circle
                stroke="var(--primary)"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
                strokeWidth={strokeWidth}
                className="progress-ring-circle"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-number">{solvedCount}</span>
              <span className="progress-total">/ {totalCount}</span>
            </div>
          </div>

          <div className="difficulty-bars">
            {['Easy', 'Medium', 'Hard'].map((diff) => {
              const solved = stats?.solvedByDifficulty?.[diff] || 0;
              const total = stats?.totalByDifficulty?.[diff] || 0;
              const pct = total > 0 ? (solved / total) * 100 : 0;
              
              return (
                <div key={diff} className="diff-bar-item">
                  <div className="diff-bar-info">
                    <span className={`diff-${diff.toLowerCase()}`}>{diff}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {solved}/{total}
                    </span>
                  </div>
                  <div className="diff-bar-bg">
                    <div
                      className={`diff-bar-fill fill-${diff.toLowerCase()}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
