import { useEffect } from "react";
import { Shield, Globe, Server, Lock, FileCode2, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashedLine from "@/components/ui/DashedLine";
import useRest from "@/hooks/useRest";

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ assetBaseUrl, isDark, onTabChange }) {
  const { execute, data, loading } = useRest("/diagnostics");

  useEffect(() => {
    execute();
  }, []);

  const env = data?.environment || {};
  const summary = data?.summary || {};
  const headers = data?.configured_headers || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen del estado de HTTP Headers Advanced.
        </p>
      </div>
      <DashedLine position="bottom" assetBaseUrl={assetBaseUrl} isDark={isDark} className="my-4" />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Shield}
              label="Active Headers"
              value={summary.configured_headers_count ?? 0}
              description="Cabeceras HTTP configuradas y activas"
            />
            <StatCard
              icon={Server}
              label="Injection Method"
              value={summary.injection_method === 'htaccess' ? '.htaccess' : 'PHP'}
              description={summary.injection_method === 'htaccess' ? 'Inyección directa vía .htaccess' : 'Inyección vía send_headers de PHP'}
            />
            <StatCard
              icon={Lock}
              label="CSP Mode"
              value={summary.csp_mode ?? 'Disabled'}
              description={
                summary.csp_mode === 'Enforce'
                  ? 'Content-Security-Policy activo en modo estricto'
                  : summary.csp_mode === 'Report-Only'
                    ? 'CSP en modo reporte (no bloquea)'
                    : 'Content-Security-Policy deshabilitado'
              }
            />
          </div>

          {/* Environment summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Entorno</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sitio</span>
                  <span className="font-medium truncate ml-4">{env.site_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HTTPS</span>
                  <span className={`font-medium ${env.is_https ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {env.is_https ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servidor</span>
                  <span className="font-medium">{env.server_software}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PHP</span>
                  <span className="font-medium">{env.php_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WordPress</span>
                  <span className="font-medium">{env.wp_version}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Cabeceras activas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {headers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay cabeceras configuradas.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {headers.map((h) => (
                      <li key={h.name} className="flex items-center gap-2 text-sm">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <code className="text-xs font-mono truncate">{h.name}</code>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Acciones rápidas</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Configura las cabeceras de seguridad HTTP de tu sitio desde el panel de Settings.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => onTabChange?.("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Ir a Settings
                </Button>
                <Button variant="outline" onClick={() => onTabChange?.("diagnostics")}>
                  Diagnósticos
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
