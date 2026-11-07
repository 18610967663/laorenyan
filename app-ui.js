/* =========================================================
   Overlays, forms, drawers, exports
   ========================================================= */

let overlayGeneration = 0;
let overlayReturnFocus = null;

function focusables(container) {
  return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
    .filter((element) => element.offsetParent !== null);
}

function showOverlayShell(content) {
  overlayGeneration += 1;
  overlayReturnFocus = document.activeElement;
  const root = $('#overlayRoot');
  if (!root) return;
  root.innerHTML = content;
  document.body.classList.add('no-scroll');
  const dialog = $('.modal, .drawer', root);
  requestAnimationFrame(() => {
    const layer = $('.overlay-layer, .drawer-layer', root);
    if (layer) layer.classList.add('is-open');
    if (dialog) {
      const focusTarget = $('[data-autofocus]', dialog) || $('input, select, textarea, button', dialog);
      if (focusTarget) focusTarget.focus();
    }
  });
}

function showModal({ title, sub = '', eyebrow = '', content, size = '' }) {
  showOverlayShell(`
    <div class="overlay-layer" data-overlay-backdrop>
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-head">
          <div>
            ${eyebrow ? `<div class="modal-eyebrow">${esc(eyebrow)}</div>` : ''}
            <h2 id="modalTitle">${esc(title)}</h2>
            ${sub ? `<p class="modal-sub">${esc(sub)}</p>` : ''}
          </div>
          <button class="modal-close" type="button" data-action="close-overlay" aria-label="关闭">${icon('close')}</button>
        </div>
        ${content}
      </div>
    </div>
  `);
}

function showFormModal({ title, sub = '', eyebrow = '', body, formType, submitLabel, size = '' }) {
  showModal({
    title, sub, eyebrow, size,
    content: `
      <form id="modalForm" class="modal-form" data-form="${formType}" novalidate>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">
          <button class="btn" type="button" data-action="close-overlay">取消</button>
          <button class="btn primary" type="submit">${esc(submitLabel)}</button>
        </div>
      </form>
    `
  });
  const first = $('#modalForm input, #modalForm select, #modalForm textarea');
  if (first) first.focus();
}

