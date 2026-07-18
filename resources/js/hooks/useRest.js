import { useState, useCallback } from "react";

const { restUrl, nonce } = window.HTTP_HEADERS_ADVANCED || {};

/**
 * Hook para realizar peticiones a la REST API de WordPress.
 *
 * @param {string} path - Ruta relativa al restUrl base (ej: "/settings").
 * @param {object} [options]
 * @param {string} [options.method='GET'] - Método HTTP.
 * @param {function} [options.onSuccess] - Callback al completar con éxito.
 * @param {function} [options.onError] - Callback ante error.
 * @returns {{ execute: function, data: any, error: string|null, loading: boolean }}
 */
export default function useRest(path, options = {}) {
  const { method = "GET", onSuccess, onError } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (body = null) => {
      setLoading(true);
      setError(null);

      try {
        const base = restUrl?.replace(/\/+$/, '') || '';
        const url = `${base}${path}`;

        const fetchOptions = {
          method,
          credentials: "same-origin",
          headers: {
            "X-WP-Nonce": nonce,
            "Content-Type": "application/json",
          },
        };

        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${response.status}`);
        }

        const json = await response.json();

        setData(json);
        onSuccess?.(json);
        return json;
      } catch (err) {
        setError(err.message);
        onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [path, method, onSuccess, onError]
  );

  return { execute, data, error, loading };
}
