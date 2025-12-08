import React from "react";
import { Input, Field } from "@fluentui/react-components";
import { LocationRegular } from "@fluentui/react-icons";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  required = false,
  label = "Location:",
  placeholder = "ex: 1234 Main Street, City, State"
}) => {
  const [suggestions, setSuggestions] = React.useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const debounceTimer = React.useRef<number>(1);

  const fetchAddressSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Using Nominatim (OpenStreetMap) - Free, no API key needed
      // Please respect their usage policy: max 1 request/second
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(input)}&` +
        `addressdetails=1&` +
        `limit=5&` +
        `countrycodes=us`, // Change to your country code
        {
          headers: {
            'Accept': 'application/json',
            // Nominatim requires a user agent
            'User-Agent': 'CommunityServiceApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Clear existing timer
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    
    // Longer debounce for Nominatim to respect rate limits
    debounceTimer.current = window.setTimeout(() => {
      fetchAddressSuggestions(newValue);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Field label={label} required={required}>
      <div style={{ position: 'relative' }}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(_, data) => handleInputChange(data.value)}
          required={required}
          contentBefore={<LocationRegular />}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginTop: '4px',
              maxHeight: '250px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <LocationRegular style={{ color: '#666', marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#666'
          }}>
            Loading...
          </div>
        )}
      </div>
    </Field>
  );
};