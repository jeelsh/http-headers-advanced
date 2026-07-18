import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "./Dashboard";
import Settings from "./Settings";

export default function AdminPanel({
  title,
  message,
  enabled,
  customHeader,
  assetBaseUrl,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const stored = window.localStorage.getItem("http_headers_advanced_theme");
    if (stored) {
      return stored === "dark";
    }
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("http_headers_advanced_theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <AdminLayout
      title={title}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      assetBaseUrl={assetBaseUrl}
    >
      {activeTab === "dashboard" && (
        <Dashboard assetBaseUrl={assetBaseUrl} isDark={isDark} />
      )}
      {activeTab === "settings" && (
        <Settings
          title={title}
          message={message}
          enabled={enabled}
          customHeader={customHeader}
          assetBaseUrl={assetBaseUrl}
          isDark={isDark}
        />
      )}
    </AdminLayout>
  );
}
