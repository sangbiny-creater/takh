'use strict';
// 타임어택 한국사 광고 설정 — 웹은 AdSense(web), 앱은 AdMob(아래). 같은 구글 게시자 계정 pub-8824642278407065
//  앱 ID(ca-app-pub-…~…)는 takh-android/android/app/src/main/res/values/strings.xml 의 admob_app_id 에.
window.ADS_CONFIG = {
  // ===== 웹 (takh.brown-crab.com) — AdMob 은 앱 전용이라 웹은 구글 AdSense 를 씀 (같은 구글 계정) =====
  //  client: AdSense 게시자 ID 'ca-pub-숫자16자리' (AdSense → 계정 → 계정 정보)
  //  bannerSlot: 문제 화면 맨 위 배너 광고 단위 ID (AdSense → 광고 → 광고 단위별 → 디스플레이 광고, 숫자 10자리)
  //  rewarded: '광고 보고 다시 도전'에 AdSense H5 게임 광고(보상형) 사용 — AdSense 에서 'H5 게임 광고' 신청·승인 필요
  //  test: true 면 진짜 광고 대신 구글 시험 광고 (승인 전 확인용). 승인 뒤 false 로.
  //  client 가 비어 있으면: 배너 자리는 비우고, 보상형은 3초짜리 가짜 광고로 대신함.
  web: {
    client: 'ca-pub-8824642278407065',
    bannerSlot: '1014984486', // takh_quiz_top_320x50
    rewarded: true,
    test: true,
  },

  // ===== 앱 (안드로이드 · iOS) — AdMob (앱 ID ca-app-pub-8824642278407065~8118081900 은 takh-android strings.xml 에) =====
  //  에뮬레이터는 구글이 자동으로 시험 기기로 처리함. 내 폰으로 시험할 때는 광고를 누르지 마세요 (부정 클릭으로 계정이 막힐 수 있음)
  test: false,
  banner: 'ca-app-pub-8824642278407065/7280689137',   // takh_quiz_top_banner (문제 화면 맨 위 적응형 배너)
  rewarded: 'ca-app-pub-8824642278407065/2201868259', // takh_retry_rewarded (광고 보고 다시 도전)
};