function showDrawer({ kicker, title, sub = '', body, footer = '' }) {
  overlayGeneration += 1;
  overlayReturnFocus = document.activeElement;
  const root = $('#overlayRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="drawer-layer" data-overlay-backdrop></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
      <div class="drawer-head">
        <div class="drawer-head-top">
          <div>
            <div class="drawer-kicker">${kicker}</div>
            <h2 class="drawer-title" id="drawerTitle">${title}</h2>
            ${sub ? `<div class="drawer-sub">${sub}</div>` : ''}
          </div>
          <button class="modal-close" type="button" data-action="close-overlay" aria-label="关闭">${icon('close')}</button>
        </div>
      </div>
      <div class="drawer-body">${body}</div>
      <div class="drawer-foot">${footer || '<button class="btn" type="button" data-action="close-overlay">关闭</button>'}</div>
    </aside>
  `;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => {
    const layer = $('.drawer-layer', root);
    const drawer = $('.drawer', root);
    if (layer) layer.classList.add('is-open');
    if (drawer) drawer.classList.add('is-open');
    const close = $('.drawer .modal-close', root);
    if (close) close.focus();
  });
}

function closeOverlay() {
  const root = $('#overlayRoot');
  if (!root || !root.children.length) return;
  const generation = ++overlayGeneration;
  const layer = $('.overlay-layer, .drawer-layer', root);
  const drawer = $('.drawer', root);
  if (layer) layer.classList.remove('is-open');
  if (drawer) drawer.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  window.setTimeout(() => {
    if (generation !== overlayGeneration) return;
    root.innerHTML = '';
    const target = overlayReturnFocus && document.contains(overlayReturnFocus)
      ? overlayReturnFocus
      : $('#mainContent');
    if (target && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
    }
    overlayReturnFocus = null;
  }, 320);
}

function handleOverlayKeydown(event) {
  const root = $('#overlayRoot');
  if (!root || !root.children.length) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeOverlay();
    return;
  }
  if (event.key !== 'Tab') return;
  const dialog = $('.modal, .drawer', root);
  if (!dialog) return;
  const items = focusables(dialog);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ---------- Form helpers ---------- */

function fieldHtml({ label, name, type = 'text', value = '', placeholder = '', required = false, full = false, hint = '', suffix = '', options = null, min = '', max = '', step = '', autofocus = false }) {
  const id = `field-${name}`;
  const requiredAttr = required ? 'required' : '';
  const requiredMark = required ? '<span class="required">*</span>' : '';
  let control = '';
  if (options) {
    control = `<select class="select" id="${id}" name="${name}" ${requiredAttr}>${options.map((option) => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label;
      return `<option value="${esc(optionValue)}" ${String(value) === String(optionValue) ? 'selected' : ''}>${esc(optionLabel)}</option>`;
    }).join('')}</select>`;
  } else if (type === 'textarea') {
    control = `<textarea class="textarea" id="${id}" name="${name}" placeholder="${esc(placeholder)}" ${requiredAttr}>${esc(value)}</textarea>`;
  } else {
    const input = `<input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${min !== '' ? `min="${min}"` : ''} ${max !== '' ? `max="${max}"` : ''} ${step !== '' ? `step="${step}"` : ''} ${requiredAttr} ${autofocus ? 'data-autofocus' : ''}>`;
    control = suffix ? `<div class="input-suffix">${input}<span>${esc(suffix)}</span></div>` : input;
  }
  return `<div class="field ${full ? 'full' : ''}"><label for="${id}">${esc(label)} ${requiredMark}</label>${control}${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}<span class="field-error"></span></div>`;
}

function formErrors(form, errors) {
  $$('.field', form).forEach((field) => {
    field.classList.remove('has-error');
    const error = $('.field-error', field);
    if (error) error.textContent = '';
  });
  let first = null;
  Object.entries(errors).forEach(([name, message]) => {
    const input = form.elements.namedItem(name);
    if (!input) return;
    const field = input.closest('.field');
    if (!field) return;
    field.classList.add('has-error');
    const error = $('.field-error', field);
    if (error) error.textContent = message;
    if (!first) first = input;
  });
  if (first) {
    first.focus();
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function digitsCount(value) {
  return String(value || '').replace(/\D/g, '').length;
}

function finishSave(message, callback) {
  closeOverlay();
  render();
  renderNotifications();
  toast(message);
  if (callback) callback();
}

/* ---------- Add forms ---------- */

function openPartnerForm() {
  const body = `
    <div class="form-grid">
      ${fieldHtml({ label: '公司名称', name: 'name', placeholder: '填写合作公司的完整名称', required: true, full: true })}
      ${fieldHtml({ label: '合作类型', name: 'type', options: ['战略伙伴', '供应商', '渠道合作'], value: '战略伙伴' })}
      ${fieldHtml({ label: '当前状态', name: 'status', options: ['合作中', '洽谈中', '已暂停'], value: '合作中' })}
      ${fieldHtml({ label: '对接人', name: 'contact', placeholder: '姓名', required: true })}
      ${fieldHtml({ label: '联系电话', name: 'phone', placeholder: '例如 138 0000 0000', required: true })}
      ${fieldHtml({ label: '年度交易额', name: 'amount', type: 'number', placeholder: '0', required: true, suffix: '万元', min: '0', step: '0.1', hint: '按年度已确认合作金额填写' })}
      ${fieldHtml({ label: '合作起始', name: 'since', type: 'month', value: AS_OF.slice(0, 7), required: true })}
      ${fieldHtml({ label: '备注', name: 'note', type: 'textarea', placeholder: '合作范围、结算方式或其他说明（选填）', full: true })}
    </div>
  `;
  showFormModal({ title: '添加合作公司', sub: '保存后立即加入合作名录，并同步更新合作概况。', eyebrow: '合作公司', body, formType: 'partner', submitLabel: '保存合作公司' });
}

function openClientForm() {
  const body = `
    <div class="form-grid">
      ${fieldHtml({ label: '客户名称', name: 'name', placeholder: '公司或机构全称', required: true, full: true })}
      ${fieldHtml({ label: '联系人', name: 'contact', placeholder: '姓名或称呼', required: true })}
      ${fieldHtml({ label: '联系方式', name: 'phone', placeholder: '电话或手机号', required: true })}
      ${fieldHtml({ label: '信任交易额', name: 'amount', type: 'number', placeholder: '0', required: true, suffix: '万元', min: '0', step: '0.1', hint: '累计已确认的交易金额' })}
      ${fieldHtml({ label: '合作起始', name: 'since', type: 'month', value: AS_OF.slice(0, 7), required: true })}
      ${fieldHtml({ label: '当前状态', name: 'status', options: ['活跃', '跟进中', '已归档'], value: '活跃' })}
      ${fieldHtml({ label: '备注', name: 'note', type: 'textarea', placeholder: '合作背景、项目范围或跟进事项（选填）', full: true })}
    </div>
  `;
  showFormModal({ title: '添加客户', sub: '客户会进入客户名录，并计入客户总数与信任交易额。', eyebrow: '客户信息', body, formType: 'client', submitLabel: '保存客户' });
}

function openTransactionForm(prefill = {}) {
  const type = prefill.type || '转出';
  const preferredCurrency = ['CNY', 'USD', 'HKD'].includes(ui.currency) ? ui.currency : 'CNY';
  const currency = prefill.currency || preferredCurrency;
  const body = `
    <div class="form-grid">
      <div class="field full">
        <label>交易类型</label>
        <div class="radio-cards">
          <label><input type="radio" name="type" value="存入" ${type === '存入' ? 'checked' : ''}>存入</label>
          <label><input type="radio" name="type" value="转出" ${type === '转出' ? 'checked' : ''}>转出</label>
        </div>
        <span class="field-error"></span>
      </div>
      ${fieldHtml({ label: '金额', name: 'amount', type: 'number', placeholder: '0.00', required: true, min: '0', step: '0.01', suffix: currency })}
      ${fieldHtml({ label: '币种', name: 'currency', options: ['CNY', 'USD', 'HKD'], value: currency })}
      <div class="field">
        <label for="field-account-display">结算账户</label>
        <input class="input" id="field-account-display" value="${esc(accountLabel(currency))}" readonly aria-readonly="true">
        <input type="hidden" name="account" value="${currency}">
        <span class="field-hint">账户按币种自动匹配</span>
        <span class="field-error"></span>
      </div>
      ${fieldHtml({ label: '处理状态', name: 'processStatus', options: ['已完成', '待确认'], value: '已完成' })}
      ${fieldHtml({ label: '对方', name: 'counterparty', value: prefill.counterparty || '', placeholder: '公司或收款方名称', required: true, full: true })}
      ${fieldHtml({ label: '发生日期', name: 'date', type: 'date', value: todayISO(), required: true })}
      ${fieldHtml({ label: '摘要', name: 'summary', value: prefill.summary || '', placeholder: '款项用途或说明', required: true, full: true })}
      <div class="field full"><div class="form-note">${icon('info')}<span data-currency-note>${currency === 'CNY' ? '金额以人民币计价' : `金额按 1 CNY = ${RATES[currency]} ${currency} 折算`}；保存后将更新对应结算账户余额。</span></div></div>
    </div>
  `;
  showFormModal({ title: '记录资金流动', sub: '完成后会写入资金流水，并同步更新可支配资金。', eyebrow: '存入与转出', body, formType: 'transaction', submitLabel: '保存流水' });
  const form = $('#modalForm');
  if (form) bindTransactionForm(form);
}

function bindTransactionForm(form) {
  const currencySelect = form.elements.namedItem('currency');
  const accountInput = form.elements.namedItem('account');
  const accountDisplay = $('#field-account-display', form);
  const amountInput = form.elements.namedItem('amount');
  const note = $('[data-currency-note]', form);
  if (!currencySelect || !accountInput) return;
  sync();
  currencySelect.addEventListener('change', sync);
  function sync() {
    const currency = currencySelect.value;
    accountInput.value = currency;
    if (accountDisplay) accountDisplay.value = accountLabel(currency);
    if (amountInput) {
      const suffix = amountInput.closest('.input-suffix');
      const span = suffix ? $('span', suffix) : null;
      if (span) span.textContent = currency;
    }
    if (note) note.textContent = `${currency === 'CNY' ? '金额以人民币计价' : `金额按 1 CNY = ${RATES[currency]} ${currency} 折算`}；保存后将更新对应结算账户余额。`;
  }
}

function openEmployeeForm() {
  const departments = ['管理层', '技术部', '产品部', '设计部', '财务部', '商务部', '交付部', '市场部'];
  const body = `
    <div class="form-grid">
      ${fieldHtml({ label: '姓名', name: 'name', placeholder: '员工姓名', required: true })}
      ${fieldHtml({ label: '职位', name: 'role', placeholder: '例如 前端工程师', required: true })}
      ${fieldHtml({ label: '部门', name: 'dept', options: departments, value: '技术部' })}
      ${fieldHtml({ label: '状态', name: 'status', options: ['在职', '试用', '休假'], value: '在职' })}
      ${fieldHtml({ label: '联系电话', name: 'phone', placeholder: '手机号或座机', required: true })}
      ${fieldHtml({ label: '入职日期', name: 'since', type: 'date', value: todayISO(), required: true })}
      ${fieldHtml({ label: '工作邮箱', name: 'email', type: 'email', placeholder: 'name@laoren.co', full: true })}
      ${fieldHtml({ label: '备注', name: 'note', type: 'textarea', placeholder: '汇报关系、职责范围或补充说明（选填）', full: true })}
    </div>
  `;
  showFormModal({ title: '添加员工', sub: '员工会进入团队档案，并按部门自动归入筛选。', eyebrow: '员工管理', body, formType: 'employee', submitLabel: '保存员工' });
}

function openServiceForm() {
  const owners = state.employees.filter((item) => item.status !== '休假').map((item) => item.name);
  const body = `
    <div class="form-grid">
      ${fieldHtml({ label: '服务名称', name: 'name', placeholder: '例如 企业官网与品牌站', required: true, full: true })}
      ${fieldHtml({ label: '服务说明', name: 'desc', type: 'textarea', placeholder: '一句话说明交付内容与适用场景', required: true, full: true })}
      ${fieldHtml({ label: '起价', name: 'price', type: 'number', placeholder: '0', required: true, min: '0', step: '1000', suffix: '元' })}
      ${fieldHtml({ label: '计价方式', name: 'priceUnit', options: ['起', '/年', '/月'], value: '起' })}
      ${fieldHtml({ label: '负责人', name: 'owner', options: owners, value: owners[0] || '老人炎', required: true })}
      ${fieldHtml({ label: '状态', name: 'status', options: ['在售', '暂停接单'], value: '在售' })}
    </div>
  `;
  showFormModal({ title: '新增服务项目', sub: '保存后会加入服务目录，并计入在售服务数量。', eyebrow: '服务项目', body, formType: 'service', submitLabel: '保存服务' });
}

/* ---------- Drawers ---------- */

function openPartnerDrawer(id) {
  const partner = state.partners.find((item) => item.id === id);
  if (!partner) return toast('未找到这家合作公司', 'error');
  const related = state.transactions.filter((item) => item.counterparty.includes(partner.short) || partner.name.includes(item.counterparty)).slice(0, 3);
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">年度交易额</div><div class="detail-hero-value">${fmtMoney(partner.amount)}</div><div class="detail-hero-note">${esc(partner.type)} · 自 ${formatMonth(partner.since)} 起合作</div></div>
    <div class="detail-section"><h3>合作信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">公司全称</div><div class="detail-value">${esc(partner.name)}</div></div>
      <div class="detail-item"><div class="detail-label">当前状态</div><div class="detail-value">${statusHtml(partner.status)}</div></div>
      <div class="detail-item"><div class="detail-label">对接人</div><div class="detail-value">${esc(partner.contact)}</div></div>
      <div class="detail-item"><div class="detail-label">联系电话</div><div class="detail-value">${esc(partner.phone)}</div></div>
      <div class="detail-item"><div class="detail-label">合作起始</div><div class="detail-value">${formatMonth(partner.since)}</div></div>
      <div class="detail-item"><div class="detail-label">合作类型</div><div class="detail-value">${esc(partner.type)}</div></div>
    </div></div>
    <div class="detail-section"><h3>合作备注</h3><div class="detail-note">${esc(partner.note || '暂无备注')}</div></div>
    <div class="detail-section"><h3>关联流水</h3>${related.length ? `<div class="detail-list">${related.map((item) => `<div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">${esc(item.summary)}</div><div class="detail-list-sub">${item.date} · ${item.type}</div></div><div class="detail-amount">${item.type === '存入' ? '+' : '-'}${fmtMoney(convertToCNY(item.amount, item.currency), { compact: false, digits: 0 })}</div></div>`).join('')}</div>` : '<div class="detail-note">暂无关联流水。发起转账后会自动出现在这里。</div>'}</div>
  `;
  showDrawer({
    kicker: '合作公司 · COOPERATION',
    title: esc(partner.name),
    sub: `<span class="status ${statusClass(partner.status)}"><span class="status-dot"></span>${esc(partner.status)}</span><span>${esc(partner.short)}</span>`,
    body,
    footer: `<button class="btn" type="button" data-action="close-overlay">关闭</button><button class="btn primary" type="button" data-action="partner-transfer" data-id="${partner.id}">发起转账</button>`
  });
}

