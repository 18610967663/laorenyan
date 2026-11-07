/* =========================================================
   Form submission
   ========================================================= */

function handleFormSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const formType = form.dataset.form;
  const get = (name) => String(form.elements.namedItem(name)?.value ?? '').trim();
  const number = (name) => Number(form.elements.namedItem(name)?.value);

  if (formType === 'partner') {
    const errors = {};
    const name = get('name');
    const contact = get('contact');
    const phone = get('phone');
    const amount = number('amount');
    const since = get('since');
    if (name.length < 2) errors.name = '请输入完整的公司名称';
    if (!contact) errors.contact = '请填写对接人';
    if (digitsCount(phone) < 7) errors.phone = '请填写有效的联系电话';
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = '年度交易额需大于 0';
    if (!since) errors.since = '请选择合作起始月份';
    if (Object.keys(errors).length) {
      formErrors(form, errors);
      return;
    }
    const partner = {
      id: uid('p'),
      name,
      short: name.replace(/有限公司|股份有限公司|集团/g, '').slice(0, 8) || name.slice(0, 8),
      type: get('type'),
      contact,
      phone,
      since,
      amount: amount * 10000,
      status: get('status'),
      note: get('note')
    };
    state.partners.unshift(partner);
    saveState();
    ui.partnerTab = 'partners';
    ui.partnerFilter = 'all';
    ui.partnerSort = 'recent';
    ui.partnerPage = 1;
    finishSave('合作公司已添加，合作概况已更新', () => openPartnerDrawer(partner.id));
    return;
  }

  if (formType === 'client') {
    const errors = {};
    const name = get('name');
    const contact = get('contact');
    const phone = get('phone');
    const amount = number('amount');
    const since = get('since');
    if (name.length < 2) errors.name = '请输入客户名称';
    if (!contact) errors.contact = '请填写联系人';
    if (digitsCount(phone) < 7) errors.phone = '请填写有效的联系方式';
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = '信任交易额需大于 0';
    if (!since) errors.since = '请选择合作起始月份';
    if (Object.keys(errors).length) {
      formErrors(form, errors);
      return;
    }
    const client = {
      id: uid('c'),
      name,
      contact,
      phone,
      amount: amount * 10000,
      since,
      last: todayISO(),
      status: get('status'),
      deals: 0,
      note: get('note')
    };
    state.clients.unshift(client);
    saveState();
    ui.clientFilter = 'all';
    ui.clientSort = 'recent';
    ui.clientPage = 1;
    finishSave('客户已添加，客户概况已更新', () => openClientDrawer(client.id));
    return;
  }

  if (formType === 'transaction') {
    const errors = {};
    const type = form.querySelector('input[name="type"]:checked')?.value || '转出';
    const amount = number('amount');
    const currency = get('currency');
    const account = get('account');
    const counterparty = get('counterparty');
    const summary = get('summary');
    const date = get('date');
    const processStatus = get('processStatus');
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = '请输入大于 0 的金额';
    if (!counterparty) errors.counterparty = '请填写交易对方';
    if (!summary) errors.summary = '请填写摘要';
    if (!date) errors.date = '请选择发生日期';
    if (!Object.keys(errors).length && processStatus !== '待确认' && type === '转出') {
      if (amount > state.accounts[account]) {
        errors.amount = `${CURRENCIES[account].label}账户余额不足`;
      }
    }
    if (Object.keys(errors).length) {
      formErrors(form, errors);
      return;
    }
    const completed = processStatus !== '待确认';
    const transaction = {
      id: uid('t'),
      date,
      type,
      amount,
      currency,
      account,
      counterparty,
      summary,
      status: completed ? (type === '存入' ? '已入账' : '已转出') : '待确认'
    };
    if (completed) {
      state.accounts[account] += type === '存入' ? amount : -amount;
    }
    state.transactions.unshift(transaction);
    saveState();
    ui.fundFilter = 'all';
    ui.fundPage = 1;
    finishSave(
      completed ? `${type}记录已保存，账户余额已更新` : '流水已保存，等待确认后计入余额',
      () => openTransactionDrawer(transaction.id)
    );
    return;
  }

  if (formType === 'employee') {
    const errors = {};
    const name = get('name');
    const role = get('role');
    const phone = get('phone');
    const email = get('email');
    const since = get('since');
    if (name.length < 2) errors.name = '请输入员工姓名';
    if (!role) errors.role = '请填写职位';
    if (digitsCount(phone) < 7) errors.phone = '请填写有效的联系电话';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '请输入有效的邮箱地址';
    if (!since) errors.since = '请选择入职日期';
    if (Object.keys(errors).length) {
      formErrors(form, errors);
      return;
    }
    const employee = {
      id: uid('e'),
      name,
      role,
      dept: get('dept'),
      phone,
      email,
      since,
      status: get('status')
    };
    state.employees.push(employee);
    saveState();
    ui.teamTab = 'employees';
    ui.employeeFilter = 'all';
    finishSave('员工已加入团队档案', () => openEmployeeDrawer(employee.id));
    return;
  }

  if (formType === 'service') {
    const errors = {};
    const name = get('name');
    const desc = get('desc');
    const price = number('price');
    if (name.length < 2) errors.name = '请输入服务名称';
    if (!desc) errors.desc = '请填写服务说明';
    if (!Number.isFinite(price) || price <= 0) errors.price = '起价需大于 0';
    if (Object.keys(errors).length) {
      formErrors(form, errors);
      return;
    }
    const service = {
      id: uid('s'),
      name,
      desc,
      price,
      priceUnit: get('priceUnit'),
      owner: get('owner'),
      projects: 0,
      status: get('status'),
      tags: ['新服务']
    };
    state.services.push(service);
    saveState();
    ui.teamTab = 'services';
    finishSave('服务项目已加入目录', () => openServiceDrawer(service.id));
  }
}

