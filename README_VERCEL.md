# F1 KOREA BRIEF — Vercel 배포

## 가장 쉬운 배포
1. 이 폴더의 파일을 GitHub 새 저장소에 업로드합니다.
2. Vercel에서 **Add New → Project**를 선택합니다.
3. GitHub 저장소를 Import합니다.
4. Framework는 자동 감지되게 두고 **Deploy**를 누릅니다.
5. 생성된 `vercel.app` 주소를 휴대폰에서 엽니다.
6. iPhone Safari: 공유 → 홈 화면에 추가.
   Android Chrome: 메뉴 → 홈 화면에 추가/앱 설치.

## 데이터
- `/api/f1/standings` : 2026 드라이버 순위
- `/api/f1/results` : 2026 경기 결과
- 서버리스 API가 데이터 공급처를 중계하므로 브라우저에서 외부 API를 직접 호출하지 않습니다.

## 주의
Jolpica/Ergast 계열 데이터는 F1 공식 Live Timing과 동일한 실시간 텔레메트리 서비스가 아닙니다.
실시간 랩별 타이밍이 필요하면 별도의 합법적인 데이터 제공 계약/API가 필요합니다.
