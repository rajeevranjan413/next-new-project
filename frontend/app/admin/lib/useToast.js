'use client';

import { useState, useCallback } from 'react';

// Small toast hook. Returns [msg, show]; render <Toast msg={msg} /> alongside.
// `show` is memoized so its identity is stable — otherwise any effect/useCallback
// that depends on it (e.g. a panel's data loader) would re-run every render and
// spin into an infinite fetch loop.
export function useToast() {
  const [msg, setMsg] = useState('');
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(''), 3200); }, []);
  return [msg, show];
}