function openClientDrawer(id) {
  const client = state.clients.find((item) => item.id === id);
  if (!client) return toast('未找到这位客户', 'error');
  const related = state.transactions.filter((item) => item.counterparty.includes(client.name) || client.name.includes(item.counterparty)).slice(0, 3);
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">信任交易额</div><div class="detail-hero-value">${fmtMoney(client.amount)}</div><div class="detail-hero-note">${client.deals} 次合作 · 最近交易 ${client.last}</div></div>
    <div class="detail-section"><h3>客户信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">客户名称</div><div class="detail-value">${esc(client.name)}</div></div>
      <div class="detail-item"><div class="detail-label">当前状态</div><div class="detail-value">${statusHtml(client.status)}</div></div>
      <div class="detail-item"><div class="detail-label">联系人</div><div class="detail-value">${esc(client.contact)}</div></div>
      <div class="detail-item"><div class="detail-label">联系方式</div><div class="detail-value">${esc(client.phone)}</div></div>
      <div class="detail-item"><div class="detail-label">合作起始</div><div class="detail-value">${formatMonth(client.since)}</div></div>
      <div class="detail-item"><div class="detail-label">合作次数</div><div class="detail-value">${client.deals} 次</div></div>
    </div></div>
    <div class="detail-section"><h3>合作备注</h3><div class="detail-note">${esc(client.note || '暂无备注')}</div></div>
    <div class="detail-section"><h3>关联回款</h3>${related.length ? `<div class="detail-list">${related.map((item) => `<div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">${esc(item.summary)}</div><div class="detail-list-sub">${item.date} · ${item.type}</div></div><div class="detail-amount">${item.type === '存入' ? '+' : '-'}${fmtMoney(convertToCNY(item.amount, item.currency), { compact: false, digits: 0 })}</div></div>`).join('')}</div>` : '<div class="detail-note">暂无关联回款记录。记录回款后会同步到资金流水。</div>'}</div>
  `;
  showDrawer({
    kicker: '客户 · CLIENT',
    title: esc(client.name),
    sub: `<span class="status ${statusClass(client.status)}"><span class="status-dot"></span>${esc(client.status)}</span><span>${esc(client.contact)}</span>`,
    body,
    footer: `<button class="btn" type="button" data-action="close-overlay">关闭</button><button class="btn primary" type="button" data-action="client-payment" data-id="${client.id}">记录回款</button>`
  });
}

function openTransactionDrawer(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return toast('未找到这笔流水', 'error');
  const cny = convertToCNY(transaction.amount, transaction.currency);
  const signed = transaction.type === '存入' ? '+' : '-';
  const statusNote = transaction.status === '待确认'
    ? '待确认，尚未计入账户余额'
    : transaction.type === '存入' ? '资金已进入对应账户' : '资金已从对应账户转出';
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">${esc(transaction.type)}金额</div><div class="detail-hero-value" style="color:${transaction.type === '存入' ? 'var(--accent)' : 'var(--negative)'}">${signed}${fmtMoney(cny, { compact: false, digits: 0 })}</div><div class="detail-hero-note">${statusNote}</div></div>
    <div class="detail-section"><h3>流水信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">发生日期</div><div class="detail-value">${transaction.date}</div></div>
      <div class="detail-item"><div class="detail-label">处理状态</div><div class="detail-value">${statusHtml(transaction.status)}</div></div>
      <div class="detail-item"><div class="detail-label">结算账户</div><div class="detail-value">${accountLabel(transaction.account)}</div></div>
      <div class="detail-item"><div class="detail-label">原币金额</div><div class="detail-value">${CURRENCIES[transaction.currency].symbol}${nf(transaction.amount, transaction.currency === 'JPY' ? 0 : 2)} ${transaction.currency}</div></div>
      <div class="detail-item"><div class="detail-label">交易类型</div><div class="detail-value">${transaction.type}</div></div>
      <div class="detail-item"><div class="detail-label">折算人民币</div><div class="detail-value">${fmtMoney(cny, { compact: false, digits: 2, currency: 'CNY' })}</div></div>
    </div></div>
    <div class="detail-section"><h3>对方与摘要</h3><div class="detail-note"><strong style="color:var(--ink);font-weight:550;">${esc(transaction.counterparty)}</strong><br>${esc(transaction.summary)}</div></div>
    <div class="detail-section"><h3>折算说明</h3><div class="info-note">${icon('info')}<span>金额按 ${FX_DATE} 内部中间价折算，仅用于总览展示；实际结算以银行回单为准。</span></div></div>
  `;
  showDrawer({
    kicker: `资金流水 · ${transaction.type === '存入' ? 'INFLOW' : 'OUTFLOW'}`,
    title: esc(transaction.summary),
    sub: `<span class="status ${statusClass(transaction.status)}"><span class="status-dot"></span>${esc(transaction.status)}</span><span>${transaction.date}</span>`,
    body,
    footer: transaction.status === '待确认' ? `<button class="btn" type="button" data-action="close-overlay">关闭</button><button class="btn primary" type="button" data-action="confirm-transaction" data-id="${transaction.id}">确认并记账</button>` : '<button class="btn" type="button" data-action="close-overlay">关闭</button>'
  });
}

function openEmployeeDrawer(id) {
  const employee = state.employees.find((item) => item.id === id);
  if (!employee) return;
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">当前职位</div><div class="detail-hero-value" style="font-size:21px;">${esc(employee.role)}</div><div class="detail-hero-note">${esc(employee.dept)} · 入职于 ${formatDate(employee.since, 'long')}</div></div>
    <div class="detail-section"><h3>员工信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">姓名</div><div class="detail-value">${esc(employee.name)}</div></div>
      <div class="detail-item"><div class="detail-label">状态</div><div class="detail-value">${statusHtml(employee.status)}</div></div>
      <div class="detail-item"><div class="detail-label">部门</div><div class="detail-value">${esc(employee.dept)}</div></div>
      <div class="detail-item"><div class="detail-label">职位</div><div class="detail-value">${esc(employee.role)}</div></div>
      <div class="detail-item"><div class="detail-label">联系电话</div><div class="detail-value">${esc(employee.phone)}</div></div>
      <div class="detail-item"><div class="detail-label">工作邮箱</div><div class="detail-value">${esc(employee.email || '—')}</div></div>
    </div></div>
    <div class="detail-section"><h3>组织关系</h3><div class="detail-note">${employee.name === '老人炎' ? '公司负责人、董事长，负责集团整体经营与重大事项决策。' : `所属 ${esc(employee.dept)}，向部门负责人汇报；涉及跨部门项目时由项目经理协调。`}</div></div>
  `;
  showDrawer({ kicker: '员工档案 · TEAM', title: esc(employee.name), sub: `<span class="status ${statusClass(employee.status)}"><span class="status-dot"></span>${esc(employee.status)}</span><span>${esc(employee.dept)}</span>`, body });
}

function openServiceDrawer(id) {
  const service = state.services.find((item) => item.id === id);
  if (!service) return;
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">服务起价</div><div class="detail-hero-value">${fmtMoney(service.price)} <span style="font-size:12px;font-weight:400;color:var(--muted);">${esc(service.priceUnit)}</span></div><div class="detail-hero-note">${service.projects} 个项目 · 负责人 ${esc(service.owner)}</div></div>
    <div class="detail-section"><h3>服务说明</h3><div class="detail-note">${esc(service.desc)}</div></div>
    <div class="detail-section"><h3>服务信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">当前状态</div><div class="detail-value">${statusHtml(service.status)}</div></div>
      <div class="detail-item"><div class="detail-label">负责人</div><div class="detail-value">${esc(service.owner)}</div></div>
      <div class="detail-item"><div class="detail-label">项目数量</div><div class="detail-value">${service.projects} 个</div></div>
      <div class="detail-item"><div class="detail-label">计价方式</div><div class="detail-value">${fmtMoney(service.price)} ${esc(service.priceUnit)}</div></div>
    </div></div>
    <div class="detail-section"><h3>交付标签</h3><div style="display:flex;gap:6px;flex-wrap:wrap;">${service.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div>
  `;
  showDrawer({ kicker: '服务项目 · SERVICE', title: esc(service.name), sub: `<span class="status ${statusClass(service.status)}"><span class="status-dot"></span>${esc(service.status)}</span><span>${service.projects} 个项目</span>`, body });
}

function openGroupDrawer(id) {
  const entity = GROUP_ENTITIES.find((item) => item.id === id);
  if (!entity) return;
  const body = `
    <div class="detail-hero"><div class="detail-hero-label">年度营业收入</div><div class="detail-hero-value">${fmtMoney(entity.revenue * 10000)}</div><div class="detail-hero-note">集团持股 ${entity.share}% · 员工 ${entity.employees} 人</div></div>
    <div class="detail-section"><h3>成员信息</h3><div class="detail-grid">
      <div class="detail-item"><div class="detail-label">公司全称</div><div class="detail-value">${esc(entity.name)}</div></div>
      <div class="detail-item"><div class="detail-label">状态</div><div class="detail-value">${statusHtml(entity.status)}</div></div>
      <div class="detail-item"><div class="detail-label">负责人</div><div class="detail-value">${esc(entity.lead)}</div></div>
      <div class="detail-item"><div class="detail-label">持股比例</div><div class="detail-value">${entity.share}%</div></div>
      <div class="detail-item"><div class="detail-label">成立年份</div><div class="detail-value">${entity.since} 年</div></div>
      <div class="detail-item"><div class="detail-label">员工人数</div><div class="detail-value">${entity.employees} 人</div></div>
    </div></div>
    <div class="detail-section"><h3>业务定位</h3><div class="detail-note">${esc(entity.role)}。作为集团成员企业，纳入集团合并口径管理，按季度同步经营数据。</div></div>
  `;
  showDrawer({ kicker: '集团成员 · GROUP', title: esc(entity.name), sub: `<span class="status active"><span class="status-dot"></span>${esc(entity.status)}</span><span>持股 ${entity.share}%</span>`, body });
}

/* ---------- Utility modals ---------- */

function openAccountModal() {
  closePopovers();
  showModal({
    title: '账户资料', sub: '当前登录人与公司信息', eyebrow: '账户',
    content: `
      <div class="modal-body">
        <div class="detail-hero"><div class="detail-hero-label">当前使用人</div><div class="detail-hero-value" style="font-size:22px;">老人炎</div><div class="detail-hero-note">董事长 · 负责人</div></div>
        <div class="detail-section"><h3>公司信息</h3><div class="detail-grid">
          <div class="detail-item"><div class="detail-label">公司名称</div><div class="detail-value">老人言程序制作有限公司</div></div>
          <div class="detail-item"><div class="detail-label">负责人</div><div class="detail-value">老人炎</div></div>
          <div class="detail-item"><div class="detail-label">数据口径</div><div class="detail-value">集团合并</div></div>
          <div class="detail-item"><div class="detail-label">数据快照</div><div class="detail-value">${AS_OF} 15:00</div></div>
        </div></div>
        <div class="detail-section"><div class="info-note">${icon('info')}<span>这是一个本地运行的管理工作台。新增的合作公司、客户、流水、员工与服务会保存在当前浏览器中，不会上传到服务器。</span></div></div>
      </div>
      <div class="modal-actions"><button class="btn" type="button" data-action="close-overlay">关闭</button></div>
    `
  });
}

function openShortcutsModal() {
  closePopovers();
  showModal({
    title: '键盘快捷键', sub: '更快的检索与关闭方式', eyebrow: '操作', size: 'sm',
    content: `
      <div class="modal-body"><div class="detail-list">
        <div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">全局搜索</div><div class="detail-list-sub">聚焦顶部搜索框</div></div><div class="tag">Ctrl / ⌘ K</div></div>
        <div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">快速搜索</div><div class="detail-list-sub">在页面空白处按下</div></div><div class="tag">/</div></div>
        <div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">选择搜索结果</div><div class="detail-list-sub">上下移动高亮项</div></div><div class="tag">↑ / ↓</div></div>
        <div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">打开结果</div><div class="detail-list-sub">进入详情或定位记录</div></div><div class="tag">Enter</div></div>
        <div class="detail-list-row"><div class="detail-list-main"><div class="detail-list-title">关闭浮层</div><div class="detail-list-sub">关闭搜索、弹窗与抽屉</div></div><div class="tag">Esc</div></div>
      </div></div>
      <div class="modal-actions"><button class="btn" type="button" data-action="close-overlay">关闭</button></div>
    `
  });
}

function openResetModal() {
  closePopovers();
  showModal({
    title: '恢复初始数据', sub: '此操作会覆盖当前浏览器中已保存的内容', eyebrow: '数据管理', size: 'sm',
    content: `
      <div class="modal-body"><div class="confirm-copy">将把合作公司、客户、流水、员工与服务恢复为初始数据。你之后添加的内容会被清除。</div><div class="confirm-warning">此操作不可撤销。建议先导出需要保留的报表。</div></div>
      <div class="modal-actions"><button class="btn" type="button" data-action="close-overlay">取消</button><button class="btn danger" type="button" data-action="confirm-reset">恢复初始数据</button></div>
    `
  });
}

/* ---------- Exports ---------- */

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadCSV(filename, headers, rows) {
  const content = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function exportDashboard() {
  const rows = getPeriodMonths().map((month) => [
    month.full,
    convertFromCNY(month.revenue * 10000, ui.currency).toFixed(2),
    convertFromCNY(month.expense * 10000, ui.currency).toFixed(2),
    convertFromCNY((month.revenue - month.expense) * 10000, ui.currency).toFixed(2),
    ui.currency
  ]);
  downloadCSV(`老人言-经营报表-${AS_OF}-${ui.currency}.csv`, ['月份', '营收', '支出', '经营结余', '币种'], rows);
  toast(`经营报表已导出（${CURRENCIES[ui.currency].label}）`);
}

function exportFunds() {
  const rows = fundRows().map((transaction) => [
    transaction.date, transaction.type, transaction.counterparty, transaction.summary,
    `${accountLabel(transaction.account)}`, transaction.amount, transaction.currency,
    convertToCNY(transaction.amount, transaction.currency).toFixed(2), transaction.status
  ]);
  downloadCSV(`老人言-资金流水-${AS_OF}.csv`, ['日期', '类型', '对方', '摘要', '账户', '原币金额', '原币种', '折算人民币', '状态'], rows);
  toast('资金流水已导出');
}

function exportClients() {
  const rows = clientRows().map((client) => [client.name, client.contact, client.phone, client.amount, client.since, client.last, client.status, client.deals]);
  downloadCSV(`老人言-客户名录-${AS_OF}.csv`, ['客户名称', '联系人', '联系方式', '信任交易额（元）', '合作起始', '最近交易', '状态', '合作次数'], rows);
  toast('客户名录已导出');
}

function exportStocks() {
  const rows = STOCKS.map((stock) => [stock.name, stock.code, stock.market, stock.price.toFixed(2), stock.changePct.toFixed(2), stock.open.toFixed(2), stock.high.toFixed(2), stock.low.toFixed(2), stock.turnover, stock.pe.toFixed(1), stock.turnoverRate.toFixed(2)]);
  downloadCSV(`老人言-收盘行情-${AS_OF}.csv`, ['名称', '代码', '市场', '收盘价', '涨跌幅%', '今开', '最高', '最低', '成交额', '市盈率TTM', '换手率%'], rows);
  toast('收盘行情已导出');
}
