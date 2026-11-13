import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';
import { ALL_REGIONS } from '../utils/regions';
import type { RegionInfo } from '../utils/regions';

interface CountryComboboxProps {
  selectedCode: string;
  onSelect: (region: RegionInfo) => void;
}

export const CountryCombobox: React.FC<CountryComboboxProps> = ({ selectedCode, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedRegion = ALL_REGIONS.find((r) => r.code === selectedCode) || ALL_REGIONS[0];

  const filteredRegions = ALL_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.phonePrefix.includes(query) ||
      r.currencyCode.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-stone-50/70 border border-stone-300 rounded-xl hover:bg-stone-100 hover:border-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 transition-all text-left cursor-pointer"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Globe className="w-4 h-4 text-stone-500 shrink-0" />
          <span className="font-semibold text-stone-900 truncate">{selectedRegion.name}</span>
          <span className="text-xs font-mono font-bold text-stone-600 bg-stone-200/80 px-2 py-0.5 rounded">
            {selectedRegion.phonePrefix}
          </span>
          <span className="text-xs font-mono text-stone-500">
            {selectedRegion.currencyCode} ({selectedRegion.currencySymbol})
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-80 flex flex-col">
          {/* Search Bar inside Dropdown */}
          <div className="p-3 border-b border-stone-100 bg-stone-50/80">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search country, code (+254), or currency..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto divide-y divide-stone-50 p-1">
            {filteredRegions.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400">
                No matching country found for "{query}"
              </div>
            ) : (
              filteredRegions.map((region) => {
                const isSelected = region.code === selectedCode;
                return (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => {
                      onSelect(region);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-stone-100 font-bold text-stone-950' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="font-semibold truncate">{region.name}</span>
                      <span className="font-mono text-[11px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                        {region.phonePrefix}
                      </span>
                      <span className="font-mono text-[11px] text-stone-400">
                        {region.currencyCode} ({region.currencySymbol})
                      </span>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-stone-900 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
