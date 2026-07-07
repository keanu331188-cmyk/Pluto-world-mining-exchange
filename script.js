let kycRequests = [];
let withdrawalRequests = [];
let authToken = localStorage.getItem('pluto-auth-token') || '';

const kycList = document.getElementById('kyc-list');
const withdrawalList = document.getElementById('withdrawal-list');
const pendingKycCount = document.getElementById('pending-kyc-count');
const pendingWithdrawalCount = document.getElementById('pending-withdrawal-count');
const verifiedCount = document.getElementById('verified-count');
const approvedCount = document.getElementById('approved-count');
const authPanel = document.getElementById('auth-panel');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

function render() {
  const pendingKyc = kycRequests.filter((item) => item.status === 'pending').length;
  const pendingWithdrawals = withdrawalRequests.filter((item) => item.status === 'pending').length;
  const verified = kycRequests.filter((item) => item.status === 'approved').length;
  const approvedToday = withdrawalRequests.filter((item) => item.status === 'approved').length + verified;

  pendingKycCount.textContent = pendingKyc;
  pendingWithdrawalCount.textContent = pendingWithdrawals;
  verifiedCount.textContent = verified;
  approvedCount.textContent = approvedToday;

  kycList.innerHTML = '';
  kycRequests.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'request-item';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="request-meta">${item.doc}</div>
      </div>
      <div class="request-actions">
        ${item.status === 'pending' ? '<button class="approve" data-type="kyc" data-action="approve" data-id="' + item.id + '">Approve</button><button class="reject" data-type="kyc" data-action="reject" data-id="' + item.id + '">Reject</button>' : '<span class="chip positive">' + (item.status === 'approved' ? 'Approved' : 'Rejected') + '</span>'}
      </div>
    `;
    kycList.appendChild(row);
  });

  withdrawalList.innerHTML = '';
  withdrawalRequests.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'request-item';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="request-meta">Withdrawal request • ${item.amount}</div>
      </div>
      <div class="request-actions">
        ${item.status === 'pending' ? '<button class="approve" data-type="withdrawal" data-action="approve" data-id="' + item.id + '">Release</button><button class="reject" data-type="withdrawal" data-action="reject" data-id="' + item.id + '">Hold</button>' : '<span class="chip positive">' + (item.status === 'approved' ? 'Processed' : 'Held') + '</span>'}
      </div>
    `;
    withdrawalList.appendChild(row);
  });
}

function updateAuthView() {
  if (authToken) {
    authPanel.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    authMessage.textContent = 'Admin signed in successfully.';
  } else {
    authPanel.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    authMessage.textContent = 'Use the demo admin credentials to access the dashboard.';
  }
}

async function loadRequests() {
  try {
    const response = await fetch('/api/requests', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (!response.ok) throw new Error('Unable to load requests');
    const data = await response.json();
    kycRequests = data.kyc || [];
    withdrawalRequests = data.withdrawals || [];
    render();
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Login failed');
    }

    authToken = data.token;
    localStorage.setItem('pluto-auth-token', authToken);
    updateAuthView();
    await loadRequests();
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

async function handleAction(type, id, action) {
  const endpoint = type === 'kyc' ? '/api/requests/kyc' : '/api/requests/withdrawal';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ id, action }),
    });

    if (!response.ok) throw new Error('Action could not be completed');
    await loadRequests();
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

loginForm.addEventListener('submit', handleLogin);

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || !authToken) return;

  const { type, id, action } = button.dataset;
  if (type && id && action) {
    handleAction(type, id, action);
  }
});

updateAuthView();
if (authToken) {
  loadRequests();
}

render();
