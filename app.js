import { call, signInPlayer } from './firebase.js';
// 타임어택 한국사 — 플레이어 웹앱 (프레임워크 없는 SPA)
const $app = document.getElementById('app');
const $tabbar = document.getElementById('tabbar');
const $shield = document.getElementById('shield');

// ---------- 아이콘 ----------
const ICONS = {
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  trophyColor: '<svg viewBox="0 0 48 48"><path d="M14 6h20v12a10 10 0 0 1-20 0z" fill="#FFC23D"/><path d="M14 9H7v4a7 7 0 0 0 7 7M34 9h7v4a7 7 0 0 1-7 7" fill="none" stroke="#F4A51C" stroke-width="3"/><path d="M20 28h8v6h-8z" fill="#F4A51C"/><rect x="14" y="34" width="20" height="6" rx="2" fill="#E8901A"/><path d="M24 11l1.8 3.6 4 .6-2.9 2.8.7 4L24 20.1l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#fff"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5z"/><path d="M12 6v13.5M5.5 9h3M5.5 12h3M15.5 9h3M15.5 12h3"/></svg>',
  bookColor: '<svg viewBox="0 0 48 48"><path d="M4 11c6-3 13-3 20 1v28c-7-4-14-4-20-1z" fill="#E3F4E4" stroke="#2E7D5B" stroke-width="3" stroke-linejoin="round"/><path d="M44 11c-6-3-13-3-20 1v28c7-4 14-4 20-1z" fill="#E3F4E4" stroke="#2E7D5B" stroke-width="3" stroke-linejoin="round"/></svg>',
  bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="12" width="4" height="9" rx="1.5"/><rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></svg>',
  barsColor: '<svg viewBox="0 0 48 48"><rect x="6" y="24" width="9" height="18" rx="3" fill="#47A276"/><rect x="19.5" y="15" width="9" height="27" rx="3" fill="#2E7D5B"/><rect x="33" y="6" width="9" height="36" rx="3" fill="#47A276"/></svg>',
  starColor: '<svg viewBox="0 0 48 48"><path d="M24 4l6 12.6 13.8 1.8-10.1 9.6 2.6 13.7L24 35l-12.3 6.7 2.6-13.7L4.2 18.4 18 16.6z" fill="#FFC23D" stroke="#F4A51C" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="24" r="5" fill="#FF9E3D"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  checkCircle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  xCircle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
  crown: '<svg viewBox="0 0 40 32"><path d="M3 9l8 7 9-13 9 13 8-7-3 19H6z" fill="#FFC23D" stroke="#E8A317" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="18" r="3" fill="#fff"/></svg>',
};
const icon = (n) => ICONS[n] || '';
document.querySelectorAll('[data-icon]').forEach((el) => { el.outerHTML = icon(el.dataset.icon); });

