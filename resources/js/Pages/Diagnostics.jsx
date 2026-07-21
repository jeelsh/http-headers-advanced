import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useRest from '@/hooks/useRest';
import { Loader2, CheckCircle2, XCircle, Server, Shield, Globe } from 'lucide-react';
import { __ } from '@/i18n';

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
        <span className="ml-2 text-muted-foreground">{__('Cargando diagnóstico…', 'jeelsh-http-headers')}</span>
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
            <CardTitle>{__('Entorno', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>{__('Información del servidor y entorno de WordPress.', 'jeelsh-http-headers')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">{__('Site URL', 'jeelsh-http-headers')}</TableCell>
                <TableCell><code className="text-sm">{environment.site_url}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HTTPS</TableCell>
                <TableCell>
                  <Badge active={environment.is_https} label={environment.is_https ? __('Sí', 'jeelsh-http-headers') : __('No', 'jeelsh-http-headers')} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('Servidor', 'jeelsh-http-headers')}</TableCell>
                <TableCell><code className="text-sm">{environment.server_software}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Apache</TableCell>
                <TableCell>
                  <Badge active={environment.is_apache} label={environment.is_apache ? __('Sí', 'jeelsh-http-headers') : __('No', 'jeelsh-http-headers')} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nginx</TableCell>
                <TableCell>
                  <Badge active={environment.is_nginx} label={environment.is_nginx ? __('Sí', 'jeelsh-http-headers') : __('No', 'jeelsh-http-headers')} />
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
            <CardTitle>{__('Resumen de configuración', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>{__('Estado general de las cabeceras de seguridad configuradas.', 'jeelsh-http-headers')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">{__('Cabeceras configuradas', 'jeelsh-http-headers')}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {summary.configured_headers_count}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('Modo CSP', 'jeelsh-http-headers')}</TableCell>
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
                <TableCell className="font-medium">{__('CSP Fail-safe', 'jeelsh-http-headers')}</TableCell>
                <TableCell>
                  <Badge active={summary.csp_fail_safe} label={summary.csp_fail_safe ? __('Activado', 'jeelsh-http-headers') : __('Desactivado', 'jeelsh-http-headers')} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('Detección de fuentes CSP', 'jeelsh-http-headers')}</TableCell>
                <TableCell><code className="text-sm">{summary.csp_source_detection}</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('Report collector', 'jeelsh-http-headers')}</TableCell>
                <TableCell>
                  <Badge active={summary.csp_report_collector} label={summary.csp_report_collector ? __('Activado', 'jeelsh-http-headers') : __('Desactivado', 'jeelsh-http-headers')} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('Método de inyección', 'jeelsh-http-headers')}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                    summary.injection_method === 'htaccess'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {summary.injection_method === 'htaccess' ? '.htaccess' : 'PHP (send_headers)'}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{__('.htaccess escribible', 'jeelsh-http-headers')}</TableCell>
                <TableCell>
                  <Badge active={summary.htaccess_writable} label={summary.htaccess_writable ? __('Sí', 'jeelsh-http-headers') : __('No', 'jeelsh-http-headers')} />
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
            <CardTitle>{__('Cabeceras HTTP generadas', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>{__('Cabeceras que se enviarán al navegador según la configuración actual.', 'jeelsh-http-headers')}</CardDescription>
        </CardHeader>
        <CardContent>
          {configured_headers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {__('No hay cabeceras configuradas actualmente.', 'jeelsh-http-headers')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">{__('Header', 'jeelsh-http-headers')}</TableHead>
                  <TableHead>{__('Value', 'jeelsh-http-headers')}</TableHead>
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
