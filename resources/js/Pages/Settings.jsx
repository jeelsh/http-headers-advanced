import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import CspSourceField from '@/components/CspSourceField';
import { parseCspValue } from '@/lib/csp';
import useRest from '@/hooks/useRest';
import useHashTab from '@/hooks/useHashTab';
import { useToast } from '@/hooks/useToast';
import { Save, Loader2, Shield, Globe, Lock } from 'lucide-react';
import { __ } from '@/i18n';

const DEFAULTS = {
  hsts_enabled: true,
  hsts_max_age: 31536000,
  hsts_include_subdomains: true,
  hsts_preload: false,
  xcto_nosniff: true,
  referrer_policy_enabled: true,
  referrer_policy_value: 'strict-origin-when-cross-origin',
  xfo_enabled: true,
  xfo_value: 'SAMEORIGIN',
  permissions_policy_enabled: true,
  permissions_policy_value: 'accelerometer=(), autoplay=(), camera=(), geolocation=(self), gyroscope=(), microphone=(), payment=()',
  xpcdp_enabled: true,
  xpcdp_value: 'none',
  csp_enabled: false,
  csp_report_only: true,
  csp_emergency_failsafe: true,
  csp_auto_detect: true,
  csp_report_collector: true,
  csp_default_src: "'self'",
  csp_script_src: "'self' 'unsafe-inline' 'unsafe-eval'",
  csp_style_src: "'self' 'unsafe-inline'",
  csp_img_src: "'self' data: https:",
  csp_connect_src: "'self'",
  csp_font_src: "'self' data: https:",
  csp_object_src: "'none'",
  csp_base_uri: "'self'",
  csp_frame_ancestors: "'self'",
  csp_form_action: "'self'",
  csp_report_uri: '',
  csp_upgrade_insecure: false,
};

const validSubTabs = ['hsts', 'headers', 'csp'];

