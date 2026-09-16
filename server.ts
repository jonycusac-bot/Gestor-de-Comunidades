import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to determine the app's base URL
function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GitHub OAuth Status Endpoint
app.get('/api/auth/github/status', (req, res) => {
  const isConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const baseUrl = getBaseUrl(req);
  res.json({
    configured: isConfigured,
    clientId: process.env.GITHUB_CLIENT_ID ? `${process.env.GITHUB_CLIENT_ID.substring(0, 6)}...` : null,
    callbackUrl: `${baseUrl}/auth/callback`,
    appUrl: baseUrl,
  });
});

// Endpoint to generate GitHub OAuth URL
app.get('/api/auth/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(400).json({
      error: 'GITHUB_CLIENT_ID no está configurado en las variables de entorno.',
    });
  }

  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;

  // Scopes: repo (to create commits/backups and issues), read:user (profile info)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo read:user',
    state: Math.random().toString(36).substring(2, 15),
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url: authUrl });
});

// OAuth Callback Handler
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error de Autenticación GitHub</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444;">Error en la autenticación</h2>
          <p>${error_description || error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: '${error}' }, '*');
              setTimeout(() => window.close(), 2500);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('No se proporcionó código de autorización.');
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send('Credenciales de GitHub OAuth no configuradas en el servidor.');
  }

  try {
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'No se pudo obtener el access_token');
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'ComuniGest-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Conexión Exitosa con GitHub</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #0f172a;
              color: #f8fafc;
            }
            .card {
              background: #1e293b;
              padding: 32px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 20px 25px -5px rgba(0,0,0,0.4);
              max-width: 400px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            h2 { margin: 0 0 8px 0; color: #38bdf8; }
            p { color: #94a3b8; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="success-icon">✓</div>
            <h2>¡GitHub Vinculado!</h2>
            <p>Conexión completada para <strong>${userData.login || 'Usuario'}</strong>. Esta ventana se cerrará automáticamente...</p>
          </div>
          <script>
            const payload = {
              type: 'GITHUB_AUTH_SUCCESS',
              token: ${JSON.stringify(accessToken)},
              user: ${JSON.stringify(userData)}
            };
            if (window.opener) {
              window.opener.postMessage(payload, '*');
              setTimeout(() => {
                window.close();
              }, 1200);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444;">Error al conectar con GitHub</h2>
          <p>${err.message}</p>
        </body>
      </html>
    `);
  }
});

// Proxy API: Verify Personal Access Token or Token
app.post('/api/github/verify-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ComuniGest-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      const errData = await userRes.json();
      return res.status(userRes.status).json({ error: errData.message || 'Token de GitHub inválido o expirado' });
    }

    const userData = await userRes.json();
    res.json({ user: userData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy API: List User Repositories
app.post('/api/github/repos', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ComuniGest-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposRes.ok) {
      const err = await reposRes.json();
      return res.status(reposRes.status).json({ error: err.message });
    }

    const repos = await reposRes.json();
    res.json({ repos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy API: Sync / Push Community Data to GitHub Repository
app.post('/api/github/sync-community', async (req, res) => {
  const { token, repoFullName, filePath = 'comunidad/datos-comunidad.json', content, commitMessage } = req.body;

  if (!token || !repoFullName || !content) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (token, repoFullName, content)' });
  }

  try {
    // 1. Check if file already exists to get its sha
    let existingSha: string | undefined;
    const checkRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ComuniGest-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
    }

    // 2. Put file contents (base64 encoded)
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');
    const updateRes = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ComuniGest-App',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: commitMessage || `Update community data: ${new Date().toLocaleString('es-ES')}`,
        content: base64Content,
        sha: existingSha,
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return res.status(updateRes.status).json({ error: err.message || 'Error al actualizar archivo en GitHub' });
    }

    const result = await updateRes.json();
    res.json({
      success: true,
      commitSha: result.commit?.sha,
      htmlUrl: result.content?.html_url,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy API: Create Issue in GitHub Repo from Community Incident
app.post('/api/github/create-issue', async (req, res) => {
  const { token, repoFullName, title, body, labels } = req.body;

  if (!token || !repoFullName || !title) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para crear el issue' });
  }

  try {
    const issueRes = await fetch(`https://api.github.com/repos/${repoFullName}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ComuniGest-App',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: labels || ['incidencia-comunidad', 'mantenimiento'],
      }),
    });

    if (!issueRes.ok) {
      const err = await issueRes.json();
      return res.status(issueRes.status).json({ error: err.message });
    }

    const issue = await issueRes.json();
    res.json({
      success: true,
      number: issue.number,
      html_url: issue.html_url,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for dev or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ComuniGest] Servidor escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer();
