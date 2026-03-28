import crypto from 'crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const scope = 'repo';
  const redirectUri = `${process.env.SITE_URL || 'https://www.unionpower.cz'}/api/callback`;
  const state = crypto.randomBytes(16).toString('hex');

  res.setHeader('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  res.redirect(authUrl);
}
