// 타임어택 한국사 Firebase 연결 정보 — BROWN CRAB 전용 프로젝트 brown-crab-takh (주인 browncrab0213, 다운힐·트윈 게임랜드와 완전히 따로)
//  공개돼도 괜찮은 값이에요 (누가 무엇을 읽고 쓸지는 firestore.rules + Cloud Functions 가 막음). 비밀 키(서비스 계정 등)는 절대 넣지 않기.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBPgPdleVEmlX7CGbUlB-a9RoNM1-XD5oU',
  authDomain: 'brown-crab-takh.firebaseapp.com',
  projectId: 'brown-crab-takh',
  storageBucket: 'brown-crab-takh.firebasestorage.app',
  messagingSenderId: '364166425986',
  appId: '1:364166425986:web:225d7635b0149084d3739b',
};

// 카카오 로그인: Firebase 콘솔 → Authentication → 로그인 방법 → 'OpenID Connect' 제공업체(이름 kakao)를 만든 뒤 'oidc.kakao' 로 바꾸기.
//  null 이면 카카오 버튼을 '준비 중'으로 보여 줌. 설정 방법: DEPLOY.md '카카오 로그인'
export const KAKAO_PROVIDER_ID = null;
