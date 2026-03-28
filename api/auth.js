export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const scope = 'repo,user';
  const redirectUri = `${process.env.SITE_URL || 'https://www.unionpower.cz'}/api/callback`;

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  res.redirect(authUrl);
}
