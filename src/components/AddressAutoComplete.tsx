import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, required, label = 'Location', placeholder = 'ex: 1234 Main Street, City, State' }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = React.useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceTimer = React.useRef<number>(0);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5&countrycodes=us`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'COSpringsCS/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (val: string) => {
    onChange(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => fetchSuggestions(val), 1000);
  };

  const handleSelect = (s: NominatimResult) => {
    onChange(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            className="input pl-9"
            value={value}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            required={required}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map(s => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 flex items-start gap-2 border-b border-gray-700/50 last:border-0"
              >
                <MapPinIcon className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}