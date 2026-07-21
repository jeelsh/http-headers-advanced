import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { __ } from "@/i18n";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <Button variant="outline" size="icon" onClick={onToggle} aria-label={__('Toggle theme', 'jeelsh-http-headers')}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
