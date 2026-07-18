import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import DashedColumn from "@/components/ui/DashedColumn";

export default function AdminLayout({
  title,
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  assetBaseUrl,
  children,
}) {
  return (
    <div className={`h-[calc(100vh-32px)] bg-background text-foreground flex flex-col ${isDark ? "dark" : ""}`}>
      <TopBar
        title={title}
        isDark={isDark}
        onToggle={onToggleTheme}
        assetBaseUrl={assetBaseUrl}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          activeTab={activeTab}
          onChange={onTabChange}
          isDark={isDark}
          assetBaseUrl={assetBaseUrl}
        />
        <DashedColumn position="right" assetBaseUrl={assetBaseUrl} isDark={isDark} className="hidden md:block" />
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          {children}
        </main>
        <DashedColumn position="left" assetBaseUrl={assetBaseUrl} isDark={isDark} className="hidden md:block" />
        <RightSidebar isDark={isDark} assetBaseUrl={assetBaseUrl} />
      </div>
    </div>
  );
}
