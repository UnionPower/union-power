export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  // Verify CSRF state
  const cookies = req.headers.cookie || '';
  const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
  const savedState = stateCookie ? stateCookie.split('=')[1].trim() : null;

  if (!state || state !== savedState) {
    res.status(403).send('Invalid state parameter');
    return;
  }

  // Clear state cookie
  res.setHeader('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    res.status(401).send('Authentication failed');
    return;
  }

  const token = data.access_token;
  const provider = 'github';
  const origin = process.env.SITE_URL || 'https://www.unionpower.cz';

  const content = `<!doctype html>
<html>
<body>
<script>
(function() {
  var token = "${token}";
  var provider = "${provider}";
  var origin = "${origin}";

  function receiveMessage(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(
      'authorization:' + provider + ':success:' + JSON.stringify({ token: token, provider: provider }),
      origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }

  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:" + provider, origin);
})();
</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(content);
}
