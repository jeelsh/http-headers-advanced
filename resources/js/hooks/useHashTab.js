import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para sincronizar un tab con el hash de la URL.
 *
 * @param {string[]} validTabs - Lista de tabs válidos
 * @param {string} defaultTab - Tab por defecto si el hash no es válido
 * @param {number} [segment=0] - Segmento del hash a leer (0 = primer nivel, 1 = sub-nivel)
 * @param {string} [prefix=''] - Prefijo requerido en segmentos anteriores (ej: 'settings' para #settings/hsts)
 * @returns {{ tab: string, setTab: (value: string) => void }}
 */
export default function useHashTab(validTabs, defaultTab, segment = 0, prefix = '') {
  const readHash = useCallback(() => {
    const parts = window.location.hash.replace('#', '').split('/');

    if (prefix && segment > 0 && parts[segment - 1] !== prefix) {
      return defaultTab;
    }

    const value = parts[segment] || '';
    return validTabs.includes(value) ? value : defaultTab;
  }, [validTabs, defaultTab, segment, prefix]);

  const [tab, setTabState] = useState(() => readHash());

  const setTab = useCallback((value) => {
    setTabState(value);

    const parts = window.location.hash.replace('#', '').split('/');

    if (segment === 0) {
      parts[0] = value;
      // Limpiar sub-segmentos al cambiar tab principal
      parts.length = 1;
    } else {
      // Asegurar que los segmentos anteriores existen
      while (parts.length <= segment) {
        parts.push('');
      }
      parts[segment] = value;
    }

    window.location.hash = parts.filter(Boolean).join('/');
  }, [segment]);

  useEffect(() => {
    const onHashChange = () => setTabState(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [readHash]);

  return { tab, setTab };
}
