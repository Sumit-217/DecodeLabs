// DecodeLabs Project 2: Developer Studio Frontend Logic

const DEMO_USER_KEY = 'demo-user-key';
const DEMO_ADMIN_KEY = 'demo-admin-key';

// Elements
const httpMethod = document.getElementById('httpMethod');
const endpointPath = document.getElementById('endpointPath');
const authSelect = document.getElementById('authSelect');
const customTokenInput = document.getElementById('customTokenInput');
const requestBody = document.getElementById('requestBody');
const sendRequestBtn = document.getElementById('sendRequestBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const responseStatusBadge = document.getElementById('responseStatusBadge');
const responseLatencyBadge = document.getElementById('responseLatencyBadge');
const responseTimestampBadge = document.getElementById('responseTimestampBadge');
const responseJsonViewer = document.getElementById('responseJsonViewer');
const copyResponseBtn = document.getElementById('copyResponseBtn');
const tasksTableBody = document.getElementById('tasksTableBody');
const refreshTasksBtn = document.getElementById('refreshTasksBtn');
const healthBadge = document.getElementById('healthBadge');
const healthText = document.getElementById('healthText');
const systemPulse = document.getElementById('systemPulse');

// Body helper buttons
const formatJsonBtn = document.getElementById('formatJsonBtn');
const samplePayloadBtn = document.getElementById('samplePayloadBtn');
const clearBodyBtn = document.getElementById('clearBodyBtn');

let lastResponseText = '';

// Auth select toggle
authSelect.addEventListener('change', () => {
  if (authSelect.value === 'custom') {
    customTokenInput.classList.remove('hidden');
    customTokenInput.focus();
  } else {
    customTokenInput.classList.add('hidden');
  }
});

// JSON Formatting helper
formatJsonBtn.addEventListener('click', () => {
  try {
    const val = requestBody.value.trim();
    if (val) {
      const parsed = JSON.parse(val);
      requestBody.value = JSON.stringify(parsed, null, 2);
    }
  } catch (err) {
    alert('Invalid JSON in request body: ' + err.message);
  }
});

samplePayloadBtn.addEventListener('click', () => {
  requestBody.value = JSON.stringify({
    title: "Verify Gatekeeper Logic",
    description: "Ensure input validation and autonomic defenses work properly",
    status: "in-progress",
    priority: "high"
  }, null, 2);
});

clearBodyBtn.addEventListener('click', () => {
  requestBody.value = '';
});

// Determine active auth token
function getActiveAuthToken() {
  const selection = authSelect.value;
  if (selection === 'none') return null;
  if (selection === 'user') return DEMO_USER_KEY;
  if (selection === 'admin') return DEMO_ADMIN_KEY;
  if (selection === 'custom') return customTokenInput.value.trim() || null;
  return null;
}

// Execute HTTP Request
async function executeRequest(method, url, bodyContent, authToken) {
  setLoading(true);
  const startTime = performance.now();

  const headers = {
    'Accept': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method: method,
    headers: headers
  };

  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && bodyContent !== undefined && bodyContent !== '') {
    headers['Content-Type'] = 'application/json';
    options.body = typeof bodyContent === 'string' ? bodyContent : JSON.stringify(bodyContent);
  }

  try {
    const res = await fetch(url, options);
    const duration = (performance.now() - startTime).toFixed(1);

    const status = res.status;
    const statusText = res.statusText || getStatusText(status);

    let data = null;
    let rawText = '';
    
    if (status === 204) {
      rawText = '(204 No Content - Empty Body)';
    } else {
      rawText = await res.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    lastResponseText = typeof data === 'object' ? JSON.stringify(data, null, 2) : rawText;

    displayResponse(status, statusText, duration, data, rawText);

    // If request created, modified, or deleted data, refresh table
    if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase()) && status < 400) {
      loadTasks();
    }
  } catch (err) {
    const duration = (performance.now() - startTime).toFixed(1);
    displayResponse(0, 'Network Error', duration, {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to backend server'
      }
    });
  } finally {
    setLoading(false);
  }
}

function getStatusText(status) {
  const map = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error'
  };
  return map[status] || 'Response';
}

