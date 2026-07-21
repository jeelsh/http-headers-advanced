import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useRest from '@/hooks/useRest';
import { Download, Upload, RotateCcw, CheckCircle2, XCircle, Loader2, FileUp } from 'lucide-react';
import { __, sprintf } from '@/i18n';

function ValidationBadge({ valid, message }) {
  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
      valid
        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
        : 'bg-red-500/10 text-red-600 dark:text-red-400'
    }`}>
      {valid ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

export default function Tools() {
  const [importText, setImportText] = useState('');
  const [validation, setValidation] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef(null);

  const { execute: doExport, loading: exporting } = useRest('/tools/export', { method: 'GET' });
  const { execute: doImport, loading: importing } = useRest('/tools/import', { method: 'POST' });
  const { execute: doReset, loading: resetting } = useRest('/tools/reset', { method: 'POST' });

  // --- Export ---
  const handleExport = async () => {
    const data = await doExport();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeelsh-http-headers-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Validate JSON ---
  const validateJson = (text) => {
    if (!text.trim()) {
      setValidation(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);

      if (!parsed.plugin || parsed.plugin !== 'jeelsh-http-headers') {
        setValidation({ valid: false, message: __('Campo "plugin" inválido o ausente. Se esperaba "jeelsh-http-headers".', 'jeelsh-http-headers') });
        return;
      }

      if (!parsed.settings || typeof parsed.settings !== 'object') {
        setValidation({ valid: false, message: __('Campo "settings" ausente o inválido.', 'jeelsh-http-headers') });
        return;
      }

      const keyCount = Object.keys(parsed.settings).length;
      const source = parsed.site_url ? ` (de ${parsed.site_url})` : '';
      setValidation({ valid: true, message: sprintf(__('JSON válido: %1$d configuraciones encontradas%2$s.', 'jeelsh-http-headers'), keyCount, source), data: parsed });
    } catch {
      setValidation({ valid: false, message: __('JSON inválido. Revisa el formato.', 'jeelsh-http-headers') });
    }
  };

  // --- File input ---
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setImportText(text);
      validateJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Textarea change ---
  const handleTextChange = (e) => {
    const text = e.target.value;
    setImportText(text);
    validateJson(text);
  };

  // --- Import ---
  const handleImport = async () => {
    if (!validation?.valid || !validation.data) return;

    const result = await doImport(validation.data);
    if (result) {
      setImportStatus({ success: true, message: __('Configuración importada correctamente.', 'jeelsh-http-headers') });
      setImportText('');
      setValidation(null);
    } else {
      setImportStatus({ success: false, message: __('Error al importar la configuración.', 'jeelsh-http-headers') });
    }

    setTimeout(() => setImportStatus(null), 4000);
  };

  // --- Reset ---
  const handleReset = async () => {
    setResetOpen(false);
    const result = await doReset({});
    if (result) {
      setImportStatus({ success: true, message: __('Configuración restablecida a los valores por defecto.', 'jeelsh-http-headers') });
    } else {
      setImportStatus({ success: false, message: __('Error al restablecer la configuración.', 'jeelsh-http-headers') });
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status toast */}
      {importStatus && (
        <ValidationBadge valid={importStatus.success} message={importStatus.message} />
      )}

      {/* Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{__('Export Settings', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>
            {__('Descarga la configuración actual en formato JSON para respaldarla o transferirla a otro sitio.', 'jeelsh-http-headers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            {__('Download Export File', 'jeelsh-http-headers')}
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{__('Import Settings', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>
            {__('Importa una configuración desde un archivo JSON exportado o pega el contenido directamente.', 'jeelsh-http-headers')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" />
              {__('Seleccionar archivo JSON', 'jeelsh-http-headers')}
            </Button>
          </div>

          <Textarea
            placeholder={__('O pega aquí el contenido del archivo JSON...', 'jeelsh-http-headers')}
            value={importText}
            onChange={handleTextChange}
            className="font-mono text-xs min-h-32"
          />

          {validation && (
            <ValidationBadge valid={validation.valid} message={validation.message} />
          )}

          <Button
            onClick={handleImport}
            disabled={!validation?.valid || importing}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {__('Importar configuración', 'jeelsh-http-headers')}
          </Button>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{__('Reset Configuration', 'jeelsh-http-headers')}</CardTitle>
          </div>
          <CardDescription>
            {__('Restaura toda la configuración a los valores por defecto de instalación.', 'jeelsh-http-headers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={resetOpen} onOpenChange={setResetOpen}>
            <PopoverTrigger
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              disabled={resetting}
            >
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {__('Reset to Defaults', 'jeelsh-http-headers')}
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <p className="text-sm font-medium">{__('¿Estás seguro?', 'jeelsh-http-headers')}</p>
                <p className="text-sm text-muted-foreground">
                  {__('Se restaurará la configuración de instalación. Esta acción no se puede deshacer.', 'jeelsh-http-headers')}
                  {' '}<a href="#" className="text-primary underline hover:text-primary/80" onClick={(e) => { e.preventDefault(); handleExport(); }}>{__('Descarga backup de configuración', 'jeelsh-http-headers')}</a>.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setResetOpen(false)}>
                    {__('Cancelar', 'jeelsh-http-headers')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleReset}>
                    {__('Confirmar', 'jeelsh-http-headers')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
}
