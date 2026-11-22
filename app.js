// 타임어택 한국사 — 플레이어 웹앱 (프레임워크 없는 SPA)
import { call, currentUser, redirectResult, loginGoogle, loginKakao, loginGuest, loginEmail, signupEmail, resetPassword, logout, deleteMe, authErrorText, providerOf, KAKAO_ON } from './firebase.js';
import { art, eraArt, avatar, avatarBox, AVATAR_IDS } from './art.js';

const $app = document.getElementById('app');
const $tabbar = document.getElementById('tabbar');
const $shield = document.getElementById('shield');

// ---------- 아이콘 ----------
const ICONS = {
  navHome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" fill-rule="evenodd"><path d="M2.8 11.2L12 3.6l9.2 7.6V20a1.2 1.2 0 0 1-1.2 1.2h-5.3v-6.2H9.3v6.2H4A1.2 1.2 0 0 1 2.8 20z"/></svg>',
  navCrown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
  navBars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="12" width="4.5" height="8.5" rx="1.5"/><rect x="9.75" y="7" width="4.5" height="13.5" rx="1.5"/><rect x="16" y="3.5" width="4.5" height="17" rx="1.5"/></svg>',
  navStar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/></svg>',
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

// ---------- 광고 (웹: AdSense · 앱: AdMob — lib/native.js · 설정은 lib/ads_config.js) ----------
const Native = window.Native || { on: false };
// ---------- 광고: 앱은 AdMob(native.js), 웹은 AdSense (lib/ads_config.js 의 web) ----------
const WEB_ADS = (!Native.on && window.ADS_CONFIG?.web) || {};
const WEB_ADS_ON = !!(WEB_ADS.client && /^ca-pub-\d{10,20}$/.test(WEB_ADS.client));
let adsLoaded = false;
function loadWebAds() {
  if (!WEB_ADS_ON || adsLoaded) return;
  adsLoaded = true;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = (o) => window.adsbygoogle.push(o);
  const sc = document.createElement('script');
  sc.async = true; sc.crossOrigin = 'anonymous';
  sc.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${WEB_ADS.client}`;
  if (WEB_ADS.test) sc.dataset.adbreakTest = 'on';
  sc.dataset.adFrequencyHint = '30s';
  document.head.appendChild(sc);
  window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
}
// 문제 화면 맨 위 배너: 문제가 바뀔 때마다 화면을 새로 그려도 광고는 다시 불러오지 않도록, 화면 밖(#web-banner)에 한 번만 만들어 위에 띄움
function adBarHtml() { return `<div class="ad-bar" aria-label="광고">${Native.on || (WEB_ADS_ON && WEB_ADS.bannerSlot) ? '' : '<span>광고 영역</span>'}</div>`; }
function bannerAd(show) {
  if (Native.on) { Native.banner(show); return; }
  if (!WEB_ADS_ON || !WEB_ADS.bannerSlot) return;
  let el = document.getElementById('web-banner');
  if (show && !el) {
    loadWebAds();
    el = document.createElement('div');
    el.id = 'web-banner';
    el.innerHTML = `<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="${WEB_ADS.client}" data-ad-slot="${WEB_ADS.bannerSlot}"${WEB_ADS.test ? ' data-adtest="on"' : ''}></ins>`;
    document.getElementById('stage').appendChild(el);
    try { window.adsbygoogle.push({}); } catch { /* 광고 차단 등 */ }
  }
  if (el) el.hidden = !show;
}
/** 보상형 광고. true = 끝까지 봄, false = 중간에 닫음. 광고를 못 불러오면 그냥 진행(true) */
async function rewardedAd() {
  if (Native.on) {
    const r = await Native.rewarded();
    if (r === 'none') { toast('지금은 광고를 불러오지 못해서 그냥 진행할게요', 3000); return true; }
    if (!r) toast('광고를 끝까지 보면 다시 도전할 수 있어요');
    return !!r;
  }
  if (WEB_ADS_ON && WEB_ADS.rewarded) {
    loadWebAds();
    const r = await new Promise((done) => {
      let settled = false;
      const end = (v) => { if (!settled) { settled = true; clearTimeout(t); done(v); } };
      const t = setTimeout(() => end('none'), 10000); // 10초 안에 광고가 안 뜨면 그냥 진행
      window.adBreak({
        type: 'reward', name: 'retry',
        beforeReward: (showAdFn) => { clearTimeout(t); showAdFn(); },
        adViewed: () => end(true),
        adDismissed: () => end(false),
        adBreakDone: (info) => end(info?.breakStatus === 'viewed' ? true : info?.breakStatus === 'dismissed' ? false : 'none'),
      });
    });
    if (r === 'none') { toast('지금은 광고를 불러오지 못해서 그냥 진행할게요', 3000); return true; }
    if (!r) toast('광고를 끝까지 보면 다시 도전할 수 있어요');
    return r;
  }
  return new Promise((done) => { // 광고 설정 전: 가짜 광고 3초
    modal(`<div class="ad-fake"><div class="ad-fake-box">광고</div><p>광고가 끝나면 다시 도전이 시작돼요</p><b id="ad-n">3</b></div>`, (m, close, back) => {
      back.dataset.locked = '1'; let n = 3;
      const t = setInterval(() => { n--; const el = m.querySelector('#ad-n'); if (el) el.textContent = n; if (n <= 0) { clearInterval(t); close(); done(true); } }, 1000);
    });
  });
}
/** 광고 보고 한 판 더: 광고 → 서버에 한 판 받기 → 시작 */
async function adThenStart(btn) {
  if (btn) btn.disabled = true;
  if (!(await rewardedAd())) { if (btn) btn.disabled = false; return; }
  try { await api('adRetry'); CONFIG.needAd = false; startNewRun(null); }
  catch (e) { toast(e.message, 3000); if (btn) btn.disabled = false; }
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
  // 글을 먼저, 링크를 맨 뒤에: 링크를 따로(url) 넘기면 카카오톡이 링크를 앞에 붙이므로 글 안에 넣어서 보냄
  const msg = `${d.text}\n${d.url}`;
  if (Native.on && Native.share && (await Native.share({ title: d.title, text: msg }))) return;
  if (navigator.share) { try { await navigator.share({ text: msg }); return; } catch (e) { if (e?.name === 'AbortError') return; } }
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

// ---------- 디자인 공통 (GPT 시안 기준: 초록 머리띠 · 하늘 장면 · 크림 카드) ----------
const UI = {
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>',
  quill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/><path d="M4 20h16"/></svg>',
  spark: '<svg class="spark" viewBox="0 0 40 40"><path d="M20 4v9M33 9l-6 6M36 22h-9" stroke="#FFC928" stroke-width="5" stroke-linecap="round"/></svg>',
  sparkL: '<svg class="spark l" viewBox="0 0 40 40"><path d="M20 4v9M7 9l6 6M4 22h9" stroke="#FFC928" stroke-width="5" stroke-linecap="round"/></svg>',
  laurel: (flip) => `<svg class="laurel ${flip ? 'r' : ''}" viewBox="0 0 40 90"><path d="M30 86C12 70 8 44 16 8" fill="none" stroke="#E5A81B" stroke-width="3.5" stroke-linecap="round"/>${[14, 26, 38, 50, 62, 74].map((y, i) => `<ellipse cx="${i % 2 ? 24 : 10}" cy="${y}" rx="7" ry="4.2" transform="rotate(${i % 2 ? -35 : 35} ${i % 2 ? 24 : 10} ${y})" fill="#F7C531" stroke="#E0A11A" stroke-width="1.5"/>`).join('')}</svg>`,
  kakao: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.3-2.8c.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8.1S17.5 3 12 3z" fill="#3A1D1D"/></svg>',
  google: '<svg viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" fill="#FBBC05"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="#1F3A2B" stroke-width="2.4" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="#2E9A5E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  video: '<svg viewBox="0 0 28 24"><rect x="1.5" y="3" width="25" height="18" rx="3" fill="#2E9A5E" stroke="#1E6B47" stroke-width="2"/><path d="M11.5 8v8l6-4z" fill="#fff"/><path d="M5 3v18M23 3v18" stroke="#1E6B47" stroke-width="2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="#C94A3A" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5" fill="#FFF3E6"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" stroke-linecap="round"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A24" stroke-width="2" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2.5" fill="#F3FAF2"/><rect x="9" y="2" width="6" height="4" rx="1.5" fill="#fff"/><path d="M8.5 11h7M8.5 15h7" stroke-linecap="round"/></svg>',
  stopwatch: '<svg viewBox="0 0 48 48"><rect x="20" y="3" width="8" height="5" rx="1.5" fill="#E8A417" stroke="#4A3426" stroke-width="2"/><circle cx="24" cy="27" r="17" fill="#FFD54A" stroke="#4A3426" stroke-width="3"/><circle cx="24" cy="27" r="12" fill="#FFF8E6"/><path d="M24 19v8l6 3" stroke="#D84A3A" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
  xcircle: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#E5484D" stroke="#9E2A2E" stroke-width="2.5"/><path d="M16.5 16.5l15 15M31.5 16.5l-15 15" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="#2E7D5B" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></svg>',
  // 설정 줄 아이콘 (노랑 채움 + 진한 선)
  sUser: '<svg viewBox="0 0 28 28"><circle cx="14" cy="9" r="5.5" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2"/><path d="M4 25c1-6 5-9 10-9s9 3 10 9z" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  sPencil: '<svg viewBox="0 0 28 28"><path d="M5 23l1.5-5.5L19 5l4 4L10.5 21.5z" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 8l4 4" stroke="#2A2416" stroke-width="2.2"/></svg>',
  sTrophy: '<svg viewBox="0 0 28 28"><path d="M8 4h12v6a6 6 0 0 1-12 0z" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2"/><path d="M8 6H4v2a4 4 0 0 0 4 4M20 6h4v2a4 4 0 0 1-4 4M14 16v4M9 24h10l-1-4h-8z" fill="none" stroke="#2A2416" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  sDoc: '<svg viewBox="0 0 28 28"><rect x="6" y="3" width="16" height="22" rx="2.5" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2"/><path d="M10 9h8M10 13h8M10 17h5" stroke="#2A2416" stroke-width="2.2" stroke-linecap="round"/></svg>',
  sShield: '<svg viewBox="0 0 28 28"><path d="M14 3l9 3v7c0 6-4 10-9 12-5-2-9-6-9-12V6z" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2" stroke-linejoin="round"/><path d="M9.5 14l3 3 6-6" fill="none" stroke="#2A2416" stroke-width="2.4" stroke-linecap="round"/></svg>',
  sInfo: '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#FFD54A" stroke="#2A2416" stroke-width="2.2"/><path d="M14 12v8" stroke="#2A2416" stroke-width="2.6" stroke-linecap="round"/><circle cx="14" cy="8" r="1.7" fill="#2A2416"/></svg>',
};
const NUM = ['①', '②', '③', '④'];
/** 초록 머리띠 (시안 공통) */
function hdr(title, { back = null, right = '', ico = '' } = {}) {
  const b = back === 'history' ? `<button class="hdr-back" onclick="history.back()">${icon('back')}</button>` : back ? `<a class="hdr-back" href="${back}">${icon('back')}</a>` : '<span class="hdr-gap"></span>';
  return `<header class="hdr">${b}<h1 class="hdr-title">${UI.sparkL}${ico}<span>${title}</span>${UI.spark}</h1><div class="hdr-right">${right || '<span class="hdr-gap"></span>'}</div></header>`;
}

// ---------- 라우터 ----------
const PUBLIC = new Set(['login', 'email', 'signup', 'terms', 'doc']);
const routes = { '': viewHome, play: viewPlay, ranking: viewRanking, results: viewResults, wrong: viewWrong, settings: viewSettings, account: viewAccount, doc: viewDoc, login: viewLogin, email: viewEmail, signup: viewSignup, terms: viewTerms, nickname: viewNickname, submit: viewSubmit, report: viewReport, profile: viewProfile };
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
      <section class="login-scene scene">${art('mascotHero', { cls: 'login-mascot' })}</section>
      <div class="login-title"><h1>${UI.sparkL}<span>타임어택 한국사</span>${UI.spark}</h1><p class="tag-pill">10문제, 문제당 20초. 빠르고 정확하게!</p></div>
      <div class="login-btns">
        <button class="lbtn kakao" id="kakao"><i>${UI.kakao}</i><span>카카오로 시작하기</span></button>
        <button class="lbtn google" id="google"><i>${UI.google}</i><span>Google로 시작하기</span></button>
        <button class="lbtn email" id="email"><i>${UI.mail}</i><span>이메일로 시작하기</span></button>
      </div>
      <button class="btn-link" id="guest">게스트로 시작하기</button>
      <p class="info-pill">ⓘ 로그인하면 다른 기기에서도 기록이 이어져요</p>
    </div>`;
  const run = (fn, msg) => async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try { await afterLogin(await fn(), msg); } catch (err) { const t = authErrorText(err); if (t) toast(t, 3000); }
    b.disabled = false;
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
      ${hdr('이메일로 로그인', { back: '#/login' })}
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
      ${hdr('이메일로 가입하기', { back: '#/email' })}
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
const COLLECT = '· 모으는 것: 로그인 계정 정보(이메일, 계정 식별자), 닉네임, 아바타, 플레이 기록(점수·정답 여부·풀이 시간), 문제내기·정정요청 때 적은 이메일과 내용, 광고 쿠키(웹)·광고 식별자(앱)\n· 쓰는 곳: 회원 확인, 주간 랭킹, 오답 노트, 부정 이용 방지, 낸 문제 채택 안내, 광고\n· 보관 기간: 계정을 삭제할 때까지 (법령에 따라 보관해야 하는 경우 그 기간)\n· 동의하지 않을 수 있지만, 동의하지 않으면 게임을 이용할 수 없어요.';
function viewTerms() {
  if (!store.user) { location.hash = '#/login'; return; }
  $app.innerHTML = `
    <div class="screen terms">
      ${hdr('약관 동의', { back: '#/login' })}
      <section class="talk-scene scene">${art('talkTerms', { cls: 'talk-mascot bust' })}<div class="bubble">시작하기 전에<br>아래 내용에<br>동의해 주세요</div></section>
      <div class="ccard ck-list">
        <label class="ck"><input type="checkbox" id="ck1"><span><b>[필수]</b> 개인정보 수집·이용 동의</span><button class="see" id="more1">보기 ›</button></label>
        <pre class="collect" id="collect" hidden>${esc(COLLECT)}</pre>
        <label class="ck"><input type="checkbox" id="ck2"><span><b>[필수]</b> 이용약관 동의</span><a class="see" href="#/doc/terms">보기 ›</a></label>
        <div class="ck plain"><span>개인정보 처리방침</span><a class="see" href="#/doc/privacy">보기 ›</a></div>
      </div>
      <div class="err" id="err"></div>
      <button class="btn-primary big" id="go">동의하고 시작하기</button>
      <button class="btn-link" id="out">다른 계정으로 로그인</button>
    </div>`;
  const $ = (id) => $app.querySelector('#' + id);
  $('more1').onclick = (e) => { e.preventDefault(); $('collect').hidden = !$('collect').hidden; };
  $('go').onclick = async () => {
    if (!$('ck1').checked || !$('ck2').checked) { $('err').textContent = '필수 항목에 모두 동의해 주세요'; return; }
    $('go').disabled = true;
    try { await api('agree'); await loadConfig(true); location.hash = '#/'; } catch (e) { $('err').textContent = e.message; $('go').disabled = false; }
  };
  const out = async (e) => { e?.preventDefault?.(); await logout(); store.user = null; CONFIG = null; location.hash = '#/login'; };
  $('out').onclick = out;
  $app.querySelector('.hdr-back').onclick = out;
}

function viewNickname() {
  $app.innerHTML = `
    <div class="screen nickname">
      ${hdr('닉네임 만들기')}
      <section class="talk-scene scene nick-scene">${art('talkNick', { cls: 'talk-mascot bust center' })}</section>
      <div class="pill-bubble">${UI.sparkL}랭킹에 보일 이름을 정해 주세요${UI.spark}</div>
      <p class="nick-note">같은 이름은 하나만 쓸 수 있어요</p>
      <label class="input-row"><i>${UI.pencil}</i><input id="nick" maxlength="10" placeholder="한글/영문/숫자 2~10자" autocomplete="off" /></label>
      <div class="err" id="err"></div>
      <button class="btn-primary big" id="go">시작하기</button>
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
  const row = (ico, label, val, attrs) => `<${attrs.href ? 'a' : 'button'} class="set-row ccard" ${attrs.href ? `href="${attrs.href}"` : `id="${attrs.id}"`}><i>${ico}</i><span>${label}</span><em>${val || ''}</em>${icon('chev')}</${attrs.href ? 'a' : 'button'}>`;
  $app.innerHTML = `
    <div class="screen settings">
      ${hdr('설정', { back: '#/' })}
      <div class="set-list">
        ${row(UI.sUser, '계정', `${PROVIDER_NAME[kind] || ''} · ${esc(store.nick)}`, { href: '#/account' })}
        ${row(CONFIG.me?.avatar ? avatarBox(CONFIG.me.avatar, { frame: CONFIG.me.frame, cls: 'set-av' }) : UI.sPencil, '프로필 변경', esc(store.nick), { href: '#/profile' })}
        ${row(UI.sTrophy, '점수 규칙', '', { id: 'rules' })}
        ${row(UI.sDoc, '이용약관', '', { href: '#/doc/terms' })}
        ${row(UI.sShield, '개인정보 처리방침', '', { href: '#/doc/privacy' })}
        <div class="set-row ccard static"><i>${UI.sInfo}</i><span>버전</span><em>1.0.0</em></div>
      </div>
      <p class="set-foot">BROWN CRAB · 타임어택 한국사</p>
    </div>`;
  $app.querySelector('#rules').onclick = showRules;
}
function viewAccount() {
  const u = store.user, kind = providerOf(u);
  $app.innerHTML = `
    <div class="screen settings account">
      ${hdr('계정', { back: '#/settings' })}
      <div class="ccard account-card">
        ${art('mascotHero', { cls: 'account-mascot' })}
        <div><b class="name-chip">${esc(store.nick)}</b>
        <p>${kind === 'guest' ? '게스트로 하고 있어요.<br>계정을 연결하면 다른 기기에서도 이어서 할 수 있어요.' : `${PROVIDER_NAME[kind]} 계정으로 로그인했어요.${u?.email ? '<br>' + esc(u.email) : ''}`}</p></div>
      </div>
      ${kind === 'guest' ? `<div class="login-btns"><button class="lbtn kakao ${KAKAO_ON ? '' : 'soon'}" id="kakao"><i>${UI.kakao}</i><span>카카오 계정 연결</span></button><button class="lbtn google" id="google"><i>${UI.google}</i><span>Google 계정 연결</span></button></div>` : ''}
      <button class="btn-ghost wide" id="out">로그아웃</button>
      <button class="btn-link danger" id="del">계정 삭제</button>
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

const DOCS = { terms: ['이용약관', 'legal/terms.txt', null], privacy: ['개인정보 처리방침', 'https://brown-crab.com/privacy.html', 'main'] };
async function viewDoc(k) {
  const [title, url, sel] = DOCS[k] || DOCS.terms;
  $app.innerHTML = `
    <div class="screen doc">
      ${hdr(title, { back: 'history' })}
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

// ---------- 문제내기 (사용자가 낸 문제 → 백오피스 '사용자 문제') ----------
async function viewSubmit() {
  const eras = CONFIG.series.eras || [];
  $app.innerHTML = `
    <div class="results-page form-page">
      ${hdr('문제내기', { back: '#/' })}
      <p class="fp-lead">내가 낸 문제가 채택되면 실제 게임에 나와요! 검토 뒤 채택되면 메일로 알려 드려요.</p>
      <form class="ccard fp-card" id="f">
        <label class="fp-l">시대<select name="era"><option value="">잘 모르겠어요</option>${eras.map((e) => `<option>${esc(e)}</option>`).join('')}</select></label>
        <label class="fp-l">문제<textarea name="question" rows="3" maxlength="300" placeholder="예) 훈민정음을 창제한 조선의 왕은?" required></textarea></label>
        <div class="fp-l">보기 (정답에 동그라미를 눌러 주세요)
          ${[1, 2, 3, 4].map((n) => `<label class="fp-opt"><input type="radio" name="correct_option" value="${n}" ${n === 1 ? 'required' : ''}><b>${NUM[n - 1]}</b><input name="option_${n}" maxlength="60" placeholder="보기 ${n}" required></label>`).join('')}
        </div>
        <label class="fp-l"><span>해설 <small>(선택)</small></span><textarea name="explanation" rows="2" maxlength="300" placeholder="왜 그게 정답인지 짧게 적어 주세요"></textarea></label>
        <label class="fp-l">채택 소식 받을 이메일<input name="email" type="email" maxlength="120" value="${esc(CONFIG.email || '')}" placeholder="example@email.com"></label>
        <div class="err" id="err"></div>
        <button class="btn-primary big" type="submit">문제 보내기</button>
      </form>
      <h3 class="fp-h">내가 낸 문제</h3>
      <div id="mine" class="fp-mine"><div class="muted">불러오는 중…</div></div>
    </div>`;
  const ST = { PENDING: ['검토 중', 'gray'], ADOPTED: ['채택!', 'green'], REJECTED: ['미채택', 'red'] };
  const loadMine = () => api('mySubmissions').then((list) => {
    $app.querySelector('#mine').innerHTML = list.length ? list.map((x) => `<div class="fp-item"><span class="tag ${ST[x.status]?.[1]}">${ST[x.status]?.[0] || ''}</span><span>${esc(x.question)}</span></div>`).join('') : '<div class="muted">아직 낸 문제가 없어요.</div>';
  }).catch(() => { $app.querySelector('#mine').innerHTML = ''; });
  loadMine();
  $app.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    try { await api('submitQuestion', d); toast('문제를 보냈어요! 고마워요'); e.target.reset(); e.target.email.value = CONFIG.email || d.email || ''; $app.querySelector('#err').textContent = ''; loadMine(); }
    catch (err) { $app.querySelector('#err').textContent = err.message; }
    btn.disabled = false;
  };
}

// ---------- 문제 정정요청 (→ 백오피스 '정정 요청') ----------
const REPORT_REASONS = [['answer', '정답이 틀렸어요'], ['options', '보기가 이상해요'], ['question', '문제 설명이 틀렸어요'], ['explanation', '해설이 틀렸어요'], ['other', '기타']];
async function viewReport(qid) {
  $app.innerHTML = `
    <div class="results-page form-page">
      ${hdr('문제 정정요청', { back: '#/' })}
      <p class="fp-lead">틀린 문제를 알려 주시면 확인해서 고칠게요. 최근에 푼 문제에서 골라 주세요.</p>
      <form class="ccard fp-card" id="f">
        <div class="fp-l">어떤 문제인가요?<div id="qs" class="fp-qs"><div class="muted">최근 문제 불러오는 중…</div></div></div>
        <div class="fp-l">무엇이 틀렸나요?<div class="fp-chips">${REPORT_REASONS.map(([k, l], i) => `<label class="chip-r"><input type="radio" name="reason" value="${k}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <label class="fp-l">자세한 내용<textarea name="detail" rows="3" maxlength="500" placeholder="예) 정답은 ②번이 아니라 ③번이에요. 근거: …"></textarea></label>
        <label class="fp-l"><span>답변 받을 이메일 <small>(선택)</small></span><input name="email" type="email" maxlength="120" value="${esc(CONFIG.email || '')}"></label>
        <div class="err" id="err"></div>
        <button class="btn-primary big" type="submit">정정 요청 보내기</button>
      </form>
    </div>`;
  api('recentQuestions').then((list) => {
    const box = $app.querySelector('#qs');
    const items = list.map((q) => `<label class="fp-q"><input type="radio" name="qid" value="${esc(q.id)}" ${q.id === qid ? 'checked' : ''}><span><em>${esc(q.era || '')}</em>${esc(q.question)}<b>정답: ${esc(q.answer)}</b></span></label>`).join('');
    box.innerHTML = items + `<label class="fp-q"><input type="radio" name="qid" value="" ${!qid && !list.length ? 'checked' : ''}><span>목록에 없어요 — 아래에 문제 내용을 적을게요</span></label>`;
    box.querySelector('input:checked')?.closest('label')?.scrollIntoView({ block: 'nearest' });
  }).catch(() => { $app.querySelector('#qs').innerHTML = '<div class="muted">최근 문제를 불러오지 못했어요. 아래에 문제 내용을 적어 주세요.</div>'; });
  $app.querySelector('#f').onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    if (d.qid === undefined) { $app.querySelector('#err').textContent = '어떤 문제인지 골라 주세요.'; return; }
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    try { await api('reportQuestion', d); toast('정정 요청을 보냈어요! 고마워요'); location.hash = '#/'; }
    catch (err) { $app.querySelector('#err').textContent = err.message; btn.disabled = false; }
  };
}

// ---------- 프로필 변경 (아바타 · 테두리 · 닉네임) ----------
const FRAMES = [['basic', '기본']]; // 꾸미기 테두리가 생기면 여기에 추가 (서버 index.js FRAMES 와 같이)
async function viewProfile() {
  let sel = CONFIG.me?.avatar || 1, frame = CONFIG.me?.frame || 'basic';
  $app.innerHTML = `
    <div class="results-page form-page profile">
      ${hdr('프로필 변경', { back: '#/settings' })}
      <div class="ccard pf-top"><div id="pv"></div><label class="fp-l">닉네임<input id="nick" maxlength="10" value="${esc(store.nick)}"></label></div>
      <h3 class="fp-h">아바타</h3>
      <div class="ccard pf-grid" id="grid">${AVATAR_IDS.map((n) => `<button type="button" class="pf-pick" data-n="${n}">${avatarBox(n, { frame })}</button>`).join('')}</div>
      <h3 class="fp-h">테두리 <small>곧 더 많은 테두리가 생겨요</small></h3>
      <div class="ccard pf-frames" id="frames">${FRAMES.map(([k, l]) => `<button type="button" class="pf-frame" data-f="${k}">${avatarBox(sel, { frame: k })}<span>${l}</span></button>`).join('')}</div>
      <div class="err" id="err"></div>
      <button class="btn-primary big" id="save">저장</button>
    </div>`;
  const paint = () => {
    $app.querySelector('#pv').innerHTML = avatarBox(sel, { frame, cls: 'pf-big' });
    $app.querySelectorAll('.pf-pick').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) === sel));
    $app.querySelectorAll('.pf-frame').forEach((b) => { b.classList.toggle('on', b.dataset.f === frame); b.querySelector('.av-img').src = `assets/gpt/avatar_${String(sel).padStart(2, '0')}.png`; });
  };
  paint();
  $app.querySelector('#grid').onclick = (e) => { const b = e.target.closest('.pf-pick'); if (b) { sel = Number(b.dataset.n); paint(); } };
  $app.querySelector('#frames').onclick = (e) => { const b = e.target.closest('.pf-frame'); if (b) { frame = b.dataset.f; paint(); } };
  $app.querySelector('#save').onclick = async () => {
    try { await api('setProfile', { avatar: sel, frame, nickname: $app.querySelector('#nick').value }); await loadConfig(true); toast('프로필을 바꿨어요'); location.hash = '#/settings'; }
    catch (e) { $app.querySelector('#err').textContent = e.message; }
  };
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
      <header class="hdr hdr-home"><h1 class="hdr-brand">${art('logo', { cls: 'brand-logo' })}<span>${esc(CONFIG.series.shortTitle)}</span></h1><a class="hdr-gear" href="#/settings" aria-label="설정">${icon('gear')}</a></header>
      <section class="hero">
        <div class="hero-text">
          <h2><span class="greet-l1">${CONFIG.me?.avatar ? avatarBox(CONFIG.me.avatar, { frame: CONFIG.me.frame, cls: 'greet-av' }) : ''}<span class="hl">${esc(store.nick)}</span>님,${UI.spark}</span><br>오늘도 한국사 도전!</h2>
          <div class="rank-pill" id="week-badge">${art('crown', { cls: 'pill-crown' })}<span>이번 주 기록에 도전!</span></div>
        </div>
        ${art('homeScene', { cls: 'hero-scene' })}
        ${art('mascotHero', { cls: 'hero-mascot' })}
      </section>
      <button class="btn-primary play-btn" id="play"><span class="play-tri">${icon('play')}</span>문제 풀기${UI.spark}</button>
      <p class="play-sub">${CONFIG.series.questionCount}문제 · 문제당 ${CONFIG.scoring.timeLimitMs / 1000}초 · <a href="#" id="rules">점수 규칙</a><span id="left"></span></p>
      <section class="home-actions">
        <a class="hact ccard" href="#/submit"><i>${UI.quill}</i><span>문제내기</span></a>
        <a class="hact ccard" href="#/report"><i>${UI.flag}</i><span>문제 정정요청</span></a>
      </section>
    </div>`;
  $app.querySelector('#play').onclick = () => { location.hash = '#/play'; };
  $app.querySelector('#rules').onclick = (e) => { e.preventDefault(); showRules(); };
  if (FRIEND) toast(`${FRIEND.by ? FRIEND.by + '님의 ' : ''}기록 ${fmt(FRIEND.from)}점에 도전해 보세요!`, 3200);
  api('ranking', { which: 'this' }).then((r) => {
    const b = $app.querySelector('#week-badge span'); if (!b) return;
    b.innerHTML = r.me ? `이번 주 <b>${fmt(r.me.rank)}위</b> · <b>${fmt(r.me.score)}점</b>` : `이번 주 참가자 <b>${fmt(r.participants)}명</b>`;
  }).catch(() => {});
  if (CONFIG.freePlays) $app.querySelector('#left').textContent = CONFIG.needAd ? ' · 광고 보고 계속 도전' : ` · 오늘 무료 ${CONFIG.freeLeft ?? CONFIG.freePlays}회`;
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
  const h = card.clientHeight, max = Math.min(30, Math.max(19, h * 0.115));
  main.querySelectorAll('.art-push,.art-hole').forEach((e) => e.remove());
  // 그림(시안 5: 문제 칸 오른쪽 아래)이 들어갈 자리를 비워 두고 글자가 그 둘레로 흐르게 함
  if (artEl) {
    artEl.hidden = false;
    const m = main.getBoundingClientRect(), a = artEl.getBoundingClientRect();
    const hw = Math.max(0, m.right - a.left + 6), hh = Math.max(0, m.bottom - a.top + 2);
    main.insertAdjacentHTML('afterbegin', `<span class="art-push" style="height:${Math.max(0, m.height - hh)}px"></span><span class="art-hole" style="width:${hw}px;height:${hh}px"></span>`);
  }
  fitText(main, '.q-text', max, 13);
  // 가장 작은 글씨로도 넘치면 그림을 빼고 다시 맞춤 (스크롤은 절대 없음)
  if (artEl && main.scrollHeight > main.clientHeight + 1) {
    artEl.hidden = true;
    main.querySelectorAll('.art-push,.art-hole').forEach((e) => e.remove());
    fitText(main, '.q-text', max, 13);
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
      <div class="fb-art">${UI.sparkL}${art(isCorrect ? 'mascotCorrect' : timeout ? 'mascotTimeout' : 'mascotWrong', { cls: 'fb-mascot' })}</div>
      <div class="fb-body" id="fb-body">
        <b class="fb-title">${title}</b>${sub ? `<span class="fb-sub">${sub}</span>` : ''}
        ${explanation ? `<p class="fb-exp">${esc(explanation.replace(/\*\*/g, ''))}</p>` : ''}
      </div>
    </div>`;
  fitText($app.querySelector('#fb-body'), '.fb-exp', 15, 11);
}

function readyHtml() {
  const s = CONFIG.scoring;
  return `
    <div class="screen ready">
      ${hdr('준비', { back: '#/' })}
      <section class="talk-scene scene">${art('talkReady', { cls: 'talk-mascot bust' })}<div class="ready-talk"><h2>${UI.sparkL}준비됐나요?</h2><div class="bubble small">문제가 뜨는 순간부터<br>시간이 흘러요</div></div></section>
      <div class="ready-grid">
        <div class="rcard">${art('iconLearn', { cls: 'rc-ico' })}<div><b><mark>${CONFIG.series.questionCount}문제</mark></b><span>시대별로 골고루</span></div></div>
        <div class="rcard"><i class="rc-ico">${UI.stopwatch}</i><div><b><mark>${s.timeLimitMs / 1000}초</mark></b><span>문제당 제한시간</span></div></div>
        <div class="rcard">${art('iconTrophy', { cls: 'rc-ico' })}<div><b><small>최고</small><mark>${fmt(s.maxPoints)}점</mark></b><span>빨리 맞힐수록 높아요</span></div></div>
        <div class="rcard warn"><i class="rc-ico">${UI.xcircle}</i><div><b><mark>오답 0점</mark></b><span>나가도 시간은 흘러요</span></div></div>
      </div>
      <button class="btn-primary big start" id="go"><span class="play-tri">${icon('play')}</span>시작!${UI.spark}</button>
    </div>`;
}

function finishHtml(runId, score, correct) {
  const beat = FRIEND && score > FRIEND.from;
  return `
    <div class="screen finish">
      <div class="finish-art">${art('mascotFinish', { cls: 'finish-mascot' })}</div>
      <div class="score-cloud">${UI.laurel(false)}<div class="sc-in"><div class="big">${fmt(score)}<small>점</small></div><div class="ok-pill">정답 ${correct} / ${CONFIG.series.questionCount}</div></div>${UI.laurel(true)}</div>
      <div class="rank-pill orange" id="rank-note">${art('crown', { cls: 'pill-crown' })}<span>순위 확인 중…</span></div>
      ${FRIEND ? `<div class="friend-note">${beat ? `${esc(FRIEND.by || '친구')}님의 ${fmt(FRIEND.from)}점을 넘었어요!` : `${esc(FRIEND.by || '친구')}님 기록 ${fmt(FRIEND.from)}점까지 ${fmt(FRIEND.from - score)}점 남았어요`}</div>` : ''}
      <button class="btn-share" id="share"><i>${UI.share}</i>자랑하기</button>
      <div class="actions-row">
        <button class="btn-card" id="retry"></button>
        <a class="btn-card" href="#/ranking">${art('iconTrophy', { cls: 'bc-ico' })}<span>주간 랭킹</span></a>
      </div>
      <a class="btn-link" href="#/results/${runId}">풀이 상세 보기</a>
    </div>`;
}

const ktime = (ms) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
// ---------- 문제 풀기 ----------
async function viewPlay() {
  const runId = CONFIG.me?.currentRunId;
  if (runId) {
    try { const c = await api('currentQuestion', { runId }); if (!c.done) return playLoop(runId, c); } catch { /* 새로 시작 */ }
  }
  $app.innerHTML = readyHtml();
  const go = $app.querySelector('#go');
  if (CONFIG.needAd) go.innerHTML = `<span class="play-tri">${icon('play')}</span>광고 보고 시작!${UI.spark}`;
  go.onclick = (e) => (CONFIG.needAd ? adThenStart(e.currentTarget) : startNewRun(e.currentTarget));
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
    CONFIG.playsToday = (CONFIG.playsToday || 0) + 1;
    CONFIG.needAd = !!CONFIG.freePlays && CONFIG.playsToday >= CONFIG.freePlays;
    const c = await api('currentQuestion', { runId: r.runId });
    playLoop(r.runId, c);
  } catch (err) {
    toast(err.message, 3200);
    if (err.code === 'functions/resource-exhausted') { CONFIG.needAd = true; location.hash = '#/play'; route(); return; }
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
  setTabbar(true); $tabbar.querySelectorAll('a').forEach((a) => a.classList.remove('on'));
  const score = tally.score, correct = tally.correct;
  $app.innerHTML = finishHtml(runId, score, correct);
  // 오늘 무료 도전(기본 3번)을 다 쓰면 '광고 보고 다시 도전', 그 전엔 그냥 '다시 도전' (광고 횟수 제한 없음)
  const retry = $app.querySelector('#retry');
  const paintRetry = () => { retry.innerHTML = CONFIG.needAd ? `<i>${UI.video}</i><span>광고 보고 다시 도전</span>` : `<i>${UI.retry}</i><span>다시 도전</span>`; };
  paintRetry();
  $app.querySelector('#share').onclick = () => share(score, correct);
  retry.onclick = () => (CONFIG.needAd ? adThenStart(retry) : startNewRun(retry));
  Promise.all([api('ranking', { which: 'this' }), loadConfig(true)]).then(([rk]) => {
    const el = $app.querySelector('#rank-note'); if (!el) return;
    el.querySelector('span').textContent = rk?.me ? `이번 주 내 순위 ${fmt(rk.me.rank)}위 · 최고 ${fmt(rk.me.score)}점` : '이번 주 기록에 올라갔어요';
    if ($app.querySelector('#retry')) paintRetry();
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
        ${avatarBox(p.avatar, { nick: p.nickname, frame: p.frame, cls: 'pod-av' })}<div class="nick">${esc(p.nickname)}</div><div class="score">${fmt(p.score)}</div></div>` : '<div></div>';
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
    <div class="results-page">
      ${hdr('내 결과 보기', { ico: art('iconChart', { cls: 'hdr-ico' }) })}
      <section class="scroll-banner"><div class="sb-in">총 풀이 <b>${fmt(r.total)}회</b><i></i>평균 점수 <b>${fmt(r.avgScore)}</b></div></section>
      <section class="ccard acc-card scene">
        <div class="acc-left"><div class="k">평균 정답률</div><div class="v">${acc}%</div>
          <div class="donut" style="background:conic-gradient(#2E9A5E ${acc * 3.6}deg, #C9D3CC 0)"><span>${acc}%</span></div></div>
        ${art('resultDeco', { cls: 'tower' })}
      </section>
      <section class="ccard rec-card">
        <h2 class="rec-title"><i>${UI.clipboard}</i>최근 풀이 기록</h2>
        ${r.recent.length ? r.recent.map((x, i) => `
          <a class="rec-row" href="#/results/${x.id}"><i>${UI.calendar}</i><span class="d">${kdate(x.finished_at)}</span><span class="t">${ktime(x.finished_at)}</span><span class="s">${fmt(x.total_score)}점</span>${icon('chev')}</a>`).join('')
          : `<div class="empty">${art('emptyState')}아직 풀이 기록이 없어요.<br><a href="#/play" class="go-link">첫 도전 시작하기 →</a></div>`}
      </section>
      ${r.total ? `<p class="week-note">최고 점수 ${fmt(r.bestScore)}점</p>` : ''}
    </div>`;
  // 누른 줄만 주황 테두리가 잠깐 보였다가 상세로 넘어감
  $app.querySelectorAll('.rec-row').forEach((a) => (a.onclick = (e) => {
    e.preventDefault();
    a.classList.add('tap');
    setTimeout(() => { location.hash = a.getAttribute('href'); }, 260);
  }));
}

async function viewResultDetail(id) {
  const d = await api('runDetail', { runId: id });
  const wrong = d.questions.filter((q) => !q.isCorrect).length;
  $app.innerHTML = `
    <div class="results-page">
      ${hdr('풀이 결과 상세', { back: '#/results', right: art('crown', { cls: 'hdr-crown' }) })}
      <section class="score-card">${UI.laurel(false)}<div class="sc-in">
        <div class="date"><i>${UI.calendar}</i>${kdate(d.finishedAt || d.startedAt, true)}</div>
        <div class="big">${fmt(d.totalScore)}<small>점</small></div>
        <div class="cnt-pill">정답 <b class="ok">${d.correctCount}</b><i></i>오답 <b class="no">${wrong}</b></div></div>${UI.laurel(true)}</section>
      ${d.questions.map((q) => {
        const { lead, clue } = splitQuestion(q.question);
        const st = q.isCorrect ? 'ok' : 'no';
        return `
        <section class="ccard dq">
          <div class="dq-head ${st}">${q.seq}번 문제 <b>[${q.isCorrect ? '정답' : q.status === 'TIMEOUT' ? '시간 초과' : '오답'}]</b><em>${sec(q.elapsedMs || 0)} · ${fmt(q.points)}점</em></div><a class="dq-report" href="#/report/${esc(q.qid || q.id || '')}">${UI.flag}정정 요청</a>
          ${lead ? `<p class="dq-lead">${esc(lead)}</p>` : ''}
          <div class="clue-box">${esc(clue)}</div>
          <div class="num-opts">${q.options.map((o, i) => `<div class="no-opt ${i === q.correctIndex ? 'correct' : i === q.chosenIndex ? 'wrong' : ''}"><span>${NUM[i]}</span>${esc(o)}${i === q.correctIndex ? `<i class="ok-mark">${icon('check')}</i>` : i === q.chosenIndex ? `<i class="no-mark">${icon('x')}</i>` : ''}</div>`).join('')}</div>
          <div class="explain-box"><b class="ex-tag">해설</b><p>${esc((q.explanation || '').replace(/\*\*/g, ''))}</p></div>
        </section>`;
      }).join('')}
    </div>`;
}

// ---------- 오답 노트 (한 화면: 카드 한 장씩 넘기기) ----------
async function viewWrong() {
  const list = await api('wrongNotes');
  let filter = 'todo', idx = 0;
  $app.innerHTML = `
    <div class="screen wrong">
      ${hdr('오답 노트', { ico: art('iconStar', { cls: 'hdr-ico' }) })}
      <div class="seg2"><button data-f="todo" class="on">복습 필요</button><button data-f="all">전체 (${list.length})</button></div>
      <div class="note-wrap" id="note"></div>
    </div>`;
  const items = () => list.filter((n) => filter === 'all' || !n.resolved);
  const render = () => {
    const arr = items(), box = $app.querySelector('#note');
    if (!arr.length) { box.innerHTML = `<div class="ccard empty">${art('emptyState')}${filter === 'todo' ? '복습할 오답이 없어요. 훌륭해요!' : '아직 틀린 문제가 없어요.'}</div>`; return; }
    idx = Math.min(idx, arr.length - 1);
    const n = arr[idx], opts = [n.option_1, n.option_2, n.option_3, n.option_4];
    const { lead, clue } = splitQuestion(n.question);
    box.innerHTML = `
      <article class="ccard note">
        <div class="note-top">${eraArt(n.era, { cls: 'note-era' })}<div class="note-meta"><div class="chips"><span class="chip">${esc(n.era)}</span><span class="cnt-chip">틀린 횟수 <b>${n.wrong_count}</b></span></div>${lead ? `<p class="dq-lead">${esc(lead)}</p>` : ''}${n.resolved ? '<p class="resolved">다시 맞혔어요 ✓</p>' : ''}</div></div>
        <div class="clue-box center" id="clue">${esc(clue)}</div>
        <div class="num-opts">${opts.map((o, k) => `<div class="no-opt ${k + 1 === n.correct_option ? 'correct' : ''}"><span>${NUM[k]}</span>${esc(o)}${k + 1 === n.correct_option ? `<i class="ok-mark">${icon('check')}</i>` : ''}</div>`).join('')}</div>
        <div class="explain-box green" id="ex"><b class="ex-tag">해설</b><p>${esc((n.explanation || '').replace(/\*\*/g, ''))}</p></div>
      </article>
      <div class="pager2"><button class="pg prev" id="prev" ${idx === 0 ? 'disabled' : ''}>${icon('back')}이전</button><span class="pg-n">${idx + 1} / ${arr.length}</span><button class="pg next" id="nxt" ${idx >= arr.length - 1 ? 'disabled' : ''}>다음${icon('chev')}</button></div>`;
    { const nt = box.querySelector('.note'); fitText(nt, '.clue-box', 22, 13); if (nt.scrollHeight > nt.clientHeight + 1) fitText(nt, '.explain-box p', 14, 11); }
    box.querySelector('#prev').onclick = () => { idx--; render(); };
    box.querySelector('#nxt').onclick = () => { idx++; render(); };
  };
  $app.querySelector('.seg2').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.f; idx = 0;
    $app.querySelectorAll('.seg2 button').forEach((x) => x.classList.toggle('on', x === b));
    render();
  };
  render();
}
// ---------- 시작 ----------
(async () => {
  store.user = (await redirectResult()) || (await currentUser());
  route();
})();
