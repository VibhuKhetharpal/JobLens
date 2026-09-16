import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const INDIAN_HUBS = ['All', 'Bengaluru', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Mumbai', 'Remote'];
const SALARY_OPTIONS = [
  { label: 'Any Salary', value: '' },
  { label: '₹10+ LPA', value: '10' },
  { label: '₹20+ LPA', value: '20' },
  { label: '₹30+ LPA', value: '30' },
  { label: '₹40+ LPA', value: '40' }
];

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [minLpa, setMinLpa] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bookmark state persisted to localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('joblens_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Active job for slide-out detail drawer
  const [activeJob, setActiveJob] = useState(null);

  const toggleBookmark = (job, e) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => {
      const isAlreadySaved = prev.some(b => b.externalId === job.externalId);
      const updated = isAlreadySaved
        ? prev.filter(b => b.externalId !== job.externalId)
        : [job, ...prev];
      localStorage.setItem('joblens_saved_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (job) => bookmarks.some(b => b.externalId === job.externalId);

  // Fetch listings from backend
  const fetchListings = useCallback(async (targetPage = 1, append = false) => {
    if (showSavedOnly) {
      setLoading(false);
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedTag) params.append('tag', selectedTag);
      if (onlyRemote) params.append('remote', 'true');
      if (minLpa) params.append('minLpa', minLpa);
      params.append('page', targetPage);
      params.append('limit', '30');

      const res = await axios.get(`/api/listings?${params.toString()}`);
      const newItems = res.data?.listings || (Array.isArray(res.data) ? res.data : []);
      const total = res.data?.total || newItems.length;

      setTotalCount(total);
      if (append) {
        setListings(prev => [...prev, ...newItems]);
      } else {
        setListings(newItems);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedCity, selectedTag, onlyRemote, minLpa, showSavedOnly]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchListings(1, false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  // Load more button handler
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(nextPage, true);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('All');
    setSelectedTag('');
    setOnlyRemote(false);
    setMinLpa('');
    setShowSavedOnly(false);
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveJob(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayedListings = showSavedOnly ? bookmarks : listings;

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by role, company, or tech (e.g. React, Java, Zomato)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Salary Filter Dropdown */}
          <select
            value={minLpa}
            onChange={e => setMinLpa(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs font-medium text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {SALARY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Remote Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-gray-300 bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:border-gray-700 transition select-none">
            <input
              type="checkbox"
              checked={onlyRemote}
              onChange={e => setOnlyRemote(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span>Remote Only</span>
          </label>

          {/* Saved Jobs Toggle Button */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              showSavedOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            <span>⭐</span>
            <span>Saved ({bookmarks.length})</span>
          </button>
        </div>

        {/* City Filter Pills */}
        {!showSavedOnly && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-gray-500 shrink-0 font-medium mr-1">Hub:</span>
            {INDIAN_HUBS.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
                  selectedCity === city
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {city}
              </button>
            ))}

            {selectedTag && (
              <div className="flex items-center gap-1.5 ml-auto bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 px-2.5 py-0.5 rounded-full text-xs">
                <span>Skill: {selectedTag}</span>
                <button onClick={() => setSelectedTag('')} className="hover:text-white">✕</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <span>
          {showSavedOnly
            ? `Showing ${bookmarks.length} bookmarked jobs`
            : `Showing ${displayedListings.length} of ${totalCount} Indian tech jobs`}
        </span>
        {(search || selectedCity !== 'All' || selectedTag || onlyRemote || minLpa || showSavedOnly) && (
          <button
            onClick={resetFilters}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !loadingMore && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-5 bg-gray-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-800/60 rounded w-1/4"></div>
              <div className="h-4 bg-gray-800/40 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Job Cards */}
      {!loading && (
        <div className="grid gap-3.5">
          {displayedListings.map(job => {
            const saved = isBookmarked(job);
            return (
              <div
                key={job._id || job.externalId}
                onClick={() => setActiveJob(job)}
                className="bg-gray-900/95 border border-gray-800/90 rounded-xl p-5 hover:border-gray-700 transition shadow-sm cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-gray-100 font-bold text-base group-hover:text-indigo-300 transition">
                        {job.title}
                      </h3>
                      {job.remote && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                          Remote
                        </span>
                      )}
                      {job.salaryLpa && (
                        <span className="bg-purple-500/10 text-purple-300 text-[11px] px-2.5 py-0.5 rounded-full border border-purple-500/20 font-semibold">
                          {job.salaryLpa}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-400 text-xs flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-200">{job.company}</span>
                      <span>•</span>
                      <span className="text-gray-300">📍 {job.location || job.city || 'India'}</span>
                      {job.postedDate && (
                        <>
                          <span>•</span>
                          <span className="text-gray-500">
                            {new Date(job.postedDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={(e) => toggleBookmark(job, e)}
                      title={saved ? 'Remove Bookmark' : 'Save Job'}
                      className={`p-1.5 rounded-lg border text-sm transition ${
                        saved
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-amber-400'
                      }`}
                    >
                      {saved ? '★' : '☆'}
                    </button>

                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                      >
                        <span>Apply</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    )}
                  </div>
                </div>

                {job.description && (
                  <p className="text-gray-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}

                {/* Skills Tags */}
                {job.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-gray-800/60">
                    {job.tags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag === selectedTag ? '' : tag);
                        }}
                        className={`text-[11px] px-2.5 py-0.5 rounded transition ${
                          selectedTag === tag
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'bg-gray-800/90 hover:bg-gray-800 text-gray-300 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Pagination */}
      {!loading && !showSavedOnly && displayedListings.length < totalCount && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-200 text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading more jobs...' : 'Load More Jobs ⬇'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedListings.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-3">
          <span className="text-4xl">{showSavedOnly ? '⭐' : '🔎'}</span>
          <h4 className="text-gray-200 font-semibold text-base">
            {showSavedOnly ? 'No saved jobs yet' : 'No listings match your search criteria'}
          </h4>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            {showSavedOnly
              ? 'Click the star icon (☆) on any job card to shortlist it here for quick review.'
              : 'Try adjusting your search terms, selecting "All" hubs, or clearing active filters.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Slide-out Job Details Drawer */}
      {activeJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setActiveJob(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-gray-950 border-l border-gray-800 h-full p-6 overflow-y-auto z-10 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-medium">
                      🇮🇳 {activeJob.city || 'India'}
                    </span>
                    {activeJob.remote && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                        Remote
                      </span>
                    )}
                    {activeJob.salaryLpa && (
                      <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-semibold">
                        {activeJob.salaryLpa}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white pt-1">{activeJob.title}</h2>
                  <div className="text-sm font-semibold text-gray-300">{activeJob.company}</div>
                  <div className="text-xs text-gray-500">📍 {activeJob.location || activeJob.city}</div>
                </div>

                <button
                  onClick={() => setActiveJob(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg bg-gray-900 border border-gray-800 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3 pt-2">
                {activeJob.applyUrl ? (
                  <a
                    href={activeJob.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>Apply on Company Site</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <div className="flex-1 text-center py-2 text-xs text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
                    Direct Recruitment
                  </div>
                )}

                <button
                  onClick={() => toggleBookmark(activeJob)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                    isBookmarked(activeJob)
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-amber-400'
                  }`}
                >
                  <span>{isBookmarked(activeJob) ? '★' : '☆'}</span>
                  <span>{isBookmarked(activeJob) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Tech Stacks Required */}
              {activeJob.tags?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Required Tech Stack & Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJob.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-900 border border-gray-800 text-indigo-300 text-xs px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Role Description & Details
                </h4>
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-gray-900/60 p-4 rounded-xl border border-gray-800/80">
                  {activeJob.description || 'No detailed job description provided by the employer.'}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-[11px] text-gray-500">
              <span>Source: {activeJob.source?.toUpperCase() || 'ADZUNA'}</span>
              <span>
                Posted:{' '}
                {activeJob.postedDate
                  ? new Date(activeJob.postedDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Listings;