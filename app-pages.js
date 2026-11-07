/* =========================================================
   Pages
   ========================================================= */

function dashboardPage() {
  const months = getPeriodMonths();
  const revenue = sumBy(months, (month) => month.revenue * 10000);
  const expense = sumBy(months, (month) => month.expense * 10000);
  const surplus = revenue - expense;
  const recentTransactions = [...state.transactions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5);

  const kpis = [
    { label: '总营收', value: 77920000, delta: '+12.8%', tone: 'positive', foot: '近 12 个月', compare: '较去年同期', spark: [42, 48, 45, 53, 51, 59, 57, 64, 62, 70, 68, 76] },
    { label: '总支出', value: 49060000, delta: '+6.4%', tone: 'neutral', foot: '近 12 个月', compare: '较去年同期', spark: [31, 33, 32, 36, 35, 39, 41, 40, 42, 44, 45, 47] },
    { label: '经营结余', value: 28860000, delta: '+18.2%', tone: 'positive', foot: '结余率 37.0%', compare: '近 12 个月', spark: [11, 15, 13, 17, 16, 20, 16, 18, 20, 26, 23, 29] },
    { label: '公司市值', value: 1286000000, delta: '+4.6%', tone: 'positive', foot: '本月', compare: '估值口径', spark: [52, 55, 54, 58, 61, 60, 65, 63, 68, 66, 70, 72] }
  ];

  return `
    ${pageHead({
      title: '公司数据看板',
      desc: `数据截至 ${AS_OF} 15:00 · 近 12 个月 · 集团合并口径 · 金额按${CURRENCIES[ui.currency].label}折算`,
      actions: `${currencySwitch()}<button class="btn" type="button" data-action="export-dashboard">${icon('download')}导出报表</button>`,
      revealIndex: 0
    })}
    <section class="kpi-band reveal" style="--i:1" aria-label="核心经营指标">
      ${kpis.map((kpi) => `
        <div class="kpi">
          <div class="kpi-head">
            <span class="kpi-label">${kpi.label}</span>
            <span class="delta ${kpi.tone === 'positive' ? '' : kpi.tone}">${kpi.delta}</span>
          </div>
          <div class="kpi-value ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(kpi.value)}</div>
          <div class="kpi-foot"><span>${kpi.foot}</span><span class="sep">·</span><span>${kpi.compare}</span></div>
          <svg class="kpi-spark" viewBox="0 0 64 25" aria-hidden="true"><path d="${sparkPath(kpi.spark, 64, 25)}"></path></svg>
        </div>
      `).join('')}
    </section>

    <div class="grid-main">
      <section class="panel chart-panel reveal" style="--i:2">
        <div class="panel-head">
          <div>
            <h2>营收与支出</h2>
            <p class="panel-sub">近 ${months.length} 个月 · 单位按${CURRENCIES[ui.currency].label}折算</p>
          </div>
          <div class="panel-tools">
            <div class="legend">
              <span class="legend-item"><span class="legend-dot"></span>营收</span>
              <span class="legend-item"><span class="legend-dot expense"></span>支出</span>
            </div>
            <div class="segmented" role="group" aria-label="统计区间">
              ${[['3m', '近3月'], ['6m', '近6月'], ['12m', '近12月']].map(([value, label]) => `
                <button type="button" data-action="set-period" data-value="${value}" class="${ui.period === value ? 'active' : ''}" aria-pressed="${ui.period === value}">${label}</button>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="panel-body">
          <div class="chart-wrap" data-chart-wrap="revenue">
            ${buildRevenueChart(months)}
            <div class="chart-tooltip" data-chart-tooltip="revenue"></div>
          </div>
          <div class="chart-summary">
            <div class="chart-stat"><div class="chart-stat-label">区间营收</div><div class="chart-stat-value">${fmtMoney(revenue)}</div></div>
            <div class="chart-stat"><div class="chart-stat-label">区间支出</div><div class="chart-stat-value">${fmtMoney(expense)}</div></div>
            <div class="chart-stat"><div class="chart-stat-label">区间结余</div><div class="chart-stat-value positive">${fmtMoney(surplus)}</div></div>
          </div>
        </div>
      </section>

      <section class="panel donut-panel reveal" style="--i:3">
        <div class="panel-head">
          <div><h2>支出构成</h2><p class="panel-sub">近 12 个月累计 · ${CURRENCIES[ui.currency].label}</p></div>
          <span class="tag">管理口径</span>
        </div>
        <div class="panel-body">${buildExpenseDonut(49060000)}</div>
      </section>
    </div>

    <div class="grid-even">
      <section class="panel reveal" style="--i:4">
        <div class="panel-head">
          <div><h2>业务板块表现</h2><p class="panel-sub">按近 12 个月确认收入拆分 · ${CURRENCIES[ui.currency].label}</p></div>
          <button class="link-btn" type="button" data-nav="team">服务项目${icon('arrow-right')}</button>
        </div>
        <div class="panel-body">
          <div class="bar-list">
            ${BUSINESS_LINES.map((line, index) => `
              <div class="bar-item">
                <span class="bar-label">${line.name}</span>
                <div class="bar-track"><div class="bar-fill" style="--i:${index};width:${(line.value / BUSINESS_LINES[0].value) * 100}%"></div></div>
                <span class="bar-value">${fmtMoney(line.value * 10000)}</span>
              </div>
            `).join('')}
          </div>
          <div class="panel-foot" style="padding-right:0;padding-left:0;margin-top:18px;">
            <span>近 12 个月确认收入合计 ${fmtMoney(77920000)}</span>
            <span>单位：${CURRENCIES[ui.currency].code}</span>
          </div>
        </div>
      </section>

      <section class="panel reveal" style="--i:5">
        <div class="panel-head">
          <div><h2>客户回款</h2><p class="panel-sub">应收账款状态 · 截至 ${AS_OF}</p></div>
          <button class="link-btn" type="button" data-nav="clients">客户列表${icon('arrow-right')}</button>
        </div>
        <div class="panel-body">
          <div class="receivable-summary">
            <div class="receivable-total">
              <div class="receivable-label">应收余额</div>
              <div class="receivable-value">${fmtMoney(12648000)}</div>
              <div class="receivable-note">涉及 5 家客户 · 其中 1 家逾期</div>
            </div>
            <div>
              <div class="stacked-bar" aria-hidden="true"><span style="width:68%"></span><span style="width:24%"></span><span style="width:8%"></span></div>
              <div class="receivable-legend">
                <span class="legend-item"><span class="legend-dot"></span>已回款 68%</span>
                <span class="legend-item"><span class="legend-dot neutral"></span>待回款 24%</span>
                <span class="legend-item"><span class="legend-dot expense"></span>逾期 8%</span>
              </div>
            </div>
          </div>
          <div class="panel-foot" style="padding-right:0;padding-left:0;margin-top:20px;">
            <span>本月已回款 ${fmtMoney(thisMonthAmount('存入'))}</span>
            <span>待结算 ${fmtMoney(pendingAmount())}</span>
          </div>
        </div>
      </section>
    </div>

    <section class="panel table-panel reveal" style="--i:6">
      <div class="panel-head">
        <div><h2>近期资金流动</h2><p class="panel-sub">最近 5 笔存入与转出记录</p></div>
        <button class="link-btn" type="button" data-nav="funds">全部流水${icon('arrow-right')}</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>日期</th><th>类型</th><th>对方 / 摘要</th><th>账户</th><th class="num">金额</th><th>状态</th></tr></thead>
          <tbody>
            ${recentTransactions.map((transaction) => `
              <tr>
                <td>${transaction.date}</td>
                <td><span class="tag ${transaction.type === '存入' ? 'green' : ''}">${transaction.type}</span></td>
                <td><div class="entity-name" style="max-width:280px;">${esc(transaction.counterparty)}</div><div class="entity-sub">${esc(transaction.summary)}</div></td>
                <td>${accountLabel(transaction.account)}</td>
                <td class="num">
                  <div class="amount ${transaction.type === '存入' ? 'positive' : ''}">${transaction.type === '存入' ? '+' : '-'}${fmtMoney(convertToCNY(transaction.amount, transaction.currency), { compact: false, digits: 0 })}</div>
                  ${ui.currency !== transaction.currency ? `<div class="amount-origin">原币 ${CURRENCIES[transaction.currency].symbol}${nf(transaction.amount, transaction.currency === 'JPY' ? 0 : 2)}</div>` : ''}
                </td>
                <td>${statusHtml(transaction.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function buildRevenueChart(months) {
  const width = 840, height = 300;
  const margin = { top: 16, right: 16, bottom: 34, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const values = months.map((month) => ({ ...month, revCny: month.revenue * 10000, expCny: month.expense * 10000 }));
  const maxCny = Math.max(...values.map((item) => Math.max(item.revCny, item.expCny)));
  const topCny = niceMax(maxCny * 1.12);
  const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW;
  const pointX = (index) => margin.left + index * stepX;
  const pointY = (cny) => margin.top + innerH - (cny / topCny) * innerH;
  const revPoints = values.map((item, index) => ({ x: pointX(index), y: pointY(item.revCny) }));
  const expPoints = values.map((item, index) => ({ x: pointX(index), y: pointY(item.expCny) }));
  const revPath = revPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const expPath = expPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const areaPath = `${revPath} L${revPoints[revPoints.length - 1].x.toFixed(1)},${(margin.top + innerH).toFixed(1)} L${revPoints[0].x.toFixed(1)},${(margin.top + innerH).toFixed(1)} Z`;
  const grid = [0, 1, 2, 3, 4].map((index) => {
    const y = margin.top + innerH - (innerH / 4) * index;
    return `<line class="grid-line" x1="${margin.left}" y1="${y.toFixed(1)}" x2="${width - margin.right}" y2="${y.toFixed(1)}"></line><text class="axis-label" x="${margin.left - 10}" y="${(y + 3).toFixed(1)}" text-anchor="end">${fmtAxis((topCny / 4) * index)}</text>`;
  }).join('');
  const xLabels = values.map((item, index) => `<text class="axis-label x" x="${pointX(index).toFixed(1)}" y="${height - 11}" text-anchor="middle">${item.label}</text>`).join('');
  charts.revenue = {
    width, height,
    points: values.map((item, index) => ({ x: pointX(index), yRev: pointY(item.revCny), yExp: pointY(item.expCny), rev: item.revCny, exp: item.expCny, label: item.full }))
  };
  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="营收与支出趋势图">
      <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f5a48" stop-opacity="0.16"></stop><stop offset="100%" stop-color="#1f5a48" stop-opacity="0"></stop></linearGradient></defs>
      ${grid}${xLabels}
      <path class="chart-area" d="${areaPath}"></path>
      <path class="chart-line" d="${revPath}" data-chart-line="revenue"></path>
      <path class="chart-line expense" d="${expPath}" data-chart-line="expense"></path>
      <line class="hover-line" data-hover-line x1="0" y1="${margin.top}" x2="0" y2="${margin.top + innerH}"></line>
      <circle class="hover-dot rev" data-hover-dot="rev" cx="0" cy="0" r="3.6"></circle>
      <circle class="hover-dot exp" data-hover-dot="exp" cx="0" cy="0" r="3.4"></circle>
    </svg>
  `;
}

function buildExpenseDonut(expenseTotal) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circles = EXPENSE_BREAKDOWN.map((item) => {
    const length = (item.pct / 100) * circumference;
    const circle = `<circle cx="79" cy="79" r="${radius}" stroke="${item.color}" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" stroke-linecap="butt"></circle>`;
    offset += length;
    return circle;
  }).join('');
  return `
    <div class="donut-layout">
      <div class="donut">
        <svg viewBox="0 0 158 158" aria-hidden="true">${circles}</svg>
        <div class="donut-center"><span class="donut-center-label">年度支出</span><span class="donut-center-value">${fmtMoney(expenseTotal)}</span></div>
      </div>
      <div class="donut-legend">
        ${EXPENSE_BREAKDOWN.map((item) => `<div class="donut-row"><span class="donut-name"><span class="donut-swatch" style="background:${item.color}"></span>${item.name}</span><span class="donut-pct">${item.pct}%</span><span class="donut-amount">${fmtMoney(expenseTotal * item.pct / 100)}</span></div>`).join('')}
      </div>
    </div>
    <div class="donut-foot">支出按管理口径归集，包含人力、研发、运营与市场费用；其他项含差旅、办公与折旧。</div>
  `;
}

/* ---------- Partners ---------- */

function partnersPage() {
  const totalPartners = state.partners.length;
  const groupCount = GROUP_ENTITIES.length;
  const activePartners = state.partners.filter((item) => item.status === '合作中').length;
  const annualVolume = sumBy(state.partners, (item) => item.amount);
  const groupRevenue = sumBy(GROUP_ENTITIES, (item) => item.revenue * 10000);
  const groupHeadcount = sumBy(GROUP_ENTITIES, (item) => item.employees);
  return `
    ${pageHead({
      title: '合作与集团',
      desc: `合作公司、集团成员与年度交易关系 · 数据截至 ${AS_OF}`,
      actions: ui.partnerTab === 'partners' ? `<button class="btn primary" type="button" data-action="open-partner-form">${icon('plus')}添加合作公司</button>` : '',
      revealIndex: 0
    })}
    <div class="page-tabs reveal" style="--i:1" role="tablist" aria-label="合作与集团视图">
      <button class="page-tab ${ui.partnerTab === 'partners' ? 'active' : ''}" type="button" role="tab" aria-selected="${ui.partnerTab === 'partners'}" data-action="partner-tab" data-value="partners">合作公司 <span class="tab-count">${totalPartners}</span></button>
      <button class="page-tab ${ui.partnerTab === 'group' ? 'active' : ''}" type="button" role="tab" aria-selected="${ui.partnerTab === 'group'}" data-action="partner-tab" data-value="group">集团总览 <span class="tab-count">${groupCount}</span></button>
    </div>
    ${ui.partnerTab === 'group' ? groupOverviewHtml({ groupRevenue, groupHeadcount, groupCount }) : partnerListHtml({ totalPartners, activePartners, annualVolume })}
  `;
}

function partnerListHtml({ totalPartners, activePartners, annualVolume }) {
  const rows = partnerRows();
  const count = pageCount(rows);
  ui.partnerPage = clamp(ui.partnerPage, 1, count);
  const visible = pageOf(rows, ui.partnerPage);
  const strategic = state.partners.filter((item) => item.type === '战略伙伴').length;
  const supplier = state.partners.filter((item) => item.type === '供应商').length;
  const channel = state.partners.filter((item) => item.type === '渠道合作').length;
  return `
    <section class="kpi-band reveal" style="--i:2" aria-label="合作概况">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">合作公司</span><span class="tag green">${activePartners} 家合作中</span></div><div class="kpi-value">${totalPartners}<span style="font-size:14px;font-weight:400;color:var(--muted);margin-left:4px;">家</span></div><div class="kpi-foot"><span>含战略伙伴、供应商与渠道</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">年度交易额</span><span class="delta">+9.6%</span></div><div class="kpi-value">${fmtMoney(annualVolume)}</div><div class="kpi-foot"><span>较上一年度</span><span class="sep">·</span><span>已确认合作</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">集团成员</span><span class="tag">控股 ${GROUP_ENTITIES.length} 家</span></div><div class="kpi-value">${GROUP_ENTITIES.length}<span style="font-size:14px;font-weight:400;color:var(--muted);margin-left:4px;">家</span></div><div class="kpi-foot"><span>含 2 家非全资子公司</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">合作结构</span></div><div class="kpi-value" style="font-size:21px;letter-spacing:-0.01em;">${strategic} / ${supplier} / ${channel}</div><div class="kpi-foot"><span>战略 / 供应商 / 渠道</span></div></div>
    </section>

    <section class="panel table-panel reveal" style="--i:3">
      <div class="panel-head"><div><h2>合作公司名录</h2><p class="panel-sub">按年度交易额排序 · 共 ${rows.length} 家</p></div></div>
      <div class="panel-body" style="padding-top:0;padding-bottom:13px;">
        <div class="toolbar">
          <button class="chip ${ui.partnerFilter === 'all' ? 'active' : ''}" type="button" data-action="partner-filter" data-value="all">全部 <span class="chip-count">${state.partners.length}</span></button>
          <button class="chip ${ui.partnerFilter === 'strategic' ? 'active' : ''}" type="button" data-action="partner-filter" data-value="strategic">战略伙伴 <span class="chip-count">${strategic}</span></button>
          <button class="chip ${ui.partnerFilter === 'supplier' ? 'active' : ''}" type="button" data-action="partner-filter" data-value="supplier">供应商 <span class="chip-count">${supplier}</span></button>
          <button class="chip ${ui.partnerFilter === 'channel' ? 'active' : ''}" type="button" data-action="partner-filter" data-value="channel">渠道合作 <span class="chip-count">${channel}</span></button>
          <div class="toolbar-spacer"></div>
          <label class="sr-only" for="partnerSort">排序方式</label>
          <select class="select compact" id="partnerSort" data-action="partner-sort">
            <option value="amount" ${ui.partnerSort === 'amount' ? 'selected' : ''}>按年度交易额</option>
            <option value="recent" ${ui.partnerSort === 'recent' ? 'selected' : ''}>按合作起始</option>
          </select>
        </div>
      </div>
      ${visible.length ? `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>公司名称</th><th>类型</th><th>对接人</th><th class="num">年度交易额</th><th>合作起始</th><th>状态</th><th class="actions">操作</th></tr></thead>
          <tbody>${visible.map((partner) => `
            <tr data-row-id="${partner.id}">
              <td><div class="entity"><span class="entity-mark">${initials(partner.short || partner.name)}</span><div class="entity-main"><div class="entity-name" title="${esc(partner.name)}">${esc(partner.name)}</div><div class="entity-sub">${esc(partner.short)} · ${esc(partner.phone)}</div></div></div></td>
              <td>${typeTag(partner.type)}</td><td>${esc(partner.contact)}</td>
              <td class="num"><span class="amount">${fmtMoney(partner.amount)}</span></td>
              <td>${formatMonth(partner.since)}</td><td>${statusHtml(partner.status)}</td>
              <td class="actions"><button class="link-btn" type="button" data-action="view-partner" data-id="${partner.id}">详情${icon('arrow-right')}</button></td>
            </tr>
          `).join('')}</tbody>
        </table></div>
        ${pagination(rows.length, ui.partnerPage, 'partner-page')}
      ` : emptyState({ title: '该筛选下暂无合作公司', desc: '切换合作类型，或添加一家新的合作公司。', action: '<button class="btn btn-sm" type="button" data-action="reset-partner-filter">查看全部</button>' })}
    </section>
  `;
}

function groupOverviewHtml({ groupRevenue, groupHeadcount, groupCount }) {
  return `
    <section class="panel group-summary reveal" style="--i:2">
      <div class="group-parent">
        <span class="group-kicker">${icon('building')}集团母公司</span>
        <h2>老人言控股（集团）有限公司</h2>
        <p>法定代表人 老人炎 · 成立于 2018 年 · 杭州</p>
        <div style="display:flex;gap:18px;margin-top:16px;flex-wrap:wrap;"><span class="status active"><span class="status-dot"></span>合并口径已确认</span><span class="status pending"><span class="status-dot"></span>2 家非全资子公司</span></div>
      </div>
      <div class="group-summary-metrics">
        <div class="group-metric"><div class="group-metric-label">集团合并营收</div><div class="group-metric-value">${fmtMoney(142000000)}</div></div>
        <div class="group-metric"><div class="group-metric-label">成员企业</div><div class="group-metric-value">${groupCount} 家</div></div>
        <div class="group-metric"><div class="group-metric-label">集团员工</div><div class="group-metric-value">${groupHeadcount + state.employees.length} 人</div></div>
        <div class="group-metric"><div class="group-metric-label">成员营收合计</div><div class="group-metric-value">${fmtMoney(groupRevenue)}</div></div>
      </div>
    </section>
    <div class="group-section-head reveal" style="--i:3"><div><h2>集团成员</h2><p>持股比例与年度营业收入 · 数据截至 ${AS_OF}</p></div><span class="tag green">全部运营中</span></div>
    <section class="group-grid">
      ${GROUP_ENTITIES.map((entity, index) => `
        <article class="group-card reveal" style="--i:${index + 4}">
          <div class="group-card-top"><span class="group-share">${entity.share}% 控股</span><span class="status active" style="font-size:9.5px;"><span class="status-dot"></span>${entity.status}</span></div>
          <h3 class="group-card-name">${esc(entity.short)}</h3>
          <div class="group-card-meta">${esc(entity.role)} · 负责人 ${esc(entity.lead)}</div>
          <div class="group-card-stats">
            <div class="group-card-stat"><span>年度营收</span><strong>${fmtMoney(entity.revenue * 10000)}</strong></div>
            <div class="group-card-stat"><span>员工</span><strong>${entity.employees} 人</strong></div>
            <div class="group-card-stat"><span>成立</span><strong>${entity.since}</strong></div>
          </div>
          <div class="group-card-foot"><button class="link-btn" type="button" data-action="view-group" data-id="${entity.id}">查看详情${icon('arrow-right')}</button></div>
        </article>
      `).join('')}
    </section>
  `;
}

/* ---------- Funds ---------- */

function fundsPage() {
  const rows = fundRows();
  const count = pageCount(rows);
  ui.fundPage = clamp(ui.fundPage, 1, count);
  const visible = pageOf(rows, ui.fundPage);
  const total = totalAccountCNY();
  const thisIn = thisMonthAmount('存入');
  const thisOut = thisMonthAmount('转出');
  const pending = pendingAmount();
  const pendingTransactions = state.transactions.filter((item) => item.status === '待确认');
  const pendingLabel = pendingTransactions.length ? pendingTransactions[0].summary : '暂无待确认';
  const fxNote = ui.currency === 'CNY' ? '人民币计价' : `1 CNY = ${RATES[ui.currency]} ${ui.currency}`;
  return `
    ${pageHead({
      title: '存入与转出',
      desc: `集团资金账户与流水 · 数据截至 ${AS_OF} · 金额按${CURRENCIES[ui.currency].label}折算`,
      actions: `${currencySwitch()}<button class="btn primary" type="button" data-action="open-transaction-form">${icon('plus')}记录一笔</button><button class="btn" type="button" data-action="export-funds">${icon('download')}导出流水</button>`,
      revealIndex: 0
    })}
    <section class="kpi-band reveal" style="--i:1" aria-label="资金概况">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">可支配资金</span><span class="delta">+3.8%</span></div><div class="kpi-value ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(total)}</div><div class="kpi-foot"><span>三个结算账户合计</span><span class="sep">·</span><span>今日</span></div><svg class="kpi-spark" viewBox="0 0 64 25" aria-hidden="true"><path d="${sparkPath([42, 44, 43, 48, 46, 51, 50, 54, 57, 55, 60, 63], 64, 25)}"></path></svg></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">本月存入</span><span class="delta">+11.2%</span></div><div class="kpi-value ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(thisIn)}</div><div class="kpi-foot"><span>已入账</span><span class="sep">·</span><span>${formatMonth(AS_OF.slice(0, 7))}</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">本月转出</span><span class="delta negative">+4.1%</span></div><div class="kpi-value ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(thisOut)}</div><div class="kpi-foot"><span>已转出</span><span class="sep">·</span><span>不含待确认</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">待结算</span><span class="tag sand">${pendingTransactions.length} 笔待确认</span></div><div class="kpi-value ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(pending)}</div><div class="kpi-foot"><span>${esc(pendingLabel)}</span><span class="sep">·</span><span>${pendingTransactions.length ? '需复核' : '已全部确认'}</span></div></div>
    </section>

    <div class="grid-main">
      <section class="panel reveal" style="--i:2">
        <div class="panel-head"><div><h2>月度资金流向</h2><p class="panel-sub">近 6 个月 · 按${CURRENCIES[ui.currency].label}折算</p></div><div class="cash-chart-legend"><span class="legend-item"><span class="legend-dot"></span>存入</span><span class="legend-item"><span class="legend-dot expense"></span>转出</span></div></div>
        <div class="panel-body"><div class="cash-chart">${buildCashChart(transactionsByMonth())}<div class="cash-note">转出金额按交易发生额计，不含手续费；待确认交易暂不计入月度流出。</div></div></div>
      </section>
      <section class="panel reveal" style="--i:3">
        <div class="panel-head"><div><h2>结算账户</h2><p class="panel-sub">账户原币余额 · 折算为${CURRENCIES[ui.currency].label}</p></div><span class="tag">3 个账户</span></div>
        <div class="panel-body">
          <div class="account-grid">
            ${[
              { code: 'CNY', name: '人民币基本户', native: state.accounts.CNY, digits: 0 },
              { code: 'USD', name: '美元结算户', native: state.accounts.USD, digits: 2 },
              { code: 'HKD', name: '港币结算户', native: state.accounts.HKD, digits: 2 }
            ].map((account) => {
              const cny = convertToCNY(account.native, account.code);
              return `<div class="account-card"><div class="account-top"><span class="account-name">${account.name}</span><span class="account-code">${account.code}</span></div><div class="account-amount ${ui.animateValues ? 'value-swap' : ''}">${fmtMoney(cny)}</div><div class="account-origin">账户原币 ${CURRENCIES[account.code].symbol}${nf(account.native, account.digits)}</div></div>`;
            }).join('')}
          </div>
          <div class="panel-foot" style="padding-right:0;padding-left:0;margin-top:15px;"><span>折算基准：${FX_DATE} 中间价</span><span>${fxNote}</span></div>
        </div>
      </section>
    </div>

    <section class="panel table-panel reveal" style="--i:4">
      <div class="panel-head"><div><h2>资金流水</h2><p class="panel-sub">共 ${rows.length} 笔记录 · 按发生日期排序</p></div></div>
      <div class="panel-body" style="padding-top:0;padding-bottom:13px;">
        <div class="toolbar">
          <button class="chip ${ui.fundFilter === 'all' ? 'active' : ''}" type="button" data-action="fund-filter" data-value="all">全部 <span class="chip-count">${state.transactions.length}</span></button>
          <button class="chip ${ui.fundFilter === 'in' ? 'active' : ''}" type="button" data-action="fund-filter" data-value="in">存入 <span class="chip-count">${state.transactions.filter((item) => item.type === '存入').length}</span></button>
          <button class="chip ${ui.fundFilter === 'out' ? 'active' : ''}" type="button" data-action="fund-filter" data-value="out">转出 <span class="chip-count">${state.transactions.filter((item) => item.type === '转出').length}</span></button>
          <div class="toolbar-spacer"></div><span class="currency-note">金额按当前币种显示，原币保留在金额下方</span>
        </div>
      </div>
      ${visible.length ? `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>日期</th><th>类型</th><th>对方 / 摘要</th><th>账户</th><th class="num">金额</th><th>状态</th><th class="actions">操作</th></tr></thead>
          <tbody>${visible.map((transaction) => {
            const cny = convertToCNY(transaction.amount, transaction.currency);
            return `<tr data-row-id="${transaction.id}">
              <td>${transaction.date}</td><td><span class="tag ${transaction.type === '存入' ? 'green' : ''}">${transaction.type}</span></td>
              <td><div class="entity-name" style="max-width:260px;">${esc(transaction.counterparty)}</div><div class="entity-sub">${esc(transaction.summary)}</div></td>
              <td>${accountLabel(transaction.account)}</td>
              <td class="num"><div class="amount ${transaction.type === '存入' ? 'positive' : 'negative'}">${transaction.type === '存入' ? '+' : '-'}${fmtMoney(cny, { compact: false, digits: 0 })}</div>${ui.currency !== transaction.currency ? `<div class="amount-origin">原币 ${CURRENCIES[transaction.currency].symbol}${nf(transaction.amount, transaction.currency === 'JPY' ? 0 : 2)}</div>` : ''}</td>
              <td>${statusHtml(transaction.status)}</td>
              <td class="actions"><button class="link-btn" type="button" data-action="view-transaction" data-id="${transaction.id}">详情${icon('arrow-right')}</button></td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
        ${pagination(rows.length, ui.fundPage, 'fund-page')}
      ` : emptyState({ title: '没有符合条件的流水', desc: '切换类型筛选，或记录一笔新的资金流动。', action: '<button class="btn btn-sm" type="button" data-action="reset-fund-filter">查看全部</button>' })}
    </section>
  `;
}

function buildCashChart(months) {
  const maxValue = Math.max(...months.flatMap((month) => [month.in, month.out]), 1);
  const top = niceMax(maxValue * 1.1);
  const axis = [4, 3, 2, 1, 0].map((index) => `<span style="bottom:${(index / 4) * 100}%">${fmtAxis((top / 4) * index)}</span>`).join('');
  const grid = [4, 3, 2, 1, 0].map((index) => `<span style="bottom:${(index / 4) * 100}%"></span>`).join('');
  return `
    <div class="bar-chart">
      <div class="bar-axis" aria-hidden="true">${axis}</div>
      <div class="bar-plot">
        <div class="bar-grid" aria-hidden="true">${grid}</div>
        <div class="bar-groups">
          ${months.map((month, index) => {
            const inHeight = Math.max(2, (month.in / top) * 174);
            const outHeight = Math.max(2, (month.out / top) * 174);
            return `<div class="bar-group" title="${month.label} 存入 ${fmtMoney(month.in)} / 转出 ${fmtMoney(month.out)}"><div class="bar-pair"><div class="cash-bar in" style="--i:${index};height:${inHeight.toFixed(1)}px"></div><div class="cash-bar out" style="--i:${index};height:${outHeight.toFixed(1)}px"></div></div><div class="bar-x">${month.label}</div></div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ---------- Clients ---------- */

function clientsPage() {
  const rows = clientRows();
  const count = pageCount(rows);
  ui.clientPage = clamp(ui.clientPage, 1, count);
  const visible = pageOf(rows, ui.clientPage);
  const active = state.clients.filter((item) => item.status === '活跃').length;
  const totalTrust = sumBy(state.clients, (item) => item.amount);
  const average = state.clients.length ? totalTrust / state.clients.length : 0;
  return `
    ${pageHead({
      title: '客户信息',
      desc: `客户档案与信任交易额 · 共 ${state.clients.length} 位客户 · 数据截至 ${AS_OF}`,
      actions: `<button class="btn primary" type="button" data-action="open-client-form">${icon('plus')}添加客户</button><button class="btn" type="button" data-action="export-clients">${icon('download')}导出客户</button>`,
      revealIndex: 0
    })}
    <section class="kpi-band reveal" style="--i:1" aria-label="客户概况">
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">客户总数</span><span class="tag green">全部在册</span></div><div class="kpi-value">${state.clients.length}<span style="font-size:14px;font-weight:400;color:var(--muted);margin-left:4px;">位</span></div><div class="kpi-foot"><span>含活跃、跟进与归档</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">活跃客户</span><span class="delta">${Math.round((active / Math.max(state.clients.length, 1)) * 100)}%</span></div><div class="kpi-value">${active}<span style="font-size:14px;font-weight:400;color:var(--muted);margin-left:4px;">位</span></div><div class="kpi-foot"><span>近 90 天有交易或服务</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">信任交易额</span><span class="delta">+14.3%</span></div><div class="kpi-value">${fmtMoney(totalTrust)}</div><div class="kpi-foot"><span>累计已确认交易</span><span class="sep">·</span><span>较去年</span></div></div>
      <div class="kpi"><div class="kpi-head"><span class="kpi-label">平均信任额</span><span class="tag">客单价</span></div><div class="kpi-value">${fmtMoney(average)}</div><div class="kpi-foot"><span>按全部客户计算</span></div></div>
    </section>
    <section class="panel table-panel reveal" style="--i:2">
      <div class="panel-head"><div><h2>客户名录</h2><p class="panel-sub">按信任交易额排序 · 共 ${rows.length} 位</p></div></div>
      <div class="panel-body" style="padding-top:0;padding-bottom:13px;">
        <div class="toolbar">
          <button class="chip ${ui.clientFilter === 'all' ? 'active' : ''}" type="button" data-action="client-filter" data-value="all">全部 <span class="chip-count">${state.clients.length}</span></button>
          <button class="chip ${ui.clientFilter === 'active' ? 'active' : ''}" type="button" data-action="client-filter" data-value="active">活跃 <span class="chip-count">${active}</span></button>
          <button class="chip ${ui.clientFilter === 'following' ? 'active' : ''}" type="button" data-action="client-filter" data-value="following">跟进中 <span class="chip-count">${state.clients.filter((item) => item.status === '跟进中').length}</span></button>
          <button class="chip ${ui.clientFilter === 'archived' ? 'active' : ''}" type="button" data-action="client-filter" data-value="archived">已归档 <span class="chip-count">${state.clients.filter((item) => item.status === '已归档').length}</span></button>
          <div class="toolbar-spacer"></div>
          <label class="sr-only" for="clientSort">排序方式</label>
          <select class="select compact" id="clientSort" data-action="client-sort"><option value="amount" ${ui.clientSort === 'amount' ? 'selected' : ''}>按信任交易额</option><option value="recent" ${ui.clientSort === 'recent' ? 'selected' : ''}>按合作起始</option></select>
        </div>
      </div>
      ${visible.length ? `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>客户名称</th><th>联系方式</th><th class="num">信任交易额</th><th>合作起始</th><th>最近交易</th><th>状态</th><th class="actions">操作</th></tr></thead>
          <tbody>${visible.map((client) => `
            <tr data-row-id="${client.id}">
              <td><div class="client-cell"><span class="entity-mark">${initials(client.name)}</span><div class="entity-main"><div class="entity-name" style="max-width:250px;" title="${esc(client.name)}">${esc(client.name)}</div><div class="entity-sub">累计 ${client.deals} 次合作</div></div></div></td>
              <td><div class="contact-main">${esc(client.contact)}</div><div class="contact-sub">${esc(client.phone)}</div></td>
              <td class="num"><span class="trust-amount">${fmtMoney(client.amount)}</span></td>
              <td>${formatMonth(client.since)}</td><td>${client.last}</td><td>${statusHtml(client.status)}</td>
              <td class="actions"><button class="link-btn" type="button" data-action="view-client" data-id="${client.id}">详情${icon('arrow-right')}</button></td>
            </tr>
          `).join('')}</tbody>
        </table></div>
        ${pagination(rows.length, ui.clientPage, 'client-page')}
      ` : emptyState({ title: '该筛选下暂无客户', desc: '调整客户状态，或添加一位新的客户。', action: '<button class="btn btn-sm" type="button" data-action="reset-client-filter">查看全部</button>' })}
    </section>
  `;
}

/* ---------- Services & team ---------- */

function teamPage() {
  const serviceCount = state.services.length;
  const inSale = state.services.filter((item) => item.status === '在售').length;
  const projectCount = sumBy(state.services, (item) => item.projects);
  const employeeCount = state.employees.length;
  return `
    ${pageHead({
      title: '服务与团队',
      desc: `服务项目与员工档案 · ${inSale} 项在售 · ${projectCount} 个进行中项目 · ${employeeCount} 位成员`,
      actions: ui.teamTab === 'services' ? `<button class="btn primary" type="button" data-action="open-service-form">${icon('plus')}新增服务</button>` : `<button class="btn primary" type="button" data-action="open-employee-form">${icon('plus')}添加员工</button>`,
      revealIndex: 0
    })}
    <div class="page-tabs reveal" style="--i:1" role="tablist" aria-label="服务与团队视图">
      <button class="page-tab ${ui.teamTab === 'services' ? 'active' : ''}" type="button" role="tab" aria-selected="${ui.teamTab === 'services'}" data-action="team-tab" data-value="services">服务项目 <span class="tab-count">${serviceCount}</span></button>
      <button class="page-tab ${ui.teamTab === 'employees' ? 'active' : ''}" type="button" role="tab" aria-selected="${ui.teamTab === 'employees'}" data-action="team-tab" data-value="employees">员工管理 <span class="tab-count">${employeeCount}</span></button>
    </div>
    ${ui.teamTab === 'services' ? servicesHtml({ inSale, projectCount, employeeCount }) : employeesHtml()}
  `;
}

function servicesHtml({ inSale, projectCount, employeeCount }) {
  return `
    <section class="panel team-summary reveal" style="--i:2" aria-label="服务概况">
      <div class="team-summary-item"><div class="team-summary-label">服务项目</div><div class="team-summary-value">${state.services.length} 项</div></div>
      <div class="team-summary-item"><div class="team-summary-label">在售项目</div><div class="team-summary-value">${inSale} 项</div></div>
      <div class="team-summary-item"><div class="team-summary-label">进行中项目</div><div class="team-summary-value">${projectCount} 个</div></div>
      <div class="team-summary-item"><div class="team-summary-label">团队成员</div><div class="team-summary-value">${employeeCount} 人</div></div>
    </section>
    <section class="service-grid">
      ${state.services.map((service, index) => `
        <article class="service-card reveal" style="--i:${index + 3}">
          <div class="service-top"><span class="service-index">${String(index + 1).padStart(2, '0')}</span>${statusHtml(service.status)}</div>
          <h3>${esc(service.name)}</h3>
          <p class="service-desc">${esc(service.desc)}</p>
          <div class="service-meta-row"><span>负责人 <strong>${esc(service.owner)}</strong></span><span class="service-meta-dot"></span><span><strong>${service.projects}</strong> 个项目</span></div>
          <div class="service-foot"><span class="service-price">${fmtMoney(service.price)} <span>${service.priceUnit}</span></span><button class="link-btn" type="button" data-action="view-service" data-id="${service.id}">查看详情${icon('arrow-right')}</button></div>
        </article>
      `).join('')}
    </section>
  `;
}

function employeesHtml() {
  const departments = [...new Set(state.employees.map((item) => item.dept))];
  const rows = employeeRows();
  const active = state.employees.filter((item) => item.status === '在职').length;
  const probation = state.employees.filter((item) => item.status === '试用').length;
  const tech = state.employees.filter((item) => ['技术部', '产品部', '设计部'].includes(item.dept)).length;
  return `
    <section class="panel team-summary reveal" style="--i:2" aria-label="员工概况">
      <div class="team-summary-item"><div class="team-summary-label">团队成员</div><div class="team-summary-value">${state.employees.length} 人</div></div>
      <div class="team-summary-item"><div class="team-summary-label">在职</div><div class="team-summary-value">${active} 人</div></div>
      <div class="team-summary-item"><div class="team-summary-label">试用期</div><div class="team-summary-value">${probation} 人</div></div>
      <div class="team-summary-item"><div class="team-summary-label">技术 / 产品 / 设计</div><div class="team-summary-value">${tech} 人</div></div>
    </section>
    <section class="panel table-panel reveal" style="--i:3">
      <div class="panel-head"><div><h2>员工档案</h2><p class="panel-sub">共 ${rows.length} 位成员 · 按部门筛选</p></div></div>
      <div class="panel-body" style="padding-top:0;padding-bottom:13px;">
        <div class="toolbar">
          <button class="chip ${ui.employeeFilter === 'all' ? 'active' : ''}" type="button" data-action="employee-filter" data-value="all">全部 <span class="chip-count">${state.employees.length}</span></button>
          ${departments.map((dept) => `<button class="chip ${ui.employeeFilter === dept ? 'active' : ''}" type="button" data-action="employee-filter" data-value="${esc(dept)}">${esc(dept)} <span class="chip-count">${state.employees.filter((item) => item.dept === dept).length}</span></button>`).join('')}
        </div>
      </div>
      ${rows.length ? `
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>姓名</th><th>职位</th><th>部门</th><th>联系方式</th><th>入职日期</th><th>状态</th><th class="actions">操作</th></tr></thead>
          <tbody>${rows.map((employee) => `
            <tr data-row-id="${employee.id}">
              <td><div class="entity"><span class="entity-mark">${initials(employee.name)}</span><div class="entity-main"><div class="entity-name">${esc(employee.name)}</div><div class="entity-sub">${esc(employee.email || '未填写邮箱')}</div></div></div></td>
              <td>${esc(employee.role)}</td><td>${esc(employee.dept)}</td><td><div class="contact-main">${esc(employee.phone)}</div></td><td>${employee.since}</td><td>${statusHtml(employee.status)}</td>
              <td class="actions"><button class="link-btn" type="button" data-action="view-employee" data-id="${employee.id}">详情${icon('arrow-right')}</button></td>
            </tr>
          `).join('')}</tbody>
        </table></div>
      ` : emptyState({ title: '该部门暂无成员', desc: '调整部门筛选，或添加一位新员工。', action: '<button class="btn btn-sm" type="button" data-action="reset-employee-filter">查看全部</button>' })}
    </section>
  `;
}

/* ---------- Stocks ---------- */

function stocksPage() {
  const stock = STOCKS.find((item) => item.code === ui.stockCode) || STOCKS[0];
  const series = getStockSeries(stock, ui.stockRange);
  const data = buildStockChart(stock, series);
  const analysis = buildStockAnalysis(stock, series);
  const last = series.points[series.points.length - 1];
  const previous = series.points[series.points.length - 2];
  const change = last.close - previous.close;
  const changePct = (change / previous.close) * 100;
  return `
    ${pageHead({
      title: '股市数据',
      desc: `收盘行情与内部研究摘要 · ${AS_OF} 15:00 · 数据为收盘快照`,
      actions: `<div class="segmented" role="group" aria-label="行情区间">${[['1M', '近1月'], ['3M', '近3月'], ['6M', '近6月'], ['1Y', '近1年']].map(([value, label]) => `<button type="button" data-action="stock-range" data-value="${value}" class="${ui.stockRange === value ? 'active' : ''}" aria-pressed="${ui.stockRange === value}">${label}</button>`).join('')}</div><button class="btn" type="button" data-action="export-stocks">${icon('download')}导出行情</button>`,
      revealIndex: 0
    })}
    <section class="panel index-band reveal" style="--i:1" aria-label="市场指数">
      ${MARKET_INDICES.map((index) => `
        <div class="index-item">
          <div class="index-head"><span class="index-name">${index.name}</span><span class="index-change ${index.change >= 0 ? 'up' : 'down'}">${fmtPct(index.change)}</span></div>
          <div class="index-value">${index.value}</div>
          <svg class="index-spark" viewBox="0 0 70 26" aria-hidden="true"><path d="${sparkPath(index.points, 70, 26)}" ${index.change < 0 ? 'style="stroke:#a65b45"' : ''}></path></svg>
        </div>
      `).join('')}
    </section>
    <div class="stock-layout">
      <section class="panel watchlist reveal" style="--i:2">
        <div class="panel-head"><div><h2>行情列表</h2><p class="panel-sub">5 只关注股票 · 收盘价</p></div><span class="tag">沪 / 深</span></div>
        <div class="watchlist-list">
          ${STOCKS.map((item) => `
            <button class="watch-row ${item.code === stock.code ? 'active' : ''}" type="button" data-action="select-stock" data-code="${item.code}" aria-pressed="${item.code === stock.code}">
              <span class="watch-main"><span class="watch-name">${item.name}</span><span class="watch-code">${item.code} · ${item.market}</span></span>
              <span class="watch-quote"><span class="watch-price">${fmtPrice(item.price)}</span><span class="watch-change ${item.changePct >= 0 ? 'up' : 'down'}">${fmtPct(item.changePct)}</span></span>
            </button>
          `).join('')}
        </div>
        <div class="market-breadth">
          <div class="breadth-head"><span>市场宽度</span><span>全市场 5,342 只</span></div>
          <div class="breadth-bar" aria-hidden="true"><span style="width:58.8%"></span><span style="width:37.2%"></span><span style="width:4%"></span></div>
          <div class="breadth-legend"><span>上涨 3,142</span><span>下跌 1,986</span><span>平盘 214</span></div>
        </div>
        <div class="market-breadth">
          <div class="breadth-head"><span>板块表现</span><span>今日涨跌</span></div>
          <div class="sector-block" style="margin-top:0;">${SECTORS.map((sector) => `<div class="sector-row"><span class="sector-name">${sector.name}</span><span class="sector-track"><span class="sector-fill ${sector.pct < 0 ? 'down' : ''}" style="width:${Math.min(100, Math.abs(sector.pct) * 28)}%"></span></span><span class="sector-value">${fmtPct(sector.pct)}</span></div>`).join('')}</div>
        </div>
      </section>
      <section class="panel stock-panel reveal" style="--i:3">
        <div class="stock-head">
          <div>
            <div class="stock-title-row"><h2 class="stock-title">${stock.name}</h2><span class="stock-code">${stock.code} · ${stock.market}</span></div>
            <div class="stock-price-row"><span class="stock-price">${fmtPrice(last.close)}</span><span class="stock-change ${changePct >= 0 ? 'up' : 'down'}">${changePct >= 0 ? '+' : ''}${fmtPrice(change)} (${fmtPct(changePct)})</span></div>
            <div class="stock-meta"><span>${AS_OF} 收盘</span><span>·</span><span>人民币计价</span></div>
          </div>
          <div class="stock-range"><span class="tag">${ui.stockRange === '1M' ? '近 1 月' : ui.stockRange === '3M' ? '近 3 月' : ui.stockRange === '6M' ? '近 6 月' : '近 1 年'}</span><span class="tag plain">${series.points.length} 个交易日</span></div>
        </div>
        <div class="stock-chart-wrap" data-chart-wrap="stock">${data.svg}<div class="chart-tooltip" data-chart-tooltip="stock"></div></div>
        <div class="stock-stats">
          <div class="stock-stat"><div class="stock-stat-label">今开</div><div class="stock-stat-value">${fmtPrice(stock.open)}</div></div>
          <div class="stock-stat"><div class="stock-stat-label">最高</div><div class="stock-stat-value">${fmtPrice(stock.high)}</div></div>
          <div class="stock-stat"><div class="stock-stat-label">最低</div><div class="stock-stat-value">${fmtPrice(stock.low)}</div></div>
          <div class="stock-stat"><div class="stock-stat-label">成交额</div><div class="stock-stat-value">${fmtMoney(stock.turnover, { currency: 'CNY' })}</div></div>
          <div class="stock-stat"><div class="stock-stat-label">市盈率 TTM</div><div class="stock-stat-value">${stock.pe.toFixed(1)}×</div></div>
          <div class="stock-stat"><div class="stock-stat-label">换手率</div><div class="stock-stat-value">${stock.turnoverRate.toFixed(2)}%</div></div>
        </div>
      </section>
    </div>
    <section class="analysis-grid reveal" style="--i:4">
      ${analysis.map((item, index) => `<article class="analysis-card"><span class="analysis-num">0${index + 1}</span><h3>${item.title}</h3><p>${esc(item.text)}</p>${index === 2 ? '<div class="analysis-foot">基于所选区间的收盘数据计算，不构成投资建议。</div>' : ''}</article>`).join('')}
    </section>
  `;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getTradingDays(count) {
  const days = [];
  const cursor = new Date(`${AS_OF}T00:00:00`);
  while (days.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      days.unshift(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}

const stockSeriesCache = {};

function getStockSeries(stock, range) {
  const dayMap = { '1M': 22, '3M': 66, '6M': 120, '1Y': 250 };
  const count = dayMap[range] || 66;
  const cacheKey = `${stock.code}-full`;
  if (!stockSeriesCache[cacheKey]) {
    const total = 250;
    const random = mulberry32(hashString(cacheKey));
    const volatility = stock.volatility || 0.015;
    const drift = (stock.trend || 0.08) / (total - 2);
    const historyLength = total - 1;
    const raw = [1];
    for (let i = 1; i < historyLength; i += 1) raw.push(raw[i - 1] * (1 + drift + (random() - 0.5) * volatility * 2));
    const previousClose = stock.price / (1 + stock.changePct / 100);
    const scale = previousClose / raw[raw.length - 1];
    const prices = raw.map((price) => price * scale);
    prices.push(stock.price);
    const dates = getTradingDays(total);
    const baseVolume = stock.volume || 500000;
    const points = prices.map((close, index) => ({ date: dates[index], close, volume: Math.round(baseVolume * (0.55 + random() * 0.9)) }));
    stockSeriesCache[cacheKey] = {
      points,
      ma20: points.map((_, index) => {
        if (index < 19) return null;
        const slice = points.slice(index - 19, index + 1);
        return slice.reduce((sum, point) => sum + point.close, 0) / slice.length;
      })
    };
  }
  const full = stockSeriesCache[cacheKey];
  return {
    points: full.points.slice(-count),
    ma20: full.ma20.slice(-count)
  };
}

function buildStockChart(stock, series) {
  const width = 840, height = 328;
  const margin = { top: 14, right: 14, bottom: 34, left: 54 };
  const innerW = width - margin.left - margin.right;
  const priceBottom = 250;
  const priceH = priceBottom - margin.top;
  const volumeTop = 270;
  const volumeH = 34;
  const points = series.points;
  const closes = points.map((point) => point.close);
  const maxClose = Math.max(...closes);
  const minClose = Math.min(...closes);
  const padding = (maxClose - minClose) * 0.12 || maxClose * 0.02;
  const high = maxClose + padding;
  const low = Math.max(0, minClose - padding);
  const stepX = innerW / Math.max(points.length - 1, 1);
  const xOf = (index) => margin.left + index * stepX;
  const yOf = (value) => margin.top + priceH - ((value - low) / (high - low)) * priceH;
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(1)},${yOf(point.close).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${xOf(points.length - 1).toFixed(1)},${priceBottom} L${xOf(0).toFixed(1)},${priceBottom} Z`;
  const maParts = [];
  series.ma20.forEach((value, index) => {
    if (value == null) return;
    maParts.push(`${maParts.length === 0 ? 'M' : 'L'}${xOf(index).toFixed(1)},${yOf(value).toFixed(1)}`);
  });
  const maPath = maParts.join(' ');
  const volumeMax = Math.max(...points.map((point) => point.volume), 1);
  const barWidth = Math.max(1.2, (innerW / points.length) * 0.55);
  const grid = [0, 1, 2, 3, 4].map((index) => {
    const value = low + ((high - low) / 4) * index;
    const y = yOf(value);
    return `<line class="grid-line" x1="${margin.left}" y1="${y.toFixed(1)}" x2="${width - margin.right}" y2="${y.toFixed(1)}"></line><text class="axis-label" x="${margin.left - 9}" y="${(y + 3).toFixed(1)}" text-anchor="end">${fmtPrice(value)}</text>`;
  }).join('');
  const labelIndexes = [0, Math.floor((points.length - 1) / 3), Math.floor(((points.length - 1) * 2) / 3), points.length - 1];
  const xLabels = labelIndexes.map((index) => `<text class="axis-label x" x="${xOf(index).toFixed(1)}" y="${height - 10}" text-anchor="${index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}">${points[index].date.slice(5).replace('-', '/')}</text>`).join('');
  const bars = points.map((point, index) => {
    const previousClose = index === 0 ? point.close : points[index - 1].close;
    const barH = Math.max(1, (point.volume / volumeMax) * volumeH);
    return `<rect x="${(xOf(index) - barWidth / 2).toFixed(1)}" y="${(volumeTop + volumeH - barH).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" fill="${point.close >= previousClose ? '#9bb8aa' : '#d2b0a5'}" rx="0.6"></rect>`;
  }).join('');
  charts.stock = { width, height, points: points.map((point, index) => ({ x: xOf(index), y: yOf(point.close), close: point.close, date: point.date, volume: point.volume })) };
  return {
    svg: `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${stock.name}价格走势图">
        <defs><linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f5a48" stop-opacity="0.14"></stop><stop offset="100%" stop-color="#1f5a48" stop-opacity="0"></stop></linearGradient></defs>
        ${grid}${xLabels}
        <path class="chart-area" d="${areaPath}"></path>
        <path class="chart-line" d="${linePath}" data-chart-line="stock"></path>
        <path class="chart-line muted" d="${maPath}"></path>
        <g>${bars}</g>
        <text class="axis-label" x="${margin.left}" y="${volumeTop - 5}" text-anchor="start">成交量</text>
        <line class="grid-line" x1="${margin.left}" y1="${volumeTop}" x2="${width - margin.right}" y2="${volumeTop}"></line>
        <line class="hover-line" data-hover-line x1="0" y1="${margin.top}" x2="0" y2="${priceBottom}"></line>
        <circle class="hover-dot stock" data-hover-dot="stock" cx="0" cy="0" r="3.6"></circle>
      </svg>
    `
  };
}

function buildStockAnalysis(stock, series) {
  const points = series.points;
  const first = points[0].close;
  const last = points[points.length - 1].close;
  const ma = series.ma20[series.ma20.length - 1];
  const high = Math.max(...points.map((point) => point.close));
  const low = Math.min(...points.map((point) => point.close));
  const rangePct = (last / first - 1) * 100;
  const maDiff = (last / ma - 1) * 100;
  const position = ((last - low) / Math.max(high - low, 0.0001)) * 100;
  const turnover = points.reduce((sum, point) => sum + point.volume * 100 * point.close, 0);
  const averageTurnover = turnover / points.length;
  const recentSlope = (last / points[Math.max(0, points.length - 6)].close - 1) * 100;
  const trendWord = rangePct >= 0 ? '上涨' : '下跌';
  const maWord = maDiff >= 0 ? '上方' : '下方';
  const positionWord = position >= 80 ? '区间上沿' : position <= 20 ? '区间下沿' : '区间中部';
  return [
    { title: '趋势结构', text: `近 ${points.length} 个交易日累计${trendWord} ${Math.abs(rangePct).toFixed(1)}%，收盘价位于 20 日均线${maWord} ${Math.abs(maDiff).toFixed(1)}%。最近 5 个交易日${recentSlope >= 0 ? '延续抬升' : '出现回撤'}，${rangePct >= 0 && maDiff >= 0 ? '短中期结构保持偏强' : '短线需要观察均线支撑'}。` },
    { title: '量能与位置', text: `区间日均成交额约 ${fmtMoney(averageTurnover, { currency: 'CNY' })}，当前价格处于 ${low.toFixed(2)}–${high.toFixed(2)} 的 ${positionWord}（${position.toFixed(0)}% 分位）。${position >= 80 ? '接近区间高点，突破需要量能配合。' : position <= 20 ? '处于相对低位，关注止跌信号。' : '价格仍在区间内震荡，方向尚未完全选择。'}` },
    { title: '关注要点', text: `短期参考支撑位 ${ma.toFixed(2)} 附近，区间高点 ${high.toFixed(2)} 为上方压力。若收盘有效跌破 20 日均线，需留意回撤扩大；若放量站稳区间高点，趋势可能延续。当前市盈率 ${stock.pe.toFixed(1)}×，换手率 ${stock.turnoverRate.toFixed(2)}%。` }
  ];
}

const PAGE_RENDERERS = {
  dashboard: dashboardPage,
  partners: partnersPage,
  funds: fundsPage,
  clients: clientsPage,
  team: teamPage,
  stocks: stocksPage
};
