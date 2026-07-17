import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import DashedLine from "@/components/ui/DashedLine";

export default function RightSidebar({ isDark, assetBaseUrl }) {
  return (
    <aside className="w-72 p-5 border-l border-border bg-background">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Soporte
      </h3>
      <DashedLine position="bottom" assetBaseUrl={assetBaseUrl} isDark={isDark} className="mb-4" />
      <p className="text-sm text-muted-foreground mb-4">
        ¿Necesitas ayuda? Consulta la documentación o contacta con soporte para resolver tus dudas.
      </p>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => window.open("https://support.example.com", "_blank")}
      >
        <HelpCircle className="h-4 w-4" />
        Apoyo
      </Button>
    </aside>
  );
}
