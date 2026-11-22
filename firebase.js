// Firebase 연결 (사용자 앱 · 백오피스 공용)
//  localhost 에서 열면 자동으로 로컬 에뮬레이터(npm run emu)에 붙는다 — 실제 서버 데이터는 건드리지 않음.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, OAuthProvider, EmailAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential, linkWithPopup, linkWithCredential,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification,
  reauthenticateWithPopup, reauthenticateWithCredential, deleteUser, signOut,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import { FIREBASE_CONFIG, KAKAO_PROVIDER_ID } from './firebase-config.js';

// 앱(Capacitor) 안에서도 주소가 localhost 라서, 앱이면 에뮬레이터가 아님 → 진짜 서버
const IN_APP = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
export const EMULATOR = !IN_APP && ['localhost', '127.0.0.1'].includes(location.hostname);
// 백오피스(/admin/)는 이름이 다른 앱으로 띄워 로그인 상태를 따로 보관 → 같은 브라우저에서 플레이어 계정이 덮이지 않음
const IS_ADMIN_PAGE = /\/admin(\/|$)/.test(location.pathname);
export const app = initializeApp(EMULATOR ? { apiKey: 'demo-key', projectId: 'demo-takh', authDomain: 'localhost' } : FIREBASE_CONFIG, IS_ADMIN_PAGE ? 'admin' : undefined);
export const auth = getAuth(app);
auth.languageCode = 'ko';
export const functions = getFunctions(app, 'asia-northeast3');
if (EMULATOR) {
  connectAuthEmulator(auth, `http://${location.hostname}:9099`, { disableWarnings: true });
  connectFunctionsEmulator(functions, location.hostname, 5001);
}

const firstAuth = new Promise((res) => { const off = onAuthStateChanged(auth, (u) => { off(); res(u); }); });
export const currentUser = async () => (await firstAuth) || auth.currentUser;

/**
 * 서버 호출. 게임 동작은 전부 함수 하나(api)로 보냄 → 한 번 데워지면 게임 중 멈춤(콜드 스타트)이 없음.
 * 'admin…' 으로 시작하면 관리자 함수.
 */
const apiFn = httpsCallable(functions, 'api', { timeout: 30000 });
export async function call(name, data = {}) {
  try {
    const fn = name.startsWith('admin') ? httpsCallable(functions, name, { timeout: 60000 }) : null;
    return (fn ? await fn(data) : await apiFn({ action: name, ...data })).data;
  } catch (e) {
    const msg = e.code === 'functions/internal' && e.message === 'internal' ? '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' : e.message;
    throw Object.assign(new Error(msg), { code: e.code });
  }
}

// ---------- 로그인 (다운힐 러너와 같은 방식: 구글 · 카카오 · 이메일 · 게스트) ----------
export const KAKAO_ON = !!KAKAO_PROVIDER_ID;
export const providerOf = (u) => {
  if (!u) return null;
  if (u.isAnonymous) return 'guest';
  const ids = u.providerData.map((p) => p.providerId);
  if (ids.includes('google.com')) return 'google';
  if (KAKAO_PROVIDER_ID && ids.includes(KAKAO_PROVIDER_ID)) return 'kakao';
  if (ids.includes('password')) return 'email';
  return 'other';
};

