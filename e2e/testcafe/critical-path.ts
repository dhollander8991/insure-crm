import { Selector, ClientFunction } from 'testcafe';

const BASE = 'http://localhost:5173';
const AUTH_URL = 'http://35.157.14.12:8081';
const AGENT_EMAIL = 'agent@insure.com';
const AGENT_PASSWORD = 'secret123';

// ClientFunction must be created at module level (not inside test body)
const setToken = ClientFunction((token: string) => {
  localStorage.setItem('insurecrm_token', token);
  localStorage.setItem('insurecrm_email', 'agent@insure.com');
});
const getToken = ClientFunction(() => localStorage.getItem('insurecrm_token'));
const clearAuth = ClientFunction(() => {
  localStorage.setItem('insurecrm_token', '');
  localStorage.setItem('insurecrm_email', '');
});

async function loginViaApiAndSetStorage(t: TestController) {
  const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: AGENT_EMAIL, password: AGENT_PASSWORD }),
  });
  const data = await res.json() as { token: string };
  await t.navigateTo(BASE);
  await setToken(data.token);
  await t.navigateTo(BASE);
}

// ─── Suite ────────────────────────────────────────────────────────────────────
fixture('InsureCRM — Critical Path (Cross Browser)').page(BASE);

test('Login page renders form elements', async t => {
  await t.navigateTo(`${BASE}/login`);
  await t
    .expect(Selector('#email').exists).ok('email input should exist')
    .expect(Selector('#password').exists).ok('password input should exist')
    .expect(Selector('button[type="submit"]').exists).ok('submit button should exist');
});

test('Login and reach dashboard', async t => {
  await t.navigateTo(`${BASE}/login`);
  await t
    .typeText('#email', AGENT_EMAIL, { replace: true })
    .typeText('#password', AGENT_PASSWORD, { replace: true })
    .click(Selector('button[type="submit"]'));
  await t.expect(Selector('body').innerText).contains('Good', { timeout: 10000 });
  const token = await getToken();
  await t.expect(token).notEql(null).expect(token!.length).gt(10);
});

test('Login with wrong password shows error', async t => {
  await t.navigateTo(`${BASE}/login`);
  await t
    .typeText('#email', AGENT_EMAIL, { replace: true })
    .typeText('#password', 'definitely_wrong', { replace: true })
    .click(Selector('button[type="submit"]'));
  // Wait for error toast — body text changes
  await t.wait(3000);
  const bodyText = await Selector('body').innerText;
  await t.expect(bodyText.toLowerCase()).contains('invalid', { timeout: 8000 });
});

test('Unauthenticated user redirected to /login', async t => {
  await clearAuth();
  await t.navigateTo(`${BASE}/clients`);
  await t.expect(Selector('#email').exists).ok({ timeout: 5000 });
});

test('Dashboard KPI cards render after login', async t => {
  await loginViaApiAndSetStorage(t);
  await t.expect(Selector('body').innerText).contains('Active Policies', { timeout: 10000 });
});

test('Sidebar navigates to Clients', async t => {
  await loginViaApiAndSetStorage(t);
  await t.click(Selector('a').withText('Clients'));
  await t.expect(Selector('body').innerText).contains('client', { timeout: 8000 });
});

test('Sidebar navigates to Policies', async t => {
  await loginViaApiAndSetStorage(t);
  await t.click(Selector('a').withText('Policies'));
  await t.expect(Selector('body').innerText).contains('Polic', { timeout: 8000 });
});

test('Sidebar navigates to Claims', async t => {
  await loginViaApiAndSetStorage(t);
  await t.click(Selector('a').withText('Claims'));
  await t.expect(Selector('body').innerText).contains('Claims', { timeout: 8000 });
});

test('Clients page loads table', async t => {
  await loginViaApiAndSetStorage(t);
  await t.navigateTo(`${BASE}/clients`);
  await t.expect(Selector('tbody tr, table tr').count).gt(0, { timeout: 10000 });
});

test('Clients search filters list', async t => {
  await loginViaApiAndSetStorage(t);
  await t.navigateTo(`${BASE}/clients`);
  const searchInput = Selector('input').withAttribute('placeholder', /search/i);
  await t.typeText(searchInput, 'zzznomatch999');
  const filtered = await Selector('tbody tr').count;
  await t.expect(filtered).lte(5);
});

test('Policies page shows currency symbol', async t => {
  await loginViaApiAndSetStorage(t);
  await t.navigateTo(`${BASE}/policies`);
  await t.expect(Selector('body').innerText).contains('₪', { timeout: 10000 });
});

test('AI Chat widget opens', async t => {
  await loginViaApiAndSetStorage(t);
  await t.navigateTo(BASE);
  await t.click(Selector('[aria-label="Open chat"]'));
  await t.expect(Selector('body').innerText).contains('Aegis', { timeout: 5000 });
});

test('AI Chat sends message', async t => {
  await loginViaApiAndSetStorage(t);
  await t.navigateTo(BASE);
  await t.click(Selector('[aria-label="Open chat"]'));
  await t
    .typeText(Selector('textarea').nth(-1), 'How many active policies?')
    .pressKey('enter');
  // Wait up to 30s for AI response
  await t.wait(30000);
  const hasResponse = await Selector('div, p').withText(/polic|\d+/i).exists;
  await t.expect(hasResponse).ok('AI should respond with policy info');
});

test('Clearing localStorage redirects to login', async t => {
  await loginViaApiAndSetStorage(t);
  await clearAuth();
  await t.navigateTo(`${BASE}/clients`);
  await t.expect(Selector('#email').exists).ok({ timeout: 5000 });
});
