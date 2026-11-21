import { api, loadMeta, exportQuestions } from './data.js';
import { adminUser, signInAdmin, signOutAll } from '../firebase.js';
// 타임어택 백오피스 SPA
const $main = document.getElementById('main');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('ko-KR'));
const secs = (ms) => (ms == null ? '-' : (ms / 1000).toFixed(1) + '초');
const pct = (v) => (v == null ? '-' : v + '%');
const dt = (ms) => (ms ? new Date(ms).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');

let META = null;
function toast(msg, error = false) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'show' + (error ? ' error' : '');
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.className = ''), 2400);
}
const parseHash = () => {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: path.split('/'), query: Object.fromEntries(new URLSearchParams(qs || '')) };
};
const setQuery = (base, q) => {
  const s = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== '' && v != null)).toString();
  history.replaceState(null, '', '#/' + base + (s ? '?' + s : ''));
};
// 사용자 앱과 같은 규칙: 줄바꿈 → 첫 줄이 안내 문구, 없으면 첫 "? " 앞이 안내 문구
function splitQuestion(text = '') {
  const nl = text.indexOf('\n');
  if (nl > 0) return { lead: text.slice(0, nl).trim(), clue: text.slice(nl + 1).trim() };
  const i = text.indexOf('? ');
  if (i > 0 && i <= 40 && text.slice(i + 2).trim()) return { lead: text.slice(0, i + 1), clue: text.slice(i + 2).trim() };
  return { lead: '', clue: text };
}
const accColor = (a) => (a == null ? '#C8D0CB' : a >= 80 ? '#47A276' : a >= 50 ? '#FF9E3D' : '#E5484D');
const accBar = (a) => `<div class="acc-bar"><div class="bar"><i style="width:${a ?? 0}%;background:${accColor(a)}"></i></div><b>${pct(a)}</b></div>`;
const REVIEW = { NEEDS_REVIEW: ['검수 필요', 'orange'], APPROVED: ['검수 완료', 'green'], REJECTED: ['반려', 'red'] };
const reviewPill = (s) => `<span class="pill ${REVIEW[s]?.[1] || 'gray'}">${REVIEW[s]?.[0] || esc(s)}</span>`;
const statusPill = (s) => (s === 'ACTIVE' ? '<span class="pill blue">출제중</span>' : s === 'DELETED' ? '<span class="pill red">삭제됨</span>' : '<span class="pill gray">비활성</span>');
const STATUS_LABEL = { ACTIVE: '출제중', INACTIVE: '비활성', DELETED: '삭제됨' };
const NUMS = ['①', '②', '③', '④'];
const FLAG_LABEL = {
  distractor: '오답 선택지 쏠림 (정답 오류 의심)',
  low_accuracy: '정답률 30% 미만',
  too_easy: '정답률 97% 초과',
  difficulty_mismatch: '난이도 재조정 필요',
  no_data: '출제 기록 없음',
};

// ---------- 로그인 (구글 · admins/{이메일} 등록된 계정만) ----------
function showLogin(msg = '') {
  document.getElementById('shell').hidden = true;
  document.getElementById('login').hidden = false;
  document.getElementById('login-err').textContent = msg;
}
document.getElementById('google-login').onclick = async () => {
  try { if (await signInAdmin()) boot(); } catch (err) { showLogin(err.message); }
};
document.getElementById('logout').onclick = async () => { await signOutAll(); showLogin(); };

async function boot() {
  const u = await adminUser();
  if (!u || u.isAnonymous) return showLogin();
  try {
    await loadMeta();
    META = await api('/meta');
  } catch (e) {
    await signOutAll();
    return showLogin(e.message);
  }
  document.getElementById('login').hidden = true;
  document.getElementById('shell').hidden = false;
  document.getElementById('series-title').textContent = META.series.title;
  document.getElementById('who').textContent = u.email || '';
  document.title = META.series.title + ' 백오피스';
  route();
}

