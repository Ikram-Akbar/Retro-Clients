import { useState, useEffect, useCallback, useRef } from 'react';
import * as vehiclesService from '../services/vehiclesService';

const DEFAULT_LIMIT = 12;

export default function useVehicles({ initialQuery = '', initialType = 'All', initialLocation = 'All', initialPage = 1, limit = DEFAULT_LIMIT } = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(null);

  const debounceRef = useRef(null);

  const fetch = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        q: opts.query ?? query,
        type: (opts.type ?? type) === 'All' ? undefined : (opts.type ?? type),
        location: (opts.location ?? location) === 'All' ? undefined : (opts.location ?? location),
        page: opts.page ?? page,
        limit,
      };

      const res = await vehiclesService.getVehicles(params);
      const payload = res?.data?.data ?? res?.data ?? res;
      // backend may return list under { data: { items, total } }
      if (payload && Array.isArray(payload.items)) {
        setVehicles(payload.items);
        setTotal(payload.total ?? null);
      } else if (Array.isArray(payload)) {
        setVehicles(payload);
        setTotal(null);
      } else {
        setVehicles([]);
        setTotal(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [query, type, location, page, limit]);

  const debouncedFetch = useCallback((opts = {}) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetch(opts), 300);
  }, [fetch]);

  useEffect(() => {
    debouncedFetch({ query, type, location, page });
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, type, location, page, debouncedFetch]);

  const refetch = useCallback(() => fetch({ query, type, location, page }), [fetch, query, type, location, page]);

  return {
    vehicles,
    loading,
    error,
    query,
    setQuery,
    type,
    setType,
    location,
    setLocation,
    page,
    setPage,
    total,
    refetch,
  };
}
