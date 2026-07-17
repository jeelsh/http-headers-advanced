import ThemeToggle from "@/components/ui/ThemeToggle";
import DashedLine from "@/components/ui/DashedLine";

export default function TopBar({ title, isDark, onToggle, assetBaseUrl }) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggle} />
      </div>
      <DashedLine position="bottom" assetBaseUrl={assetBaseUrl} isDark={isDark} />
    </header>
  );
}
