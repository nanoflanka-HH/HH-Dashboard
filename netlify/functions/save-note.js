exports.handler = async function(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const section = body.section === 'quarterly' ? 'quarterly' : 'overview';
    const folder = section === 'quarterly' ? 'notes/quarterly' : 'notes/overview';

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      throw new Error('Missing GITHUB_OWNER, GITHUB_REPO or GITHUB_TOKEN env vars.');
    }

    const safeGroup = String(body.group || 'A事業群').replace(/[\\/:*?"<>|\s]+/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${folder}/${timestamp}_${safeGroup}.json`;

    const payload = {
      section,
      group: body.group || 'A事業群',
      note: body.note || '',
      meta: body.meta || {},
      savedAt: body.savedAt || new Date().toISOString(),
      userAgent: event.headers['user-agent'] || ''
    };

    const content = Buffer.from(JSON.stringify(payload, null, 2), 'utf8').toString('base64');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'human-trend-dashboard'
      },
      body: JSON.stringify({
        message: `save ${section} note ${timestamp}`,
        content,
        branch
      })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, path })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: String(err.message || err)
    };
  }
};
