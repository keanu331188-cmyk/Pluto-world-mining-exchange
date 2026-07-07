const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, loadState, saveState } = require('./server');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('approvals persist across server restarts', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluto-'));
  const dataFile = path.join(tmpDir, 'requests.json');

  const server = createServer(dataFile);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'pluto2026' }),
    });
    assert.equal(loginResponse.status, 200);

    const approvedResponse = await fetch(`${baseUrl}/api/requests/kyc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, action: 'approve' }),
    });
    assert.equal(approvedResponse.status, 200);

    server.close();

    const state = loadState(dataFile);
    assert.equal(state.kyc.find((item) => item.id === 1).status, 'approved');

    const restartedServer = createServer(dataFile);
    await new Promise((resolve) => restartedServer.listen(0, resolve));
    const restartedAddress = restartedServer.address();
    const restartedUrl = `http://127.0.0.1:${restartedAddress.port}`;

    const requestsResponse = await fetch(`${restartedUrl}/api/requests`);
    const body = await requestsResponse.json();
    assert.equal(body.kyc.find((item) => item.id === 1).status, 'approved');

    restartedServer.close();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
