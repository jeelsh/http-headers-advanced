import { useState, useCallback } from "react";

const { ajaxUrl, nonce } = window.HTTP_HEADERS_ADVANCED || {};

/**
 * Hook para realizar peticiones AJAX al backend de WordPress.
 *
 * @param {string} action - Nombre de la acción WP (sin prefijo).
 * @param {object} [options]
 * @param {string} [options.method='POST'] - Método HTTP.
 * @param {function} [options.onSuccess] - Callback al completar con éxito.
 * @param {function} [options.onError] - Callback ante error.
 * @returns {{ execute: function, data: any, error: string|null, loading: boolean }}
 */
export default function useAjax(action, options = {}) {
  const { method = "POST", onSuccess, onError } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (payload = {}) => {
      setLoading(true);
      setError(null);

      try {
        const body = new URLSearchParams();
        body.append("action", action);
        body.append("_ajax_nonce", nonce);

        Object.entries(payload).forEach(([key, value]) => {
          body.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        });

        const fetchOptions = {
          method,
          credentials: "same-origin",
          headers: { "X-WP-Nonce": nonce },
        };

        if (method === "POST") {
          fetchOptions.body = body;
        }

        const url =
          method === "GET"
            ? `${ajaxUrl}?${body.toString()}`
            : ajaxUrl;

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        if (json.success === false) {
          const msg = json.data?.message || json.data || "Error desconocido";
          throw new Error(msg);
        }

        setData(json.data ?? json);
        onSuccess?.(json.data ?? json);
        return json.data ?? json;
      } catch (err) {
        setError(err.message);
        onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, method, onSuccess, onError]
  );

  return { execute, data, error, loading };
}
