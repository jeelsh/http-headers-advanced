import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useRest from '@/hooks/useRest';
import { Loader2, CheckCircle2, XCircle, Server, Shield, Globe } from 'lucide-react';

function Badge({ active, label }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
      active
        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
        : 'bg-red-500/10 text-red-600 dark:text-red-400'
    }`}>
      {active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

export default function Diagnostics() {
  const { execute, data, loading } = useRest('/diagnostics', { method: 'GET' });

  useEffect(() => {
    execute();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando diagnóstico…</span>
      </div>
    );
  }

  const { environment, summary, configured_headers } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Entorno */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Entorno</CardTitle>
          </div>
          <CardDescription>Información del servidor y entorno de WordPress.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Site URL</TableCell>
                <TableCell><code className="text-sm">{environment.site_url}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HTTPS</TableCell>
                <TableCell>
                  <Badge active={environment.is_https} label={environment.is_https ? 'Sí' : 'No'} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Servidor</TableCell>
                <TableCell><code className="text-sm">{environment.server_software}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Apache</TableCell>
                <TableCell>
                  <Badge active={environment.is_apache} label={environment.is_apache ? 'Sí' : 'No'} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nginx</TableCell>
                <TableCell>
                  <Badge active={environment.is_nginx} label={environment.is_nginx ? 'Sí' : 'No'} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PHP</TableCell>
                <TableCell><code className="text-sm">{environment.php_version}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">WordPress</TableCell>
                <TableCell><code className="text-sm">{environment.wp_version}</code></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Resumen de configuración</CardTitle>
          </div>
          <CardDescription>Estado general de las cabeceras de seguridad configuradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Cabeceras configuradas</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {summary.configured_headers_count}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Modo CSP</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                    summary.csp_mode === 'Enforce'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : summary.csp_mode === 'Report-Only'
                        ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {summary.csp_mode}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">CSP Fail-safe</TableCell>
                <TableCell>
                  <Badge active={summary.csp_fail_safe} label={summary.csp_fail_safe ? 'Activado' : 'Desactivado'} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Detección de fuentes CSP</TableCell>
                <TableCell><code className="text-sm">{summary.csp_source_detection}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Report collector</TableCell>
                <TableCell>
                  <Badge active={summary.csp_report_collector} label={summary.csp_report_collector ? 'Activado' : 'Desactivado'} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cabeceras generadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Cabeceras HTTP generadas</CardTitle>
          </div>
          <CardDescription>Cabeceras que se enviarán al navegador según la configuración actual.</CardDescription>
        </CardHeader>
        <CardContent>
          {configured_headers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay cabeceras configuradas actualmente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Header</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configured_headers.map((header) => (
                  <TableRow key={header.name}>
                    <TableCell>
                      <code className="text-sm font-semibold">{header.name}</code>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm break-all">{header.value}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
