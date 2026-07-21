import { useEffect } from "react";
import { Shield, Globe, Server, Lock, FileCode2, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashedLine from "@/components/ui/DashedLine";
import useRest from "@/hooks/useRest";
import { __ } from "@/i18n";

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
        <h2 className="text-2xl font-bold tracking-tight text-white">{__('Dashboard', 'jeelsh-http-headers')}</h2>
        <p className="text-muted-foreground">
          {__('Resumen del estado de HTTP Headers Advanced.', 'jeelsh-http-headers')}
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
              label={__('Active Headers', 'jeelsh-http-headers')}
              value={summary.configured_headers_count ?? 0}
              description={__('Cabeceras HTTP configuradas y activas', 'jeelsh-http-headers')}
            />
            <StatCard
              icon={Server}
              label={__('Injection Method', 'jeelsh-http-headers')}
              value={summary.injection_method === 'htaccess' ? '.htaccess' : 'PHP'}
              description={summary.injection_method === 'htaccess' ? __('Inyección directa vía .htaccess', 'jeelsh-http-headers') : __('Inyección vía send_headers de PHP', 'jeelsh-http-headers')}
            />
            <StatCard
              icon={Lock}
              label={__('CSP Mode', 'jeelsh-http-headers')}
              value={summary.csp_mode ?? __('Disabled', 'jeelsh-http-headers')}
              description={
                summary.csp_mode === 'Enforce'
                  ? __('Content-Security-Policy activo en modo estricto', 'jeelsh-http-headers')
                  : summary.csp_mode === 'Report-Only'
                    ? __('CSP en modo reporte (no bloquea)', 'jeelsh-http-headers')
                    : __('Content-Security-Policy deshabilitado', 'jeelsh-http-headers')
              }
            />
          </div>

          {/* Environment summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{__('Entorno', 'jeelsh-http-headers')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{__('Sitio', 'jeelsh-http-headers')}</span>
                  <span className="font-medium truncate ml-4">{env.site_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HTTPS</span>
                  <span className={`font-medium ${env.is_https ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {env.is_https ? __('Sí', 'jeelsh-http-headers') : __('No', 'jeelsh-http-headers')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{__('Servidor', 'jeelsh-http-headers')}</span>
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
                  <CardTitle className="text-base">{__('Cabeceras activas', 'jeelsh-http-headers')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {headers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{__('No hay cabeceras configuradas.', 'jeelsh-http-headers')}</p>
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
              <h3 className="text-lg font-semibold mb-2">{__('Acciones rápidas', 'jeelsh-http-headers')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {__('Configura las cabeceras de seguridad HTTP de tu sitio desde el panel de Settings.', 'jeelsh-http-headers')}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => onTabChange?.("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  {__('Ir a Settings', 'jeelsh-http-headers')}
                </Button>
                <Button variant="outline" onClick={() => onTabChange?.("diagnostics")}>
                  {__('Diagnósticos', 'jeelsh-http-headers')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