/* =========================================================
   Actions
   ========================================================= */

function handleAction(element) {
  const action = element.dataset.action;
  if (!action) return;
  if (element.tagName === 'SELECT') return;

  switch (action) {
    case 'set-currency':
      if (ui.currency !== element.dataset.value) {
        ui.currency = element.dataset.value;
        ui.animateValues = true;
        render();
      }
      break;
    case 'set-period':
      ui.period = element.dataset.value;
      render();
      break;
    case 'export-dashboard':
      exportDashboard();
      break;
    case 'partner-tab':
      ui.partnerTab = element.dataset.value;
      ui.partnerPage = 1;
      render();
      break;
    case 'partner-filter':
      ui.partnerFilter = element.dataset.value;
      ui.partnerPage = 1;
      render();
      break;
    case 'reset-partner-filter':
      ui.partnerFilter = 'all';
      ui.partnerPage = 1;
      render();
      break;
    case 'partner-page':
      ui.partnerPage = Number(element.dataset.page) || 1;
      render();
      break;
    case 'view-partner':
      openPartnerDrawer(element.dataset.id);
      break;
    case 'partner-transfer': {
      const partner = state.partners.find((item) => item.id === element.dataset.id);
      if (partner) {
        const currency = ['CNY', 'USD', 'HKD'].includes(ui.currency) ? ui.currency : 'CNY';
        openTransactionForm({
          type: '转出',
          currency,
          account: currency,
          counterparty: partner.name,
          summary: '合作项目结算'
        });
      }
      break;
    }
    case 'view-group':
      openGroupDrawer(element.dataset.id);
      break;
    case 'open-partner-form':
      openPartnerForm();
      break;
    case 'fund-filter':
      ui.fundFilter = element.dataset.value;
      ui.fundPage = 1;
      render();
      break;
    case 'reset-fund-filter':
      ui.fundFilter = 'all';
      ui.fundPage = 1;
      render();
      break;
    case 'fund-page':
      ui.fundPage = Number(element.dataset.page) || 1;
      render();
      break;
    case 'view-transaction':
      openTransactionDrawer(element.dataset.id);
      break;
    case 'open-transaction-form':
      openTransactionForm();
      break;
    case 'export-funds':
      exportFunds();
      break;
    case 'confirm-transaction':
      confirmTransaction(element.dataset.id);
      break;
    case 'client-filter':
      ui.clientFilter = element.dataset.value;
      ui.clientPage = 1;
      render();
      break;
    case 'reset-client-filter':
      ui.clientFilter = 'all';
      ui.clientPage = 1;
      render();
      break;
    case 'client-page':
      ui.clientPage = Number(element.dataset.page) || 1;
      render();
      break;
    case 'view-client':
      openClientDrawer(element.dataset.id);
      break;
    case 'client-payment': {
      const client = state.clients.find((item) => item.id === element.dataset.id);
      if (client) {
        const currency = ['CNY', 'USD', 'HKD'].includes(ui.currency) ? ui.currency : 'CNY';
        openTransactionForm({
          type: '存入',
          currency,
          account: currency,
          counterparty: client.name,
          summary: '客户项目回款'
        });
      }
      break;
    }
    case 'open-client-form':
      openClientForm();
      break;
    case 'export-clients':
      exportClients();
      break;
    case 'team-tab':
      ui.teamTab = element.dataset.value;
      render();
      break;
    case 'view-service':
      openServiceDrawer(element.dataset.id);
      break;
    case 'open-service-form':
      openServiceForm();
      break;
    case 'open-employee-form':
      openEmployeeForm();
      break;
    case 'employee-filter':
      ui.employeeFilter = element.dataset.value;
      render();
      break;
    case 'reset-employee-filter':
      ui.employeeFilter = 'all';
      render();
      break;
    case 'view-employee':
      openEmployeeDrawer(element.dataset.id);
      break;
    case 'stock-range':
      ui.stockRange = element.dataset.value;
      render();
      break;
    case 'select-stock':
      ui.stockCode = element.dataset.code;
      render();
      break;
    case 'export-stocks':
      exportStocks();
      break;
    case 'read-all-notifications':
      readAllNotifications();
      break;
    case 'open-account':
      openAccountModal();
      break;
    case 'open-shortcuts':
      openShortcutsModal();
      break;
    case 'open-reset':
      openResetModal();
      break;
    case 'confirm-reset':
      resetData();
      break;
    case 'close-overlay':
      closeOverlay();
      break;
    default:
      break;
  }
}

function confirmTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction || transaction.status !== '待确认') return;
  if (transaction.type === '转出' && transaction.amount > state.accounts[transaction.account]) {
    toast(`${CURRENCIES[transaction.account].label}账户余额不足，暂时无法确认`, 'error');
    return;
  }
  transaction.status = transaction.type === '存入' ? '已入账' : '已转出';
  state.accounts[transaction.account] += transaction.type === '存入' ? transaction.amount : -transaction.amount;
  saveState();
  closeOverlay();
  render();
  toast('流水已确认，账户余额已更新');
}

function readAllNotifications() {
  const unread = state.notifications.filter((item) => !item.read).length;
  if (!unread) {
    toast('当前没有未读通知');
    return;
  }
  state.notifications.forEach((item) => { item.read = true; });
  saveState();
  renderNotifications();
  toast('全部通知已标记为已读');
}

function resetData() {
  state = createSeedState();
  saveState();
  ui.partnerTab = 'partners';
  ui.partnerFilter = 'all';
  ui.partnerPage = 1;
  ui.clientFilter = 'all';
  ui.clientPage = 1;
  ui.fundFilter = 'all';
  ui.fundPage = 1;
  ui.teamTab = 'services';
  ui.employeeFilter = 'all';
  closeOverlay();
  render();
  renderNotifications();
  toast('已恢复初始数据');
}

/* =========================================================
   Events
   ========================================================= */

function handleDocumentClick(event) {
  const target = event.target;

  const skipLink = target.closest('.skip-link');
  if (skipLink) {
    event.preventDefault();
    const main = $('#mainContent');
    if (main) {
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start' });
    }
    return;
  }

  const searchResult = target.closest('[data-search-kind]');
  if (searchResult) {
    openSearchResult(searchResult.dataset.searchKind, searchResult.dataset.searchId);
    return;
  }

  const searchNav = target.closest('[data-search-nav]');
  if (searchNav) {
    closeSearch({ clear: true });
    navigate(searchNav.dataset.searchNav);
    return;
  }

  const notification = target.closest('[data-notification]');
  if (notification) {
    openNotification(notification.dataset.notification);
    return;
  }

  const nav = target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    closeSearch({ clear: true });
    navigate(nav.dataset.nav);
    return;
  }

  const backdrop = target.closest('[data-overlay-backdrop]');
  if (backdrop && target === backdrop) {
    closeOverlay();
    return;
  }

  const actionEl = target.closest('[data-action]');
  if (actionEl) {
    handleAction(actionEl);
  }

  if (!target.closest('#searchWrap')) closeSearch();
  if (!target.closest('.popover-wrap')) closePopovers();
}

function handleGlobalKeydown(event) {
  const overlayRoot = $('#overlayRoot');
  if (overlayRoot && overlayRoot.children.length) {
    handleOverlayKeydown(event);
    return;
  }

  const searchPanel = $('#searchPanel');
  const searchInput = $('#globalSearch');
  const isSearchOpen = searchPanel && !searchPanel.hidden;

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      openSearch();
    }
    return;
  }

  if (isSearchOpen) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!searchState.results.length) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      searchState.activeIndex = (searchState.activeIndex + direction + searchState.results.length) % searchState.results.length;
      updateSearchActive();
      const active = searchState.results[searchState.activeIndex];
      if (active) active.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (event.key === 'Enter') {
      if (searchState.activeIndex >= 0 && searchState.results[searchState.activeIndex]) {
        event.preventDefault();
        searchState.results[searchState.activeIndex].click();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      if (searchInput) searchInput.blur();
      return;
    }
  }

  if (event.key === 'Escape') {
    closePopovers();
    closeMobileNav();
    closeSearch();
    return;
  }

  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const tag = document.activeElement?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    event.preventDefault();
    if (searchInput) {
      searchInput.focus();
      openSearch();
    }
  }
}

