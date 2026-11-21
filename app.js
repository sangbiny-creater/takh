// 타임어택 한국사 — 플레이어 웹앱 (프레임워크 없는 SPA)
import { call, currentUser, redirectResult, loginGoogle, loginKakao, loginGuest, loginEmail, signupEmail, resetPassword, logout, deleteMe, authErrorText, providerOf, KAKAO_ON } from './firebase.js';
import { art, eraArt, avatar } from './art.js';

const $app = document.getElementById('app');
const $tabbar = document.getElementById('tabbar');
const $shield = document.getElementById('shield');

// ---------- 아이콘 ----------
const ICONS = {
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
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


// ---------- 상태 · 서버 ----------
const store = { nick: '', user: null };
async function api(name, data) {
  try { return await call(name, data); }
  catch (e) { if (e.code === 'functions/unauthenticated') { store.user = null; location.hash = '#/login'; } throw e; }
}
let CONFIG = null;
async function loadConfig(force = false) {
  if (!CONFIG || force) {
    CONFIG = await api('bootstrap');
    store.nick = CONFIG.me?.nickname || '';
  }
  return CONFIG;
}
// 친구가 보낸 자랑하기 링크 (?from=점수&by=이름)
const FRIEND = (() => {
  const q = new URLSearchParams(location.search);
  const from = Number(q.get('from')) || 0, by = (q.get('by') || '').slice(0, 10);
  if (from) { try { sessionStorage.setItem('takh_friend', JSON.stringify({ from, by })); } catch { /* ignore */ } history.replaceState(null, '', location.pathname + location.hash); }
  try { return JSON.parse(sessionStorage.getItem('takh_friend') || 'null'); } catch { return null; }
})();

// ---------- 광고 (웹: 빈 광고 자리 · 앱: AdMob — lib/native.js) ----------
const Native = window.Native || { on: false };
function adBarHtml() { return `<div class="ad-bar" aria-label="광고">${Native.on ? '' : '<span>광고 영역</span>'}</div>`; }
function bannerAd(show) { if (Native.on) Native.banner(show); }
async function rewardedAd() {
  if (Native.on) {
    const r = await Native.rewarded();
    if (r === 'none') { toast('지금은 광고를 불러오지 못해서 그냥 진행할게요', 3000); return true; }
    if (!r) toast('광고를 끝까지 보면 다시 도전할 수 있어요');
    return !!r;
  }
  return new Promise((done) => { // 웹: 가짜 광고 3초 (다운힐 러너와 같음)
    modal(`<div class="ad-fake"><div class="ad-fake-box">광고</div><p>광고가 끝나면 다시 도전이 시작돼요</p><b id="ad-n">3</b></div>`, (m, close, back) => {
      back.dataset.locked = '1'; let n = 3;
      const t = setInterval(() => { n--; const el = m.querySelector('#ad-n'); if (el) el.textContent = n; if (n <= 0) { clearInterval(t); close(); done(true); } }, 1000);
    });
  });
}

// ---------- 자랑하기: 공유 창(카카오톡·문자 등) → 안 되면 문자·링크 복사 (다운힐 러너와 같음) ----------
function shareData(score, correct) {
  const nick = store.nick || '';
  const url = `${location.origin}${location.pathname}?from=${score}${nick ? '&by=' + encodeURIComponent(nick) : ''}`;
  const text = `[타임어택 한국사] ${nick ? nick + '님이 ' : ''}한국사 10문제를 ${fmt(score)}점${correct != null ? `(정답 ${correct}/10)` : ''}으로 풀었어요! 나를 이겨 볼래?`;
  return { title: '타임어택 한국사', text, url };
}
async function share(score, correct) {
  const d = shareData(score, correct);
  if (Native.on && Native.share && (await Native.share(d))) return;
  if (navigator.share) { try { await navigator.share(d); return; } catch (e) { if (e?.name === 'AbortError') return; } }
  const body = encodeURIComponent(`${d.text}\n${d.url}`);
  const sms = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? `sms:&body=${body}` : `sms:?body=${body}`;
  modal(`<h3>자랑하기</h3><p class="share-text">${esc(d.text)}<br><span class="muted">${esc(d.url)}</span></p>
    <div class="share-btns"><a class="btn-primary" href="${sms}">문자로 보내기</a><button class="btn-ghost" id="copy">링크 복사 (카카오톡에 붙여 넣기)</button></div>
    <button class="btn-text" id="x">닫기</button>`, (m, close) => {
    m.querySelector('#x').onclick = close;
    m.querySelector('#copy').onclick = async () => {
      try { await navigator.clipboard.writeText(`${d.text}\n${d.url}`); toast('복사했어요! 카카오톡에 붙여 넣어 보내 보세요'); } catch { toast('복사하지 못했어요'); }
    };
  });
}

// ---------- 라우터 ----------
const PUBLIC = new Set(['login', 'email', 'signup', 'terms', 'doc']);
const routes = { '': viewHome, play: viewPlay, ranking: viewRanking, results: viewResults, wrong: viewWrong, settings: viewSettings, account: viewAccount, doc: viewDoc, login: viewLogin, email: viewEmail, signup: viewSignup, terms: viewTerms, nickname: viewNickname };
const TABS = { '': 'home', ranking: 'ranking', results: 'results', wrong: 'wrong' };
let cleanup = null;
async function route() {
  cleanup?.(); cleanup = null;
  secure(false);
  bannerAd(false);
  const [, name = '', arg] = location.hash.replace(/^#\/?/, '#').split(/[#/]/);
  const view = routes[name] ? name : '';
  $tabbar.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.tab === TABS[view]));
  setTabbar(view in TABS);
  window.scrollTo(0, 0);
  if (!PUBLIC.has(view)) {
    if (!store.user) { location.hash = '#/login'; return; }
    try { await loadConfig(); } catch (e) { $app.innerHTML = `<div class="screen"><div class="empty">${esc(e.message)}<button class="btn-ghost" onclick="location.reload()" style="margin-top:12px">다시 시도</button></div></div>`; return; }
    if (CONFIG.me?.blocked) { $app.innerHTML = `<div class="screen"><div class="empty">${art('mascotWrong')}이용이 제한된 계정이에요.</div></div>`; setTabbar(false); return; }
    if (!CONFIG.me?.agreed) { if (view !== 'terms') { location.hash = '#/terms'; return; } }
    else if (!CONFIG.me?.nickname && view !== 'nickname') { location.hash = '#/nickname'; return; }
  }
  try { await routes[view](arg); } catch (e) { $app.innerHTML = `<div class="screen"><div class="empty">${esc(e.message)}</div></div>`; }
}
window.addEventListener('hashchange', route);
function setTabbar(on) { $tabbar.hidden = !on; document.body.classList.toggle('has-tab', on); }

