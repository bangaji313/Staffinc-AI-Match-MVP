import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import staffincLogo from './assets/staffinc_logo_text.png';
import './App.css';
import remarkGfm from 'remark-gfm';

function App() {
  const [requirement, setRequirement] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [initStatus, setInitStatus] = useState('');
  const [initSuccess, setInitSuccess] = useState(false);

  const handleInitDb = async () => {
    setInitStatus('Initializing...');
    setInitSuccess(false);
    try {
      const response = await axios.post('/api/init-db');
      setInitStatus(response.data.message || 'Database initialized successfully.');
      setInitSuccess(true);
    } catch (error) {
      console.error(error);
      setInitStatus('Failed to initialize database.');
      setInitSuccess(false);
    }
  };

  const handleFindMatch = async () => {
    if (!requirement.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post('/api/match', {
        client_requirement: requirement,
      });
      setResult(response.data.match_result || 'No match found.');
    } catch (error) {
      console.error(error);
      setResult('Error finding best match. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Top Nav Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={staffincLogo} alt="Staffinc" className="h-8 object-contain" />
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">AI Matchmaker</span>
          </div>
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium px-2.5 py-1 rounded-md">HR Platform</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-10 px-4 pb-16">

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-yellow-500 overflow-hidden">

          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <img src={staffincLogo} alt="Staffinc" className="h-12 mx-auto mb-2 object-contain" />
            <h1 className="text-xl font-semibold text-slate-800 text-center mb-1">AI Matchmaker</h1>
            <p className="text-slate-500 text-sm text-center">
              Describe your ideal candidate and surface the best matches from the talent database.
            </p>
          </div>

          <div className="px-8 py-6 flex flex-col gap-6">

            {/* Database Section */}
            <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Candidate Database</p>
                <p className="text-xs text-slate-500 mt-0.5">Load candidate data into the vector store before running searches.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {initStatus && (
                  <span className={`text-xs font-medium flex items-center gap-1.5 ${initSuccess ? 'text-emerald-600' : 'text-red-500'}`}>
                    {initSuccess ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {initStatus}
                  </span>
                )}
                <button
                  onClick={handleInitDb}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-yellow-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Initialize Database
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div>
              <label htmlFor="requirement" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Client Requirement
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Describe the role, required skills, experience level, and any specific qualifications.
              </p>
              <textarea
                id="requirement"
                className="w-full border border-slate-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none rounded-lg shadow-sm p-4 text-slate-700 text-sm resize-y min-h-[120px] placeholder-slate-400 transition-all"
                placeholder="e.g., We need a senior frontend developer with 5+ years of React experience and knowledge of GraphQL..."
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />

              <button
                onClick={handleFindMatch}
                disabled={loading}
                className={`bg-yellow-500 text-slate-900 font-bold py-3 px-5 rounded-lg shadow-sm transition-colors w-full mt-4 flex items-center justify-center gap-2
                  ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? 'Analyzing candidates...' : 'Find Best Match'}
              </button>
            </div>

          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div className="mt-8 p-6 bg-yellow-50/50 border border-yellow-200 shadow-sm rounded-xl prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-yellow-700">
            <div className="not-prose flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Match Report</h2>
                <p className="text-xs text-slate-400 mt-0.5">Generated by AI — review before sharing with clients</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-md">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </span>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