export default function Settings({ assetBaseUrl, isDark }) {
  const [form, setForm] = useState(DEFAULTS);
  const [cspErrors, setCspErrors] = useState({});
  const { toast } = useToast();
  const { tab: subTab, setTab: handleSubTabChange } = useHashTab(validSubTabs, 'hsts', 1, 'settings');

  const { execute: loadSettings, loading: loadingGet } = useRest('/settings', { method: 'GET' });
  const { execute: saveSettings, loading: loadingSave } = useRest('/settings', {
    method: 'POST',
    onError: (err) => {
      toast({ variant: 'destructive', title: __('Error al guardar', 'http-headers-advanced'), description: err.message, duration: null });
    },
  });

  useEffect(() => {
    loadSettings().then((data) => {
      if (data) setForm((prev) => ({ ...prev, ...data }));
    });
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCspErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleCspValidation = (id, error) => {
    setCspErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleSave = async () => {
    const cspFields = [
      'csp_default_src',
      'csp_script_src',
      'csp_style_src',
      'csp_img_src',
      'csp_connect_src',
      'csp_font_src',
      'csp_object_src',
      'csp_base_uri',
      'csp_frame_ancestors',
      'csp_form_action',
    ];

    const payload = { ...form };
    const errors = {};
    let hasErrors = false;

    for (const key of cspFields) {
      const result = parseCspValue(String(form[key] ?? ''), 'sources');
      if (result.error) {
        errors[key] = result.error;
        hasErrors = true;
      } else {
        payload[key] = result.corrected;
      }
    }

    const reportResult = parseCspValue(String(form.csp_report_uri ?? ''), 'report-uri');
    if (reportResult.error) {
      errors.csp_report_uri = reportResult.error;
      hasErrors = true;
    } else {
      payload.csp_report_uri = reportResult.corrected;
    }

    setCspErrors(errors);

    if (hasErrors) {
      toast({
        variant: 'destructive',
        title: __('Error en CSP', 'http-headers-advanced'),
        description: __('Corrige los campos marcados en rojo antes de guardar.', 'http-headers-advanced'),
        duration: null,
      });
      return;
    }

    const result = await saveSettings(payload);
    if (!result) {
      return;
    }

    toast({ variant: 'success', title: __('Guardado', 'http-headers-advanced'), description: __('Configuración guardada correctamente.', 'http-headers-advanced') });
    if (result?.settings) {
      setForm((prev) => ({ ...prev, ...result.settings }));
    }
  };

  if (loadingGet) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">{__('Cargando configuración…', 'http-headers-advanced')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs value={subTab} onValueChange={handleSubTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="hsts" className="gap-1.5">
            <Lock className="h-4 w-4" /> HSTS
          </TabsTrigger>
          <TabsTrigger value="headers" className="gap-1.5">
            <Globe className="h-4 w-4" /> {__('Cabeceras', 'http-headers-advanced')}
          </TabsTrigger>
          <TabsTrigger value="csp" className="gap-1.5">
            <Shield className="h-4 w-4" /> CSP
          </TabsTrigger>
        </TabsList>

        {/* HSTS */}
        <TabsContent value="hsts">
          <Card>
            <CardHeader>
              <CardTitle>Strict-Transport-Security (HSTS)</CardTitle>
              <CardDescription>{__('Obliga a los navegadores a conectarse solo por HTTPS.', 'http-headers-advanced')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSwitch
                id="hsts_enabled"
                label={__('Activar HSTS', 'http-headers-advanced')}
                checked={form.hsts_enabled}
                onChange={(v) => handleChange('hsts_enabled', v)}
              />
              <FieldInput
                id="hsts_max_age"
                label={__('Max-Age (segundos)', 'http-headers-advanced')}
                type="number"
                value={form.hsts_max_age}
                onChange={(v) => handleChange('hsts_max_age', parseInt(v, 10) || 0)}
              />
              <FieldSwitch
                id="hsts_include_subdomains"
                label={__('Incluir subdominios', 'http-headers-advanced')}
                checked={form.hsts_include_subdomains}
                onChange={(v) => handleChange('hsts_include_subdomains', v)}
              />
              <FieldSwitch
                id="hsts_preload"
                label={__('Añadir directiva preload', 'http-headers-advanced')}
                checked={form.hsts_preload}
                onChange={(v) => handleChange('hsts_preload', v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Headers */}
        <TabsContent value="headers">
          <Card>
            <CardHeader>
              <CardTitle>{__('Otras cabeceras de seguridad', 'http-headers-advanced')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* X-Content-Type-Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">X-Content-Type-Options</h4>
                <FieldSwitch
                  id="xcto_nosniff"
                  label={__('Enviar nosniff', 'http-headers-advanced')}
                  checked={form.xcto_nosniff}
                  onChange={(v) => handleChange('xcto_nosniff', v)}
                />
              </div>

              <Separator />

              {/* Referrer-Policy */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Referrer-Policy</h4>
                <FieldSwitch
                  id="referrer_policy_enabled"
                  label={__('Activar Referrer-Policy', 'http-headers-advanced')}
                  checked={form.referrer_policy_enabled}
                  onChange={(v) => handleChange('referrer_policy_enabled', v)}
                />
                {form.referrer_policy_enabled && (
                  <FieldSelect
                    id="referrer_policy_value"
                    label={__('Política', 'http-headers-advanced')}
                    value={form.referrer_policy_value}
                    onChange={(v) => handleChange('referrer_policy_value', v)}
                    options={[
                      { value: 'no-referrer', label: 'no-referrer' },
                      { value: 'same-origin', label: 'same-origin' },
                      { value: 'strict-origin', label: 'strict-origin' },
                      { value: 'strict-origin-when-cross-origin', label: 'strict-origin-when-cross-origin' },
                      { value: 'origin-when-cross-origin', label: 'origin-when-cross-origin' },
                    ]}
                  />
                )}
              </div>

              <Separator />

              {/* X-Frame-Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">X-Frame-Options</h4>
                <FieldSwitch
                  id="xfo_enabled"
                  label={__('Activar X-Frame-Options', 'http-headers-advanced')}
                  checked={form.xfo_enabled}
                  onChange={(v) => handleChange('xfo_enabled', v)}
                />
                {form.xfo_enabled && (
                  <FieldSelect
                    id="xfo_value"
                    label={__('Modo', 'http-headers-advanced')}
                    value={form.xfo_value}
                    onChange={(v) => handleChange('xfo_value', v)}
                    options={[
                      { value: 'SAMEORIGIN', label: 'SAMEORIGIN' },
                      { value: 'DENY', label: 'DENY' },
                    ]}
                  />
                )}
              </div>

              <Separator />

              {/* Permissions-Policy */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Permissions-Policy</h4>
                <FieldSwitch
                  id="permissions_policy_enabled"
                  label={__('Activar Permissions-Policy', 'http-headers-advanced')}
                  checked={form.permissions_policy_enabled}
                  onChange={(v) => handleChange('permissions_policy_enabled', v)}
                />
                {form.permissions_policy_enabled && (
                  <FieldTextarea
                    id="permissions_policy_value"
                    label={__('Valor de la política', 'http-headers-advanced')}
                    value={form.permissions_policy_value}
                    onChange={(v) => handleChange('permissions_policy_value', v)}
                  />
                )}
              </div>

              <Separator />

              {/* X-Permitted-Cross-Domain-Policies */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">X-Permitted-Cross-Domain-Policies</h4>
                <FieldSwitch
                  id="xpcdp_enabled"
                  label={__('Activar cabecera', 'http-headers-advanced')}
                  checked={form.xpcdp_enabled}
                  onChange={(v) => handleChange('xpcdp_enabled', v)}
                />
                {form.xpcdp_enabled && (
                  <FieldSelect
                    id="xpcdp_value"
                    label={__('Valor', 'http-headers-advanced')}
                    value={form.xpcdp_value}
                    onChange={(v) => handleChange('xpcdp_value', v)}
                    options={[
                      { value: 'none', label: 'none' },
                      { value: 'master-only', label: 'master-only' },
                      { value: 'by-content-type', label: 'by-content-type' },
                      { value: 'all', label: 'all' },
                    ]}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSP */}
        <TabsContent value="csp">
          <Card>
            <CardHeader>
              <CardTitle>Content-Security-Policy (CSP)</CardTitle>
              <CardDescription>{__('Controla qué recursos puede cargar el navegador.', 'http-headers-advanced')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSwitch
                id="csp_enabled"
                label={__('Activar Content-Security-Policy', 'http-headers-advanced')}
                checked={form.csp_enabled}
                onChange={(v) => handleChange('csp_enabled', v)}
              />
              <FieldSwitch
                id="csp_report_only"
                label={__('Solo modo Report-Only', 'http-headers-advanced')}
                checked={form.csp_report_only}
                onChange={(v) => handleChange('csp_report_only', v)}
              />
              <FieldSwitch
                id="csp_emergency_failsafe"
                label={__('Emergency fail-safe', 'http-headers-advanced')}
                checked={form.csp_emergency_failsafe}
                onChange={(v) => handleChange('csp_emergency_failsafe', v)}
              />
              <FieldSwitch
                id="csp_auto_detect"
                label={__('Auto-detectar fuentes desde HTML', 'http-headers-advanced')}
                checked={form.csp_auto_detect}
                onChange={(v) => handleChange('csp_auto_detect', v)}
              />
              <FieldSwitch
                id="csp_report_collector"
                label={__('Enviar reportes al collector interno', 'http-headers-advanced')}
                checked={form.csp_report_collector}
                onChange={(v) => handleChange('csp_report_collector', v)}
              />

              <Separator />

              <h4 className="text-sm font-semibold">{__('Directivas CSP', 'http-headers-advanced')}</h4>

              <CspSourceField
                id="csp_default_src"
                label="default-src"
                value={form.csp_default_src}
                onChange={(v) => handleChange('csp_default_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_default_src}
                placeholder="'self' https://example.com 'nonce-abc123'"
              />
              <CspSourceField
                id="csp_script_src"
                label="script-src"
                value={form.csp_script_src}
                onChange={(v) => handleChange('csp_script_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_script_src}
                placeholder="'self' 'unsafe-inline' 'unsafe-eval'"
              />
              <CspSourceField
                id="csp_style_src"
                label="style-src"
                value={form.csp_style_src}
                onChange={(v) => handleChange('csp_style_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_style_src}
                placeholder="'self' 'unsafe-inline'"
              />
              <CspSourceField
                id="csp_img_src"
                label="img-src"
                value={form.csp_img_src}
                onChange={(v) => handleChange('csp_img_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_img_src}
                placeholder="'self' data: https:"
              />
              <CspSourceField
                id="csp_connect_src"
                label="connect-src"
                value={form.csp_connect_src}
                onChange={(v) => handleChange('csp_connect_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_connect_src}
                placeholder="'self' https://api.example.com"
              />
              <CspSourceField
                id="csp_font_src"
                label="font-src"
                value={form.csp_font_src}
                onChange={(v) => handleChange('csp_font_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_font_src}
                placeholder="'self' data: https:"
              />
              <CspSourceField
                id="csp_object_src"
                label="object-src"
                value={form.csp_object_src}
                onChange={(v) => handleChange('csp_object_src', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_object_src}
                placeholder="'none'"
              />
              <CspSourceField
                id="csp_base_uri"
                label="base-uri"
                value={form.csp_base_uri}
                onChange={(v) => handleChange('csp_base_uri', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_base_uri}
                placeholder="'self'"
              />
              <CspSourceField
                id="csp_frame_ancestors"
                label="frame-ancestors"
                value={form.csp_frame_ancestors}
                onChange={(v) => handleChange('csp_frame_ancestors', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_frame_ancestors}
                placeholder="'self' https://example.com"
              />
              <CspSourceField
                id="csp_form_action"
                label="form-action"
                value={form.csp_form_action}
                onChange={(v) => handleChange('csp_form_action', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_form_action}
                placeholder="'self'"
              />
              <CspSourceField
                mode="report-uri"
                id="csp_report_uri"
                label="report-uri"
                value={form.csp_report_uri}
                onChange={(v) => handleChange('csp_report_uri', v)}
                onValidation={handleCspValidation}
                error={cspErrors.csp_report_uri}
                placeholder="https://..."
              />

              <Separator />

              <FieldSwitch
                id="csp_upgrade_insecure"
                label={__('Añadir upgrade-insecure-requests', 'http-headers-advanced')}
                checked={form.csp_upgrade_insecure}
                onChange={(v) => handleChange('csp_upgrade_insecure', v)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loadingSave} className="gap-2">
          {loadingSave ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {__('Guardar configuración', 'http-headers-advanced')}
        </Button>
      </div>
    </div>
  );
}

/* ─── Field Components ─────────────────────────────────────────── */

function FieldSwitch({ id, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function FieldInput({ id, label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldTextarea({ id, label, value, onChange, placeholder }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldSelect({ id, label, value, onChange, options }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