function displayResponse(status, statusText, durationMs, data, rawText) {
  // Update status badge
  responseStatusBadge.textContent = `${status} ${statusText}`;
  responseStatusBadge.className = 'status-badge';

  if (status >= 200 && status < 300) {
    responseStatusBadge.classList.add('status-2xx');
  } else if (status >= 300 && status < 400) {
    responseStatusBadge.classList.add('status-3xx');
  } else if (status >= 400 && status < 500) {
    responseStatusBadge.classList.add('status-4xx');
  } else if (status >= 500) {
    responseStatusBadge.classList.add('status-5xx');
  }

  // Update latency & time
  responseLatencyBadge.textContent = `${durationMs} ms`;
  responseLatencyBadge.classList.toggle('fast', Number(durationMs) < 50);

  const now = new Date();
  responseTimestampBadge.textContent = now.toTimeString().split(' ')[0];

  // Render highlighted JSON
  if (status === 204) {
    responseJsonViewer.innerHTML = `<span class="json-null">// 204 No Content: Resource deleted successfully with an empty body.</span>`;
  } else if (typeof data === 'object' && data !== null) {
    responseJsonViewer.innerHTML = syntaxHighlightJson(JSON.stringify(data, null, 2));
  } else {
    responseJsonViewer.textContent = rawText || '// Empty response body';
  }
}

// JSON syntax highlighter
function syntaxHighlightJson(json) {
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function setLoading(isLoading) {
  if (isLoading) {
    btnSpinner.classList.remove('hidden');
    btnText.textContent = 'Executing...';
    sendRequestBtn.disabled = true;
  } else {
    btnSpinner.classList.add('hidden');
    btnText.textContent = 'Send Request';
    sendRequestBtn.disabled = false;
  }
}

// Send Request button handler
sendRequestBtn.addEventListener('click', () => {
  const method = httpMethod.value;
  const path = endpointPath.value.trim() || '/api/v1/tasks';
  const body = requestBody.value;
  const token = getActiveAuthToken();
  executeRequest(method, path, body, token);
});

// Keyboard shortcut (Ctrl + Enter)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    sendRequestBtn.click();
  }
});

// Copy response JSON
copyResponseBtn.addEventListener('click', () => {
  if (lastResponseText) {
    navigator.clipboard.writeText(lastResponseText).then(() => {
      copyResponseBtn.textContent = 'Copied!';
      setTimeout(() => { copyResponseBtn.textContent = 'Copy JSON'; }, 1500);
    });
  }
});

// Preset Buttons Handlers
document.getElementById('preset200').addEventListener('click', () => {
  httpMethod.value = 'GET';
  endpointPath.value = '/api/v1/tasks';
  authSelect.value = 'none';
  customTokenInput.classList.add('hidden');
  executeRequest('GET', '/api/v1/tasks', '', null);
});

document.getElementById('preset201').addEventListener('click', () => {
  httpMethod.value = 'POST';
  endpointPath.value = '/api/v1/tasks';
  authSelect.value = 'user';
  customTokenInput.classList.add('hidden');
  const payload = {
    title: "Deploy Microservice Endpoints",
    description: "Fulfill DecodeLabs industrial training milestone requirements",
    status: "pending",
    priority: "high"
  };
  requestBody.value = JSON.stringify(payload, null, 2);
  executeRequest('POST', '/api/v1/tasks', JSON.stringify(payload), DEMO_USER_KEY);
});

document.getElementById('preset400').addEventListener('click', () => {
  httpMethod.value = 'POST';
  endpointPath.value = '/api/v1/tasks';
  authSelect.value = 'user';
  customTokenInput.classList.add('hidden');
  const malformedPayload = {
    title: "X", // Too short (min 3)
    status: "invalid-status",
    priority: "ultra-high"
  };
  requestBody.value = JSON.stringify(malformedPayload, null, 2);
  executeRequest('POST', '/api/v1/tasks', JSON.stringify(malformedPayload), DEMO_USER_KEY);
});

document.getElementById('preset401').addEventListener('click', () => {
  httpMethod.value = 'POST';
  endpointPath.value = '/api/v1/tasks';
  authSelect.value = 'none';
  customTokenInput.classList.add('hidden');
  const payload = { title: "Attempt Unauthorized Task" };
  requestBody.value = JSON.stringify(payload, null, 2);
  executeRequest('POST', '/api/v1/tasks', JSON.stringify(payload), null);
});

document.getElementById('preset403').addEventListener('click', () => {
  // DELETE requires admin key, but we send user key
  httpMethod.value = 'DELETE';
  endpointPath.value = '/api/v1/tasks/1';
  authSelect.value = 'user';
  customTokenInput.classList.add('hidden');
  executeRequest('DELETE', '/api/v1/tasks/1', '', DEMO_USER_KEY);
});

document.getElementById('preset404').addEventListener('click', () => {
  httpMethod.value = 'GET';
  endpointPath.value = '/api/v1/tasks/999999';
  authSelect.value = 'none';
  customTokenInput.classList.add('hidden');
  executeRequest('GET', '/api/v1/tasks/999999', '', null);
});

