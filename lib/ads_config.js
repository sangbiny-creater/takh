'use strict';
// 타임어택 한국사 광고(AdMob) 설정 — 안드로이드 앱 안에서만 씀 (웹에서는 가짜 광고 자리)
//  지금은 구글이 주는 '테스트 광고 ID' (누르거나 봐도 돈이 안 되고, 계정에 문제도 안 생김).
//  AdMob 에 앱을 등록하고 광고 단위 2개(배너·보상형)를 만들면 받은 ID 로 바꾸고 test 를 false 로.
//  앱 ID(ca-app-pub-…~…)는 (앱으로 묶을 때) android/app/src/main/res/values/strings.xml 의 admob_app_id 에.
window.ADS_CONFIG = {
  // ===== 웹 (takh.brown-crab.com) — AdMob 은 앱 전용이라 웹은 구글 AdSense 를 씀 (같은 구글 계정) =====
  //  client: AdSense 게시자 ID 'ca-pub-숫자16자리' (AdSense → 계정 → 계정 정보)
  //  bannerSlot: 문제 화면 맨 위 배너 광고 단위 ID (AdSense → 광고 → 광고 단위별 → 디스플레이 광고, 숫자 10자리)
  //  rewarded: '광고 보고 다시 도전'에 AdSense H5 게임 광고(보상형) 사용 — AdSense 에서 'H5 게임 광고' 신청·승인 필요
  //  test: true 면 진짜 광고 대신 구글 시험 광고 (승인 전 확인용). 승인 뒤 false 로.
  //  client 가 비어 있으면: 배너 자리는 비우고, 보상형은 3초짜리 가짜 광고로 대신함.
  web: {
    client: 'ca-pub-8824642278407065',
    bannerSlot: '',
    rewarded: true,
    test: true,
  },

  // ===== 앱 (안드로이드 · iOS) — AdMob =====
  test: true,
  banner: 'ca-app-pub-3940256099942544/9214589741',   // 문제 화면 맨 위 배너 (적응형 배너, 테스트 ID)
  rewarded: 'ca-app-pub-3940256099942544/5224354917', // 광고 보고 다시 도전 (보상형, 테스트 ID)
};