// ---------- 유틸 ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const sec = (ms) => (ms / 1000).toFixed(1) + '초';
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const kdate = (ms, time = false) => {
  const d = new Date(ms);
  const s = `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`;
  return time ? `${s} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : s;
};
// 지문 = "안내 문구? 단서". 안내 문구는 작게, 답을 유추하는 단서는 크게 보여준다.
// 줄바꿈이 있으면 첫 줄을 안내 문구로 본다 (백오피스에서 직접 나눌 때).
function splitQuestion(text = '') {
  const nl = text.indexOf('\n');
  if (nl > 0) return { lead: text.slice(0, nl).trim(), clue: text.slice(nl + 1).trim() };
  const i = text.indexOf('? ');
  if (i > 0 && i <= 40 && text.slice(i + 2).trim()) return { lead: text.slice(0, i + 1), clue: text.slice(i + 2).trim() };
  return { lead: '', clue: text };
}
function questionHtml(text) {
  const { lead, clue } = splitQuestion(text);
  return `${lead ? `<p class="q-lead">${esc(lead)}</p>` : ''}<p class="q-text">${esc(clue)}</p>`;
}
const AVATAR_COLORS = ['#2E7D5B', '#FF9E3D', '#4F8EDC', '#B76BD9', '#E5484D', '#1FA6A0', '#8B6F47'];
const avatar = (nick, cls = '') => {
  const h = [...(nick || '?')].reduce((a, c) => a + c.charCodeAt(0), 0);
  return `<div class="avatar ${cls}" style="background:${AVATAR_COLORS[h % AVATAR_COLORS.length]}">${esc([...(nick || '?')][0])}</div>`;
};

const store = { nick: '' };

// 서버 호출 (Cloud Functions). 실패하면 사용자용 메시지를 담은 Error 를 던진다.
async function api(name, data) {
  try {
    return await call(name, data);
  } catch (e) {
    if (e.code === 'functions/unauthenticated') await signInPlayer();
    throw e;
  }
}

function toast(msg, ms = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

function modal(html, onMount) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const back = root.firstElementChild;
  const close = () => { root.innerHTML = ''; };
  back.addEventListener('click', (e) => { if (e.target === back && !back.dataset.locked) close(); });
  onMount?.(back.querySelector('.modal'), close, back);
  return close;
}

let CONFIG = null;
async function loadConfig(force = false) {
  if (!CONFIG || force) {
    await signInPlayer();
    CONFIG = await api('bootstrap');
    store.nick = CONFIG.me?.nickname || '';
  }
  return CONFIG;
}

// 클라이언트 쪽 점수 미리보기 (서버와 같은 공식, 표시용)
function potentialPoints(elapsed, windowMs) {
  const s = CONFIG.scoring;
  if (elapsed > s.timeLimitMs) return 0;
  const x = Math.min(1, Math.max(0, (elapsed - windowMs) / Math.max(1, s.timeLimitMs - windowMs)));
  return Math.round(s.minCorrectPoints + (s.maxPoints - s.minCorrectPoints) * Math.pow(1 - x, s.decayExponent));
}

// ---------- 닉네임 ----------
function ensureUser() {
  if (CONFIG?.me?.nickname) return true;
  modal(`
    <img src="assets/king.png" alt="" style="width:110px;margin:-8px auto 6px">
    <h3 style="text-align:center">타임어택 한국사에 오신 걸 환영해요!</h3>
    <p style="text-align:center;margin-top:0">랭킹에 표시될 닉네임을 정해 주세요.</p>
    <input id="nick" maxlength="10" placeholder="한글/영문/숫자 2~10자" autocomplete="off" />
    <div class="err" id="nick-err"></div>
    <button class="btn-primary" id="nick-ok" style="margin-top:8px">시작하기</button>`,
  (m, close, back) => {
    back.dataset.locked = '1';
    const input = m.querySelector('#nick');
    input.focus();
    const submit = async () => {
      try {
        await api('setNickname', { nickname: input.value });
        await loadConfig(true);
        close(); route();
      } catch (e) { m.querySelector('#nick-err').textContent = e.message; }
    };
    m.querySelector('#nick-ok').onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  });
  return false;
}

function editNickname() {
  modal(`<h3>닉네임 변경</h3><input id="nick" maxlength="10" value="${esc(store.nick)}" /><div class="err" id="nick-err"></div>
    <div class="row"><button class="btn-ghost" id="c">취소</button><button class="btn-primary" id="ok" style="height:48px;font-size:16px">저장</button></div>`,
  (m, close) => {
    m.querySelector('#c').onclick = close;
    m.querySelector('#ok').onclick = async () => {
      try {
        await api('setNickname', { nickname: m.querySelector('#nick').value });
        await loadConfig(true); close(); route(); toast('닉네임을 바꿨어요');
      } catch (e) { m.querySelector('#nick-err').textContent = e.message; }
    };
  });
}

function showRules() {
  const s = CONFIG.scoring;
  modal(`<h3>점수 규칙</h3>
    <p>한 판 <b>${CONFIG.series.questionCount}문제</b>, 문제당 최고 <b>${fmt(s.maxPoints)}점</b>이에요.</p>
    <table>
      <tr><th>결과</th><th>점수</th></tr>
      <tr><td>바로(${s.readMaxMs / 1000}초 안에) 정답</td><td><b>${fmt(s.maxPoints)}</b></td></tr>
      <tr><td>${s.timeLimitMs / 1000}초까지 정답 (문제가 뜨는 순간부터 감소)</td><td>${fmt(s.maxPoints)} → ${s.minCorrectPoints}</td></tr>
      <tr><td>오답</td><td>${s.wrongPoints}</td></tr>
      <tr><td>시간 초과 (${s.timeLimitMs / 1000}초)</td><td>${s.timeoutPoints}</td></tr>
    </table>
    <p>⏱ 문제가 화면에 나온 순간부터 <b>서버 시간</b>으로 재요. 앱을 나가도 시간은 멈추지 않아요.<br>
    🏆 주간 랭킹은 한 주(월~일) 동안 <b>내 최고 점수</b>로 매겨지고, 동점이면 더 빨리 푼 사람이 위예요.</p>
    <p><a href="/docs/SCORING.md" target="_blank" style="color:var(--green);font-weight:700">자세한 점수 규칙 문서 보기 →</a></p>
    <button class="btn-primary" id="ok" style="height:48px;font-size:16px">확인</button>`, (m, close) => { m.querySelector('#ok').onclick = close; });
}

// ---------- 라우터 ----------
const routes = {
  '': viewHome,
  play: viewPlay,
  ranking: viewRanking,
  results: viewResults,
  learn: viewLearn,
  wrong: viewWrong,
};
let cleanup = null;
async function route() {
  cleanup?.(); cleanup = null;
  secure(false);
  const [, name = '', arg] = location.hash.replace(/^#\/?/, '#').split(/[#/]/);
  const view = routes[name] || viewHome;
  const tab = name === 'ranking' ? 'ranking' : name === 'results' ? 'results' : 'home';
  $tabbar.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  $tabbar.hidden = name === 'play';
  window.scrollTo(0, 0);
  await loadConfig();
  if (!ensureUser()) { $app.innerHTML = ''; return; }
  try { await view(arg); } catch (e) { $app.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}
window.addEventListener('hashchange', route);

// ---------- 홈 ----------
async function viewHome() {
  $app.innerHTML = `
    <header class="topbar">
      <h1><img src="assets/hunmin.png" alt="">${esc(CONFIG.series.shortTitle)}</h1><div class="spacer"></div>
      <button class="icon-btn" id="rules" aria-label="점수 규칙">${icon('bell')}<span class="dot"></span></button>
      <button class="icon-btn" id="me" aria-label="닉네임 변경">${icon('user')}</button>
    </header>
    <section class="hero">
      <h2>${esc(store.nick)}님,<br>오늘도<br><span class="underline">한국사 도전!</span></h2>
      <div class="week-badge" id="week-badge" hidden></div>
      <img class="palace" src="assets/palace.png" alt="">
      <img class="king" src="assets/king.png" alt="">
    </section>
    <button class="btn-primary play-btn" id="play"><span class="play-ico">${icon('play')}</span>문제 풀기</button>
    <p class="play-sub">${CONFIG.series.questionCount}문제 · 문제당 ${CONFIG.scoring.timeLimitMs / 1000}초 · <a href="#" id="rules2">점수 규칙</a><span id="left"></span></p>
    <section class="tiles">
      <a class="tile card" href="#/ranking">${icon('trophyColor')}주간 랭킹</a>
      <a class="tile card" href="#/results">${icon('barsColor')}내 결과 보기</a>
      <a class="tile card" href="#/learn">${icon('bookColor')}학습 모드</a>
      <a class="tile card" href="#/wrong">${icon('starColor')}오답 노트</a>
    </section>`;
  $app.querySelector('#play').onclick = () => { location.hash = '#/play'; };
  $app.querySelector('#rules').onclick = showRules;
  $app.querySelector('#rules2').onclick = (e) => { e.preventDefault(); showRules(); };
  $app.querySelector('#me').onclick = editNickname;
  api('ranking', { which: 'this' }).then((r) => {
    const b = $app.querySelector('#week-badge');
    if (!b) return;
    b.hidden = false;
    b.innerHTML = r.me ? `${icon('trophy').replace('<svg', '<svg width="16" height="16"')} 이번 주 ${fmt(r.me.rank)}위 · ${fmt(r.me.score)}점` : `이번 주 참가자 ${fmt(r.participants)}명 · 첫 기록에 도전!`;
  }).catch(() => {});
  if (CONFIG.playsLeftToday != null) $app.querySelector('#left').textContent = ` · 오늘 남은 도전 ${CONFIG.playsLeftToday}회`;
}

// ---------- 캡처 방지 (보조 수단) ----------
const sec_ = { on: false, lost: 0 };
function secure(on) {
  sec_.on = on;
  document.body.classList.toggle('secure', on);
  if (!on) $shield.hidden = true;
}
function hideScreen() {
  if (!sec_.on) return;
  if ($shield.hidden) sec_.lost++;
  $shield.hidden = false;
}
window.addEventListener('blur', hideScreen);
document.addEventListener('visibilitychange', () => { if (document.hidden) hideScreen(); });
window.addEventListener('pagehide', hideScreen);
document.addEventListener('keydown', (e) => {
  if (!sec_.on) return;
  // PrintScreen / macOS ⌘+Shift(+3/4/5) / Win+Shift+S
  if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey) || (e.shiftKey && e.key === 'Meta') || (e.metaKey && e.key === 'Shift')) {
    hideScreen();
    try { navigator.clipboard?.writeText(''); } catch {}
  }
  if ((e.ctrlKey || e.metaKey) && ['c', 'p', 's', 'a'].includes(e.key.toLowerCase())) e.preventDefault();
});
document.addEventListener('keyup', (e) => {
  if (sec_.on && e.key === 'PrintScreen') { hideScreen(); try { navigator.clipboard?.writeText(''); } catch {} }
});
['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach((ev) =>
  document.addEventListener(ev, (e) => { if (sec_.on) e.preventDefault(); }));
document.getElementById('shield-back').onclick = () => { $shield.hidden = true; };
window.addEventListener('focus', () => { /* 사용자가 직접 '돌아가기'를 눌러야 해제 */ });

function watermarkUrl(text) {
  const t = esc(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="110"><text x="10" y="60" transform="rotate(-20 90 55)" font-family="sans-serif" font-size="16" font-weight="700" fill="#1F2A24">${t} · ${t}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

// ---------- 문제 풀기 ----------
async function viewPlay() {
  const runId = CONFIG.me?.currentRunId;
  if (runId) {
    // 진행 중인 판 이어하기 (시간은 계속 흘렀음)
    try {
      const c = await api('currentQuestion', { runId });
      if (!c.done) return playLoop(runId, c);
    } catch {}
  }
  const s = CONFIG.scoring;
  $app.innerHTML = `
    <div class="quiz-head"><a class="icon-btn back-btn" href="#/">${icon('back')}</a><div></div><div></div></div>
    <div class="ready">
      <img src="assets/king_book.png" alt="">
      <h2>준비됐나요?</h2>
      <ul>
        <li><b>${CONFIG.series.questionCount}문제</b>, 문제당 <b>${s.timeLimitMs / 1000}초</b> 안에 풀어요.</li>
        <li>빨리 맞힐수록 점수가 높아요. (최고 <b>${fmt(s.maxPoints)}점</b>)</li>
        <li>틀리거나 시간이 지나면 <b>0점</b>이에요.</li>
        <li>문제가 나온 순간부터 시간이 흐르고, <b>화면을 나가도 멈추지 않아요.</b></li>
      </ul>
      <button class="btn-primary" id="go" style="margin-top:20px">시작!</button>
    </div>`;
  $app.querySelector('#go').onclick = async (e) => {
    e.target.disabled = true;
    try {
      const r = await api('startRun');
      CONFIG.me.currentRunId = r.runId;
      for (const n of [3, 2, 1]) {
        $app.innerHTML = `<div class="countdown">${n}</div>`;
        await new Promise((res) => setTimeout(res, 700));
      }
      const c = await api('currentQuestion', { runId: r.runId });
      playLoop(r.runId, c);
    } catch (err) { toast(err.message); e.target.disabled = false; }
  };
}

function playLoop(runId, cur) {
  let timer = null;
  let answered = false;
  let lastHandledSeq = 0;
  cleanup = () => { cancelAnimationFrame(timer); secure(false); };

  const leave = () => {
    modal(`<h3>그만둘까요?</h3><p>지금 나가도 <b>시간은 계속 흘러요.</b><br>30분 안에 다시 들어오면 이어서 풀 수 있지만, 지난 문제는 시간 초과가 될 수 있어요.</p>
      <div class="row"><button class="btn-ghost" id="stay">계속 풀기</button><button class="btn-primary" id="go" style="height:48px;font-size:16px">나가기</button></div>`,
    (m, close) => { m.querySelector('#stay').onclick = close; m.querySelector('#go').onclick = () => { close(); location.hash = '#/'; }; });
  };

  function render(c) {
    if (c.done) return finish(runId);
    if (c.lastTimeout && c.lastTimeout !== lastHandledSeq) toast(`${c.lastTimeout}번 문제는 시간이 지나 0점 처리됐어요`);
    answered = false;
    sec_.lost = 0;
    const q = c.question;
    const t0 = performance.now() - q.elapsedMs;
    const longOpt = q.options.some((o) => [...o].length > 8);
    $app.innerHTML = `
      <div class="quiz-head">
        <button class="icon-btn back-btn" id="leave" aria-label="나가기">${icon('back')}</button>
        <div class="count">${q.seq} / ${c.total}</div>
        <div class="timer-chip" id="timer">${icon('clock')}<span>00:${String(Math.ceil((q.timeLimitMs - q.elapsedMs) / 1000)).padStart(2, '0')}</span></div>
      </div>
      <div class="progress"><div style="width:${((q.seq - 1) / c.total) * 100}%"></div></div>
      <div class="timebar"><div id="tbar"></div></div>
      <section class="q-area">
        <div class="watermark" style="background-image:${watermarkUrl(store.nick)}"></div>
        <span class="chip">${esc(q.era)}${q.period ? ' · ' + esc(q.period) : ''}</span>
        ${questionHtml(q.question)}
        <div class="q-illust">
          <div class="q-potential">획득 가능 점수<b id="pot">${fmt(CONFIG.scoring.maxPoints)}</b></div>
          <img src="assets/king_book.png" alt="">
        </div>
      </section>
      <section class="options" id="opts">
        ${q.options.map((o, i) => `<button class="option ${longOpt ? 'long' : ''}" data-i="${i}">${esc(o)}</button>`).join('')}
      </section>
      <div id="after"></div>`;
    secure(true);
    $app.querySelector('#leave').onclick = leave;

    const $timer = $app.querySelector('#timer');
    const $tsec = $timer.querySelector('span');
    const $pot = $app.querySelector('#pot');
    const $tbar = $app.querySelector('#tbar');
    const limit = q.timeLimitMs;
    const tick = () => {
      if (answered) return;
      const el = performance.now() - t0;
      const left = Math.max(0, limit - el);
      $tsec.textContent = '00:' + String(Math.ceil(left / 1000)).padStart(2, '0');
      $timer.className = 'timer-chip' + (left < 5000 ? ' danger' : left < 10000 ? ' warn' : '');
      $pot.textContent = fmt(potentialPoints(el, q.readWindowMs));
      $tbar.style.width = (left / limit) * 100 + '%';
      if (left <= 0) return submit(null);
      timer = requestAnimationFrame(tick);
    };
    tick();

    async function submit(index) {
      if (answered) return;
      answered = true;
      cancelAnimationFrame(timer);
      const btns = [...$app.querySelectorAll('.option')];
      btns.forEach((b) => (b.disabled = true));
      let r;
      try {
        r = await api('submitAnswer', { runId, seq: q.seq, index, focusLost: sec_.lost });
      } catch (e) {
        if (e.code === 'functions/already-exists' || e.code === 'functions/failed-precondition') { const n = await api('currentQuestion', { runId }); return render(n); }
        toast(e.message); answered = false; btns.forEach((b) => (b.disabled = false)); tick(); return;
      }
      lastHandledSeq = q.seq;
      secure(false);
      btns.forEach((b, i) => {
        if (i === r.correctIndex) { b.classList.add('correct'); b.insertAdjacentHTML('beforeend', `<span class="mark">${icon('check')}</span>`); }
        else if (i === index) { b.classList.add('wrong'); b.insertAdjacentHTML('beforeend', `<span class="mark">${icon('x')}</span>`); }
        else b.classList.add('dim');
      });
      $app.querySelector('.progress > div').style.width = (q.seq / c.total) * 100 + '%';
      const timeout = r.status === 'TIMEOUT';
      $app.querySelector('#after').innerHTML = `
        <div class="feedback ${r.isCorrect ? 'ok' : 'no'}">
          <div class="pts">${r.isCorrect ? '+' + fmt(r.points) : timeout ? '시간 초과' : '오답'}</div>
          <div><span class="label">${r.isCorrect ? `정답! ${sec(r.elapsedMs)}` : timeout ? '0점' : '0점'}</span> · 누적 ${fmt(r.totalScore)}점
          ${r.explanation ? `<p>${esc(r.explanation.replace(/\*\*/g, ''))}</p>` : ''}</div>
        </div>
        <button class="btn-primary next-btn" id="next">${r.done ? '결과 보기' : '다음 문제'} ${icon('chev').replace('<svg', '<svg width="20" height="20"')}</button>`;
      $app.querySelector('#next').onclick = async (e) => {
        e.currentTarget.disabled = true;
        if (r.done) return finish(runId);
        try { render(await api('currentQuestion', { runId })); } catch (err) { toast(err.message); e.currentTarget.disabled = false; }
      };
    }
    $app.querySelector('#opts').addEventListener('click', (e) => {
      const b = e.target.closest('.option');
      if (b && !b.disabled) submit(Number(b.dataset.i));
    });
  }
  render(cur);
}

async function finish(runId) {
  if (CONFIG.me) CONFIG.me.currentRunId = null;
  secure(false);
  const [d, rk] = await Promise.all([api('runDetail', { runId }), api('ranking', { which: 'this' }).catch(() => null)]);
  const s = CONFIG.scoring;
  $app.innerHTML = `
    <div class="finish">
      <img class="crown" src="assets/crown.png" alt="">
      <div class="big">${fmt(d.totalScore)}<small>점</small></div>
      <div class="sub">정답 ${d.correctCount} / ${d.questionCount} · 총 ${sec(d.totalTimeMs)}</div>
      ${rk?.me ? `<div class="rank-note">이번 주 내 순위 ${fmt(rk.me.rank)}위 (최고 ${fmt(rk.me.score)}점)</div>` : ''}
      <div class="actions">
        <button class="btn-primary" id="again">다시 도전</button>
        <a class="btn-ghost" style="display:grid;place-items:center" href="#/results/${d.id}">풀이 결과 상세</a>
        <a class="btn-ghost" style="display:grid;place-items:center" href="#/ranking">주간 랭킹 보기</a>
      </div>
      <p class="muted" style="font-size:12px;margin-top:20px">만점 ${fmt(s.maxPoints * d.questionCount)}점</p>
    </div>`;
  $tabbar.hidden = false;
  $app.querySelector('#again').onclick = () => { location.hash = '#/play'; route(); };
}

// ---------- 랭킹 ----------
async function viewRanking() {
  let which = 'this';
  $app.innerHTML = `
    <header class="topbar"><h1><img src="assets/trophy.png" alt="">주간 랭킹</h1></header>
    <div class="seg"><button data-w="this" class="on">이번 주</button><button data-w="last">지난 주</button></div>
    <div id="rk"></div>`;
  const seg = $app.querySelector('.seg');
  seg.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    which = b.dataset.w;
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    load();
  };
  async function load() {
    const box = $app.querySelector('#rk');
    box.innerHTML = '<div class="empty">불러오는 중…</div>';
    const r = await api('ranking', { which });
    if (!r.list.length) {
      box.innerHTML = `<div class="empty"><img src="assets/crown.png" alt="">${which === 'last' ? '지난 주 기록이 없어요.' : '아직 이번 주 기록이 없어요.<br>첫 번째 1위에 도전해 보세요!'}</div>`;
      return;
    }
    const [a, b, c] = r.list;
    const pod = (p, n, cls) => p ? `<div class="pod ${cls}">
        <span class="medal" style="background:${n === 2 ? '#A8B4BD' : '#F29A4A'}">${n === 1 ? icon('crown') : n}</span>
        ${avatar(p.nickname)}<div class="nick">${esc(p.nickname)}</div><div class="score">${fmt(p.score)}</div></div>` : '<div></div>';
    box.innerHTML = `
      <section class="podium">${pod(b, 2, '')}${pod(a, 1, 'first')}${pod(c, 3, '')}</section>
      ${r.list.length > 3 ? `<section class="card rank-list">${r.list.slice(3).map((p) => `
        <div class="rank-row ${p.me ? 'me' : ''}"><span class="n">${p.rank}</span><span>${esc(p.nickname)}</span><span class="s">${fmt(p.score)}</span></div>`).join('')}</section>` : ''}
      <p class="week-note">${esc(r.week)} · 참가 ${fmt(r.participants)}명 · 동점이면 총 소요시간이 짧은 순</p>
      ${r.me ? `<div class="my-rank"><span>내 순위 ${fmt(r.me.rank)}위</span><b>${fmt(r.me.score)}점</b></div>` : which === 'this' ? `<a class="my-rank" href="#/play"><span>아직 이번 주 기록이 없어요</span><b>도전 →</b></a>` : ''}`;
  }
  await load();
}

// ---------- 내 결과 ----------
async function viewResults(id) {
  if (id) return viewResultDetail(id);
  const r = await api('myRuns');
  const acc = r.accuracy;
  $app.innerHTML = `
    <header class="topbar"><h1>${icon('barsColor').replace('<svg', '<svg width="30" height="30"')}내 결과 보기</h1></header>
    <section class="stat-scroll">
      <div><div class="k">총 풀이</div><div class="v">${fmt(r.total)}<small>회</small></div></div>
      <div><div class="k">평균 점수</div><div class="v">${fmt(r.avgScore)}</div></div>
    </section>
    <section class="card acc-card">
      <div><div class="k">평균 정답률</div><div class="v">${acc}%</div></div>
      <div class="donut" style="background:conic-gradient(var(--green) ${acc * 3.6}deg, #E3EBE5 0)"></div>
      <img class="tower" src="assets/cheomseongdae.png" alt="">
    </section>
    <h2 class="sec-title">최근 풀이 기록</h2>
    ${r.recent.length ? `<section class="card rec-list">${r.recent.map((x) => `
      <a class="rec-row" href="#/results/${x.id}"><span>${kdate(x.finished_at)}</span><span class="s">${fmt(x.total_score)}점</span>${icon('chev')}</a>`).join('')}</section>`
      : `<div class="empty"><img src="assets/hunmin.png" alt="">아직 풀이 기록이 없어요.<br><a href="#/play" style="color:var(--green);font-weight:700">첫 도전 시작하기 →</a></div>`}
    ${r.total ? `<p class="week-note">최고 점수 ${fmt(r.bestScore)}점</p>` : ''}`;
}

async function viewResultDetail(id) {
  const d = await api('runDetail', { runId: id });
  const wrong = d.questions.filter((q) => !q.isCorrect).length;
  $app.innerHTML = `
    <header class="topbar center"><a class="icon-btn back-btn" href="#/results">${icon('back')}</a><span class="title">풀이 결과 상세</span><img src="assets/crown.png" alt="" style="width:56px;margin:-4px -6px 0 0"></header>
    <section class="card detail-head">
      <div class="date">${kdate(d.finishedAt || d.startedAt, true)}</div>
      <div class="row"><span class="score">${fmt(d.totalScore)}점</span>
        <span class="cnt">정답 <b class="ok">${d.correctCount}</b> &nbsp;|&nbsp; 오답 <b class="no">${wrong}</b></span></div>
      <div class="meta">총 소요시간 ${sec(d.totalTimeMs)}${d.status !== 'FINISHED' ? ' · 완료하지 않은 판' : ''}</div>
    </section>
    ${d.questions.map((q) => `
      <section class="card dq">
        <div class="dq-top"><h3>${q.seq}번 문제</h3>
          ${q.isCorrect ? `<span class="badge ok">${icon('checkCircle')}정답</span>` : q.status === 'TIMEOUT' ? `<span class="badge to">⏱ 시간초과</span>` : `<span class="badge no">${icon('xCircle')}오답</span>`}</div>
        <p class="q">${esc(q.question)}</p>
        <div class="opts">${q.options.map((o, i) => `<div class="o ${i === q.correctIndex ? 'correct' : i === q.chosenIndex ? 'wrong' : ''}">${esc(o)}</div>`).join('')}</div>
        <div class="explain"><div class="t">${icon('book')}해설</div><p>${esc((q.explanation || '').replace(/\*\*/g, ''))}</p><img src="assets/king_write.png" alt=""></div>
        <div class="time">${esc(q.era)} · ${sec(q.elapsedMs || 0)} · <b>${fmt(q.points)}점</b></div>
      </section>`).join('')}`;
}

// ---------- 학습 모드 ----------
async function viewLearn() {
  const eras = await api('learnEras');
  const total = eras.reduce((a, e) => a + e.count, 0);
  $app.innerHTML = `
    <header class="topbar center"><a class="icon-btn back-btn" href="#/">${icon('back')}</a><span class="title">학습 모드</span><span style="width:40px"></span></header>
    <p class="muted" style="margin:0">시간 제한 없이 시대별로 풀어보고 해설을 확인해요. 랭킹에는 반영되지 않아요.</p>
    <div class="era-grid">
      <button class="card era-btn all" data-era="">전체 시대 랜덤<small>${fmt(total)}문항</small></button>
      ${eras.map((e) => `<button class="card era-btn" data-era="${esc(e.era)}">${esc(e.era)}<small>${fmt(e.count)}문항</small></button>`).join('')}
    </div>`;
  $app.querySelector('.era-grid').onclick = (e) => {
    const b = e.target.closest('.era-btn');
    if (b) learnSession(b.dataset.era);
  };
}

async function learnSession(era) {
  const list = await api('learn', { era: era || null, limit: 10 });
  let i = 0, correct = 0;
  const show = () => {
    if (i >= list.length) {
      $app.innerHTML = `<div class="finish"><img class="crown" src="assets/king.png" alt=""><div class="big">${correct}<small> / ${list.length}</small></div>
        <div class="sub">${esc(era || '전체 시대')} 학습 완료!</div>
        <div class="actions"><button class="btn-primary" id="more">한 세트 더</button><a class="btn-ghost" style="display:grid;place-items:center" href="#/learn">다른 시대 고르기</a></div></div>`;
      $app.querySelector('#more').onclick = () => learnSession(era);
      return;
    }
    const q = list[i];
    const opts = [q.option_1, q.option_2, q.option_3, q.option_4];
    $app.innerHTML = `
      <div class="quiz-head"><a class="icon-btn back-btn" href="#/learn">${icon('back')}</a><div class="count">${i + 1} / ${list.length}</div><span class="chip">학습</span></div>
      <div class="progress"><div style="width:${(i / list.length) * 100}%"></div></div>
      <section class="q-area" style="min-height:0">
        <span class="chip">${esc(q.era)}${q.period ? ' · ' + esc(q.period) : ''}</span>
        ${questionHtml(q.question)}
      </section>
      <section class="options" style="margin-top:20px">${opts.map((o, k) => `<button class="option ${opts.some((x) => [...x].length > 8) ? 'long' : ''}" data-k="${k + 1}">${esc(o)}</button>`).join('')}</section>
      <div id="after"></div>`;
    $app.querySelector('.options').onclick = (e) => {
      const b = e.target.closest('.option');
      if (!b || b.disabled) return;
      const k = Number(b.dataset.k);
      const ok = k === q.correct_option;
      if (ok) correct++;
      $app.querySelectorAll('.option').forEach((x) => {
        x.disabled = true;
        const kk = Number(x.dataset.k);
        if (kk === q.correct_option) { x.classList.add('correct'); x.insertAdjacentHTML('beforeend', `<span class="mark">${icon('check')}</span>`); }
        else if (kk === k) { x.classList.add('wrong'); x.insertAdjacentHTML('beforeend', `<span class="mark">${icon('x')}</span>`); }
        else x.classList.add('dim');
      });
      $app.querySelector('#after').innerHTML = `
        <div class="explain" style="margin-top:16px"><div class="t">${icon('book')}${ok ? '정답이에요!' : '아쉬워요'} · 해설</div><p>${esc((q.explanation || '').replace(/\*\*/g, ''))}</p><img src="assets/king_write.png" alt=""></div>
        <button class="btn-primary next-btn" id="next">${i + 1 < list.length ? '다음 문제' : '결과 보기'}</button>`;
      $app.querySelector('#next').onclick = () => { i++; show(); window.scrollTo(0, 0); };
    };
  };
  show();
}

// ---------- 오답 노트 ----------
async function viewWrong() {
  const list = await api('wrongNotes');
  let filter = 'todo';
  const render = () => {
    const items = list.filter((n) => filter === 'all' || !n.resolved);
    $app.querySelector('#notes').innerHTML = items.length ? items.map((n) => {
      const opts = [n.option_1, n.option_2, n.option_3, n.option_4];
      return `<article class="card note">
        <div class="head"><span class="chip" style="height:24px;font-size:12px">${esc(n.era)}</span>틀린 횟수 ${n.wrong_count} · ${kdate(n.last_at)}${n.resolved ? ' · <b style="color:var(--green)">다시 맞힘 ✓</b>' : ''}</div>
        <p class="q">${esc(n.question)}</p>
        <div class="ans">
          <div class="dq" style="padding:0;margin-top:8px"><div class="opts">${opts.map((o, k) => `<div class="o ${k + 1 === n.correct_option ? 'correct' : ''}">${esc(o)}</div>`).join('')}</div></div>
          <div class="explain"><div class="t">${icon('book')}해설</div><p>${esc((n.explanation || '').replace(/\*\*/g, ''))}</p><img src="assets/king_write.png" alt=""></div>
        </div>
        <button class="toggle">정답과 해설 보기</button>
      </article>`;
    }).join('') : `<div class="empty"><img src="assets/turtleship.png" alt="">${filter === 'todo' ? '복습할 오답이 없어요. 훌륭해요!' : '아직 틀린 문제가 없어요.'}</div>`;
  };
  $app.innerHTML = `
    <header class="topbar center"><a class="icon-btn back-btn" href="#/">${icon('back')}</a><span class="title">오답 노트</span><span style="width:40px"></span></header>
    <div class="filter-row"><button data-f="todo" class="on">복습 필요</button><button data-f="all">전체 (${list.length})</button></div>
    <div id="notes"></div>`;
  $app.querySelector('.filter-row').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filter = b.dataset.f;
    $app.querySelectorAll('.filter-row button').forEach((x) => x.classList.toggle('on', x === b));
    render();
  };
  $app.querySelector('#notes').onclick = (e) => {
    const t = e.target.closest('.toggle');
    if (!t) return;
    const card = t.closest('.note');
    card.classList.toggle('open');
    t.textContent = card.classList.contains('open') ? '접기' : '정답과 해설 보기';
  };
  render();
}

route();
