const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = process.env.DATA_FILE || path.join(ROOT, 'data', 'requests.json');

function getDefaultState() {
  return {
    kyc: [
      { id: 1, name: 'Ava Parker', doc: 'Passport • Pending review', status: 'pending' },
      { id: 2, name: 'Noah Silva', doc: 'Driver License • Needs correction', status: 'pending' },
      { id: 3, name: 'Mia Chen', doc: 'National ID • Approved', status: 'approved' },
    ],
    withdrawals: [
      { id: 101, name: 'Liam Brooks', amount: '$8,400', status: 'pending' },
      { id: 102, name: 'Sofia Diaz', amount: '$3,200', status: 'pending' },
      { id: 103, name: 'James Hall', amount: '$1,150', status: 'approved' },
    ],
  };
}

function ensureDataFile(storageFile) {
  fs.mkdirSync(path.dirname(storageFile), { recursive: true });
  if (!fs.existsSync(storageFile)) {
    fs.writeFileSync(storageFile, JSON.stringify(getDefaultState(), null, 2));
  }
}

function loadState(storageFile) {
  ensureDataFile(storageFile);
  try {
    const parsed = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
    return {
      kyc: Array.isArray(parsed.kyc) ? parsed.kyc : getDefaultState().kyc,
      withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : getDefaultState().withdrawals,
    };
  } catch (error) {
    return getDefaultState();
  }
}

function saveState(storageFile, state) {
  ensureDataFile(storageFile);
  fs.writeFileSync(storageFile, JSON.stringify(state, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createServer(storageFile = DATA_FILE) {
  let state = loadState(storageFile);

  return http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;

    if (pathname === '/api/login' && req.method === 'POST') {
      try {
        const { username, password } = await readJsonBody(req);
        if (username === 'admin' && password === 'pluto2026') {
          sendJson(res, 200, { ok: true, token: 'demo-admin-token' });
        } else {
          sendJson(res, 401, { ok: false, message: 'Invalid credentials' });
        }
      } catch (error) {
        sendJson(res, 400, { ok: false, message: 'Invalid request' });
      }
      return;
    }

    if (pathname === '/api/requests' && req.method === 'GET') {
      sendJson(res, 200, { kyc: state.kyc, withdrawals: state.withdrawals });
      return;
    }

    if (pathname === '/api/requests/kyc' && req.method === 'POST') {
      try {
        const { id, action } = await readJsonBody(req);
        const request = state.kyc.find((item) => item.id === Number(id));
        if (request) {
          request.status = action === 'reject' ? 'rejected' : 'approved';
        }
        saveState(storageFile, state);
        sendJson(res, 200, { kyc: state.kyc });
      } catch (error) {
        sendJson(res, 400, { ok: false, message: 'Invalid request' });
      }
      return;
    }

    if (pathname === '/api/requests/withdrawal' && req.method === 'POST') {
      try {
        const { id, action } = await readJsonBody(req);
        const request = state.withdrawals.find((item) => item.id === Number(id));
        if (request) {
          request.status = action === 'reject' ? 'rejected' : 'approved';
        }
        saveState(storageFile, state);
        sendJson(res, 200, { withdrawals: state.withdrawals });
      } catch (error) {
        sendJson(res, 400, { ok: false, message: 'Invalid request' });
      }
      return;
    }

    if (pathname === '/' || pathname === '/index.html') {
      serveFile(res, path.join(ROOT, 'index.html'), 'text/html');
      return;
    }

    if (pathname === '/styles.css') {
      serveFile(res, path.join(ROOT, 'styles.css'), 'text/css');
      return;
    }

    if (pathname === '/script.js') {
      serveFile(res, path.join(ROOT, 'script.js'), 'application/javascript');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Pluto broker server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = { createServer, getDefaultState, loadState, saveState };
