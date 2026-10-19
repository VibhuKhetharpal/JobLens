import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

function MatchBar({ pct }) {
  const color =
    pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  const textColor =
    pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-sm font-bold tabular-nums w-12 text-right ${textColor}`}>
        {pct}%
      </span>
    </div>
  );
}

function RoadmapPanel({ job, onClose }) {
  const [guides, setGuides] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/roadmap', {
        jobTitle: job.title,
        matched: job.matched,
        missing: job.missing
      });
      setGuides(res.data.guides || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  }, [job]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  return (
    <div className="mt-3 bg-gray-950 border border-indigo-500/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Learning Roadmap — {job.title}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
        >
          Close
        </button>
      </div>

      <div className="text-xs text-gray-400">
        Skills to learn:{' '}
        {job.missing.map((s, i) => (
          <span key={i} className="inline-block bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded mr-1 mb-1">
            {s}
          </span>
        ))}
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse pt-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="h-3 bg-gray-800 rounded w-1/4" />
              <div className="h-3 bg-gray-800/70 rounded w-full" />
              <div className="h-3 bg-gray-800/50 rounded w-3/4" />
            </div>
          ))}
          <p className="text-xs text-gray-500 text-center">Generating roadmap via Gemini AI...</p>
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {guides && guides.length > 0 && (
        <div className="space-y-2.5">
          {guides.map((g, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3.5 space-y-1">
              <div className="text-xs font-semibold text-gray-200">{g.skill}</div>
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{g.guide}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ job }) {
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <div className="bg-gray-900/95 border border-gray-800 rounded-xl p-5 space-y-3 hover:border-gray-700 transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-gray-100 font-bold text-base">{job.title}</h3>
          <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-300">{job.company}</span>
            {job.city && (
              <>
                <span>•</span>
                <span>{job.city}</span>
              </>
            )}
            {job.salaryLpa && (
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {job.salaryLpa}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition"
            >
              Apply ↗
            </a>
          )}
        </div>
      </div>

      {/* Match bar */}
      <MatchBar pct={job.match_percent} />

      {/* Skill tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.matched.map((s, i) => (
          <span key={i} className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {s}
          </span>
        ))}
        {job.missing.map((s, i) => (
          <span key={i} className="text-[11px] px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {s}
          </span>
        ))}
      </div>

      {/* Roadmap toggle */}
      {job.missing.length > 0 && (
        <div>
          <button
            onClick={() => setShowRoadmap(v => !v)}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            {showRoadmap ? 'Hide roadmap' : 'Get learning roadmap for missing skills'}
          </button>
          {showRoadmap && (
            <RoadmapPanel job={job} onClose={() => setShowRoadmap(false)} />
          )}
        </div>
      )}

      {job.missing.length === 0 && (
        <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
          <span>{job.match_percent === 100 ? 'You meet 100% of all listed requirements for this role.' : 'All technical stack skills matched!'}</span>
        </p>
      )}
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | analyzing | done | error
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File too large (max 5 MB).');
      return;
    }
    setError(null);
    setFile(f);
    setMatches([]);
    setStatus('idle');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    setError(null);
    setMatches([]);

    const form = new FormData();
    form.append('resume', file);

    try {
      const res = await axios.post('/api/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000
      });
      const results = res.data?.matches || [];
      setMatches(results.filter(m => m.match_percent > 0));
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the Python service is running.');
      setStatus('error');
    }
  };

  const bestMatch = matches.length > 0 ? matches[0] : null;

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-200">Resume Analyzer</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload your resume and get matched against live Indian tech job listings — powered by Gemini AI.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/5'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB — click to change</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Drop your resume here or click to browse</p>
              <p className="text-xs text-gray-500">PDF only, max 5 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">
            Matches against live MongoDB job listings via Gemini AI
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!file || status === 'analyzing'}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition"
          >
            {status === 'analyzing' ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      {status === 'analyzing' && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-5 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800/60 rounded w-1/4" />
              <div className="h-1.5 bg-gray-800 rounded-full w-full" />
              <div className="flex gap-1.5">
                {[1,2,3,4].map(j => <div key={j} className="h-5 w-16 bg-gray-800/60 rounded-full" />)}
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-gray-500">
            Comparing against live Indian job listings via Gemini AI...
          </p>
        </div>
      )}

      {/* Results */}
      {status === 'done' && matches.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-gray-400">
            <span>{matches.length} job{matches.length !== 1 ? 's' : ''} matched</span>
            {bestMatch && (
              <>
                <span>•</span>
                <span>
                  Best match: <span className="text-emerald-400 font-semibold">{bestMatch.title}</span> at{' '}
                  <span className="text-gray-200 font-semibold">{bestMatch.match_percent}%</span>
                </span>
              </>
            )}
            <span className="ml-auto">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" />matched
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 mx-1 ml-3" />missing
            </span>
          </div>

          {matches.map((job, i) => <MatchCard key={i} job={job} />)}
        </div>
      )}

      {/* No results */}
      {status === 'done' && matches.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-2">
          <h4 className="text-gray-200 font-semibold">No strong matches found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your resume didn't match any live listings above 0%. Try syncing more jobs or uploading a more detailed resume.
          </p>
        </div>
      )}
    </div>
  );
}
