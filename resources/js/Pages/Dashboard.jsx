import { Activity, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashedLine from "@/components/ui/DashedLine";

const stats = [
  { label: "Sites", value: "1", icon: Globe },
  { label: "Active Headers", value: "0", icon: Shield },
  { label: "Requests", value: "—", icon: Activity },
];

export default function Dashboard({ assetBaseUrl, isDark }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen del estado de HTTP Headers Advanced.
        </p>
      </div>
      <DashedLine position="bottom" assetBaseUrl={assetBaseUrl} isDark={isDark} className="my-4" />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
        <h3 className="text-lg font-semibold mb-2">Bienvenido</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Desde aquí podrás gestionar los headers avanzados de tu sitio. Usa el
          sidebar para navegar entre Dashboard y Settings.
        </p>
        <Button>Ir a Settings</Button>
      </div>
    </div>
  );
}
