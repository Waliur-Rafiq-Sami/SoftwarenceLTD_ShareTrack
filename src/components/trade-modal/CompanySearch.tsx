// components/dashboard/trade-modal/CompanySearch.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Building2, PlusCircle } from "lucide-react";

interface CompanySearchProps {
  value: string;
  onChange: (val: string) => void;
  activeCompanies: string[];
  isFetching: boolean;
}

export function CompanySearch({
  value,
  onChange,
  activeCompanies,
  isFetching,
}: CompanySearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCompanies = activeCompanies.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase()),
  );

  const exactMatchExists = activeCompanies.some(
    (c) => c.toLowerCase() === value.toLowerCase(),
  );

  const handleSelect = (company: string) => {
    onChange(company.toUpperCase());
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <Label htmlFor="companySearch">Company Symbol / Name</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isFetching ? (
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )}
        </div>
        <Input
          id="companySearch"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search or type a new symbol (e.g. AAPL)"
          className="pl-10 uppercase font-semibold text-base sm:text-sm h-11 dark:bg-slate-900 dark:border-slate-800"
          autoComplete="off"
          required
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border rounded-xl shadow-lg z-50 max-h-[200px] overflow-y-auto dark:bg-slate-900 dark:border-slate-800 py-1">
          {filteredCompanies.length > 0
            ? filteredCompanies.map((company, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(company)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {company}
                </button>
              ))
            : !value && (
                <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                  No recent companies found. Start typing to add one.
                </div>
              )}

          {value && !exactMatchExists && (
            <button
              type="button"
              onClick={() => handleSelect(value)}
              className="w-full text-left px-4 py-2.5 text-sm bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium flex items-center gap-2 border-t dark:border-slate-800 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Add "{value}" as new
            </button>
          )}
        </div>
      )}
    </div>
  );
}
