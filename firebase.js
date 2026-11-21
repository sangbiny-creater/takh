// Firebase 연결 (사용자 앱 · 백오피스 공용)
//  localhost 에서 열면 자동으로 로컬 에뮬레이터(npm run emu)에 붙는다 — 실제 서버 데이터는 건드리지 않음.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import { FIREBASE_CONFIG } from './firebase-config.js';

export const EMULATOR = ['localhost', '127.0.0.1'].includes(location.hostname);
// 백오피스(/admin/)는 이름이 다른 앱으로 띄워 로그인 상태를 따로 보관 → 같은 브라우저에서 플레이어 익명 계정이 덮이지 않음
const IS_ADMIN_PAGE = /\/admin(\/|$)/.test(location.pathname);
export const app = initializeApp(EMULATOR ? { apiKey: 'demo-key', projectId: 'demo-takh', authDomain: 'localhost' } : FIREBASE_CONFIG, IS_ADMIN_PAGE ? 'admin' : undefined);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'asia-northeast3');
if (EMULATOR) {
  connectAuthEmulator(auth, `http://${location.hostname}:9099`, { disableWarnings: true });
  connectFunctionsEmulator(functions, location.hostname, 5001);
}

const firstAuth = new Promise((res) => { const off = onAuthStateChanged(auth, (u) => { off(); res(u); }); });

/** Cloud Function 호출. 서버가 보낸 한국어 메시지를 그대로 담은 Error 를 던진다. */
export async function call(name, data = {}) {
  try {
    return (await httpsCallable(functions, name, { timeout: 30000 })(data)).data;
  } catch (e) {
    const msg = e.code === 'functions/internal' && e.message === 'internal' ? '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' : e.message;
    throw Object.assign(new Error(msg), { code: e.code });
  }
}

/** 플레이어: 익명 로그인 (브라우저가 기억 → 같은 기기면 같은 계정) */
export async function signInPlayer() {
  const u = (await firstAuth) || auth.currentUser;
  if (u) return u;
  return (await signInAnonymously(auth)).user;
}

/** 관리자: 구글 로그인 */
export async function adminUser() { return (await firstAuth) || auth.currentUser; }
export async function signInAdmin() {
  if (EMULATOR) {
    // 에뮬레이터: 진짜 구글 대신 테스트 계정 (이메일을 물어봄)
    const email = prompt('에뮬레이터 테스트용 관리자 이메일', 'admin@example.com');
    if (!email) return null;
    const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: 'emu-' + email, email, email_verified: true }));
    return (await signInWithCredential(auth, cred)).user;
  }
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}
export const signOutAll = () => signOut(auth);