const ROUTES = { dashboard: viewDashboard, questions: viewQuestions, q: viewQuestion, import: viewImport, stats: viewStats, runs: viewRuns, ranking: viewRanking, settings: viewSettings };
async function route() {
  if (!META) return;
  const { parts, query } = parseHash();
  const name = ROUTES[parts[0]] ? parts[0] : 'dashboard';
  document.querySelectorAll('#side nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === (name === 'q' ? 'questions' : name)));
  document.getElementById('drawer-root').innerHTML = '';
  try { await ROUTES[name](parts.slice(1), query); } catch (e) { $main.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}
window.addEventListener('hashchange', route);

// ---------- 대시보드 ----------
async function viewDashboard() {
  const d = await api('/dashboard');
  const q = d.questions;
  const maxRuns = Math.max(1, ...d.daily.map((x) => x.runs));
  $main.innerHTML = `
    ${q.needs_review === q.total && q.total ? '<div class="warn-banner">📝 모든 문항이 아직 "검수 필요" 상태입니다. 원본 DB 안내대로 전문가 감수 후 상용 배포하세요. (설정 → "검수 완료 문항만 출제")</div>' : ''}
    <h1 class="page">대시보드</h1><p class="page-sub">${esc(META.series.title)} 운영 현황</p>
    <div class="grid g4">
      <a class="card kpi link" href="#/questions"><div class="k">전체 문항</div><div class="v">${fmt(q.total)}</div><div class="s">출제중 ${fmt(q.active)} · 지식 그룹 ${fmt(q.facts)}개</div></a>
      <a class="card kpi link" href="#/questions?review_status=NEEDS_REVIEW"><div class="k">검수 현황</div><div class="v">${fmt(q.approved)}<small>/ ${fmt(q.total)} 완료</small></div><div class="s">검수 필요 ${fmt(q.needs_review)} · 반려 ${fmt(q.rejected)}</div></a>
      <div class="card kpi"><div class="k">플레이</div><div class="v">${fmt(d.plays.today)}<small>오늘 시작</small></div><div class="s">이번 주 완료 ${fmt(d.plays.week_finished)} · 누적 완료 ${fmt(d.plays.finished)} · 사용자 ${fmt(d.users)}</div></div>
      <div class="card kpi"><div class="k">전체 정답률</div><div class="v">${pct(d.accuracy)}</div><div class="s">응시 ${fmt(d.attempts)}회 · 시간초과 ${pct(d.timeoutRate)}</div></div>
    </div>
    <div class="grid g2" style="margin-top:14px">
      <div class="card"><h2>최근 14일 플레이 수</h2>
        ${d.daily.length ? `<div class="bars-v">${d.daily.map((x) => `<div class="b" title="${x.d}: 시작 ${x.runs} / 완료 ${x.finished} / 평균 ${fmt(x.avg_score)}점"><em>${x.runs}</em><i style="height:${(x.runs / maxRuns) * 140}px"></i><span>${x.d.slice(5)}</span></div>`).join('')}</div>` : '<div class="empty">아직 플레이 기록이 없습니다.</div>'}
      </div>
      <div class="card"><h2>확인이 필요한 문항 <span class="muted" style="font-weight:400">(응시 ${META.minAttempts}회 이상 기준)</span></h2>
        <table class="t"><tbody>
          ${Object.entries(d.flagCounts).map(([k, v]) => `<tr class="click" onclick="location.hash='#/questions?flag=${k}'"><td>${FLAG_LABEL[k]}</td><td class="num"><b style="color:${v ? 'var(--red)' : 'var(--ink-3)'}">${fmt(v)}</b></td></tr>`).join('')}
          <tr class="click" onclick="location.hash='#/runs?flagged=1'"><td>부정행위 의심 판 (미처리)</td><td class="num"><b style="color:${d.plays.flagged ? 'var(--red)' : 'var(--ink-3)'}">${fmt(d.plays.flagged)}</b></td></tr>
        </tbody></table>
      </div>
    </div>`;
}

// ---------- 문항 목록 ----------
async function viewQuestions(_p, query) {
  const st = { q: '', era: '', period: '', difficulty: '', review_status: '', status: '', source_type: '', flag: '', fact_group_id: '', sort: 'id', order: 'asc', page: 1, size: 50, ...query };
  const selected = new Set();
  const dash = await api('/dashboard');
  const opt = (list, v, label = (x) => x) => list.map((x) => `<option value="${esc(x)}" ${x === v ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  const eras = [...META.series.eraOrder, ...META.eras.map((e) => e.era).filter((e) => !META.series.eraOrder.includes(e))];

  $main.innerHTML = `
    <div class="page-head"><div class="grow"><h1 class="page">문항 관리</h1></div>
      <a class="btn" id="export">CSV 내보내기 (현재 필터)</a>
      <a class="btn primary" href="#/q/new">+ 새 문항</a></div>
    <div class="flag-chips" id="flags">
      <button data-f="" class="${!st.flag ? 'on' : ''}">전체</button>
      ${Object.entries(FLAG_LABEL).map(([k, l]) => `<button data-f="${k}" class="${st.flag === k ? 'on' : ''}">${l}${dash.flagCounts[k] ? `<b>${dash.flagCounts[k]}</b>` : ''}</button>`).join('')}
    </div>
    <div class="filters">
      <input class="in search" id="f-q" placeholder="ID · 지문 · 키워드 · 보기 · 해설 검색" value="${esc(st.q)}">
      <select class="in" id="f-era"><option value="">시대 전체</option>${opt(eras, st.era)}</select>
      <select class="in" id="f-period"><option value="">세부 시기 전체</option></select>
      <select class="in" id="f-difficulty"><option value="">난이도</option>${opt(META.enums.difficulties, st.difficulty)}</select>
      <select class="in" id="f-review_status"><option value="">검수 상태</option>${opt(META.enums.reviewStatuses, st.review_status, (x) => REVIEW[x][0])}</select>
      <select class="in" id="f-status"><option value="">출제 상태</option>${opt(META.enums.statuses, st.status, (x) => STATUS_LABEL[x] || x)}</select>
      <select class="in" id="f-source_type"><option value="">출처</option>${opt(META.enums.sourceTypes, st.source_type)}</select>
      <input class="in" id="f-fact_group_id" placeholder="지식 그룹 (F-001)" value="${esc(st.fact_group_id)}" style="width:140px">
      <button class="btn sm" id="reset">초기화</button>
    </div>
    <div id="bulk"></div>
    <div class="table-wrap" id="tbl"></div>
    <div class="pager" id="pager"></div>`;

  const fillPeriods = () => {
    const ps = META.periods.filter((p) => !st.era || p.era === st.era);
    const uniq = [...new Set(ps.map((p) => p.period))];
    $main.querySelector('#f-period').innerHTML = `<option value="">세부 시기 전체</option>${opt(uniq, st.period)}`;
  };
  fillPeriods();

  const SORTABLE = { id: 'ID', era: '시대', topic: '키워드', difficulty: '난이도', served: '출제 횟수', attempts: '응답', accuracy: '정답률', avg_correct_ms: '평균 정답시간', updated_at: '수정일' };
  const th = (k, label = SORTABLE[k]) => `<th class="sort" data-s="${k}">${label} ${st.sort === k ? `<span class="arr">${st.order === 'asc' ? '▲' : '▼'}</span>` : ''}</th>`;

  async function load() {
    setQuery('questions', { ...st, page: st.page > 1 ? st.page : '', size: st.size !== 50 ? st.size : '', sort: st.sort !== 'id' ? st.sort : '', order: st.order !== 'asc' ? st.order : '' });
    const params = new URLSearchParams(Object.entries(st).filter(([, v]) => v !== ''));
    const r = await api('/questions?' + params);
    $main.querySelector('#tbl').innerHTML = r.rows.length ? `<table class="t qtable">
      <thead><tr><th><input type="checkbox" id="all"></th>${th('id')}${th('era')}<th>문제</th><th>정답</th>${th('difficulty')}<th>상태</th>${th('served')}${th('accuracy')}<th>관리</th></tr></thead>
      <tbody>${r.rows.map((x) => `<tr class="click" data-id="${esc(x.id)}">
        <td onclick="event.stopPropagation()"><input type="checkbox" class="sel" value="${esc(x.id)}" ${selected.has(x.id) ? 'checked' : ''}></td>
        <td><b>${esc(x.id)}</b>${x.importedFrom && x.importedFrom !== x.id ? `<div class="muted" style="font-size:11px" title="가져온 파일의 원래 번호">원본 ${esc(x.importedFrom)}</div>` : ''}</td>
        <td>${esc(x.era)}<div class="muted" style="font-size:12px">${esc(x.period || '')}</div></td>
        <td class="qcell"><div class="qtext" title="${esc(x.question)}">${esc(x.question)}</div><div class="opts">${[1, 2, 3, 4].map((n) => `<span class="${n === x.correct_option ? 'ok' : ''}">${NUMS[n - 1]} ${esc(x['option_' + n])}</span>`).join('')}</div></td>
        <td class="ans"><b>${NUMS[x.correct_option - 1] || ''} ${esc(x.answer)}</b></td>
        <td>${esc(x.difficulty)}${x.suggested_difficulty && x.suggested_difficulty !== x.difficulty ? ` <span class="pill orange" title="실제 정답률 기준 추천">→${x.suggested_difficulty}</span>` : ''}</td>
        <td>${statusPill(x.status)}<div style="margin-top:4px">${reviewPill(x.review_status)}</div></td>
        <td class="num"><b>${fmt(x.served)}</b>회<div class="muted" style="font-size:11px">응답 ${fmt(x.attempts)}</div></td><td>${x.attempts ? accBar(x.accuracy) : '<span class="muted">-</span>'}</td>
        <td class="acts" onclick="event.stopPropagation()"><button class="btn sm" data-edit="${esc(x.id)}">수정</button>${x.status === 'DELETED' ? `<button class="btn sm" data-restore="${esc(x.id)}">되살리기</button>` : `<button class="btn sm danger" data-del="${esc(x.id)}">삭제</button>`}</td>
      </tr>`).join('')}</tbody></table>` : '<div class="empty">조건에 맞는 문항이 없습니다.</div>';
    $main.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => quickEdit(b.dataset.edit, load)));
    $main.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => removeQuestion(r.rows.find((x) => x.id === b.dataset.del), load)));
    $main.querySelectorAll('[data-restore]').forEach((b) => (b.onclick = async () => {
      try { await api('/questions/' + encodeURIComponent(b.dataset.restore), { method: 'PUT', body: { status: 'INACTIVE' } }); toast('되살렸습니다 (비활성 상태 — 확인 후 출제중으로 바꾸세요)'); load(); } catch (e) { toast(e.message, true); }
    }));
    const pages = Math.max(1, Math.ceil(r.total / st.size));
    $main.querySelector('#pager').innerHTML = `총 <b>${fmt(r.total)}</b>개 ·
      <select class="in" id="size">${[20, 50, 100, 200].map((n) => `<option ${n == st.size ? 'selected' : ''}>${n}</option>`).join('')}</select>개씩
      <button class="btn sm" id="prev" ${st.page <= 1 ? 'disabled' : ''}>이전</button> ${st.page} / ${pages} <button class="btn sm" id="next" ${st.page >= pages ? 'disabled' : ''}>다음</button>`;
    $main.querySelector('#prev').onclick = () => { st.page--; load(); };
    $main.querySelector('#next').onclick = () => { st.page++; load(); };
    $main.querySelector('#size').onchange = (e) => { st.size = Number(e.target.value); st.page = 1; load(); };
    $main.querySelectorAll('th.sort').forEach((h) => (h.onclick = () => {
      const s = h.dataset.s;
      st.order = st.sort === s && st.order === 'asc' ? 'desc' : st.sort === s ? 'asc' : ['accuracy', 'attempts', 'updated_at'].includes(s) ? 'desc' : 'asc';
      st.sort = s; st.page = 1; load();
    }));
    $main.querySelectorAll('tr.click').forEach((tr) => (tr.onclick = () => (location.hash = '#/q/' + tr.dataset.id)));
    $main.querySelectorAll('.sel').forEach((c) => (c.onchange = () => { c.checked ? selected.add(c.value) : selected.delete(c.value); renderBulk(); }));
    const all = $main.querySelector('#all');
    if (all) all.onchange = () => { $main.querySelectorAll('.sel').forEach((c) => { c.checked = all.checked; all.checked ? selected.add(c.value) : selected.delete(c.value); }); renderBulk(); };
    renderBulk();
  }
  function renderBulk() {
    const b = $main.querySelector('#bulk');
    if (!selected.size) { b.innerHTML = ''; return; }
    b.innerHTML = `<div class="bulkbar"><b>${selected.size}개 선택</b>
      <button class="btn sm" data-set='{"status":"ACTIVE"}'>출제중으로</button>
      <button class="btn sm" data-set='{"status":"INACTIVE"}'>비활성으로</button>
      <button class="btn sm" data-set='{"review_status":"APPROVED"}'>검수 완료</button>
      <button class="btn sm" data-set='{"review_status":"NEEDS_REVIEW"}'>검수 필요</button>
      <button class="btn sm" data-set='{"review_status":"REJECTED"}'>반려</button>
      <span style="opacity:.6">난이도</span>
      ${META.enums.difficulties.map((d) => `<button class="btn sm" data-set='{"difficulty":"${d}"}'>${d}</button>`).join('')}
      <button class="btn sm" id="clear" style="margin-left:auto">선택 해제</button></div>`;
    b.querySelectorAll('[data-set]').forEach((x) => (x.onclick = async () => {
      try {
        const r = await api('/questions/bulk', { method: 'POST', body: { ids: [...selected], set: JSON.parse(x.dataset.set) } });
        toast(`${r.updated}개 문항을 변경했습니다`); selected.clear(); load();
      } catch (e) { toast(e.message, true); }
    }));
    b.querySelector('#clear').onclick = () => { selected.clear(); load(); };
  }

  let deb;
  $main.querySelector('#f-q').oninput = (e) => { clearTimeout(deb); deb = setTimeout(() => { st.q = e.target.value.trim(); st.page = 1; load(); }, 250); };
  for (const f of ['era', 'period', 'difficulty', 'review_status', 'status', 'source_type']) {
    $main.querySelector('#f-' + f).onchange = (e) => { st[f] = e.target.value; if (f === 'era') { st.period = ''; fillPeriods(); } st.page = 1; load(); };
  }
  $main.querySelector('#f-fact_group_id').onchange = (e) => { st.fact_group_id = e.target.value.trim(); st.page = 1; load(); };
  $main.querySelector('#flags').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    st.flag = b.dataset.f; st.page = 1;
    if (st.flag && st.flag !== 'no_data') { st.sort = 'accuracy'; st.order = st.flag === 'too_easy' ? 'desc' : 'asc'; }
    $main.querySelectorAll('#flags button').forEach((x) => x.classList.toggle('on', x === b));
    load();
  };
  $main.querySelector('#reset').onclick = () => { location.hash = '#/questions'; route(); };
  $main.querySelector('#export').onclick = () => exportQuestions(st, { stats: true }).catch((e) => toast(e.message, true));
  await load();
}

// ---------- 문항 상세/편집 ----------
async function viewQuestion([id], query) {
  const isNew = id === 'new';
  let data = null;
  let q;
  if (isNew) {
    q = { id: '', era: query.era || META.series.eraOrder[0], period: '', topic: '', fact_group_id: query.fact_group_id || '', source_type: 'ORIGINAL', difficulty: '중', review_status: 'NEEDS_REVIEW', status: 'INACTIVE', question: '', option_1: '', option_2: '', option_3: '', option_4: '', correct_option: 1, explanation: '', memo: '' };
    if (query.copy) {
      const src = (await api('/questions/' + encodeURIComponent(query.copy))).question;
      Object.keys(q).forEach((k) => { if (k !== 'id' && src[k] != null) q[k] = src[k]; });
      q.review_status = 'NEEDS_REVIEW'; q.status = 'INACTIVE';
    }
  } else {
    data = await api('/questions/' + encodeURIComponent(id));
    q = data.question;
  }
  const opt = (list, v, label = (x) => x) => list.map((x) => `<option value="${esc(x)}" ${x === v ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  const eras = [...new Set([...META.series.eraOrder, ...META.eras.map((e) => e.era)])];
  const periods = [...new Set(META.periods.map((p) => p.period))];
  const picks = [q.pick_1, q.pick_2, q.pick_3, q.pick_4];
  const answered = picks.reduce((a, b) => a + (b || 0), 0);

  $main.innerHTML = `
    <div class="page-head">
      <a class="btn sm" href="#/questions">← 목록</a>
      <div class="grow"><h1 class="page">${isNew ? '새 문항' : esc(q.id)}</h1></div>
      ${isNew ? '' : `<a class="btn" href="#/q/new?copy=${encodeURIComponent(q.id)}">변형 문항 만들기 (복제)</a><button class="btn danger" id="del">삭제</button>`}
    </div>
    <div class="editor">
      <form class="card" id="form">
        <div class="form">
          <label class="c2">ID <input class="in" name="id" value="${esc(q.id)}" ${isNew ? `placeholder="비우면 자동 (${esc(META.nextId)})"` : 'disabled'}></label>
          <label class="c2">시대 * <input class="in" name="era" list="eras" value="${esc(q.era)}" required><datalist id="eras">${eras.map((e) => `<option value="${esc(e)}">`).join('')}</datalist></label>
          <label class="c2">세부 시기 <input class="in" name="period" list="periods" value="${esc(q.period || '')}"><datalist id="periods">${periods.map((e) => `<option value="${esc(e)}">`).join('')}</datalist></label>
          <label class="c2">핵심 키워드 (정답 개념) <input class="in" name="topic" value="${esc(q.topic || '')}"></label>
          <label class="c2">지식 그룹 ID <input class="in" name="fact_group_id" value="${esc(q.fact_group_id || '')}" placeholder="같은 지식 변형끼리 같은 값"></label>
          <label class="c1">난이도 <select class="in" name="difficulty">${opt(META.enums.difficulties, q.difficulty)}</select></label>
          <label class="c1">출처 <select class="in" name="source_type">${opt(META.enums.sourceTypes, q.source_type)}</select></label>
          <label class="c3">검수 상태 <select class="in" name="review_status">${opt(META.enums.reviewStatuses, q.review_status, (x) => REVIEW[x][0])}</select></label>
          <label class="c3">출제 상태 <select class="in" name="status">${opt(META.enums.statuses, q.status, (x) => (x === 'ACTIVE' ? '출제중 (게임에 나옴)' : '비활성 (나오지 않음)'))}</select></label>
          <label class="c6"><span>지문 * <span class="muted" style="font-weight:400">— 게임에서는 첫 "?" 앞(또는 첫 줄)의 안내 문구를 작게, 뒤의 단서를 크게 보여줍니다.</span></span><textarea class="in" name="question" rows="3" required>${esc(q.question)}</textarea></label>
          <div class="c6" style="display:flex;flex-direction:column;gap:8px">
            <div style="font-size:12.5px;font-weight:600;color:var(--ink-2)">보기 * <span class="muted" style="font-weight:400">— 동그라미를 눌러 정답 지정. 게임에서는 보기 순서가 매번 섞입니다.</span></div>
            ${[1, 2, 3, 4].map((n) => `<div class="opt-row ${q.correct_option == n ? 'correct' : ''}" data-n="${n}">
              <label class="radio"><input type="radio" name="correct_option" value="${n}" ${q.correct_option == n ? 'checked' : ''} hidden><span class="no">${n}</span></label>
              <input class="in" name="option_${n}" value="${esc(q['option_' + n])}" required>
              <span class="pick">${!isNew && answered ? `${Math.round(((picks[n - 1] || 0) / answered) * 100)}% 선택` : ''}</span></div>`).join('')}
          </div>
          <label class="c6">해설 <textarea class="in" name="explanation" rows="3">${esc(q.explanation || '')}</textarea></label>
          <label class="c2">기출 연도 <input class="in" name="exam_year" type="number" value="${esc(q.exam_year ?? '')}"></label>
          <label class="c2">회차 <input class="in" name="exam_round" value="${esc(q.exam_round ?? '')}"></label>
          <label class="c2">문항 번호 <input class="in" name="exam_question_no" type="number" value="${esc(q.exam_question_no ?? '')}"></label>
          <label class="c6">원문/출처 URL <input class="in" name="source_url" value="${esc(q.source_url ?? '')}"></label>
          <label class="c6">내부 메모 (사용자에게 보이지 않음) <textarea class="in" name="memo" rows="2">${esc(q.memo || '')}</textarea></label>
        </div>
        <div class="sticky-actions">
          ${!isNew && q.review_status !== 'APPROVED' ? '<button type="button" class="btn" id="approve">검수 완료 + 출제 시작</button>' : ''}
          <button type="submit" class="btn primary">${isNew ? '문항 추가' : '저장'}</button>
        </div>
      </form>
      <div class="grid" style="gap:14px">
        <div class="card"><h2>사용자 화면 미리보기</h2><div class="preview-phone" id="preview"></div></div>
        ${isNew ? '' : statsPanel(data)}
      </div>
    </div>`;

  const form = $main.querySelector('#form');
  const read = () => {
    const fd = new FormData(form);
    const o = Object.fromEntries(fd.entries());
    o.correct_option = Number(fd.get('correct_option'));
    if (!isNew) delete o.id;
    return o;
  };
  const renderPreview = () => {
    const o = read();
    $main.querySelector('#preview').innerHTML = `<span class="chip">${esc(o.era)}${o.period ? ' · ' + esc(o.period) : ''}</span>
      ${o.question ? (({ lead, clue }) => `${lead ? `<div class="ql">${esc(lead)}</div>` : ''}<div class="qt">${esc(clue)}</div>`)(splitQuestion(o.question)) : '<div class="qt"><span class="muted">지문을 입력하세요</span></div>'}
      <div class="ops">${[1, 2, 3, 4].map((n) => `<div class="op ${o.correct_option === n ? 'c' : ''}">${esc(o['option_' + n]) || '&nbsp;'}</div>`).join('')}</div>
      ${o.explanation ? `<div class="ex">📖 ${esc(o.explanation.replace(/\*\*/g, ''))}</div>` : ''}`;
  };
  form.addEventListener('input', renderPreview);
  form.addEventListener('change', (e) => {
    if (e.target.name === 'correct_option') $main.querySelectorAll('.opt-row').forEach((r) => r.classList.toggle('correct', r.dataset.n === e.target.value));
    renderPreview();
  });
  renderPreview();
  const origCorrect = q.correct_option;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = read();
    try {
      if (isNew) {
        const r = await api('/questions', { method: 'POST', body });
        toast('문항을 추가했습니다'); location.hash = '#/q/' + r.id;
      } else {
        await api('/questions/' + encodeURIComponent(q.id), { method: 'PUT', body });
        toast('저장했습니다');
        if (body.correct_option !== origCorrect && q.attempts > 0 && confirm('정답 번호가 바뀌었습니다. 기존 정답률 통계는 의미가 없어졌으니 통계를 초기화할까요?')) {
          await api(`/questions/${encodeURIComponent(q.id)}/reset-stats`, { method: 'POST' });
        }
        route();
      }
    } catch (err) { toast(err.message, true); }
  };
  if (!isNew) {
    $main.querySelector('#approve')?.addEventListener('click', async () => {
      try { await api('/questions/' + encodeURIComponent(q.id), { method: 'PUT', body: { ...read(), review_status: 'APPROVED', status: 'ACTIVE' } }); toast('검수 완료 처리했습니다'); route(); } catch (err) { toast(err.message, true); }
    });
    $main.querySelector('#del').onclick = async () => {
      return removeQuestion(q, () => { location.hash = '#/questions'; });
    };
    $main.querySelector('#reset-stats')?.addEventListener('click', async () => {
      if (!confirm('이 문항의 정답률 통계를 0부터 다시 집계할까요? (플레이 기록은 남습니다)')) return;
      await api(`/questions/${encodeURIComponent(q.id)}/reset-stats`, { method: 'POST' }); toast('통계를 초기화했습니다'); route();
    });
    $main.querySelectorAll('[data-restore]').forEach((b) => (b.onclick = async () => {
      if (!confirm('이 버전으로 되돌릴까요?')) return;
      await api(`/questions/${encodeURIComponent(q.id)}/restore/${b.dataset.restore}`, { method: 'POST' }); toast('복원했습니다'); route();
    }));
  }
}

function statsPanel(d) {
  const q = d.question;
  const picks = [q.pick_1, q.pick_2, q.pick_3, q.pick_4];
  const answered = picks.reduce((a, b) => a + b, 0);
  const maxPick = Math.max(1, ...picks);
  const alerts = [];
  const enough = q.attempts >= META.minAttempts;
  if (enough) {
    const correctPick = picks[q.correct_option - 1];
    picks.forEach((p, i) => { if (i + 1 !== q.correct_option && p > correctPick) alerts.push(['red', `보기 ${i + 1}("${esc(q['option_' + (i + 1)])}")을 고른 사람이 정답보다 많습니다. 정답 번호가 맞는지, 보기가 애매하지 않은지 확인하세요.`]); });
    if (q.accuracy < 30) alerts.push(['orange', `정답률이 ${q.accuracy}%로 매우 낮습니다. 지문이 어렵거나 오류가 있을 수 있습니다.`]);
    if (q.accuracy > 97) alerts.push(['blue', `정답률이 ${q.accuracy}%로 매우 높습니다. 변별력이 낮습니다.`]);
    if (q.suggested_difficulty && q.suggested_difficulty !== q.difficulty) alerts.push(['blue', `실제 정답률 기준 추천 난이도는 <b>${q.suggested_difficulty}</b>입니다. (현재 ${q.difficulty})`]);
  }
  const maxB = Math.max(1, ...d.timeBuckets.map((b) => b.count));
  return `
    <div class="card">
      <h2 style="display:flex;justify-content:space-between;align-items:center">정답률 / 응시 통계 <button class="btn sm" id="reset-stats">통계 초기화</button></h2>
      ${q.stats_since ? `<p class="muted" style="margin:-6px 0 10px;font-size:12px">${esc(q.stats_since)} (UTC) 이후 집계</p>` : ''}
      <div class="grid g3" style="gap:8px;margin-bottom:12px">
        <div class="kpi"><div class="k">응시</div><div class="v" style="font-size:22px">${fmt(q.attempts)}</div><div class="s">출제 ${fmt(d.servedCount)}회</div></div>
        <div class="kpi"><div class="k">정답률</div><div class="v" style="font-size:22px;color:${accColor(q.accuracy)}">${pct(q.accuracy)}</div><div class="s">오답 ${fmt(q.wrong_cnt)} · 시간초과 ${fmt(q.timeout_cnt)}</div></div>
        <div class="kpi"><div class="k">정답 소요시간</div><div class="v" style="font-size:22px">${secs(q.avg_correct_ms)}</div><div class="s">중앙값 ${secs(d.medianCorrectMs)} · 평균 ${fmt(q.avg_points)}점</div></div>
      </div>
      ${!enough ? `<div class="alert blue" style="margin-bottom:12px">응시가 ${META.minAttempts}회 이상 쌓이면 정답 오류·난이도 경고가 표시됩니다.</div>` : ''}
      <div class="alerts">${alerts.map(([c, m]) => `<div class="alert ${c}">${m}</div>`).join('')}</div>
      <h2>보기별 선택 분포</h2>
      <div class="dist">${picks.map((p, i) => {
        const isC = i + 1 === q.correct_option;
        return `<div class="row ${isC ? 'correct' : p > picks[q.correct_option - 1] ? 'danger' : ''}"><span class="lbl">${isC ? '✅' : `${i + 1}.`} ${esc(q['option_' + (i + 1)])}</span>
          <div class="bar"><i style="width:${(p / maxPick) * 100}%"></i></div><span class="num">${fmt(p)} (${answered ? Math.round((p / answered) * 100) : 0}%)</span></div>`;
      }).join('')}
        <div class="row"><span class="lbl">⏱ 시간초과</span><div class="bar"><i style="width:${(q.timeout_cnt / Math.max(maxPick, q.timeout_cnt || 1)) * 100}%;background:#D7DCD9"></i></div><span class="num">${fmt(q.timeout_cnt)}</span></div>
      </div>
      <h2 style="margin-top:18px">정답 소요시간 분포 (2초 단위)</h2>
      <div class="hist">${d.timeBuckets.map((b) => `<div class="b" title="${b.from}~${b.to}초: ${b.count}명"><span>${b.count || ''}</span><i style="height:${(b.count / maxB) * 90}px"></i><span>${b.from}</span></div>`).join('')}</div>
    </div>
    ${d.sameFact.length ? `<div class="card"><h2>같은 지식 그룹 (${esc(q.fact_group_id)}) 변형 문항 ${d.sameFact.length}개</h2>
      <table class="t"><tbody>${d.sameFact.map((s) => `<tr class="click" onclick="location.hash='#/q/${esc(s.id)}'"><td><b>${esc(s.id)}</b></td><td class="q" style="max-width:220px">${esc(s.question)}</td><td>${statusPill(s.status)}</td><td>${s.attempts ? accBar(s.accuracy) : '-'}</td></tr>`).join('')}</tbody></table>
      <p class="muted" style="font-size:12px;margin:8px 0 0">같은 그룹 문항은 한 판에 1개만 출제됩니다.</p></div>` : ''}
    <div class="card"><h2>수정 이력</h2>${d.revisions.map((r, i) => `<div class="rev"><span><span class="pill ${r.action === 'CREATE' ? 'green' : 'gray'}">${esc(r.action)}</span> ${esc(r.changed_at)} · ${esc(r.changed_by || '')}</span>
      ${i > 0 && r.action !== 'DELETE' ? `<button class="btn sm" data-restore="${r.id}" title="${esc(r.snapshot.question || '')}">이 버전으로 복원</button>` : '<span class="muted">현재</span>'}</div>`).join('') || '<div class="muted">이력 없음</div>'}</div>`;
}

// ---------- 가져오기 / 내보내기 ----------
// ---------- 목록에서 바로 고치기 · 지우기 ----------
async function removeQuestion(q, reload) {
  const msg = q.served
    ? `${q.id} 문항을 삭제할까요?\n\n이미 사용자에게 ${q.served}회 나간 문항이라, 지난 기록이 깨지지 않도록 완전히 지우지 않고 '삭제됨'으로 숨깁니다. 앞으로 출제되지 않고, 상태 필터에서 '삭제됨'을 고르면 다시 볼 수 있어요.`
    : `${q.id} 문항을 완전히 삭제할까요? (아직 출제된 적 없음, 되돌릴 수 없음)`;
  if (!confirm(msg)) return;
  try {
    const r = await api('/questions/' + encodeURIComponent(q.id), { method: 'DELETE' });
    toast(r.soft ? '삭제됨으로 숨겼습니다 (출제 안 됨)' : '삭제했습니다'); reload();
  } catch (e) { toast(e.message, true); }
}
async function quickEdit(id, reload) {
  const q = (await api('/questions/' + encodeURIComponent(id))).question;
  const root = document.getElementById('drawer-root');
  const opt = (list, v, label = (x) => x) => list.map((x) => `<option value="${esc(x)}" ${x === v ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  root.innerHTML = `<div class="drawer-back"><form class="drawer" id="qe">
    <div class="page-head"><div class="grow"><h1 class="page" style="font-size:18px">${esc(q.id)} 고치기</h1><div class="muted">출제 ${fmt(q.served)}회 · 응답 ${fmt(q.attempts)} · 정답률 ${pct(q.accuracy)}</div></div><button type="button" class="btn sm" id="close">닫기</button></div>
    <div class="form">
      <label class="c2">시대 <input class="in" name="era" value="${esc(q.era)}" required></label>
      <label class="c2">세부 시기 <input class="in" name="period" value="${esc(q.period || '')}"></label>
      <label class="c2">키워드 <input class="in" name="topic" value="${esc(q.topic || '')}"></label>
      <label class="c2">난이도 <select class="in" name="difficulty">${opt(META.enums.difficulties, q.difficulty)}</select></label>
      <label class="c2">출제 상태 <select class="in" name="status">${opt(META.enums.statuses, q.status, (x) => STATUS_LABEL[x] || x)}</select></label>
      <label class="c2">검수 <select class="in" name="review_status">${opt(META.enums.reviewStatuses, q.review_status, (x) => REVIEW[x][0])}</select></label>
      <label class="c6">문제 <textarea class="in" name="question" rows="3" required>${esc(q.question)}</textarea></label>
      ${[1, 2, 3, 4].map((n) => `<label class="c6 optrow"><input type="radio" name="correct_option" value="${n}" ${q.correct_option === n ? 'checked' : ''} title="정답으로 지정"> 보기 ${n} <input class="in" name="option_${n}" value="${esc(q['option_' + n])}" required></label>`).join('')}
      <label class="c6">해설 <textarea class="in" name="explanation" rows="3">${esc(q.explanation || '')}</textarea></label>
    </div>
    <p class="muted" style="font-size:12px">보기 왼쪽 동그라미가 정답이에요. 정답이나 보기를 바꾸면 이미 쌓인 정답률과 맞지 않을 수 있어서, 저장 뒤 통계 초기화를 권해요 (문항 상세 화면).</p>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" type="submit">저장</button><a class="btn" href="#/q/${esc(q.id)}">상세 화면에서 보기</a></div>
  </form></div>`;
  const close = () => (root.innerHTML = '');
  root.querySelector('.drawer-back').onclick = (e) => { if (e.target.classList.contains('drawer-back')) close(); };
  root.querySelector('#close').onclick = close;
  root.querySelector('#qe').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = Object.fromEntries([...f.entries()]);
    body.correct_option = Number(body.correct_option);
    try { await api('/questions/' + encodeURIComponent(q.id), { method: 'PUT', body }); toast('저장했습니다'); close(); reload(); } catch (err) { toast(err.message, true); }
  };
}

async function viewImport() {
  const cols = 'id,era,period,topic,question_type,concept_ids,fact_group_id,source_type,difficulty,review_status,status,question,option_1,option_2,option_3,option_4,correct_option,explanation,memo';
  $main.innerHTML = `
    <h1 class="page">가져오기 / 내보내기</h1>
    <p class="page-sub">새로 만든 문제 파일(md)을 올리면 <b>내용이 같은 문제는 자동으로 빼고</b>, 새 문제만 이어지는 번호(${esc(META.nextId)}부터)로 추가합니다. 추가된 문제는 바로 <a href="#/questions">문항 관리</a> 목록에 보여요.</p>
    <div class="grid g2">
      <div class="card">
        <h2>1. 파일 선택 (md · CSV · JSON)</h2>
        <div class="drop" id="drop">여기로 파일을 끌어오거나 클릭해서 선택하세요<br><span class="muted" style="font-size:12px">.md (### KH-0001 형식) · .csv (UTF-8) · .json</span></div>
        <input type="file" id="file" accept=".csv,.json,.md,.txt" hidden>
        <div class="modes" id="modes">
          <label><input type="radio" name="mode" value="add" checked> <b>새 문제 추가</b> <span class="muted">— 내용 중복은 빼고 새 번호로 추가 (새로 만든 md 는 이걸로)</span></label>
          <label><input type="radio" name="mode" value="upsert"> <b>같은 번호 고치기</b> <span class="muted">— 내보낸 파일을 고쳐서 다시 올릴 때. 번호가 같은 문제의 내용을 바꿈</span></label>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap">
          <button class="btn" id="dry" disabled>2. 미리 검사</button>
          <button class="btn primary" id="apply" disabled>3. 반영하기</button>
        </div>
        <div id="result" style="margin-top:14px"></div>
      </div>
      <div class="card">
        <h2>내보내기 — 지금 서비스 중인 최종 문항 목록</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn primary" data-exp="md">MD (최종 문항 목록)</button>
          <button class="btn" data-exp="stats">CSV (문항 + 정답률 · 출제 횟수)</button>
          <button class="btn" data-exp="csv">CSV (문항만)</button>
          <button class="btn" data-exp="json">JSON</button>
        </div>
        <p class="muted" style="font-size:13px;line-height:1.6">MD 는 원본 문제 파일과 같은 모양이라, 새 문제를 만들 때 GPT 등에 "이 목록과 겹치지 않게"라고 같이 주면 좋아요. 삭제한 문항은 빠집니다.<br>
          엑셀에서 고치려면 CSV 로 내보내 고친 뒤, 왼쪽에서 <b>같은 번호 고치기</b>로 올리세요.</p>
        <h2 style="margin-top:18px">중복 판단 기준</h2>
        <p class="muted" style="font-size:13px;line-height:1.7">· <b>같은 문제</b> = 문제 글이 같고 정답 보기 글자도 같음 (띄어쓰기·문장부호·굵게 표시는 무시)<br>
          · 시대 순서 문제는 괄호 안 4개 항목이 같으면 순서가 달라도 같은 문제<br>
          · 파일 안의 번호(KH-0001 등)는 보지 않아요 → 새 파일이 1번부터 다시 시작해도 기존 문제를 덮어쓰지 않음<br>
          · 문제 글은 같은데 정답이 다르면 추가는 하되 <b>확인 필요</b>로 알려 줘요</p>
        <h2 style="margin-top:18px">CSV 열 형식</h2>
        <pre class="code">${cols.split(',').join(', ')}</pre>
        <a class="btn sm" id="tpl">빈 템플릿 CSV 받기</a>
      </div>
    </div>`;
  $main.querySelectorAll('[data-exp]').forEach((b) => (b.onclick = () => exportQuestions({}, { format: b.dataset.exp === 'stats' ? 'csv' : b.dataset.exp, stats: b.dataset.exp === 'stats' }).catch((e) => toast(e.message, true))));
  let text = '', filename = '';
  const drop = $main.querySelector('#drop'), file = $main.querySelector('#file');
  const mode = () => $main.querySelector('input[name=mode]:checked').value;
  const pick = async (f) => {
    text = await f.text(); filename = f.name;
    drop.innerHTML = `<b>${esc(f.name)}</b> (${fmt(Math.round(f.size / 1024))}KB) 선택됨 — 다른 파일을 고르려면 클릭`;
    $main.querySelector('#dry').disabled = $main.querySelector('#apply').disabled = false;
    run(true);
  };
  drop.onclick = () => file.click();
  file.onchange = () => file.files[0] && pick(file.files[0]);
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); e.dataTransfer.files[0] && pick(e.dataTransfer.files[0]); };
  $main.querySelector('#modes').onchange = () => text && run(true);
  const short = (t) => esc(String(t || '').slice(0, 70)) + (String(t || '').length > 70 ? '…' : '');
  const section = (title, n, head, rows) => !n ? '' : `<details class="imp" ${n <= 20 ? 'open' : ''}><summary>${title} <b>${fmt(n)}</b>개${rows.length < n ? ` (앞 ${rows.length}개만 표시)` : ''}</summary><table class="t"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></details>`;
  async function run(dry) {
    const m = mode();
    if (!dry && !confirm(m === 'add' ? '중복을 뺀 새 문제를 추가할까요?' : '같은 번호 문제의 내용을 파일대로 바꿀까요?')) return;
    try {
      $main.querySelector('#result').innerHTML = '<div class="muted">검사 중…</div>';
      const r = await api(`/import?filename=${encodeURIComponent(filename)}&mode=${m}${dry ? '&dryRun=1' : ''}`, { method: 'POST', body: text });
      const head = m === 'add'
        ? `${dry ? '🔍 검사 결과 (아직 반영 안 됨)' : '✅ 반영 완료'} — 파일 속 문제 ${fmt(r.parsed)}개 → <b>새로 추가 ${fmt(r.created)}개</b>${!dry && r.newIds?.length ? ` (${esc(r.newIds[0])} ~ ${esc(r.newIds[1])})` : ''} · 이미 있는 문제라 뺌 ${fmt(r.dupExistingCount)} · 파일 안 중복 ${fmt(r.dupInFileCount)} · 확인 필요 ${fmt(r.similarCount)} · 오류 ${fmt(r.errors.length)}`
        : `${dry ? '🔍 검사 결과 (아직 반영 안 됨)' : '✅ 반영 완료'} — 파일 속 문제 ${fmt(r.parsed)}개 · 새로 추가 <b>${fmt(r.created)}</b> · 수정 <b>${fmt(r.updated)}</b> · 오류 ${fmt(r.errors.length)}`;
      $main.querySelector('#result').innerHTML = `<div class="alert ${r.errors.length || r.similarCount ? 'orange' : 'blue'}">${head}</div>
        ${section('⚠ 확인 필요 — 문제 글은 같은데 정답이 다름', r.similarCount || 0, ['파일 번호', '문제', '새 정답', '기존 문항', '기존 정답'], (r.similar || []).map((x) => `<tr><td>${esc(x.file_id)}</td><td class="q">${short(x.question)}</td><td>${esc(x.answer)}</td><td><a href="#/q/${esc(x.id)}">${esc(x.id)}</a></td><td>${esc(x.existing_answer)}</td></tr>`))}
        ${section('이미 있는 문제라 뺌', r.dupExistingCount || 0, ['파일 번호', '문제', '같은 기존 문항'], (r.dupExisting || []).map((x) => `<tr><td>${esc(x.file_id)}</td><td class="q">${short(x.question)}</td><td><a href="#/q/${esc(x.id)}">${esc(x.id)}</a>${x.status === 'DELETED' ? ' <span class="pill red">삭제됨</span>' : ''}</td></tr>`))}
        ${section('파일 안에서 두 번 나와 하나만 넣음', r.dupInFileCount || 0, ['파일 번호', '문제', '먼저 나온 번호'], (r.dupInFile || []).map((x) => `<tr><td>${esc(x.file_id)}</td><td class="q">${short(x.question)}</td><td>${esc(x.same_as)}</td></tr>`))}
        ${section('오류 (빠짐)', r.errors.length, ['행', '번호', '오류'], r.errors.slice(0, 100).map((e) => `<tr><td>${e.row}</td><td>${esc(e.id || '')}</td><td>${esc(e.errors.join(', '))}</td></tr>`))}
        ${!dry && r.created ? `<a class="btn primary" style="margin-top:10px" href="#/questions?sort=id&order=desc">추가된 문제 보러 가기 →</a>` : ''}`;
      if (!dry) { META = await api('/meta'); toast('반영했습니다'); }
    } catch (e) { $main.querySelector('#result').innerHTML = ''; toast(e.message, true); }
  }
  $main.querySelector('#dry').onclick = () => run(true);
  $main.querySelector('#apply').onclick = () => run(false);
  $main.querySelector('#tpl').onclick = () => {
    const blob = new Blob(['﻿' + cols + '\r\n,조선 전기,세종,훈민정음,개념 확인,,,ORIGINAL,하,NEEDS_REVIEW,INACTIVE,훈민정음을 창제한 왕은?,태조,세종,성종,정조,2,세종은 1443년 훈민정음을 창제했다.,\r\n'], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'question-template.csv'; a.click();
  };
}

// ---------- 정답률 분석 ----------
async function viewStats() {
  const s = await api('/stats');
  const maxScore = Math.max(1, ...s.scoreDist.map((x) => x.c));
  const groupTable = (rows, label) => `<table class="t"><thead><tr><th>${label}</th><th class="num">문항</th><th class="num">출제중</th><th class="num">응시</th><th>정답률</th><th class="num">시간초과</th><th class="num">평균 정답시간</th></tr></thead>
    <tbody>${rows.map((r) => `<tr class="click" onclick="location.hash='#/questions?${label === '시대' ? 'era' : 'difficulty'}=${encodeURIComponent(r.k)}&sort=accuracy'"><td><b>${esc(r.k)}</b></td><td class="num">${fmt(r.questions)}</td><td class="num">${fmt(r.active)}</td><td class="num">${fmt(r.attempts)}</td><td>${r.attempts ? accBar(r.accuracy) : '-'}</td><td class="num">${r.attempts ? Math.round((r.timeouts / r.attempts) * 1000) / 10 + '%' : '-'}</td><td class="num">${secs(r.avg_correct_ms)}</td></tr>`).join('')}</tbody></table>`;
  const qList = (rows) => rows.length ? `<table class="t"><tbody>${rows.map((r) => `<tr class="click" onclick="location.hash='#/q/${esc(r.id)}'"><td><b>${esc(r.id)}</b></td><td>${esc(r.era)}</td><td class="q" style="max-width:260px" title="${esc(r.question)}">${esc(r.topic || r.question)}</td><td class="num">${fmt(r.attempts)}회</td><td>${accBar(r.accuracy)}</td></tr>`).join('')}</tbody></table>` : `<div class="empty">응시 ${s.minAttempts}회 이상 문항이 아직 없습니다.</div>`;
  const facts = Object.fromEntries(s.factCoverage.map((f) => [f.era, f]));
  $main.innerHTML = `
    <div class="page-head"><div class="grow"><h1 class="page">정답률 분석</h1><p class="page-sub" style="margin:4px 0 0">실제 플레이 기록 기준. 행을 누르면 해당 문항 목록으로 이동합니다.</p></div>
      <button class="btn" id="apply-diff">추천 난이도 일괄 적용</button></div>
    <div class="grid g2">
      <div class="card"><h2>시대별</h2>${groupTable(s.byEra, '시대')}</div>
      <div class="grid" style="gap:14px">
        <div class="card"><h2>난이도별</h2>${groupTable(s.byDifficulty, '난이도')}
          <p class="muted" style="font-size:12px;margin:8px 0 0">목표: 하 ≥ 80%, 중 50~80%, 상 &lt; 50%. 벗어나면 "추천 난이도 일괄 적용"으로 맞추세요 (응시 ${s.minAttempts}회 이상 문항만 변경).</p></div>
        <div class="card"><h2>한 판 점수 분포</h2>
          ${s.scoreDist.length ? `<div class="bars-v" style="height:150px">${Array.from({ length: 11 }, (_, i) => i * 1000).map((b) => { const c = s.scoreDist.find((x) => x.bucket === b)?.c || 0; return `<div class="b" title="${fmt(b)}~${fmt(b + 999)}점: ${c}판"><em>${c || ''}</em><i style="height:${(c / maxScore) * 110}px;background:var(--orange)"></i><span>${b / 1000}k</span></div>`; }).join('')}</div>` : '<div class="empty">완료된 판이 없습니다.</div>'}
        </div>
      </div>
    </div>
    <div class="grid g2" style="margin-top:14px">
      <div class="card"><h2>가장 어려운 문항 (정답률 낮은 순)</h2>${qList(s.hardest)}</div>
      <div class="card"><h2>가장 쉬운 문항 (정답률 높은 순)</h2>${qList(s.easiest)}</div>
    </div>
    <div class="card" style="margin-top:14px"><h2>시대별 문항 풀 (출제중 기준)</h2>
      <table class="t"><thead><tr><th>슬롯</th><th>시대</th><th class="num">출제중 문항</th><th class="num">서로 다른 지식 그룹</th></tr></thead><tbody>
      ${META.series.slots.map((sl, i) => `<tr><td>${i + 1}</td><td>${esc(sl.eras.join(' / '))}</td><td class="num">${fmt(sl.eras.reduce((a, e) => a + (facts[e]?.questions || 0), 0))}</td><td class="num">${fmt(sl.eras.reduce((a, e) => a + (facts[e]?.facts || 0), 0))}</td></tr>`).join('')}
      </tbody></table><p class="muted" style="font-size:12px;margin:8px 0 0">지식 그룹 수가 적은 시대일수록 같은 내용이 자주 반복됩니다. 문항을 늘릴 때 우선순위로 참고하세요.</p></div>`;
  $main.querySelector('#apply-diff').onclick = async () => {
    if (!confirm('응시 수가 충분한 문항 중 정답률과 난이도가 맞지 않는 문항의 난이도를 추천값으로 바꿀까요?')) return;
    const r = await api('/questions/apply-suggested-difficulty', { method: 'POST' });
    toast(`${r.updated}개 문항 난이도를 조정했습니다`); route();
  };
}

// ---------- 플레이 기록 ----------
async function viewRuns(_p, query) {
  const st = { flagged: query.flagged || '', nickname: query.nickname || '', week: query.week || '', page: 1 };
  $main.innerHTML = `
    <h1 class="page">플레이 기록</h1><p class="page-sub">완료된 판. 0.7초 안에 맞힌 답이 3개 이상이면 '의심'으로 표시됩니다. 실격 처리하면 랭킹에서 빠집니다.</p>
    <div class="filters">
      <input class="in" id="nick" placeholder="닉네임" value="${esc(st.nickname)}">
      <input class="in" id="week" placeholder="주차 (예: 2026-W47)" value="${esc(st.week)}" style="width:170px">
      <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="flagged" ${st.flagged ? 'checked' : ''}> 의심 판만</label>
    </div>
    <div class="table-wrap" id="tbl"></div><div class="pager" id="pager"></div>`;
  async function load() {
    setQuery('runs', { flagged: st.flagged, nickname: st.nickname, week: st.week });
    const r = await api('/runs?' + new URLSearchParams(Object.entries(st).filter(([, v]) => v !== '')));
    $main.querySelector('#tbl').innerHTML = r.rows.length ? `<table class="t"><thead><tr><th>완료 시각</th><th>주차</th><th>닉네임</th><th class="num">점수</th><th class="num">정답</th><th class="num">총 시간</th><th class="num">너무 빠른 답</th><th class="num">화면 이탈</th><th>상태</th></tr></thead>
      <tbody>${r.rows.map((x) => `<tr class="click" data-id="${x.id}"><td>${dt(x.finished_at)}</td><td>${esc(x.week_key)}</td><td><b>${esc(x.nickname)}</b>${x.blocked ? ' <span class="pill red">차단</span>' : ''}</td>
        <td class="num"><b>${fmt(x.total_score)}</b></td><td class="num">${x.correct_count}/${x.question_count}</td><td class="num">${secs(x.total_time_ms)}</td>
        <td class="num" style="color:${x.too_fast_count ? 'var(--red)' : ''}">${x.too_fast_count}</td><td class="num">${x.focus_lost_count}</td>
        <td>${x.disqualified ? '<span class="pill red">실격</span>' : x.flagged ? '<span class="pill orange">의심</span>' : '<span class="pill green">정상</span>'}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">기록이 없습니다.</div>';
    const pages = Math.max(1, Math.ceil(r.total / 50));
    $main.querySelector('#pager').innerHTML = `총 ${fmt(r.total)}판 · <button class="btn sm" id="prev" ${st.page <= 1 ? 'disabled' : ''}>이전</button> ${st.page}/${pages} <button class="btn sm" id="next" ${st.page >= pages ? 'disabled' : ''}>다음</button>`;
    $main.querySelector('#prev').onclick = () => { st.page--; load(); };
    $main.querySelector('#next').onclick = () => { st.page++; load(); };
    $main.querySelectorAll('tr.click').forEach((tr) => (tr.onclick = () => runDrawer(tr.dataset.id, load)));
  }
  let deb;
  $main.querySelector('#nick').oninput = (e) => { clearTimeout(deb); deb = setTimeout(() => { st.nickname = e.target.value.trim(); st.page = 1; load(); }, 250); };
  $main.querySelector('#week').onchange = (e) => { st.week = e.target.value.trim(); st.page = 1; load(); };
  $main.querySelector('#flagged').onchange = (e) => { st.flagged = e.target.checked ? '1' : ''; st.page = 1; load(); };
  await load();
}

async function runDrawer(id, reload) {
  const d = await api('/runs/' + id);
  const root = document.getElementById('drawer-root');
  const r = d.run;
  root.innerHTML = `<div class="drawer-back"><div class="drawer">
    <div class="page-head"><div class="grow"><h1 class="page" style="font-size:18px">${esc(r.nickname)} · ${fmt(r.total_score)}점</h1><div class="muted">${dt(r.finished_at)} · ${esc(r.week_key)} · 점수규칙 v${r.score_version}</div></div><button class="btn sm" id="close">닫기</button></div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="btn ${r.disqualified ? '' : 'danger'}" id="dq">${r.disqualified ? '실격 해제' : '이 판 실격 처리'}</button>
      <button class="btn danger" id="block">사용자 차단 (랭킹 제외)</button>
    </div>
    <table class="t"><thead><tr><th>#</th><th>문항</th><th>결과</th><th class="num">소요</th><th class="num">허용시간</th><th class="num">점수</th></tr></thead><tbody>
    ${d.questions.map((x) => `<tr><td>${x.seq}</td><td class="q" style="max-width:240px"><a href="#/q/${esc(x.question_id)}">${esc(x.question_id)}</a> ${esc(x.question)}</td>
      <td>${x.status === 'TIMEOUT' ? '<span class="pill gray">시간초과</span>' : x.is_correct ? '<span class="pill green">정답</span>' : '<span class="pill red">오답</span>'}${x.too_fast ? ' <span class="pill orange">너무 빠름</span>' : ''}${x.focus_lost ? ` <span class="pill gray">이탈 ${x.focus_lost}</span>` : ''}</td>
      <td class="num">${secs(x.elapsed_ms)}</td><td class="num">${secs(x.read_window_ms)}</td><td class="num"><b>${fmt(x.points)}</b></td></tr>`).join('')}
    </tbody></table></div></div>`;
  const close = () => (root.innerHTML = '');
  root.querySelector('.drawer-back').onclick = (e) => { if (e.target.classList.contains('drawer-back')) close(); };
  root.querySelector('#close').onclick = close;
  root.querySelector('#dq').onclick = async () => { await api(`/runs/${id}/disqualify`, { method: 'POST', body: { value: !r.disqualified } }); toast('변경했습니다'); close(); reload(); };
  root.querySelector('#block').onclick = async () => {
    if (!confirm(`${r.nickname} 사용자를 차단할까요? 모든 기록이 랭킹에서 빠지고 플레이할 수 없습니다.`)) return;
    await api(`/users/${r.user_id}/block`, { method: 'POST', body: { value: true } }); toast('차단했습니다'); close(); reload();
  };
}

// ---------- 주간 랭킹 ----------
async function viewRanking(_p, query) {
  const r = await api('/ranking' + (query.week ? '?week=' + encodeURIComponent(query.week) : ''));
  $main.innerHTML = `
    <div class="page-head"><div class="grow"><h1 class="page">주간 랭킹 · ${esc(r.week)}</h1><p class="page-sub" style="margin:4px 0 0">사용자별 그 주 최고 기록 · 동점이면 총 소요시간 → 먼저 달성 순 · 실격/차단 제외</p></div>
      <a class="btn ${r.week === r.thisWeek ? 'primary' : ''}" href="#/ranking">이번 주</a>
      <a class="btn ${r.week === r.lastWeek ? 'primary' : ''}" href="#/ranking?week=${r.lastWeek}">지난 주</a>
      <input class="in" id="wk" placeholder="2026-W40" style="width:120px"></div>
    <div class="table-wrap">${r.list.length ? `<table class="t"><thead><tr><th>순위</th><th>닉네임</th><th class="num">점수</th><th class="num">정답</th><th class="num">총 소요시간</th><th>달성 시각</th><th></th></tr></thead>
      <tbody>${r.list.map((x) => `<tr><td><b>${x.rank}</b></td><td>${esc(x.nickname)}</td><td class="num"><b>${fmt(x.score)}</b></td><td class="num">${x.correct_count}</td><td class="num">${secs(x.total_time_ms)}</td><td>${dt(x.finished_at)}</td><td><button class="btn sm" data-run="${x.run_id}">상세</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">기록이 없습니다.</div>'}</div>`;
  $main.querySelector('#wk').onchange = (e) => (location.hash = '#/ranking?week=' + encodeURIComponent(e.target.value.trim()));
  $main.querySelectorAll('[data-run]').forEach((b) => (b.onclick = () => runDrawer(b.dataset.run, route)));
}

// ---------- 설정 ----------
async function viewSettings() {
  const s = await api('/settings');
  const sc = META.scoring;
  $main.innerHTML = `
    <h1 class="page">설정</h1><p class="page-sub">출제 정책. 변경 즉시 다음 판부터 적용됩니다.</p>
    <div class="grid g2">
      <form class="card" id="f">
        <h2>출제 정책</h2>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-bottom:16px"><input type="checkbox" name="only_approved" ${s.only_approved === '1' ? 'checked' : ''} style="margin-top:3px">
          <span><b>검수 완료(APPROVED) 문항만 출제</b><br><span class="muted">상용 서비스에서는 켜는 것을 권장합니다. 켜면 시대별로 검수 완료 문항이 충분한지 먼저 확인하세요.</span></span></label>
        <label style="display:block;margin-bottom:16px"><b>하루 도전 횟수 제한</b> <span class="muted">(0 = 무제한, KST 자정 초기화)</span><br><input class="in" type="number" min="0" max="999" name="daily_play_limit" value="${esc(s.daily_play_limit)}" style="margin-top:6px;width:120px"></label>
        <label style="display:block;margin-bottom:16px"><b>최근 본 문항 회피 기간 (일)</b> <span class="muted">(0 = 사용 안 함)</span><br><input class="in" type="number" min="0" max="365" name="avoid_recent_days" value="${esc(s.avoid_recent_days)}" style="margin-top:6px;width:120px"></label>
        <button class="btn primary">저장</button>
      </form>
      <div class="card">
        <h2>점수 규칙 (v${sc.version}) — 읽기 전용</h2>
        <table class="t"><tbody>
          <tr><td>문항당 최고점 / 정답 최저점</td><td class="num">${sc.maxPoints} / ${sc.minCorrectPoints}</td></tr>
          <tr><td>오답 / 시간초과</td><td class="num">${sc.wrongPoints} / ${sc.timeoutPoints}</td></tr>
          <tr><td>문항당 제한시간</td><td class="num">${sc.timeLimitMs / 1000}초</td></tr>
          <tr><td>감점 시작 전 허용 시간 (네트워크 지연분)</td><td class="num">${sc.readMaxMs / 1000}초</td></tr>
          <tr><td>감점 곡선 지수</td><td class="num">${sc.decayExponent}</td></tr>
          <tr><td>너무 빠른 답 기준 / 의심 판 기준</td><td class="num">${sc.tooFastMs}ms / ${sc.tooFastFlagCount}개</td></tr>
        </tbody></table>
        <p class="muted" style="font-size:13px;line-height:1.6">점수 규칙은 랭킹의 공정성을 위해 코드(<code>functions/src/config.js</code>)와 <a href="../docs/SCORING.md" target="_blank">SCORING.md</a>로 관리하며, 바꿀 때는 version을 올리고 주가 바뀌는 시점(월요일 00:00 KST)에 배포하세요.</p>
        <h2 style="margin-top:16px">한 판 구성</h2>
        <p class="muted" style="font-size:13px;margin:0">${META.series.slots.map((x) => esc(x.label)).join(' · ')}<br>난이도 배분: ${META.series.difficultyMix.join(' ')}</p>
      </div>
    </div>`;
  $main.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/settings', { method: 'PUT', body: { only_approved: fd.get('only_approved') ? '1' : '0', daily_play_limit: fd.get('daily_play_limit') || '0', avoid_recent_days: fd.get('avoid_recent_days') || '0' } });
      toast('저장했습니다');
    } catch (err) { toast(err.message, true); }
  };
}

boot();
