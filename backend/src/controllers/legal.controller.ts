import type { Request, Response } from "express";

const POLICY_VERSION = process.env.POLICY_VERSION ?? "1";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPrivacyPolicyHtml(): string {
  const title = "Política de tratamiento de datos personales";
  const version = escapeHtml(POLICY_VERSION);
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - EcoTrack</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; background: #f6f8fb; color: #16202a; }
    main { max-width: 900px; margin: 0 auto; padding: 40px 20px 64px; }
    .card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
    h1, h2 { line-height: 1.15; }
    .meta { display: inline-flex; gap: 12px; align-items: center; margin-bottom: 16px; font-size: 0.95rem; color: #52606d; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 700; }
    a { color: #0f766e; }
    .actions { margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
    .button { display: inline-block; padding: 12px 16px; border-radius: 12px; text-decoration: none; font-weight: 700; }
    .primary { background: #0f766e; color: white; }
    .secondary { background: #e2e8f0; color: #0f172a; }
    ul { padding-left: 20px; }
    .note { font-size: 0.92rem; color: #52606d; }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <div class="meta"><span class="badge">Versión ${version}</span><span>EcoTrack</span></div>
      <h1>${title}</h1>
      <p>Esta política describe cómo EcoTrack trata datos personales en los flujos de registro, acceso, auditoría y anonimización.</p>
      <h2>Resumen legal</h2>
      <ul>
        <li>Finalidad: administración de cuentas, seguridad, auditoría y cumplimiento.</li>
        <li>Base de tratamiento: consentimiento explícito mediante el checkbox obligatorio de registro.</li>
        <li>Conservación: se preservan únicamente los registros legalmente requeridos, como auditoría de aceptación y anonimización.</li>
        <li>Seguridad: transmisión HTTPS/TLS, encabezados seguros y control de acceso por JWT.</li>
        <li>Derechos: el usuario puede solicitar la anonimización de su cuenta mediante el endpoint de privacidad.</li>
      </ul>
      <p class="note">Antes de registrarte, confirma que has leído esta política y marca la casilla <strong>"Acepto términos y política de tratamiento de datos"</strong>.</p>
      <div class="actions">
        <a class="button primary" href="/api-docs">Abrir API docs</a>
        <a class="button secondary" href="/">Volver al inicio</a>
      </div>
    </section>
  </main>
</body>
</html>`;
}

export class LegalController {
  public static getPrivacyPolicy(_req: Request, res: Response): Response {
    return res.status(200).type("html").send(renderPrivacyPolicyHtml());
  }
}

export default LegalController;