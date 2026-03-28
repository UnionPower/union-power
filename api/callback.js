export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

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
    res.status(401).send(`OAuth error: ${data.error_description || data.error}`);
    return;
  }

  const token = data.access_token;
  const provider = 'github';

  const content = `<!doctype html>
<html>
<body>
<script>
(function() {
  var token = "${token}";
  var provider = "${provider}";

  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:' + provider + ':success:' + JSON.stringify({ token: token, provider: provider }),
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }

  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:" + provider, "*");
})();
</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(content);
}