// ---------- 로그인 (다운힐 러너와 같은 흐름: 로그인 → 약관 동의 → 닉네임) ----------
async function afterLogin(u, msg) {
  if (!u) return;
  store.user = u; CONFIG = null;
  if (msg) toast(msg);
  location.hash = '#/';
  route();
}
function viewLogin() {
  if (store.user) { location.hash = '#/'; return; }
  $app.innerHTML = `
    <div class="screen login">
      <div class="login-hero">${art('mascotHero', { cls: 'login-mascot' })}</div>
      <div class="login-title"><h1>타임어택 한국사</h1><p>10문제, 문제당 20초. 빠르고 정확하게!</p></div>
      <div class="login-btns">
        <button class="lbtn kakao" id="kakao"><b>K</b>카카오로 시작하기</button>
        <button class="lbtn google" id="google"><b>G</b>Google로 시작하기</button>
        <button class="lbtn email" id="email"><b>@</b>이메일로 시작하기</button>
        <button class="btn-text" id="guest">게스트로 시작하기</button>
      </div>
      <p class="login-note">로그인하면 다른 기기에서도 기록이 이어져요. 게스트 기록은 이 기기에만 남아요.</p>
    </div>`;
  const run = (fn, msg) => async (e) => {
    e.currentTarget.disabled = true;
    try { await afterLogin(await fn(), msg); } catch (err) { const t = authErrorText(err); if (t) toast(t, 3000); }
    e.currentTarget && (e.currentTarget.disabled = false);
  };
  $app.querySelector('#kakao').onclick = KAKAO_ON ? run(loginKakao, '카카오 계정으로 로그인했어요!') : () => toast('카카오 로그인은 준비 중이에요. 다른 방법으로 시작해 주세요');
  if (!KAKAO_ON) $app.querySelector('#kakao').classList.add('soon');
  $app.querySelector('#google').onclick = run(loginGoogle, '구글 계정으로 로그인했어요!');
  $app.querySelector('#guest').onclick = run(loginGuest, '게스트로 시작해요');
  $app.querySelector('#email').onclick = () => { location.hash = '#/email'; };
}
function viewEmail() {
  $app.innerHTML = `
    <div class="screen form-screen">
      <header class="topbar center"><a class="icon-btn back-btn" href="#/login">${icon('back')}</a><span class="title">이메일로 로그인</span><span style="width:40px"></span></header>
      <div class="form-card card">
        <input id="em" type="email" placeholder="이메일" autocomplete="email" />
        <input id="pw" type="password" placeholder="비밀번호" autocomplete="current-password" />
        <div class="err" id="err"></div>
        <button class="btn-primary" id="go">로그인</button>
        <div class="form-links"><a href="#/signup">가입하기</a><button class="btn-text" id="reset">비밀번호를 잊었어요</button></div>
      </div>
    </div>`;
  const $ = (id) => $app.querySelector('#' + id);
  const go = async () => {
    const em = $('em').value.trim().toLowerCase(), pw = $('pw').value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('err').textContent = '이메일을 다시 확인해 주세요'; return; }
    if (!pw) { $('err').textContent = '비밀번호를 넣어 주세요'; return; }
    $('go').disabled = true; $('err').textContent = '';
    try { await afterLogin(await loginEmail(em, pw), '로그인했어요!'); } catch (e) { $('err').textContent = authErrorText(e); $('go').disabled = false; }
  };
  $('go').onclick = go;
  $('pw').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  $('reset').onclick = async () => {
    const em = $('em').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('err').textContent = '비밀번호를 바꿀 이메일을 위에 적어 주세요'; return; }
    try { await resetPassword(em); $('err').textContent = ''; toast('비밀번호를 바꾸는 메일을 보냈어요', 3200); } catch (e) { $('err').textContent = authErrorText(e); }
  };
}
function viewSignup() {
  $app.innerHTML = `
    <div class="screen form-screen">
      <header class="topbar center"><a class="icon-btn back-btn" href="#/email">${icon('back')}</a><span class="title">이메일로 가입하기</span><span style="width:40px"></span></header>
      <div class="form-card card">
        <input id="em" type="email" placeholder="이메일" autocomplete="email" />
        <input id="pw" type="password" placeholder="비밀번호 (6자 이상)" autocomplete="new-password" />
        <input id="pw2" type="password" placeholder="비밀번호 한 번 더" autocomplete="new-password" />
        <div class="err" id="err"></div>
        <button class="btn-primary" id="go">가입하기</button>
      </div>
    </div>`;
  const $ = (id) => $app.querySelector('#' + id);
  $('go').onclick = async () => {
    const em = $('em').value.trim().toLowerCase(), pw = $('pw').value, pw2 = $('pw2').value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('err').textContent = '이메일을 다시 확인해 주세요'; return; }
    if (pw.length < 6) { $('err').textContent = '비밀번호는 6자 이상으로 정해 주세요'; return; }
    if (pw !== pw2) { $('err').textContent = '두 비밀번호가 달라요'; return; }
    $('go').disabled = true; $('err').textContent = '';
    try { await afterLogin(await signupEmail(em, pw), '가입했어요! 확인 메일을 보냈어요'); } catch (e) { $('err').textContent = authErrorText(e); $('go').disabled = false; }
  };
}
const COLLECT = '· 모으는 것: 로그인 계정 정보(이메일, 계정 식별자), 닉네임, 플레이 기록(점수·정답 여부·풀이 시간), 앱에서는 광고 식별자\n· 쓰는 곳: 회원 확인, 주간 랭킹, 오답 노트, 부정 이용 방지, 광고\n· 보관 기간: 계정을 삭제할 때까지 (법령에 따라 보관해야 하는 경우 그 기간)\n· 동의하지 않을 수 있지만, 동의하지 않으면 게임을 이용할 수 없어요.';
function viewTerms() {
  if (!store.user) { location.hash = '#/login'; return; }
  $app.innerHTML = `
    <div class="screen form-screen terms">
      <header class="topbar center"><span style="width:40px"></span><span class="title">약관 동의</span><span style="width:40px"></span></header>
      <div class="terms-hero">${art('mascotBook', { cls: 'terms-mascot' })}<p>시작하기 전에 아래 내용에 동의해 주세요.</p></div>
      <div class="form-card card">
        <label class="ck"><input type="checkbox" id="ck1"><span><b>[필수]</b> 개인정보 수집·이용 동의</span><button class="btn-text" id="more1">보기</button></label>
        <pre class="collect" id="collect" hidden>${esc(COLLECT)}</pre>
        <label class="ck"><input type="checkbox" id="ck2"><span><b>[필수]</b> 이용약관 동의</span><a class="btn-text" href="#/doc/terms">보기</a></label>
        <div class="ck plain"><span>개인정보 처리방침</span><a class="btn-text" href="#/doc/privacy">보기</a></div>
        <div class="err" id="err"></div>
        <button class="btn-primary" id="go">동의하고 시작하기</button>
        <button class="btn-text" id="out">다른 계정으로 로그인</button>
      </div>
    </div>`;
  const $ = (id) => $app.querySelector('#' + id);
  $('more1').onclick = (e) => { e.preventDefault(); $('collect').hidden = !$('collect').hidden; };
  $('go').onclick = async () => {
    if (!$('ck1').checked || !$('ck2').checked) { $('err').textContent = '필수 항목에 모두 동의해 주세요'; return; }
    $('go').disabled = true;
    try { await api('agree'); await loadConfig(true); location.hash = '#/'; } catch (e) { $('err').textContent = e.message; $('go').disabled = false; }
  };
  $('out').onclick = async () => { await logout(); store.user = null; CONFIG = null; location.hash = '#/login'; };
}
function viewNickname() {
  $app.innerHTML = `
    <div class="screen form-screen">
      <header class="topbar center"><span style="width:40px"></span><span class="title">닉네임 만들기</span><span style="width:40px"></span></header>
      <div class="terms-hero">${art('mascotHero', { cls: 'terms-mascot' })}<p>랭킹에 보일 이름을 정해 주세요.<br>같은 이름은 하나만 쓸 수 있어요.</p></div>
      <div class="form-card card">
        <input id="nick" maxlength="10" placeholder="한글/영문/숫자 2~10자" autocomplete="off" />
        <div class="err" id="err"></div>
        <button class="btn-primary" id="go">시작하기</button>
      </div>
    </div>`;
  const input = $app.querySelector('#nick');
  const go = async () => {
    try { await api('setNickname', { nickname: input.value }); await loadConfig(true); location.hash = '#/'; }
    catch (e) { $app.querySelector('#err').textContent = e.message; }
  };
  $app.querySelector('#go').onclick = go;
  input.onkeydown = (e) => { if (e.key === 'Enter') go(); };
}

