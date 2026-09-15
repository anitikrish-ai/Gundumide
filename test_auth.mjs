// Simple auth endpoint smoke test — run with: node test_auth.mjs
const BASE = 'http://localhost:5000';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

async function main() {
  console.log('\n=== GundamDev Auth Endpoint Tests ===\n');

  // 1. Health — unknown route should return JSON 404 (not empty body)
  const health = await req('GET', '/api/nonexistent');
  console.log('[404 fallback]', health.status, health.ok, JSON.stringify(health.json));

  // 2. Register
  const regResult = await req('POST', '/api/auth/register', {
    email: 'smoketest@gundamdev.io',
    password: 'SmokePass999!',
    username: 'smoketester'
  });
  console.log('[POST /api/auth/register]', regResult.status, regResult.ok, JSON.stringify(regResult.json).slice(0, 200));

  const token = regResult.json?.data?.token;

  // 3. Duplicate register — should return 400 with JSON error
  const dupResult = await req('POST', '/api/auth/register', {
    email: 'smoketest@gundamdev.io',
    password: 'SmokePass999!',
    username: 'smoketester2'
  });
  console.log('[Duplicate register]', dupResult.status, dupResult.ok, JSON.stringify(dupResult.json));

  // 4. Login
  const loginResult = await req('POST', '/api/auth/login', {
    email: 'smoketest@gundamdev.io',
    password: 'SmokePass999!'
  });
  console.log('[POST /api/auth/login]', loginResult.status, loginResult.ok, JSON.stringify(loginResult.json).slice(0, 200));

  const loginToken = loginResult.json?.data?.token || token;

  // 5. Wrong password — should return 401 JSON
  const wrongPw = await req('POST', '/api/auth/login', {
    email: 'smoketest@gundamdev.io',
    password: 'WrongPass!'
  });
  console.log('[Wrong password]', wrongPw.status, wrongPw.ok, JSON.stringify(wrongPw.json));

  // 6. /api/auth/me with valid token
  if (loginToken) {
    const meRes = await fetch(BASE + '/api/auth/me', {
      headers: { Authorization: `Bearer ${loginToken}` }
    });
    const meText = await meRes.text();
    let meJson;
    try { meJson = JSON.parse(meText); } catch { meJson = { raw: meText }; }
    console.log('[GET /api/auth/me]', meRes.status, meRes.ok, JSON.stringify(meJson).slice(0, 200));
  }

  // 7. /api/auth/me with no token — should return 401 JSON
  const noToken = await req('GET', '/api/auth/me');
  console.log('[/api/auth/me no token]', noToken.status, noToken.ok, JSON.stringify(noToken.json));

  console.log('\n=== Tests complete ===\n');
}

main().catch(err => console.error('TEST ERROR:', err));
