'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect, useTransition } from 'react';

export function ProductSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      params.delete('page'); // Reset to page 1 on search
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only trigger if the value actually changed to prevent infinite loops
      if (value !== defaultValue) {
        handleSearch(value);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [value, handleSearch, defaultValue]);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 12, top: 11, width: 18, height: 18, color: '#94a3b8', pointerEvents: 'none' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        {isPending && (
          <div style={{ position: 'absolute', right: 12, top: 12 }}>
            <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16, color: '#0423a0' }}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        <input
          name="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products..."
          style={{
            width: '100%', height: 40, paddingLeft: 38, paddingRight: isPending ? 40 : 14,
            border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b',
            background: '#f8fafc', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>
      
      {defaultValue && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            handleSearch('');
          }}
          style={{
            height: 40, padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 14, color: '#1e293b', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', background: '#fff', cursor: 'pointer'
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
