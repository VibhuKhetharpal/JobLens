import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const INDIAN_HUBS = ['All', 'Bengaluru', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Mumbai', 'Remote'];

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedTag) params.append('tag', selectedTag);
      if (onlyRemote) params.append('remote', 'true');

      const res = await axios.get(`/api/listings?${params.toString()}`);
      // Handles both { listings, total } format and legacy array
      if (res.data?.listings) {
        setListings(res.data.listings);
        setTotalCount(res.data.total);
      } else if (Array.isArray(res.data)) {
        setListings(res.data);
        setTotalCount(res.data.length);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCity, selectedTag, onlyRemote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('All');
    setSelectedTag('');
    setOnlyRemote(false);
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-3.5">
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

          <label className="flex items-center gap-2 text-xs font-medium text-gray-300 bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:border-gray-700 transition select-none">
            <input
              type="checkbox"
              checked={onlyRemote}
              onChange={e => setOnlyRemote(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span>Remote Only</span>
          </label>
        </div>

        {/* City Filter Pills */}
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
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <span>Showing {listings.length} {totalCount > listings.length ? `of ${totalCount}` : ''} Indian tech jobs</span>
        {(search || selectedCity !== 'All' || selectedTag || onlyRemote) && (
          <button
            onClick={resetFilters}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
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
          {listings.map(job => (
            <div
              key={job._id}
              className="bg-gray-900/95 border border-gray-800/90 rounded-xl p-5 hover:border-gray-700 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-gray-100 font-bold text-base hover:text-indigo-300 transition">
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

                {/* Apply Button */}
                <div className="shrink-0 pt-1 sm:pt-0">
                  {job.applyUrl ? (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <span>Apply</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Direct Hire</span>
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
                      onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-3">
          <span className="text-4xl">🔎</span>
          <h4 className="text-gray-200 font-semibold text-base">No listings match your search criteria</h4>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            Try adjusting your search terms, selecting &quot;All&quot; hubs, or clearing your active skill filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Listings;