/** 팝업 로그인. 게스트였다면 같은 계정(uid)에 연결해서 기록이 그대로 이어짐 */
async function popupLogin(provider) {
  const cur = auth.currentUser;
  try {
    if (cur && cur.isAnonymous) {
      try { return (await linkWithPopup(cur, provider)).user; } catch (e) {
        if (e.code !== 'auth/credential-already-in-use') throw e;
        const cred = OAuthProvider.credentialFromError(e) || GoogleAuthProvider.credentialFromError(e);
        return (await signInWithCredential(auth, cred)).user; // 이미 있는 계정이면 그 계정으로
      }
    }
    return (await signInWithPopup(auth, provider)).user;
  } catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      try { sessionStorage.setItem('takh_redirect', '1'); } catch { /* ignore */ }
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
  }
}
export async function redirectResult() {
  try {
    if (!sessionStorage.getItem('takh_redirect')) return null;
    sessionStorage.removeItem('takh_redirect');
    return (await getRedirectResult(auth))?.user || null;
  } catch { return null; }
}
const NATIVE = () => !!(window.Native && window.Native.on);
/** 앱 안 구글 로그인: 휴대폰의 구글 계정 고르기 → 받은 토큰으로 Firebase 로그인 (웹 팝업은 앱 안에서 막힘 — lib/native.js) */
async function nativeGoogle() {
  const cred = GoogleAuthProvider.credential(await window.Native.googleIdToken());
  const cur = auth.currentUser;
  if (cur && cur.isAnonymous) {
    try { return (await linkWithCredential(cur, cred)).user; } catch (e) {
      if (e.code !== 'auth/credential-already-in-use') throw e; // 이미 있는 계정이면 그 계정으로
    }
  }
  return (await signInWithCredential(auth, cred)).user;
}
export async function loginGoogle() {
  if (EMULATOR) return emulatorLogin('google.com');
  if (NATIVE()) return nativeGoogle();
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  return popupLogin(p);
}
export async function loginKakao() {
  if (!KAKAO_PROVIDER_ID) throw Object.assign(new Error('카카오 로그인은 준비 중이에요.'), { code: 'kakao/off' });
  const p = new OAuthProvider(KAKAO_PROVIDER_ID); p.addScope('openid');
  return popupLogin(p);
}
export async function loginGuest() { return (auth.currentUser || (await signInAnonymously(auth)).user); }
export async function loginEmail(email, pw) { return (await signInWithEmailAndPassword(auth, email, pw)).user; }
export async function signupEmail(email, pw) {
  const cur = auth.currentUser;
  const cred = EmailAuthProvider.credential(email, pw);
  const u = cur && cur.isAnonymous ? (await linkWithCredential(cur, cred)).user : (await createUserWithEmailAndPassword(auth, email, pw)).user;
  try { await sendEmailVerification(u); } catch { /* 확인 메일은 못 보내도 가입은 됨 */ }
  return u;
}
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const logout = async () => { if (NATIVE()) await window.Native.googleSignOut(); return signOut(auth); };
export async function deleteMe(password) {
  const u = auth.currentUser; if (!u) return;
  try { await deleteUser(u); } catch (e) {
    if (e.code !== 'auth/requires-recent-login') throw e;
    const kind = providerOf(u);
    if (kind === 'email') await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password || prompt('비밀번호를 한 번 더 넣어 주세요') || ''));
    else if (kind === 'google') {
      if (NATIVE()) await reauthenticateWithCredential(u, GoogleAuthProvider.credential(await window.Native.googleIdToken()));
      else await reauthenticateWithPopup(u, new GoogleAuthProvider());
    }
    else if (kind === 'kakao') await reauthenticateWithPopup(u, new OAuthProvider(KAKAO_PROVIDER_ID));
    await deleteUser(u);
  }
}
export const authErrorText = (e) => ({
  'auth/email-already-in-use': '이미 가입된 이메일이에요. 로그인해 주세요',
  'auth/invalid-email': '이메일을 다시 확인해 주세요',
  'auth/weak-password': '비밀번호는 6자 이상으로 정해 주세요',
  'auth/too-many-requests': '잠시 뒤에 다시 해 주세요',
  'auth/network-request-failed': '인터넷 연결을 확인해 주세요',
  'auth/operation-not-allowed': '이 로그인 방법이 아직 켜져 있지 않아요',
  'auth/user-not-found': '가입되지 않은 이메일이에요',
  'auth/popup-closed-by-user': '',
  'no-token': '구글 로그인을 하지 못했어요. 다시 해 주세요',
  'auth/cancelled-popup-request': '',
  'kakao/off': '카카오 로그인은 준비 중이에요',
})[e && e.code] ?? (e && /cancel/i.test(String(e.message || e)) ? '' : null) ?? (e && /auth\/(invalid-credential|wrong-password|invalid-login-credentials)/.test(e.code) ? '이메일 또는 비밀번호가 맞지 않아요' : `로그인하지 못했어요 (${(e && (e.code || e.message)) || ''})`);

// 에뮬레이터: 진짜 구글 대신 테스트 계정
async function emulatorLogin(providerId) {
  const email = prompt('에뮬레이터 테스트용 이메일', 'tester@example.com');
  if (!email) return null;
  const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: 'emu-' + email, email, email_verified: true }));
  const cur = auth.currentUser;
  if (cur && cur.isAnonymous) { try { return (await linkWithCredential(cur, cred)).user; } catch { /* 이미 있는 계정 */ } }
  return (await signInWithCredential(auth, cred)).user;
}

// ---------- 백오피스 ----------
export async function adminUser() { return (await firstAuth) || auth.currentUser; }
export async function signInAdmin() {
  if (EMULATOR) {
    const email = prompt('에뮬레이터 테스트용 관리자 이메일', 'admin@example.com');
    if (!email) return null;
    const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: 'emu-' + email, email, email_verified: true }));
    return (await signInWithCredential(auth, cred)).user;
  }
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}
export const signOutAll = () => signOut(auth);
