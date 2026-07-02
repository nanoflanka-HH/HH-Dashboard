exports.handler = async function(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors };
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const secret = process.env.GITHUB_TOKEN;

  const result = {
    ok: false,
    checkedAt: new Date().toISOString(),
    env: {
      GITHUB_OWNER: Boolean(owner),
      GITHUB_REPO: Boolean(repo),
      GITHUB_BRANCH: Boolean(branch),
      GITHUB_TOKEN: Boolean(secret)
    },
    config: {
      owner: owner || null,
      repo: repo || null,
      branch
    },
    github: null,
    nextAction: ''
  };

  if (!owner || !repo || !secret) {
    result.nextAction = '請到 Netlify Site configuration > Environment variables 補齊 GITHUB_OWNER、GITHUB_REPO、GITHUB_BRANCH、GITHUB_TOKEN，然後重新 Deploy。';
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(result, null, 2) };
  }

  try {
    const authHeader = ['Bearer', secret].join(' ');
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'human-trend-dashboard-health'
      }
    });

    result.github = {
      status: repoRes.status,
      ok: repoRes.ok
    };

    if (!repoRes.ok) {
      result.nextAction = 'GitHub Token 無法讀取 repo，請確認 Token 是否授權 nanoflanka-HH/HH-Dashboard，並具備 Contents: Read and write。';
      result.github.body = await repoRes.text();
      return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(result, null, 2) };
    }

    const repoJson = await repoRes.json();
    result.ok = true;
    result.github.fullName = repoJson.full_name;
    result.github.defaultBranch = repoJson.default_branch;
    result.nextAction = '環境變數與 GitHub Token 基本可用；若存檔仍失敗，請查看 Netlify Function logs 的 save-note 錯誤。';
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(result, null, 2) };
  } catch (err) {
    result.nextAction = 'Function 可執行，但連 GitHub API 時發生錯誤，請查看 Netlify Function logs。';
    result.github = { error: String(err.message || err) };
    return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(result, null, 2) };
  }
};