// ---------- 설정 (오른쪽 위 · 다운힐 러너와 같은 줄 모양) ----------
const PROVIDER_NAME = { guest: '게스트', google: '구글', kakao: '카카오', email: '이메일', other: '로그인' };
function viewSettings() {
  const kind = providerOf(store.user);
  $app.innerHTML = `
    <div class="screen settings">
      <header class="topbar center"><a class="icon-btn back-btn" href="#/">${icon('back')}</a><span class="title">설정</span><span style="width:40px"></span></header>
      <div class="set-list card">
        <a class="set-row" href="#/account"><span>계정</span><em>${PROVIDER_NAME[kind] || ''} · ${esc(store.nick)}</em>${icon('chev')}</a>
        <button class="set-row" id="nick"><span>닉네임 바꾸기</span><em>${esc(store.nick)}</em>${icon('chev')}</button>
        <button class="set-row" id="rules"><span>점수 규칙</span><em></em>${icon('chev')}</button>
        <a class="set-row" href="#/doc/terms"><span>이용약관</span><em></em>${icon('chev')}</a>
        <a class="set-row" href="#/doc/privacy"><span>개인정보 처리방침</span><em></em>${icon('chev')}</a>
        <div class="set-row static"><span>버전</span><em>1.0.0</em></div>
      </div>
      <p class="set-foot">BROWN CRAB · 타임어택 한국사</p>
    </div>`;
  $app.querySelector('#nick').onclick = editNickname;
  $app.querySelector('#rules').onclick = showRules;
}
function viewAccount() {
  const u = store.user, kind = providerOf(u);
  $app.innerHTML = `
    <div class="screen settings">
      <header class="topbar center"><a class="icon-btn back-btn" href="#/settings">${icon('back')}</a><span class="title">계정</span><span style="width:40px"></span></header>
      <div class="card account-card">
        ${art('mascotHero', { cls: 'account-mascot' })}
        <b>${esc(store.nick)}</b>
        <span>${kind === 'guest' ? '게스트로 하고 있어요.<br>계정을 연결하면 다른 기기에서도 이어서 할 수 있어요.' : `${PROVIDER_NAME[kind]} 계정${u?.email ? '<br>' + esc(u.email) : ''}`}</span>
      </div>
      ${kind === 'guest' ? `<div class="login-btns compact"><button class="lbtn kakao ${KAKAO_ON ? '' : 'soon'}" id="kakao"><b>K</b>카카오 계정 연결</button><button class="lbtn google" id="google"><b>G</b>Google 계정 연결</button></div>` : ''}
      <div class="account-actions"><button class="btn-ghost" id="out">로그아웃</button><button class="btn-text danger" id="del">계정 삭제</button></div>
    </div>`;
  const link = (fn) => async () => { try { const nu = await fn(); if (nu) { store.user = nu; toast('계정을 연결했어요! 기록은 그대로예요'); viewAccount(); } } catch (e) { const t = authErrorText(e); if (t) toast(t, 3000); } };
  $app.querySelector('#google')?.addEventListener('click', link(loginGoogle));
  $app.querySelector('#kakao')?.addEventListener('click', KAKAO_ON ? link(loginKakao) : () => toast('카카오 로그인은 준비 중이에요'));
  $app.querySelector('#out').onclick = async () => {
    if (kind === 'guest' && !confirm('게스트 기록과 닉네임은 다시 찾을 수 없어요. 로그아웃할까요?')) return;
    await logout(); store.user = null; CONFIG = null; toast('로그아웃했어요'); location.hash = '#/login';
  };
  $app.querySelector('#del').onclick = async () => {
    if (!confirm('계정을 지우면 닉네임과 기록이 모두 사라지고 되돌릴 수 없어요. 계정을 삭제할까요?')) return;
    try { await api('deleteAccount'); await deleteMe(); } catch (e) { toast(e.message || '계정을 지우지 못했어요', 3000); return; }
    store.user = null; CONFIG = null; toast('계정을 삭제했어요'); location.hash = '#/login';
  };
}
// 이용약관 · 개인정보 처리방침 (앱 안 화면, 뒤로 버튼으로 돌아옴)
const DOCS = { terms: ['이용약관', 'legal/terms.txt', null], privacy: ['개인정보 처리방침', 'https://brown-crab.com/privacy.html', 'main'] };
async function viewDoc(k) {
  const [title, url, sel] = DOCS[k] || DOCS.terms;
  $app.innerHTML = `
    <div class="screen doc">
      <header class="topbar center"><button class="icon-btn back-btn" onclick="history.back()">${icon('back')}</button><span class="title">${title}</span><span style="width:40px"></span></header>
      <div class="card doc-body" id="body">불러오는 중이에요…</div>
    </div>`;
  try {
    const t = await (await fetch(url)).text();
    let text = t;
    if (sel) { const el = new DOMParser().parseFromString(t, 'text/html').querySelector(sel); text = el ? el.innerText || el.textContent : ''; }
    $app.querySelector('#body').textContent = text.trim() || '글을 불러오지 못했어요.';
  } catch { $app.querySelector('#body').textContent = '글을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'; }
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


function potentialPoints(elapsed, windowMs) {
  const s = CONFIG.scoring;
  if (elapsed > s.timeLimitMs) return 0;
  const x = Math.min(1, Math.max(0, (elapsed - windowMs) / Math.max(1, s.timeLimitMs - windowMs)));
  return Math.round(s.minCorrectPoints + (s.maxPoints - s.minCorrectPoints) * Math.pow(1 - x, s.decayExponent));
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


// ---------- 홈 (임시 배치 — 최종 디자인은 GPT 시안으로 교체 예정) ----------
async function viewHome() {
  $app.innerHTML = `
    <div class="screen home">
      <header class="topbar">
        <h1>${art('logo', { cls: 'logo' })}${esc(CONFIG.series.shortTitle)}</h1><div class="spacer"></div>
        <a class="icon-btn" href="#/settings" aria-label="설정">${icon('gear')}</a>
      </header>
      <section class="hero">
        <div class="hero-text">
          <h2>${esc(store.nick)}님,<br>오늘도<br><span class="underline">한국사 도전!</span></h2>
          <div class="week-badge" id="week-badge" hidden></div>
        </div>
        ${art('homeScene', { cls: 'hero-scene' })}
        ${art('mascotHero', { cls: 'hero-mascot' })}
      </section>
      <button class="btn-primary play-btn" id="play"><span class="play-ico">${icon('play')}</span>문제 풀기</button>
      <p class="play-sub">${CONFIG.series.questionCount}문제 · 문제당 ${CONFIG.scoring.timeLimitMs / 1000}초 · <a href="#" id="rules">점수 규칙</a><span id="left"></span></p>
      <section class="tiles three">
        <a class="tile card" href="#/ranking">${art('iconTrophy', { cls: 'tile-ico' })}주간 랭킹</a>
        <a class="tile card" href="#/results">${art('iconChart', { cls: 'tile-ico' })}내 결과 보기</a>
        <a class="tile card" href="#/wrong">${art('iconStar', { cls: 'tile-ico' })}오답 노트</a>
      </section>
    </div>`;
  $app.querySelector('#play').onclick = () => { location.hash = '#/play'; };
  $app.querySelector('#rules').onclick = (e) => { e.preventDefault(); showRules(); };
  if (FRIEND) toast(`${FRIEND.by ? FRIEND.by + '님의 ' : ''}기록 ${fmt(FRIEND.from)}점에 도전해 보세요!`, 3200);
  api('ranking', { which: 'this' }).then((r) => {
    const b = $app.querySelector('#week-badge');
    if (!b) return;
    b.hidden = false;
    b.innerHTML = r.me ? `${icon('trophy').replace('<svg', '<svg width="14" height="14"')} 이번 주 ${fmt(r.me.rank)}위 · ${fmt(r.me.score)}점` : `이번 주 참가자 ${fmt(r.participants)}명`;
  }).catch(() => {});
  if (CONFIG.playsLeftToday != null) $app.querySelector('#left').textContent = ` · 오늘 남은 도전 ${CONFIG.playsLeftToday}회`;
}

// ---------- 문제 화면 (맨 위 광고 · 문제 카드 · 보기 4개 · 하단 버튼) ----------
//  원칙: 문제는 어떤 경우에도 스크롤 없이 다 보여야 함 → 글자 크기를 카드에 맞춰 자동으로 줄임. 그림은 카드 오른쪽 아래 작게, 글자와 겹치면 숨김.
function quizScreenHtml({ headLeft, headCenter, headRight, era, period, question, options, progress, watermark = false, footHtml = '' }) {
  const longOpt = options.some((o) => [...o].length > 8);
  return `
    <div class="screen quiz">
      ${adBarHtml()}
      <div class="quiz-head">${headLeft}<div class="count">${headCenter}</div>${headRight}</div>
      <div class="bars"><div class="progress"><div style="width:${progress}%"></div></div><div class="timebar"><div id="tbar"></div></div></div>
      <section class="q-card" id="q-card">
        ${watermark ? `<div class="watermark" style="background-image:${watermarkUrl(store.nick)}"></div>` : ''}
        <div class="q-card-art" id="q-art">${eraArt(era)}</div>
        <div class="q-card-main" id="q-main">
          <span class="chip">${esc(era)}${period ? ' · ' + esc(period) : ''}</span>
          ${questionHtml(question)}
        </div>
      </section>
      <section class="options" id="opts">
        ${options.map((o, i) => `<button class="option ${longOpt ? 'long' : ''}" data-i="${i}">${esc(o)}</button>`).join('')}
      </section>
      <div class="q-foot" id="foot">${footHtml}</div>
    </div>`;
}
/** 글자가 칸을 넘치지 않을 때까지 글자 크기를 줄임 (스크롤 금지) */
function fitText(box, sel, max, min) {
  const els = [...box.querySelectorAll(sel)];
  if (!els.length) return;
  let lo = min, hi = max, best = min;
  const set = (px) => els.forEach((el) => { el.style.fontSize = px + 'px'; });
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2; set(mid);
    if (box.scrollHeight <= box.clientHeight + 1) { best = mid; lo = mid; } else hi = mid;
  }
  set(Math.floor(best * 10) / 10);
}
function layoutQuestion() {
  const main = $app.querySelector('#q-main'), artEl = $app.querySelector('#q-art'), card = $app.querySelector('#q-card');
  if (!main || !card) return;
  const h = card.clientHeight;
  fitText(main, '.q-text', Math.min(30, Math.max(19, h * 0.115)), 13);
  // 그림: 글자 끝(마지막 줄 오른쪽 끝)과 겹치면 숨김
  if (artEl) {
    artEl.hidden = false;
    const a = artEl.getBoundingClientRect(), t = main.querySelector('.q-text');
    const range = document.createRange(); range.selectNodeContents(t);
    const overlap = [...range.getClientRects()].some((r) => r.right > a.left + 4 && r.bottom > a.top + 4);
    artEl.hidden = overlap;
  }
}
function showAnswer({ correctIndex, chosenIndex, isCorrect, timeout, title, sub, explanation }) {
  [...$app.querySelectorAll('.option')].forEach((b, i) => {
    b.disabled = true; b.classList.remove('picked');
    if (i === correctIndex) { b.classList.add('correct'); b.insertAdjacentHTML('beforeend', `<span class="mark">${icon('check')}</span>`); }
    else if (i === chosenIndex) { b.classList.add('wrong'); b.insertAdjacentHTML('beforeend', `<span class="mark">${icon('x')}</span>`); }
    else b.classList.add('dim');
  });
  const card = $app.querySelector('#q-card');
  card.classList.add(isCorrect ? 'is-ok' : 'is-no');
  card.innerHTML = `
    <div class="feedback ${isCorrect ? 'ok' : 'no'}">
      ${art(isCorrect ? 'mascotCorrect' : timeout ? 'mascotTimeout' : 'mascotWrong', { cls: 'fb-mascot' })}
      <div class="fb-body" id="fb-body">
        <b class="fb-title">${title}</b>${sub ? `<span class="fb-sub">${sub}</span>` : ''}
        ${explanation ? `<p class="fb-exp">${esc(explanation.replace(/\*\*/g, ''))}</p>` : ''}
      </div>
    </div>`;
  fitText($app.querySelector('#fb-body'), '.fb-exp', 15, 11);
}

// ---------- 문제 풀기 ----------
async function viewPlay() {
  const runId = CONFIG.me?.currentRunId;
  if (runId) {
    try { const c = await api('currentQuestion', { runId }); if (!c.done) return playLoop(runId, c); } catch { /* 새로 시작 */ }
  }
  const s = CONFIG.scoring;
  $app.innerHTML = `
    <div class="screen ready">
      <div class="quiz-head"><a class="icon-btn back-btn" href="#/">${icon('back')}</a><div class="count">준비</div><div style="width:40px"></div></div>
      <div class="ready-hero">
        ${art('mascotBook', { cls: 'ready-mascot' })}
        <div class="ready-title"><h2>준비됐나요?</h2><p>문제가 뜨는 순간부터 시간이 흘러요</p></div>
      </div>
      <div class="ready-grid">
        <div class="rcard"><b>${CONFIG.series.questionCount}문제</b><span>시대별로 골고루</span></div>
        <div class="rcard"><b>${s.timeLimitMs / 1000}초</b><span>문제당 제한시간</span></div>
        <div class="rcard"><b>최고 ${fmt(s.maxPoints)}점</b><span>빨리 맞힐수록 높아요</span></div>
        <div class="rcard warn"><b>오답 0점</b><span>나가도 시간은 흘러요</span></div>
      </div>
      <button class="btn-primary ready-go" id="go">시작!</button>
    </div>`;
  $app.querySelector('#go').onclick = (e) => startNewRun(e.currentTarget);
}
async function startNewRun(btn) {
  if (btn) btn.disabled = true;
  try {
    const startP = api('startRun'); // 카운트다운과 동시에 서버 준비 (기다림 없음)
    for (const n of [3, 2, 1]) {
      $app.innerHTML = `<div class="screen countdown-wrap"><div class="countdown">${n}</div></div>`;
      await new Promise((res) => setTimeout(res, 650));
    }
    const r = await startP;
    CONFIG.me.currentRunId = r.runId;
    const c = await api('currentQuestion', { runId: r.runId });
    playLoop(r.runId, c);
  } catch (err) {
    toast(err.message, 3200);
    if (err.code === 'functions/resource-exhausted') { location.hash = '#/'; route(); return; }
    if (btn) btn.disabled = false; else { location.hash = '#/'; route(); }
  }
}

function playLoop(runId, cur) {
  let timer = null, answered = false, lastHandledSeq = 0;
  const tally = { correct: 0, score: cur.scoreSoFar || 0 };
  cleanup = () => { cancelAnimationFrame(timer); secure(false); bannerAd(false); window.removeEventListener('resize', layoutQuestion); };
  window.addEventListener('resize', layoutQuestion);
  bannerAd(true);

  const leave = () => {
    modal(`<h3>그만둘까요?</h3><p>지금 나가도 <b>시간은 계속 흘러요.</b><br>30분 안에 다시 들어오면 이어서 풀 수 있지만, 지난 문제는 시간 초과가 될 수 있어요.</p>
      <div class="row"><button class="btn-ghost" id="stay">계속 풀기</button><button class="btn-primary" id="go" style="height:48px;font-size:16px">나가기</button></div>`,
    (m, close) => { m.querySelector('#stay').onclick = close; m.querySelector('#go').onclick = () => { close(); location.hash = '#/'; }; });
  };

  function render(c) {
    if (c.done) return finish(runId, tally);
    if (c.lastTimeout && c.lastTimeout !== lastHandledSeq) toast(`${c.lastTimeout}번 문제는 시간이 지나 0점 처리됐어요`);
    answered = false;
    sec_.lost = 0;
    const q = c.question;
    const t0 = performance.now() - q.elapsedMs;
    $app.innerHTML = quizScreenHtml({
      headLeft: `<button class="icon-btn back-btn" id="leave" aria-label="나가기">${icon('back')}</button>`,
      headCenter: `${q.seq} / ${c.total}`,
      headRight: `<div class="timer-chip" id="timer">${icon('clock')}<span>00:${String(Math.ceil((q.timeLimitMs - q.elapsedMs) / 1000)).padStart(2, '0')}</span></div>`,
      era: q.era, period: q.period, question: q.question, options: q.options,
      progress: ((q.seq - 1) / c.total) * 100, watermark: true,
      footHtml: `<div class="pot-pill"><span>획득 가능 점수</span><b id="pot">${fmt(CONFIG.scoring.maxPoints)}</b><em>누적 ${fmt(c.scoreSoFar || 0)}점</em></div>`,
    });
    layoutQuestion();
    secure(true);
    $app.querySelector('#leave').onclick = leave;
    const $timer = $app.querySelector('#timer'), $tsec = $timer.querySelector('span'), $pot = $app.querySelector('#pot'), $tbar = $app.querySelector('#tbar');
    const limit = q.timeLimitMs;
    const tick = () => {
      if (answered) return;
      const el = performance.now() - t0, left = Math.max(0, limit - el);
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
      btns.forEach((b, i) => { b.disabled = true; if (i === index) b.classList.add('picked'); }); // 누른 보기는 바로 표시 (서버 답은 0.1~0.2초 뒤)
      let r;
      try {
        r = await api('submitAnswer', { runId, seq: q.seq, index, focusLost: sec_.lost });
      } catch (e) {
        if (e.code === 'functions/already-exists' || e.code === 'functions/failed-precondition') { const n = await api('currentQuestion', { runId }); return render(n); }
        toast(e.message); answered = false; btns.forEach((b) => { b.disabled = false; b.classList.remove('picked'); }); tick(); return;
      }
      lastHandledSeq = q.seq;
      secure(false);
      if (r.isCorrect) tally.correct++;
      tally.score = r.totalScore;
      const timeout = r.status === 'TIMEOUT';
      $app.querySelector('.progress > div').style.width = (q.seq / c.total) * 100 + '%';
      showAnswer({
        correctIndex: r.correctIndex, chosenIndex: index, isCorrect: r.isCorrect, timeout,
        title: r.isCorrect ? `정답! +${fmt(r.points)}점` : timeout ? '시간 초과 · 0점' : '오답 · 0점',
        sub: `${r.isCorrect ? `${sec(r.elapsedMs)} · ` : ''}누적 ${fmt(r.totalScore)}점`,
        explanation: r.explanation,
      });
      $app.querySelector('#foot').innerHTML = `<button class="btn-primary next-btn" id="next">${r.done ? '결과 보기' : '다음 문제'} ${icon('chev').replace('<svg', '<svg width="20" height="20"')}</button>`;
      $app.querySelector('#next').onclick = async (e) => {
        e.currentTarget.disabled = true;
        if (r.done) return finish(runId, tally);
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

/** 판 종료: 이미 아는 점수로 바로 보여 주고, 순위는 뒤에서 채움 (기다림 없음) */
function finish(runId, tally) {
  if (CONFIG.me) CONFIG.me.currentRunId = null;
  secure(false); bannerAd(false);
  setTabbar(false);
  const score = tally.score, correct = tally.correct;
  const beat = FRIEND && score > FRIEND.from;
  $app.innerHTML = `
    <div class="screen finish">
      <div class="finish-art">${art('mascotFinish', { cls: 'finish-mascot' })}</div>
      <div class="big">${fmt(score)}<small>점</small></div>
      <div class="sub">정답 ${correct} / ${CONFIG.series.questionCount}</div>
      <div class="rank-note" id="rank-note">순위 확인 중…</div>
      ${FRIEND ? `<div class="friend-note">${beat ? `${esc(FRIEND.by || '친구')}님의 ${fmt(FRIEND.from)}점을 넘었어요!` : `${esc(FRIEND.by || '친구')}님 기록 ${fmt(FRIEND.from)}점까지 ${fmt(FRIEND.from - score)}점 남았어요`}</div>` : ''}
      <div class="actions">
        <div class="actions-row main"><button class="btn-primary" id="again">다시 도전</button><button class="btn-share" id="share">자랑하기</button></div>
        <div class="actions-row"><button class="btn-ghost" id="adretry">광고 보고 다시 도전<small id="ad-left"></small></button><a class="btn-ghost" href="#/ranking">주간 랭킹</a></div>
        <a class="btn-text" href="#/results/${runId}">풀이 상세 보기</a>
      </div>
    </div>`;
  const adBtn = $app.querySelector('#adretry');
  const paintAd = () => { const left = CONFIG.adRetryLeft ?? 1; $app.querySelector('#ad-left').textContent = left ? '오늘 1회' : '오늘 사용함'; adBtn.disabled = !left; };
  paintAd();
  $app.querySelector('#again').onclick = (e) => startNewRun(e.currentTarget);
  $app.querySelector('#share').onclick = () => share(score, correct);
  adBtn.onclick = async () => {
    adBtn.disabled = true;
    if (!(await rewardedAd())) { adBtn.disabled = false; return; }
    try { await api('adRetry'); CONFIG.adRetryLeft = 0; startNewRun(null); } catch (e) { toast(e.message, 3000); CONFIG.adRetryLeft = 0; paintAd(); }
  };
  Promise.all([api('ranking', { which: 'this' }), loadConfig(true)]).then(([rk]) => {
    const el = $app.querySelector('#rank-note'); if (!el) return;
    el.textContent = rk?.me ? `이번 주 내 순위 ${fmt(rk.me.rank)}위 · 최고 ${fmt(rk.me.score)}점` : '이번 주 기록에 올라갔어요';
    if ($app.querySelector('#ad-left')) paintAd();
  }).catch(() => { const el = $app.querySelector('#rank-note'); if (el) el.hidden = true; });
}

// ---------- 랭킹 (한 화면: 시상대 + 목록은 카드 안에서만 스크롤) ----------
async function viewRanking() {
  let which = 'this';
  $app.innerHTML = `
    <div class="screen ranking">
      <header class="topbar"><h1>${art('iconTrophy', { cls: 'logo' })}주간 랭킹</h1></header>
      <div class="seg"><button data-w="this" class="on">이번 주</button><button data-w="last">지난 주</button></div>
      <div class="rk" id="rk"></div>
    </div>`;
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
      box.innerHTML = `<div class="empty">${art('crown')}${which === 'last' ? '지난 주 기록이 없어요.' : '아직 이번 주 기록이 없어요.<br>첫 번째 1위에 도전해 보세요!'}</div>`;
      return;
    }
    const [a, b, c] = r.list;
    const pod = (p, n, cls) => p ? `<div class="pod ${cls}">
        <div class="medal">${n === 1 ? art('crown') : art(n === 2 ? 'medal2' : 'medal3')}</div>
        ${avatar(p.nickname)}<div class="nick">${esc(p.nickname)}</div><div class="score">${fmt(p.score)}</div></div>` : '<div></div>';
    box.innerHTML = `
      <section class="podium">${art('rankingScene', { cls: 'podium-bg' })}${pod(b, 2, 'second')}${pod(a, 1, 'first')}${pod(c, 3, 'third')}</section>
      <section class="card rank-list">${r.list.length > 3 ? r.list.slice(3).map((p) => `
        <div class="rank-row ${p.me ? 'me' : ''}"><span class="n">${p.rank}</span><span class="nm">${esc(p.nickname)}</span><span class="s">${fmt(p.score)}</span></div>`).join('') : `<div class="empty rank-empty">${art('mascotHero')}<b>4위 자리가 비어 있어요!</b><span>지금 도전해서 순위에 이름을 올려 보세요</span></div>`}
      </section>
      <p class="week-note">${esc(r.week)} · 참가 ${fmt(r.participants)}명 · 동점이면 더 빨리 푼 순</p>
      ${r.me ? `<button class="my-rank" id="my-rank"><span>내 순위 ${fmt(r.me.rank)}위 · 눌러서 자랑하기</span><b>${fmt(r.me.score)}점</b></button>` : which === 'this' ? `<a class="my-rank" href="#/play"><span>아직 이번 주 기록이 없어요</span><b>도전 →</b></a>` : ''}`;
    box.querySelector('#my-rank')?.addEventListener('click', () => share(r.me.score));
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
      ${art('resultDeco', { cls: 'tower' })}
    </section>
    <h2 class="sec-title">최근 풀이 기록</h2>
    ${r.recent.length ? `<section class="card rec-list">${r.recent.map((x) => `
      <a class="rec-row" href="#/results/${x.id}"><span>${kdate(x.finished_at)}</span><span class="s">${fmt(x.total_score)}점</span>${icon('chev')}</a>`).join('')}</section>`
      : `<div class="empty">${art('emptyState')}아직 풀이 기록이 없어요.<br><a href="#/play" style="color:var(--green);font-weight:700">첫 도전 시작하기 →</a></div>`}
    ${r.total ? `<p class="week-note">최고 점수 ${fmt(r.bestScore)}점</p>` : ''}`;
}

async function viewResultDetail(id) {
  const d = await api('runDetail', { runId: id });
  const wrong = d.questions.filter((q) => !q.isCorrect).length;
  $app.innerHTML = `
    <header class="topbar center"><a class="icon-btn back-btn" href="#/results">${icon('back')}</a><span class="title">풀이 결과 상세</span>${art('crown', { cls: 'head-deco' })}</header>
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
        <div class="explain"><div class="t">${icon('book')}해설</div><p>${esc((q.explanation || '').replace(/\*\*/g, ''))}</p>${art('mascotWrite')}</div>
        <div class="time">${esc(q.era)} · ${sec(q.elapsedMs || 0)} · <b>${fmt(q.points)}점</b></div>
      </section>`).join('')}`;
}


// ---------- 오답 노트 (한 화면: 카드 한 장씩 넘기기) ----------
async function viewWrong() {
  const list = await api('wrongNotes');
  let filter = 'todo';
  let idx = 0;
  $app.innerHTML = `
    <div class="screen wrong">
      <header class="topbar"><h1>${art('iconStar', { cls: 'logo' })}오답 노트</h1></header>
      <div class="filter-row"><button data-f="todo" class="on">복습 필요</button><button data-f="all">전체 (${list.length})</button></div>
      <div class="note-wrap" id="note"></div>
    </div>`;
  const items = () => list.filter((n) => filter === 'all' || !n.resolved);
  const render = () => {
    const arr = items();
    const box = $app.querySelector('#note');
    if (!arr.length) {
      box.innerHTML = `<div class="empty">${art('emptyState')}${filter === 'todo' ? '복습할 오답이 없어요. 훌륭해요!' : '아직 틀린 문제가 없어요.'}</div>`;
      return;
    }
    idx = Math.min(idx, arr.length - 1);
    const n = arr[idx];
    const opts = [n.option_1, n.option_2, n.option_3, n.option_4];
    box.innerHTML = `
      <article class="card note">
        <div class="note-head">${eraArt(n.era, { cls: 'note-era' })}<span class="chip">${esc(n.era)}</span><span class="muted">틀린 횟수 ${n.wrong_count}${n.resolved ? ' · <b style="color:var(--green)">다시 맞힘 ✓</b>' : ''}</span></div>
        ${questionHtml(n.question)}
        <div class="note-opts">${opts.map((o, k) => `<div class="o ${k + 1 === n.correct_option ? 'correct' : ''}">${esc(o)}</div>`).join('')}</div>
        <div class="explain"><div class="t">${icon('book')}해설</div><p>${esc((n.explanation || '').replace(/\*\*/g, ''))}</p></div>
      </article>
      <div class="pager"><button class="btn-ghost" id="prev" ${idx === 0 ? 'disabled' : ''}>이전</button><span>${idx + 1} / ${arr.length}</span><button class="btn-ghost" id="nxt" ${idx >= arr.length - 1 ? 'disabled' : ''}>다음</button></div>`;
    box.querySelector('#prev').onclick = () => { idx--; render(); };
    box.querySelector('#nxt').onclick = () => { idx++; render(); };
  };
  $app.querySelector('.filter-row').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filter = b.dataset.f; idx = 0;
    $app.querySelectorAll('.filter-row button').forEach((x) => x.classList.toggle('on', x === b));
    render();
  };
  render();
}


// ---------- 시작 ----------
(async () => {
  store.user = (await redirectResult()) || (await currentUser());
  route();
})();
