exports.handler = async function(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  try {
    const params = new URLSearchParams(event.rawQuery || '');
    const section = params.get('section') === 'quarterly' ? 'quarterly' : 'overview';
    const folder = section === 'quarterly' ? 'notes/quarterly' : 'notes/overview';

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return { statusCode: 404, headers: cors, body: '{}' };
    }

    const listRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'human-trend-dashboard'
      }
    });

    if (!listRes.ok) {
      return { statusCode: 404, headers: cors, body: '{}' };
    }

    const files = (await listRes.json())
      .filter(f => f.type === 'file' && f.name.endsWith('.json'))
      .sort((a, b) => b.name.localeCompare(a.name));

    if (!files.length) {
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: '{}' };
    }

    const fileRes = await fetch(files[0].url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'human-trend-dashboard'
      }
    });

    const file = await fileRes.json();
    const decoded = JSON.parse(Buffer.from(file.content || '', 'base64').toString('utf8'));

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify(decoded)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: String(err.message || err)
    };
  }
};