document.getElementById('preset429').addEventListener('click', async () => {
  const proceed = confirm(
    "Rate Limit Test Warning:\n\nTriggering this test will rapidly fire 35 requests to intentionally trip the 30 req/min threshold (HTTP 429).\n\nNote: This will temporarily rate-limit subsequent requests from your IP for up to 60 seconds (Retry-After).\n\nDo you want to proceed?"
  );
  if (!proceed) return;

  httpMethod.value = 'GET';
  endpointPath.value = '/api/v1/tasks';
  setLoading(true);

  displayResponse(0, 'Bursting...', 0, {
    info: "Firing 35 concurrent requests to exceed the 30 req/min rate limit threshold..."
  });

  // Rapidly fire 35 requests to trigger the 429 limiter
  let triggered429 = null;
  for (let i = 0; i < 35; i++) {
    const res = await fetch('/api/v1/tasks');
    if (res.status === 429) {
      const data = await res.json();
      triggered429 = { status: res.status, data };
      break;
    }
  }

  if (triggered429) {
    displayResponse(triggered429.status, 'Too Many Requests', 12, triggered429.data);
  } else {
    // If not breached (or already cleared), re-test
    executeRequest('GET', '/api/v1/tasks', '', null);
  }
  setLoading(false);
});

document.getElementById('preset500').addEventListener('click', () => {
  httpMethod.value = 'POST';
  endpointPath.value = '/api/v1/simulate-error';
  authSelect.value = 'none';
  customTokenInput.classList.add('hidden');
  executeRequest('POST', '/api/v1/simulate-error', '{}', null);
});

// Load tasks for live database table
async function loadTasks() {
  try {
    const res = await fetch('/api/v1/tasks');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      renderTasksTable(result.data);
    }
  } catch (err) {
    tasksTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error loading tasks: ${err.message}</td></tr>`;
  }
}

function renderTasksTable(tasks) {
  if (tasks.length === 0) {
    tasksTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No tasks found in database. Create one using POST /api/v1/tasks.</td></tr>`;
    return;
  }

  tasksTableBody.innerHTML = tasks.map(task => `
    <tr>
      <td><code>#${task.id}</code></td>
      <td><strong>${escapeHtml(task.title)}</strong></td>
      <td><span class="tag ${task.status}">${task.status}</span></td>
      <td><span class="tag ${task.priority}">${task.priority}</span></td>
      <td><small>${new Date(task.createdAt).toLocaleTimeString()}</small></td>
      <td>
        <button class="table-action-btn" onclick="populateForEdit(${task.id})">Edit</button>
        <button class="table-action-btn btn-delete" onclick="quickDeleteTask(${task.id})">Del</button>
      </td>
    </tr>
  `).join('');
}

// Global functions for inline table buttons
window.populateForEdit = function(id) {
  httpMethod.value = 'PUT';
  endpointPath.value = `/api/v1/tasks/${id}`;
  authSelect.value = 'user';
  customTokenInput.classList.add('hidden');
  requestBody.value = JSON.stringify({
    title: "Updated Task Title",
    status: "in-progress",
    priority: "high"
  }, null, 2);
  window.scrollTo({ top: 180, behavior: 'smooth' });
};

window.quickDeleteTask = function(id) {
  if (confirm(`Permanently delete Task #${id}? (Will use Admin Key)`)) {
    httpMethod.value = 'DELETE';
    endpointPath.value = `/api/v1/tasks/${id}`;
    authSelect.value = 'admin';
    customTokenInput.classList.add('hidden');
    executeRequest('DELETE', `/api/v1/tasks/${id}`, '', DEMO_ADMIN_KEY);
  }
};

refreshTasksBtn.addEventListener('click', loadTasks);

// Check System Health
async function checkHealth() {
  try {
    const res = await fetch('/api/v1/health');
    const data = await res.json();
    if (data.success && data.data?.status === 'healthy') {
      healthBadge.innerHTML = `<span class="status-dot healthy"></span> Online (${data.data.uptime.toFixed(0)}s)`;
      systemPulse.style.background = '#06b6d4';
    } else {
      healthBadge.innerHTML = `<span class="status-dot error"></span> Degraded`;
      systemPulse.style.background = '#ef4444';
    }
  } catch {
    healthBadge.innerHTML = `<span class="status-dot error"></span> Offline`;
    systemPulse.style.background = '#ef4444';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Initial Boot
loadTasks();
checkHealth();
setInterval(checkHealth, 15000);
