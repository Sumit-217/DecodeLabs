/**
 * DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
 * File: public/js/app.js
 * Description: Main Application Controller.
 *              Manages UI state, safe DOM rendering (XSS immune), debounced search,
 *              track/status filters, modal dialogs, toasts, IPO lifecycle stepper,
 *              and API diagnostics sandbox.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. INITIAL SAMPLE DATA (For offline demo fallback when backend is offline)
  // --------------------------------------------------------------------------
  const SEED_INTERNS = [
    {
      id: 1,
      name: 'Sumit Kumar',
      role: 'Full Stack Engineer Intern',
      email: 'sumit.kumar@decodelabs.dev',
      track: 'Full Stack Development',
      status: 'Active',
      created_at: '2026-09-01T09:00:00Z',
      updated_at: '2026-09-01T09:00:00Z'
    },
    {
      id: 2,
      name: 'Aarav Patel',
      role: 'Frontend UI/UX Specialist',
      email: 'aarav.patel@decodelabs.dev',
      track: 'Frontend Engineering',
      status: 'Active',
      created_at: '2026-08-15T10:30:00Z',
      updated_at: '2026-08-15T10:30:00Z'
    },
    {
      id: 3,
      name: 'Diya Sharma',
      role: 'Backend Systems Engineer',
      email: 'diya.sharma@decodelabs.dev',
      track: 'Backend Engineering',
      status: 'Graduated',
      created_at: '2026-06-10T08:15:00Z',
      updated_at: '2026-08-28T16:45:00Z'
    },
    {
      id: 4,
      name: 'Rohan Deshmukh',
      role: 'Cloud & AI Associate',
      email: 'rohan.deshmukh@decodelabs.dev',
      track: 'Cloud & AI',
      status: 'Active',
      created_at: '2026-09-05T11:00:00Z',
      updated_at: '2026-09-05T11:00:00Z'
    },
    {
      id: 5,
      name: 'Ananya Roy',
      role: 'Full Stack Core Intern',
      email: 'ananya.roy@decodelabs.dev',
      track: 'Full Stack Development',
      status: 'On Leave',
      created_at: '2026-07-20T14:20:00Z',
      updated_at: '2026-09-10T12:00:00Z'
    },
    {
      id: 6,
      name: 'Vikram Mehta',
      role: 'API Integration Developer',
      email: 'vikram.mehta@decodelabs.dev',
      track: 'Backend Engineering',
      status: 'Graduated',
      created_at: '2026-05-18T09:45:00Z',
      updated_at: '2026-08-20T17:00:00Z'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. CENTRAL APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    interns: [],
    filteredInterns: [],
    filters: {
      search: '',
      track: 'All',
      status: 'All'
    },
    activeIntern: null, // Holds intern object for edit or delete modals
    isBackendOnline: false,
    isLoading: false,
    isProcessing: false,
    ipoStage: 'IDLE' // IDLE | INPUT | REQUEST_SENT | SERVER_PROCESSING | DATABASE | RESPONSE | DOM_UPDATED
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const DOM = {
    // Navigation & Status
    systemStatus: document.getElementById('system-status'),
    statusText: document.getElementById('status-text'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    mobileNav: document.getElementById('mobile-nav'),
    headerAddBtn: document.getElementById('header-add-intern-btn'),
    heroAddBtn: document.getElementById('hero-add-intern-btn'),
    toolbarAddBtn: document.getElementById('toolbar-add-intern-btn'),

    // Statistics
    statTotal: document.getElementById('stat-total'),
    statActive: document.getElementById('stat-active'),
    statGraduated: document.getElementById('stat-graduated'),
    statOnLeave: document.getElementById('stat-onleave'),

    // Controls Toolbar
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    filterTrack: document.getElementById('filter-track'),
    filterStatus: document.getElementById('filter-status'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    btnRefresh: document.getElementById('btn-refresh'),
    resultsCount: document.getElementById('results-count'),
    activeFilterTags: document.getElementById('active-filter-tags'),

    // Data Containers & States
    tableBody: document.getElementById('interns-table-body'),
    mobileCardsGrid: document.getElementById('mobile-cards-grid'),
    desktopWrapper: document.getElementById('desktop-table-wrapper'),
    skeletonLoading: document.getElementById('skeleton-loading'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    emptyAddBtn: document.getElementById('empty-add-btn'),
    emptyClearBtn: document.getElementById('empty-clear-btn'),
    errorState: document.getElementById('error-state'),
    errorStateDesc: document.getElementById('error-state-desc'),
    errorRetryBtn: document.getElementById('error-retry-btn'),

    // IPO Stepper
    stepperList: document.getElementById('stepper-list'),
    ipoPulseIndicator: document.getElementById('ipo-pulse-indicator'),
    ipoCurrentStageText: document.getElementById('ipo-current-stage-text'),
    btnSimulateFlow: document.getElementById('btn-simulate-flow'),

    // API Diagnostics
    diagBtns: document.querySelectorAll('.btn-diag'),
    diagMetricScenario: document.getElementById('diag-metric-scenario'),
    diagMetricStatus: document.getElementById('diag-metric-status'),
    diagMetricRecovery: document.getElementById('diag-metric-recovery'),
    diagMetricResult: document.getElementById('diag-metric-result'),
    consoleLastExecuted: document.getElementById('console-last-executed'),
    diagConsoleLog: document.getElementById('diag-console-log'),

    // Intern Add/Edit Modal
    internModalBackdrop: document.getElementById('intern-modal-backdrop'),
    modalTitle: document.getElementById('modal-title'),
    modalDescription: document.getElementById('modal-description'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalSubmitBtn: document.getElementById('modal-submit-btn'),
    modalSubmitText: document.getElementById('modal-submit-text'),
    internForm: document.getElementById('intern-form'),
    internIdInput: document.getElementById('intern-id'),
    internNameInput: document.getElementById('intern-name'),
    internRoleInput: document.getElementById('intern-role'),
    internEmailInput: document.getElementById('intern-email'),
    internTrackInput: document.getElementById('intern-track'),
    internStatusInput: document.getElementById('intern-status'),

    // Delete Modal
    deleteModalBackdrop: document.getElementById('delete-modal-backdrop'),
    deleteInternName: document.getElementById('delete-intern-name'),
    deleteCancelBtn: document.getElementById('delete-cancel-btn'),
    deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
    deleteSubmitText: document.getElementById('delete-submit-text'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // --------------------------------------------------------------------------
  // 4. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', title = null) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    // Select icon based on type
    let iconSvg = '';
    let defaultTitle = 'Notification';
    if (type === 'success') {
      defaultTitle = 'Success';
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      defaultTitle = 'Error Occurred';
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
      defaultTitle = 'Warning';
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      defaultTitle = 'System Update';
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <span class="toast-title">${escapeHtml(title || defaultTitle)}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
      <button class="toast-close-btn" type="button" aria-label="Dismiss notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    DOM.toastContainer.appendChild(toast);

    // Auto dismiss after 4.5 seconds
    const dismissTimeout = setTimeout(() => dismissToast(toast), 4500);
    toast._dismissTimeout = dismissTimeout;
  }

  function dismissToast(toast) {
    if (!toast || toast._isDismissing) return;
    toast._isDismissing = true;
    clearTimeout(toast._dismissTimeout);
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }

  // Safe HTML string sanitizer
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // 5. IPO LIFECYCLE STEPPER TELEMETRY
  // --------------------------------------------------------------------------
  const IPO_STAGES = [
    { key: 'INPUT', label: 'INPUT', detail: 'User submits form or interaction' },
    { key: 'REQUEST_SENT', label: 'REQUEST SENT', detail: 'fetch() sends HTTP request' },
    { key: 'SERVER_PROCESSING', label: 'SERVER PROCESSING', detail: 'Express validates request & logic' },
    { key: 'DATABASE', label: 'DATABASE', detail: 'SQLite persists data with WAL' },
    { key: 'RESPONSE', label: 'RESPONSE', detail: 'Server returns JSON & HTTP code' },
    { key: 'DOM_UPDATED', label: 'DOM UPDATED', detail: 'Frontend renders new state safely' }
  ];

  function updateIpoStage(stageKey, customMessage = null) {
    state.ipoStage = stageKey;

    const stepItems = DOM.stepperList.querySelectorAll('.step-item');
    const stepConnectors = DOM.stepperList.querySelectorAll('.step-connector');

    let activeIndex = -1;
    if (stageKey === 'INPUT' || stageKey === 'INPUT_SUBMITTED') activeIndex = 0;
    else if (stageKey === 'REQUEST_SENT') activeIndex = 1;
    else if (stageKey === 'SERVER_PROCESSING') activeIndex = 2;
    else if (stageKey === 'DATABASE' || stageKey === 'DATABASE_PERSISTED') activeIndex = 3;
    else if (stageKey === 'RESPONSE' || stageKey === 'RESPONSE_RECEIVED' || stageKey === 'RESPONSE_ERROR') activeIndex = 4;
    else if (stageKey === 'DOM_UPDATED') activeIndex = 5;

    // Update steps
    stepItems.forEach((item, index) => {
      item.classList.remove('active', 'completed');
      if (index === activeIndex) {
        item.classList.add('active');
      } else if (index < activeIndex) {
        item.classList.add('completed');
      }
    });

    // Update connectors
    stepConnectors.forEach((conn, index) => {
      conn.classList.remove('completed');
      if (index < activeIndex) {
        conn.classList.add('completed');
      }
    });

    // Update status indicator pill
    if (activeIndex >= 0) {
      DOM.ipoPulseIndicator.classList.add('active');
      const stageInfo = IPO_STAGES[activeIndex] || {};
      DOM.ipoCurrentStageText.textContent = customMessage || `${stageInfo.label} • ${stageInfo.detail}`;
    } else {
      DOM.ipoPulseIndicator.classList.remove('active');
      DOM.ipoCurrentStageText.textContent = 'IDLE • Ready for Request';
    }

    // Auto-return to IDLE after completion
    if (stageKey === 'DOM_UPDATED') {
      setTimeout(() => {
        if (state.ipoStage === 'DOM_UPDATED') {
          updateIpoStage('IDLE');
        }
      }, 3500);
    }
  }

  // Subscribe ApiClient events to the IPO Stepper
  if (window.ApiClient && typeof window.ApiClient.onStageChange === 'function') {
    window.ApiClient.onStageChange((stage, details) => {
      updateIpoStage(stage);
    });
  }

  /**
   * Run slow-motion interactive educational IPO demonstration
   */
  let isSimulatingFlow = false;
  async function runSimulatedFlowDemo() {
    if (isSimulatingFlow) return;
    isSimulatingFlow = true;
    DOM.btnSimulateFlow.disabled = true;

    showToast('Starting 6-Stage Input-Process-Output Demonstration', 'info', 'Integration Flow');

    const delays = [650, 750, 800, 850, 700, 900];
    const stages = ['INPUT', 'REQUEST_SENT', 'SERVER_PROCESSING', 'DATABASE', 'RESPONSE', 'DOM_UPDATED'];

    for (let i = 0; i < stages.length; i++) {
      updateIpoStage(stages[i]);
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }

    showToast('Complete request-response cycle persisted & rendered successfully!', 'success', 'Pipeline Complete');
    isSimulatingFlow = false;
    DOM.btnSimulateFlow.disabled = false;
  }

  // --------------------------------------------------------------------------
  // 6. HEALTH CHECK & DATA INITIALIZATION
  // --------------------------------------------------------------------------
  async function checkBackendConnectivity() {
    try {
      if (window.ApiClient) {
        const health = await window.ApiClient.checkHealth();
        setConnectionStatus(true, 'API Connected');
        return true;
      }
      return false;
    } catch (err) {
      setConnectionStatus(false, 'API Offline (Demo Mode)');
      return false;
    }
  }

  function setConnectionStatus(isConnected, message) {
    state.isBackendOnline = isConnected;
    DOM.statusText.textContent = message;
    if (isConnected) {
      DOM.systemStatus.classList.remove('offline');
      DOM.systemStatus.classList.add('connected');
      DOM.systemStatus.setAttribute('title', 'API Status: Live Express server connected on port 3002');
    } else {
      DOM.systemStatus.classList.remove('connected');
      DOM.systemStatus.classList.add('offline');
      DOM.systemStatus.setAttribute('title', 'API Status: Offline. Operating in client demonstration mode.');
    }
  }

  async function loadInterns() {
    state.isLoading = true;
    renderLoadingState(true);
    hideErrorState();

    try {
      const isConnected = await checkBackendConnectivity();
      
      if (isConnected && window.ApiClient) {
        // Live Fetch from Express / SQLite
        const response = await window.ApiClient.getInterns(state.filters);
        const data = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
        state.interns = data;
      } else {
        // Fallback Demonstration Seed Data
        if (state.interns.length === 0) {
          state.interns = [...SEED_INTERNS];
        }
      }

      applyFiltersAndRender();
      updateIpoStage('DOM_UPDATED');
    } catch (err) {
      console.error('[loadInterns] Error loading records:', err);
      renderErrorState(err.message || 'Unable to retrieve interns from the backend API.');
      showToast(err.message || 'Unable to connect to the backend server.', 'error', 'Fetch Failure');
    } finally {
      state.isLoading = false;
      renderLoadingState(false);
    }
  }

  // --------------------------------------------------------------------------
  // 7. FILTERING & DYNAMIC STATISTICS
  // --------------------------------------------------------------------------
  function applyFiltersAndRender() {
    const searchLower = state.filters.search.trim().toLowerCase();
    const trackFilter = state.filters.track;
    const statusFilter = state.filters.status;

    state.filteredInterns = state.interns.filter(intern => {
      // Search match
      const matchSearch = !searchLower ||
        (intern.name && intern.name.toLowerCase().includes(searchLower)) ||
        (intern.email && intern.email.toLowerCase().includes(searchLower)) ||
        (intern.role && intern.role.toLowerCase().includes(searchLower));

      // Track match
      const matchTrack = (trackFilter === 'All') || (intern.track === trackFilter);

      // Status match
      const matchStatus = (statusFilter === 'All') || (intern.status === statusFilter);

      return matchSearch && matchTrack && matchStatus;
    });

    renderStatistics();
    renderInternList();
    renderFilterToolbarState();
  }

  function renderStatistics() {
    const total = state.interns.length;
    const active = state.interns.filter(i => i.status === 'Active').length;
    const graduated = state.interns.filter(i => i.status === 'Graduated').length;
    const onLeave = state.interns.filter(i => i.status === 'On Leave').length;

    DOM.statTotal.textContent = total;
    DOM.statActive.textContent = active;
    DOM.statGraduated.textContent = graduated;
    DOM.statOnLeave.textContent = onLeave;
  }

  function renderFilterToolbarState() {
    const hasFilters = (state.filters.search.trim() !== '') ||
                       (state.filters.track !== 'All') ||
                       (state.filters.status !== 'All');

    // Show/hide Clear Filters button
    if (hasFilters) {
      DOM.btnClearFilters.removeAttribute('hidden');
    } else {
      DOM.btnClearFilters.setAttribute('hidden', '');
    }

    // Search clear button
    if (state.filters.search.trim() !== '') {
      DOM.searchClearBtn.removeAttribute('hidden');
    } else {
      DOM.searchClearBtn.setAttribute('hidden', '');
    }

    // Results count bar
    const totalCount = state.interns.length;
    const currentCount = state.filteredInterns.length;

    if (hasFilters) {
      DOM.resultsCount.textContent = `Showing ${currentCount} of ${totalCount} interns`;
    } else {
      DOM.resultsCount.textContent = `Showing all ${totalCount} registered interns`;
    }

    // Dynamic Filter Tags
    DOM.activeFilterTags.innerHTML = '';
    if (state.filters.track !== 'All') {
      const tag = document.createElement('span');
      tag.className = 'filter-tag';
      tag.textContent = `Track: ${state.filters.track}`;
      DOM.activeFilterTags.appendChild(tag);
    }
    if (state.filters.status !== 'All') {
      const tag = document.createElement('span');
      tag.className = 'filter-tag';
      tag.textContent = `Status: ${state.filters.status}`;
      DOM.activeFilterTags.appendChild(tag);
    }
  }

  // --------------------------------------------------------------------------
  // 8. SAFE DOM RENDERING (STRICT XSS IMMUNITY)
  // --------------------------------------------------------------------------
  function renderInternList() {
    // Clear both table and mobile card containers
    DOM.tableBody.innerHTML = '';
    DOM.mobileCardsGrid.innerHTML = '';

    if (state.filteredInterns.length === 0) {
      DOM.desktopWrapper.style.display = 'none';
      DOM.mobileCardsGrid.style.display = 'none';
      renderEmptyState();
      return;
    }

    DOM.emptyState.setAttribute('hidden', '');
    DOM.desktopWrapper.style.display = '';
    DOM.mobileCardsGrid.style.display = '';

    state.filteredInterns.forEach(intern => {
      // 1. Build Desktop Table Row via safe createElement & textContent
      const tr = document.createElement('tr');
      tr.className = 'intern-table-row';
      tr.setAttribute('data-id', intern.id);

      // Column 1: Intern (Avatar + Name + Subrole)
      const tdIntern = document.createElement('td');
      const cellIntern = document.createElement('div');
      cellIntern.className = 'cell-intern';

      const avatar = document.createElement('div');
      avatar.className = 'avatar-circle';
      avatar.textContent = getInitials(intern.name);

      const infoDiv = document.createElement('div');
      infoDiv.className = 'intern-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'intern-name';
      nameSpan.textContent = intern.name;

      const subroleSpan = document.createElement('span');
      subroleSpan.className = 'intern-subrole';
      subroleSpan.textContent = intern.role;

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(subroleSpan);
      cellIntern.appendChild(avatar);
      cellIntern.appendChild(infoDiv);
      tdIntern.appendChild(cellIntern);

      // Column 2: Role
      const tdRole = document.createElement('td');
      tdRole.textContent = intern.role;

      // Column 3: Track Badge
      const tdTrack = document.createElement('td');
      const trackBadge = document.createElement('span');
      trackBadge.className = 'badge-track';
      trackBadge.textContent = intern.track;
      tdTrack.appendChild(trackBadge);

      // Column 4: Email
      const tdEmail = document.createElement('td');
      tdEmail.className = 'cell-email';
      tdEmail.textContent = intern.email;

      // Column 5: Status Badge
      const tdStatus = document.createElement('td');
      const statusBadge = document.createElement('span');
      const statusClass = intern.status.toLowerCase().replace(/\s+/g, '-');
      statusBadge.className = `badge-status ${statusClass}`;

      const statusDot = document.createElement('span');
      statusDot.className = 'badge-status-dot';
      statusBadge.appendChild(statusDot);

      const statusTextNode = document.createTextNode(intern.status);
      statusBadge.appendChild(statusTextNode);
      tdStatus.appendChild(statusBadge);

      // Column 6: Joined Date
      const tdJoined = document.createElement('td');
      tdJoined.className = 'cell-date';
      tdJoined.textContent = formatDate(intern.created_at);

      // Column 7: Actions
      const tdActions = document.createElement('td');
      tdActions.className = 'cell-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-ghost btn-sm action-btn-edit';
      editBtn.setAttribute('aria-label', `Edit intern record for ${intern.name}`);
      editBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>Edit</span>
      `;
      editBtn.addEventListener('click', () => openEditModal(intern));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-ghost btn-sm action-btn-delete';
      deleteBtn.setAttribute('aria-label', `Delete intern record for ${intern.name}`);
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>Delete</span>
      `;
      deleteBtn.addEventListener('click', () => openDeleteModal(intern));

      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);

      // Assemble table row
      tr.appendChild(tdIntern);
      tr.appendChild(tdRole);
      tr.appendChild(tdEmail);
      tr.appendChild(tdTrack);
      tr.appendChild(tdStatus);
      tr.appendChild(tdJoined);
      tr.appendChild(tdActions);
      DOM.tableBody.appendChild(tr);

      // 2. Build Mobile Stacked Card via safe createElement & textContent
      const card = document.createElement('article');
      card.className = 'intern-card-mobile';
      card.setAttribute('data-id', intern.id);

      // Header: Avatar, Name, Role, Status
      const cardHeader = document.createElement('div');
      cardHeader.className = 'card-mobile-header';

      const cardIntern = document.createElement('div');
      cardIntern.className = 'card-mobile-intern';

      const cardAvatar = document.createElement('div');
      cardAvatar.className = 'avatar-circle';
      cardAvatar.textContent = getInitials(intern.name);

      const cardInfo = document.createElement('div');
      cardInfo.className = 'intern-info';

      const cardName = document.createElement('h4');
      cardName.className = 'intern-name';
      cardName.textContent = intern.name;

      const cardRole = document.createElement('span');
      cardRole.className = 'intern-subrole';
      cardRole.textContent = intern.role;

      cardInfo.appendChild(cardName);
      cardInfo.appendChild(cardRole);
      cardIntern.appendChild(cardAvatar);
      cardIntern.appendChild(cardInfo);

      const cardStatusBadge = statusBadge.cloneNode(true);

      cardHeader.appendChild(cardIntern);
      cardHeader.appendChild(cardStatusBadge);

      // Meta Grid: Email, Track, Joined
      const cardMeta = document.createElement('div');
      cardMeta.className = 'card-mobile-meta';

      const metaEmail = document.createElement('div');
      metaEmail.className = 'meta-field';
      const metaEmailLabel = document.createElement('span');
      metaEmailLabel.className = 'meta-field-label';
      metaEmailLabel.textContent = 'Email';
      const metaEmailVal = document.createElement('span');
      metaEmailVal.className = 'meta-field-value font-mono';
      metaEmailVal.textContent = intern.email;
      metaEmail.appendChild(metaEmailLabel);
      metaEmail.appendChild(metaEmailVal);

      const metaTrack = document.createElement('div');
      metaTrack.className = 'meta-field';
      const metaTrackLabel = document.createElement('span');
      metaTrackLabel.className = 'meta-field-label';
      metaTrackLabel.textContent = 'Track';
      const metaTrackVal = document.createElement('span');
      metaTrackVal.className = 'meta-field-value';
      metaTrackVal.textContent = intern.track;
      metaTrack.appendChild(metaTrackLabel);
      metaTrack.appendChild(metaTrackVal);

      const metaJoined = document.createElement('div');
      metaJoined.className = 'meta-field';
      const metaJoinedLabel = document.createElement('span');
      metaJoinedLabel.className = 'meta-field-label';
      metaJoinedLabel.textContent = 'Joined Date';
      const metaJoinedVal = document.createElement('span');
      metaJoinedVal.className = 'meta-field-value';
      metaJoinedVal.textContent = formatDate(intern.created_at);
      metaJoined.appendChild(metaJoinedLabel);
      metaJoined.appendChild(metaJoinedVal);

      cardMeta.appendChild(metaEmail);
      cardMeta.appendChild(metaTrack);
      cardMeta.appendChild(metaJoined);

      // Actions Footer
      const cardActions = document.createElement('div');
      cardActions.className = 'card-mobile-actions';

      const mEditBtn = editBtn.cloneNode(true);
      mEditBtn.addEventListener('click', () => openEditModal(intern));

      const mDeleteBtn = deleteBtn.cloneNode(true);
      mDeleteBtn.addEventListener('click', () => openDeleteModal(intern));

      cardActions.appendChild(mEditBtn);
      cardActions.appendChild(mDeleteBtn);

      card.appendChild(cardHeader);
      card.appendChild(cardMeta);
      card.appendChild(cardActions);
      DOM.mobileCardsGrid.appendChild(card);
    });
  }

  // Helpers
  function getInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function formatDate(isoString) {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  }

  // --------------------------------------------------------------------------
  // 9. LOADING, EMPTY, AND ERROR STATES
  // --------------------------------------------------------------------------
  function renderLoadingState(isLoading) {
    if (isLoading) {
      DOM.skeletonLoading.removeAttribute('hidden');
      DOM.desktopWrapper.style.display = 'none';
      DOM.mobileCardsGrid.style.display = 'none';
      DOM.emptyState.setAttribute('hidden', '');
    } else {
      DOM.skeletonLoading.setAttribute('hidden', '');
    }
  }

  function renderEmptyState() {
    DOM.emptyState.removeAttribute('hidden');
    const hasFilters = (state.filters.search.trim() !== '') ||
                       (state.filters.track !== 'All') ||
                       (state.filters.status !== 'All');

    if (hasFilters) {
      DOM.emptyStateTitle.textContent = 'No matching interns found';
      DOM.emptyStateDesc.textContent = 'There are no intern records matching your current filter criteria.';
      DOM.emptyClearBtn.removeAttribute('hidden');
      DOM.emptyAddBtn.setAttribute('hidden', '');
    } else {
      DOM.emptyStateTitle.textContent = 'No interns registered yet';
      DOM.emptyStateDesc.textContent = 'Get started by creating your first intern record in the database.';
      DOM.emptyClearBtn.setAttribute('hidden', '');
      DOM.emptyAddBtn.removeAttribute('hidden');
    }
  }

  function renderErrorState(errorMessage) {
    DOM.errorState.removeAttribute('hidden');
    DOM.desktopWrapper.style.display = 'none';
    DOM.mobileCardsGrid.style.display = 'none';
    DOM.skeletonLoading.setAttribute('hidden', '');
    DOM.emptyState.setAttribute('hidden', '');
    DOM.errorStateDesc.textContent = errorMessage || 'We could not retrieve the latest data from the API.';
  }

  function hideErrorState() {
    DOM.errorState.setAttribute('hidden', '');
  }

  // --------------------------------------------------------------------------
  // 10. MODAL HANDLING: ADD / EDIT INTERN
  // --------------------------------------------------------------------------
  function openAddModal() {
    state.activeIntern = null;
    DOM.internIdInput.value = '';
    DOM.internForm.reset();
    clearFormErrors();

    DOM.modalTitle.textContent = 'Add New Intern';
    DOM.modalDescription.textContent = 'Create a new intern record in the persistent SQLite database.';
    DOM.modalSubmitText.textContent = 'Create Intern';
    DOM.modalSubmitBtn.disabled = false;

    openBackdrop(DOM.internModalBackdrop);
    setTimeout(() => DOM.internNameInput.focus(), 80);
  }

  function openEditModal(intern) {
    if (!intern) return;
    state.activeIntern = intern;
    clearFormErrors();

    DOM.internIdInput.value = intern.id;
    DOM.internNameInput.value = intern.name || '';
    DOM.internRoleInput.value = intern.role || '';
    DOM.internEmailInput.value = intern.email || '';
    DOM.internTrackInput.value = intern.track || 'Full Stack Development';
    DOM.internStatusInput.value = intern.status || 'Active';

    DOM.modalTitle.textContent = 'Edit Intern';
    DOM.modalDescription.textContent = `Updating record #${intern.id} (${intern.name})`;
    DOM.modalSubmitText.textContent = 'Save Changes';
    DOM.modalSubmitBtn.disabled = false;

    openBackdrop(DOM.internModalBackdrop);
    setTimeout(() => DOM.internNameInput.focus(), 80);
  }

  function closeInternModal() {
    closeBackdrop(DOM.internModalBackdrop);
    state.activeIntern = null;
  }

  function clearFormErrors() {
    const errorSpans = DOM.internForm.querySelectorAll('.form-error');
    errorSpans.forEach(span => { span.textContent = ''; });
    const inputs = DOM.internForm.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => { input.classList.remove('invalid'); });
  }

  function setFieldError(fieldId, errorMsg) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (input) input.classList.add('invalid');
    if (errorEl) errorEl.textContent = errorMsg;
  }

  async function handleInternFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const id = DOM.internIdInput.value;
    const isEdit = Boolean(id);

    const payload = {
      name: DOM.internNameInput.value.trim(),
      role: DOM.internRoleInput.value.trim(),
      email: DOM.internEmailInput.value.trim().toLowerCase(),
      track: DOM.internTrackInput.value,
      status: DOM.internStatusInput.value
    };

    // Client-side defensive validation
    let hasError = false;
    if (!payload.name || payload.name.length < 2) {
      setFieldError('intern-name', 'Name must contain at least 2 characters');
      hasError = true;
    }
    if (!payload.role || payload.role.length < 2) {
      setFieldError('intern-role', 'Role must contain at least 2 characters');
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email)) {
      setFieldError('intern-email', 'Please provide a valid email address');
      hasError = true;
    }

    // Check email uniqueness locally if in demo mode
    const duplicate = state.interns.find(i => i.email.toLowerCase() === payload.email && String(i.id) !== String(id));
    if (duplicate) {
      setFieldError('intern-email', 'This email address is already registered to another intern');
      hasError = true;
    }

    if (hasError) {
      showToast('Please correct the validation errors in the form.', 'warning', 'Validation Failed');
      return;
    }

    // Submit state animation
    DOM.modalSubmitBtn.disabled = true;
    const spinner = DOM.modalSubmitBtn.querySelector('.btn-spinner');
    if (spinner) spinner.removeAttribute('hidden');
    DOM.modalSubmitText.textContent = isEdit ? 'Saving...' : 'Creating...';

    try {
      if (state.isBackendOnline && window.ApiClient) {
        if (isEdit) {
          await window.ApiClient.updateIntern(id, payload);
          showToast(`Intern "${payload.name}" updated successfully.`, 'success');
        } else {
          await window.ApiClient.createIntern(payload);
          showToast(`Intern "${payload.name}" created successfully.`, 'success');
        }
        await loadInterns();
      } else {
        // Local state mutation for offline demo
        await new Promise(resolve => setTimeout(resolve, 400));
        if (isEdit) {
          const index = state.interns.findIndex(i => String(i.id) === String(id));
          if (index !== -1) {
            state.interns[index] = {
              ...state.interns[index],
              ...payload,
              updated_at: new Date().toISOString()
            };
          }
          showToast(`Intern "${payload.name}" updated successfully.`, 'success');
        } else {
          const newId = state.interns.length > 0 ? Math.max(...state.interns.map(i => i.id)) + 1 : 1;
          const newIntern = {
            id: newId,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          state.interns.unshift(newIntern);
          showToast(`Intern "${payload.name}" created successfully.`, 'success');
        }
        applyFiltersAndRender();
        updateIpoStage('DOM_UPDATED');
      }

      closeInternModal();
    } catch (err) {
      console.error('[handleInternFormSubmit] Error:', err);
      showToast(err.message || 'Failed to save intern. Please try again.', 'error');
      if (err.message && err.message.toLowerCase().includes('email')) {
        setFieldError('intern-email', err.message);
      }
    } finally {
      DOM.modalSubmitBtn.disabled = false;
      if (spinner) spinner.setAttribute('hidden', '');
      DOM.modalSubmitText.textContent = isEdit ? 'Save Changes' : 'Create Intern';
    }
  }

  // --------------------------------------------------------------------------
  // 11. MODAL HANDLING: DELETE INTERN
  // --------------------------------------------------------------------------
  function openDeleteModal(intern) {
    if (!intern) return;
    state.activeIntern = intern;
    DOM.deleteInternName.textContent = intern.name;
    DOM.deleteConfirmBtn.disabled = false;
    DOM.deleteSubmitText.textContent = 'Delete Intern';

    openBackdrop(DOM.deleteModalBackdrop);
  }

  function closeDeleteModal() {
    closeBackdrop(DOM.deleteModalBackdrop);
    state.activeIntern = null;
  }

  async function handleConfirmDelete() {
    if (!state.activeIntern) return;
    const intern = state.activeIntern;

    DOM.deleteConfirmBtn.disabled = true;
    const spinner = DOM.deleteConfirmBtn.querySelector('.btn-spinner');
    if (spinner) spinner.removeAttribute('hidden');
    DOM.deleteSubmitText.textContent = 'Deleting...';

    try {
      if (state.isBackendOnline && window.ApiClient) {
        await window.ApiClient.deleteIntern(intern.id);
        showToast(`Intern "${intern.name}" deleted from database.`, 'success', 'Record Deleted');
        await loadInterns();
      } else {
        await new Promise(resolve => setTimeout(resolve, 350));
        state.interns = state.interns.filter(i => i.id !== intern.id);
        applyFiltersAndRender();
        updateIpoStage('DOM_UPDATED');
        showToast(`Intern "${intern.name}" deleted successfully.`, 'success', 'Record Deleted');
      }

      closeDeleteModal();
    } catch (err) {
      console.error('[handleConfirmDelete] Error:', err);
      showToast(err.message || 'Unable to delete intern.', 'error', 'Delete Failure');
    } finally {
      DOM.deleteConfirmBtn.disabled = false;
      if (spinner) spinner.setAttribute('hidden', '');
      DOM.deleteSubmitText.textContent = 'Delete Intern';
    }
  }

  // Generic backdrop helpers
  function openBackdrop(el) {
    el.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeBackdrop(el) {
    el.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // --------------------------------------------------------------------------
  // 12. API DIAGNOSTICS HANDLERS
  // --------------------------------------------------------------------------
  async function handleDiagnosticClick(e) {
    const btn = e.currentTarget;
    const diagType = btn.getAttribute('data-diag');
    if (!diagType) return;

    btn.disabled = true;
    DOM.consoleLastExecuted.textContent = `Running test: ${diagType}...`;
    DOM.diagMetricScenario.textContent = diagType.toUpperCase();
    DOM.diagMetricResult.textContent = 'Executing...';

    try {
      if (state.isBackendOnline && window.ApiClient) {
        await window.ApiClient.simulateError(diagType);
      } else {
        // Client-side demonstration of defensive error containment
        await new Promise(resolve => setTimeout(resolve, 500));
        if (diagType === '400') {
          throw new Error('HTTP 400 Bad Request: Simulated missing required body parameters.');
        } else if (diagType === '404') {
          throw new Error('HTTP 404 Not Found: Simulated query for non-existent intern ID.');
        } else if (diagType === '500') {
          throw new Error('HTTP 500 Internal Server Error: Simulated unexpected database crash.');
        } else if (diagType === 'network') {
          throw new Error('Network Connection Failed: Simulated offline DNS or CORS disconnection.');
        } else if (diagType === 'timeout') {
          throw new Error('Request Timeout (408): Client AbortController aborted request after 1500ms.');
        }
      }

      // If unexpected 200 returned
      DOM.diagMetricStatus.textContent = '200 OK';
      DOM.diagMetricRecovery.textContent = 'Normal flow';
      DOM.diagMetricResult.textContent = 'Completed without error';
      DOM.consoleLastExecuted.textContent = `Last run: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
      // Diagnostic failure was intercepted cleanly!
      const statusMatch = err.message.match(/\b(400|404|408|500)\b/);
      const statusCode = statusMatch ? statusMatch[1] : (diagType === 'network' ? '0' : 'ERR');

      DOM.diagMetricStatus.textContent = statusCode;
      DOM.diagMetricRecovery.textContent = 'Intercepted by try/catch & toast';
      DOM.diagMetricResult.textContent = 'Handled gracefully';
      DOM.consoleLastExecuted.textContent = `Last run: ${new Date().toLocaleTimeString()}`;

      DOM.diagConsoleLog.textContent = `[DIAGNOSTICS TRACE]\nTime: ${new Date().toISOString()}\nTarget Scenario: ${diagType.toUpperCase()}\nStatus: ${statusCode}\nMessage: ${err.message}\nDefensive Action: Non-blocking toast dispatched, finally block cleaned up UI loading states.`;

      showToast(err.message, 'error', `Diagnostics: ${diagType.toUpperCase()}`);
    } finally {
      btn.disabled = false;
    }
  }

  // --------------------------------------------------------------------------
  // 13. EVENT LISTENERS SETUP
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Navigation Modals
    DOM.headerAddBtn.addEventListener('click', openAddModal);
    DOM.heroAddBtn.addEventListener('click', openAddModal);
    DOM.toolbarAddBtn.addEventListener('click', openAddModal);
    DOM.emptyAddBtn.addEventListener('click', openAddModal);

    // Mobile Navigation Drawer Toggle
    DOM.mobileMenuToggle.addEventListener('click', () => {
      const isHidden = DOM.mobileNav.hasAttribute('hidden');
      if (isHidden) {
        DOM.mobileNav.removeAttribute('hidden');
        DOM.mobileMenuToggle.setAttribute('aria-expanded', 'true');
      } else {
        DOM.mobileNav.setAttribute('hidden', '');
        DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile nav when clicking a link
    DOM.mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        DOM.mobileNav.setAttribute('hidden', '');
        DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Debounced Search Input (300ms)
    let searchDebounceTimer = null;
    DOM.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.filters.search = e.target.value;
        applyFiltersAndRender();
      }, 300);
    });

    DOM.searchClearBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.filters.search = '';
      applyFiltersAndRender();
      DOM.searchInput.focus();
    });

    // Dropdown Filters
    DOM.filterTrack.addEventListener('change', (e) => {
      state.filters.track = e.target.value;
      applyFiltersAndRender();
    });

    DOM.filterStatus.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      applyFiltersAndRender();
    });

    // Reset Filters
    function clearAllFilters() {
      DOM.searchInput.value = '';
      DOM.filterTrack.value = 'All';
      DOM.filterStatus.value = 'All';
      state.filters.search = '';
      state.filters.track = 'All';
      state.filters.status = 'All';
      applyFiltersAndRender();
    }

    DOM.btnClearFilters.addEventListener('click', clearAllFilters);
    DOM.emptyClearBtn.addEventListener('click', clearAllFilters);

    // Refresh Button with Icon Animation
    DOM.btnRefresh.addEventListener('click', async () => {
      const icon = DOM.btnRefresh.querySelector('.refresh-icon');
      if (icon) icon.classList.add('spinning');
      DOM.btnRefresh.disabled = true;

      await loadInterns();

      if (icon) icon.classList.remove('spinning');
      DOM.btnRefresh.disabled = false;
      showToast('Interns list synchronized with database.', 'info', 'Refreshed');
    });

    // Retry Button on Error State
    DOM.errorRetryBtn.addEventListener('click', loadInterns);

    // Stepper Interactive Demo
    DOM.btnSimulateFlow.addEventListener('click', runSimulatedFlowDemo);

    // API Diagnostics Sandbox Buttons
    DOM.diagBtns.forEach(btn => {
      btn.addEventListener('click', handleDiagnosticClick);
    });

    // Form Submissions
    DOM.internForm.addEventListener('submit', handleInternFormSubmit);
    DOM.modalCloseBtn.addEventListener('click', closeInternModal);
    DOM.modalCancelBtn.addEventListener('click', closeInternModal);

    // Delete Modal Actions
    DOM.deleteCancelBtn.addEventListener('click', closeDeleteModal);
    DOM.deleteConfirmBtn.addEventListener('click', handleConfirmDelete);

    // Modal Backdrop Click Dismissal
    DOM.internModalBackdrop.addEventListener('click', (e) => {
      if (e.target === DOM.internModalBackdrop) closeInternModal();
    });

    DOM.deleteModalBackdrop.addEventListener('click', (e) => {
      if (e.target === DOM.deleteModalBackdrop) closeDeleteModal();
    });

    // Global Escape Key to dismiss modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!DOM.internModalBackdrop.hasAttribute('hidden')) {
          closeInternModal();
        }
        if (!DOM.deleteModalBackdrop.hasAttribute('hidden')) {
          closeDeleteModal();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. APPLICATION INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadInterns();
  });

})();
