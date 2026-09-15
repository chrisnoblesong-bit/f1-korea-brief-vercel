# F1 Korea Brief

## 실행
1. Node.js 20+ 설치
2. 폴더에서 `npm install`
3. `npm start`
4. PC에서 `http://localhost:3000`

## 구조
- Express API 서버
- Jolpica F1: 현재 시즌 드라이버 순위/가장 최근 경기 결과
- Google News RSS: 최근 30일 F1 기사
- PWA: manifest + service worker

## 중요한 점
Formula1.com의 Live Timing은 공식 서비스이지만 공개된 범용 개발자 API 문서/키가 제공되는 형태가 아니므로, 이 프로젝트는 공식 F1 웹사이트를 직접 스크래핑하지 않습니다. 경기/순위의 자동 데이터는 Jolpica F1 API를 서버에서 받아옵니다. 공식 기사/Live Timing은 원문 링크로 연결합니다.

실시간 레이스 중 초 단위 라이브 타이밍은 F1 공식 Live Timing 서비스가 제공하는 영역이며 별도 이용 권한이 필요할 수 있습니다.