function handleDocumentChange(event) {
  const target = event.target;
  if (target.dataset.action === 'partner-sort') {
    ui.partnerSort = target.value;
    ui.partnerPage = 1;
    render();
  }
  if (target.dataset.action === 'client-sort') {
    ui.clientSort = target.value;
    ui.clientPage = 1;
    render();
  }
}

function bindEvents() {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('change', handleDocumentChange);

  const overlayRoot = $('#overlayRoot');
  if (overlayRoot) {
    overlayRoot.addEventListener('submit', handleFormSubmit);
    overlayRoot.addEventListener('input', (event) => {
      const field = event.target.closest('.field');
      if (field) {
        field.classList.remove('has-error');
        const error = $('.field-error', field);
        if (error) error.textContent = '';
      }
    });
  }

  const notifBtn = $('#notifBtn');
  const notifPanel = $('#notifPanel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', () => {
      const willOpen = notifPanel.hidden;
      closeSearch();
      closePopovers();
      notifPanel.hidden = !willOpen;
      notifBtn.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) renderNotifications();
    });
  }

  const userBtn = $('#userBtn');
  const userPanel = $('#userPanel');
  if (userBtn && userPanel) {
    userBtn.addEventListener('click', () => {
      const willOpen = userPanel.hidden;
      closeSearch();
      closePopovers();
      userPanel.hidden = !willOpen;
      userBtn.setAttribute('aria-expanded', String(willOpen));
    });
  }

  const searchInput = $('#globalSearch');
  const searchWrap = $('#searchWrap');
  if (searchInput) {
    searchInput.addEventListener('focus', openSearch);
    searchInput.addEventListener('click', openSearch);
    searchInput.addEventListener('input', () => {
      searchState.activeIndex = -1;
      openSearch();
    });
  }
  if (searchWrap) {
    searchWrap.addEventListener('click', (event) => {
      if (event.target === searchWrap) openSearch();
    });
  }
  const searchField = $('#searchField');
  if (searchField && searchInput) {
    searchField.addEventListener('click', () => searchInput.focus());
  }

  const mobileMenu = $('#mobileMenu');
  if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
      if (document.body.classList.contains('nav-open')) closeMobileNav();
      else openMobileNav();
    });
  }
  const scrim = $('#sidebarScrim');
  if (scrim) scrim.addEventListener('click', closeMobileNav);

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileNav();
  });
}

function migrateStaffNames() {
  const renamed = {
    '林知远': { name: '吕金德', oldEmail: 'linzhiyuan@laoren.co', email: 'lvjinde@laoren.co' },
    '周砚': { name: '王震', oldEmail: 'zhouyan@laoren.co', email: 'wangzhen@laoren.co' },
    '陈默': { name: '张景明', oldEmail: 'chenmo@laoren.co', email: 'zhangjingming@laoren.co' },
    '苏晚': { name: '张玉琴', oldEmail: 'suwan@laoren.co', email: 'zhangyuqin@laoren.co' },
    '许可': { name: '夏清', oldEmail: 'xuke@laoren.co', email: 'xiaqing@laoren.co' },
    '沈一': { name: '陈海军', oldEmail: 'shenyi@laoren.co', email: 'chenhaijun@laoren.co' }
  };
  let changed = false;

  state.employees.forEach((employee) => {
    const record = renamed[employee.name];
    if (!record) return;
    employee.name = record.name;
    if (employee.email === record.oldEmail) employee.email = record.email;
    changed = true;
  });

  state.services.forEach((service) => {
    const record = renamed[service.owner];
    if (!record) return;
    service.owner = record.name;
    changed = true;
  });

  if (changed) saveState();
}

function init() {
  if (!state.accounts) state.accounts = { CNY: 31020000, USD: 640000, HKD: 3120000 };
  if (!Array.isArray(state.notifications)) state.notifications = NOTIFICATIONS_SEED.map((item) => ({ ...item, target: { ...item.target } }));
  if (!Array.isArray(state.partners)) state.partners = seedPartners();
  if (!Array.isArray(state.clients)) state.clients = seedClients();
  if (!Array.isArray(state.transactions)) state.transactions = seedTransactions();
  if (!Array.isArray(state.employees)) state.employees = seedEmployees();
  if (!Array.isArray(state.services)) state.services = seedServices();
  migrateStaffNames();

  ui.page = hashPage();
  ui.animateNext = true;
  try {
    history.replaceState(null, '', `#${ui.page}`);
  } catch (error) {
    location.hash = ui.page;
  }

  const dateElement = $('#topbarDate');
  if (dateElement) dateElement.textContent = topbarDateText();
  const kbd = $('#searchKbd');
  if (kbd) {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    kbd.textContent = isMac ? '⌘ K' : 'Ctrl K';
  }

  bindEvents();
  renderNotifications();
  render();
}

init();
