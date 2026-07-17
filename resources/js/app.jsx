import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

// Auto-register all components in /Pages
const pageModules = import.meta.glob('./Pages/**/*.jsx', { eager: true });
const components = {};

Object.entries(pageModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop();
  if (!fileName) {
    return;
  }
  const componentName = fileName.replace(/\.(jsx|tsx)$/i, '');
  components[componentName] = module?.default ?? module;
});

// Main App Component
function App({ component, props }) {
  const Component = components[component];
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  
  if (!Component) {
    const warningMessage = `Antonella Framework: component "${component}" not found.`;
    if (typeof console !== 'undefined' && console.warn) {
      console.error(warningMessage);
    }

    if (!isDev) {
      return null;
    }

    return (
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          color: '#9a3412',
          boxShadow: '0 8px 20px rgba(154, 52, 18, 0.12)',
        }}
      >
        <p>
          ⚠️ Component not found{component ? `: ${component}` : ''}
        </p>
      </div>
    );
  }
  
  return <Component {...props} />;
}

const SCRIPT_ATTR = 'data-antonella-react-app';
const MOUNTED_ATTR = 'data-antonella-react-mounted';

const stripQuery = (url) => (url ? url.split('?')[0] : '');

const appScripts = Array.from(document.querySelectorAll(`script[${SCRIPT_ATTR}]`));
const currentModuleUrl = typeof import.meta !== 'undefined' ? stripQuery(import.meta.url) : '';

let appKey = null;
if (currentModuleUrl) {
  const match = appScripts.find((script) => stripQuery(script.src) === currentModuleUrl);
  if (match) {
    appKey = match.dataset.antonellaReactApp || null;
  }
}

if (!appKey && appScripts.length === 1) {
  appKey = appScripts[0].dataset.antonellaReactApp || null;
}

if (!appKey) {
  const containerKeys = new Set(
    Array.from(document.querySelectorAll('[data-antonella-react]'))
      .map((node) => node.getAttribute('data-antonella-react'))
      .filter(Boolean)
  );

  if (containerKeys.size === 1) {
    appKey = Array.from(containerKeys)[0];
  }
}

if (!appKey) {
  console.warn('Antonella React app key not found. Skipping mount to avoid collisions.');
}

const REACT_SELECTOR = appKey
  ? `[data-antonella-react="${appKey}"]`
  : '[data-antonella-react="1"]';

function parseContainerData(container) {
  const componentName = container.getAttribute('data-component');
  const propsJson = container.getAttribute('data-props');

  if (componentName) {
    const props = propsJson ? JSON.parse(propsJson) : {};
    return { component: componentName, props };
  }

  const pageDataAttr = container.getAttribute('data-page');
  if (pageDataAttr) {
    const pageData = JSON.parse(pageDataAttr);
    return { component: pageData.component, props: pageData.props || {} };
  }

  return null;
}

function mountContainer(container) {
  if (container.getAttribute(MOUNTED_ATTR) === '1') {
    return;
  }

  try {
    const data = parseContainerData(container);
    if (!data || !data.component) {
      console.warn('Container found but no component data', container);
      return;
    }

    const root = createRoot(container);
    root.render(<App component={data.component} props={data.props} />);
    container.setAttribute(MOUNTED_ATTR, '1');
  } catch (error) {
    console.error('Failed to mount React container:', error);
  }
}

function mountAll(root = document) {
  const containers = root.querySelectorAll(REACT_SELECTOR);
  containers.forEach(mountContainer);
}

function findContainers(node) {
  if (node.nodeType !== 1) {
    return [];
  }

  const containers = [];
  if (node.matches && node.matches(REACT_SELECTOR)) {
    containers.push(node);
  }
  if (node.querySelectorAll) {
    containers.push(...node.querySelectorAll(REACT_SELECTOR));
  }
  return containers;
}

function startObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        findContainers(node).forEach(mountContainer);
      });
    });
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountAll());
} else {
  mountAll();
}

startObserver();