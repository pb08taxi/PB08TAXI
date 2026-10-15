import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Plane, 
  Train, 
  Building2, 
  Compass, 
  LocateFixed, 
  Loader2, 
  X, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  searchLocalIndiaLocations, 
  searchOnlineMapLocations, 
  reverseGeocodeGPS 
} from '../utils/indiaLocations';

export default function LocationAutocompleteInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  isDestination = false,
  required = false,
  allowGPS = false,
  error = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 1. Instant local suggestions from curated Indian database (<1ms)
  const localResults = useMemo(() => {
    return searchLocalIndiaLocations(value, isDestination, 6);
  }, [value, isDestination]);

  // 2. Debounced online map search for deep localities / colonies across India
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsSearchingOnline(true);

      const mapItems = await searchOnlineMapLocations(value, controller.signal);
      
      // Filter out items already present in localResults (avoid duplicates)
      const existingNames = new Set(localResults.map((r) => r.name.toLowerCase()));
      const uniqueMapItems = mapItems.filter(
        (m) => !existingNames.has(m.name.toLowerCase())
      );

      setOnlineResults(uniqueMapItems.slice(0, 4));
      setIsSearchingOnline(false);
    }, 220);

    return () => {
      clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value, localResults]);

  // Combined suggestions
  const allSuggestions = useMemo(() => {
    return [...localResults, ...onlineResults];
  }, [localResults, onlineResults]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    const selectedText = item.display || `${item.name}, ${item.state}`;
    onChange(selectedText);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    if (inputRef.current) inputRef.current.focus();
  };

  // GPS Current Location Fetcher
  const handleUseCurrentLocation = (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = `GPS Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
        try {
          address = await reverseGeocodeGPS(latitude, longitude);
        } catch (err) {
          console.warn('GPS location resolution error:', err);
        } finally {
          onChange(address, { lat: latitude, lng: longitude });
          setIsOpen(false);
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        setIsLocating(false);
        alert('Could not retrieve current location. Please enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < allSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : allSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < allSuggestions.length) {
        e.preventDefault();
        handleSelect(allSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Highlight matching letters in suggestion title (supports single & multi-token queries)
  const renderHighlightedName = (name, query) => {
    if (!query || !query.trim()) return name;
    const tokens = query.trim().split(/[\s,()/-]+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return name;

    const pattern = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = name.split(regex);

    return parts.map((part, i) => {
      const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <span key={i} className="text-taxi-yellow font-black underline decoration-taxi-yellow/60 underline-offset-2">
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  // Helper icon by location type
  const renderTypeIcon = (type) => {
    switch (type) {
      case 'airport':
        return <Plane className="w-4 h-4 text-sky-400 flex-shrink-0" />;
      case 'railway':
        return <Train className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'map':
        return <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      default:
        return <Building2 className="w-4 h-4 text-taxi-yellow flex-shrink-0" />;
    }
  };

  const renderBadge = (type) => {
    switch (type) {
      case 'airport':
        return <span className="text-[10px] uppercase font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">Airport</span>;
      case 'railway':
        return <span className="text-[10px] uppercase font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded">Station</span>;
      case 'map':
        return <span className="text-[10px] uppercase font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">Map Match</span>;
      default:
        return <span className="text-[10px] uppercase font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-1.5 py-0.5 rounded">City</span>;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Label with quick hint */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 truncate">
          {label} {required ? <span className="text-taxi-yellow">*</span> : <span className="text-zinc-500 text-[10px] font-normal lowercase">(optional)</span>}
        </label>
        {allowGPS && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-[11px] font-bold text-taxi-yellow hover:text-yellow-300 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS location"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-taxi-yellow" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-3 h-3 text-taxi-yellow" />
                <span>Use Current Location</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Input Field Box */}
      <div className="relative flex items-center">
        {/* Left Icon */}
        <MapPin 
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            value ? 'text-taxi-yellow' : 'text-zinc-500'
          }`} 
        />

        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          required={required}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-11 sm:h-12 bg-zinc-900 border rounded-xl pl-10 pr-12 text-sm sm:text-base text-white placeholder-zinc-500 outline-none transition-all ${
            isOpen 
              ? 'border-taxi-yellow ring-1 ring-taxi-yellow shadow-lg shadow-taxi-yellow/10' 
              : error 
                ? 'border-rose-500' 
                : 'border-zinc-800 hover:border-zinc-700'
          }`}
        />

        {/* Right Action Icons (Clear / Live Searching Indicator) */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {isSearchingOnline && (
            <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin mr-1" title="Searching map..." />
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1.5 bg-[#141416] border border-zinc-700/90 rounded-2xl p-2 shadow-2xl shadow-black/95 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl max-h-72 overflow-y-auto"
          style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.95))' }}
        >
          {/* Header Banner */}
          <div className="px-2.5 py-1.5 mb-1 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-taxi-yellow" />
              <span>{value ? 'Matching Indian Locations' : 'Popular Destinations'}</span>
            </span>
            <span className="text-[10px] font-normal text-zinc-500 lowercase">
              {allSuggestions.length} found
            </span>
          </div>

          {/* Quick GPS Location Bar inside dropdown (for Pickup) */}
          {allowGPS && !value && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full mb-1.5 px-3 py-2 rounded-xl bg-taxi-yellow/10 hover:bg-taxi-yellow/20 border border-taxi-yellow/30 text-taxi-yellow flex items-center justify-between text-xs font-bold transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <LocateFixed className="w-4 h-4 text-taxi-yellow group-hover:scale-110 transition-transform" />
                <span>Use My Current Location</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">Auto GPS 📍</span>
            </button>
          )}

          {/* Suggestions List */}
          {allSuggestions.length > 0 ? (
            <div className="space-y-1">
              {allSuggestions.map((item, idx) => {
                const isSelected = idx === highlightedIndex;
                return (
                  <button
                    key={`${item.name}-${item.state}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-zinc-800 text-white ring-1 ring-taxi-yellow/50' 
                        : 'hover:bg-zinc-850 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex-shrink-0">
                        {renderTypeIcon(item.type)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {renderHighlightedName(item.name, value)}
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate">
                          {item.state}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {renderBadge(item.type)}
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-taxi-yellow group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-400">
              <p className="font-semibold text-zinc-300">No exact preset found</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Press enter or continue typing — custom addresses are fully supported.
              </p>
            </div>
          )}

          {/* Bottom helper tip */}
          <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 px-2 flex items-center justify-between text-[10px] text-zinc-500">
            <span>↑↓ to navigate • ↵ to select</span>
            <span>All India Coverage 🇮🇳</span>
          </div>
        </div>
      )}
    </div>
  );
}
