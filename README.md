# Welcome to GitHub Desktop!

This is your README. READMEs are where you can communicate what your project is and how to use it.

Write your name on line 6, save it, and then head back to GitHub Desktop.

## 면접 대비 연습 (Interview Practice)

면접 연습 웹앱입니다. 정적 파일만으로도 바로 열어 쓸 수 있고, Node 서버 + Claude API 키를 붙이면 AI 꼬리질문까지 업그레이드됩니다.

- 카테고리(인성 / 기술·직무 / 상황·경험)와 질문 개수를 선택해 연습을 시작합니다.
- 질문마다 답변을 입력하면 규칙 기반으로 즉시 피드백(길이, 구체성, 군더더기 표현, STAR 구조)을 받습니다.
- "🎤 음성으로 입력" 버튼으로 마이크에 말하면 브라우저 내장 음성 인식(Web Speech API)으로 답변이 실시간 텍스트로 변환됩니다. Chrome/Edge에서 지원하며, 미지원 브라우저에서는 버튼이 비활성화되고 안내 문구가 표시됩니다.
- 답변을 제출하면 꼬리질문이 뜹니다. 백엔드가 켜져 있고 API 키가 설정되어 있으면 Claude가 답변 내용을 읽고 만든 맞춤 꼬리질문("AI 꼬리질문")이, 그렇지 않으면 미리 정해진 꼬리질문("꼬리질문")이 표시됩니다 — 실패해도 자동으로 후자로 대체되어 항상 동작합니다.
- 연습이 끝나면 평균 점수와 문항별 요약을 보여주고, 브라우저의 로컬 저장소(localStorage)에 기록을 남겨 "기록 보기"에서 지난 연습을 다시 확인할 수 있습니다.

### 그냥 정적으로 열어보기

`index.html`을 브라우저로 직접 열거나 아무 정적 파일 서버로 이 폴더를 서빙하면 됩니다. 이 경우 꼬리질문은 항상 미리 정해진 버전으로 나옵니다.

### AI 꼬리질문까지 켜서 실행하기

1. `npm install`
2. [console.anthropic.com](https://console.anthropic.com)에서 API 키를 발급받아 `.env.example`을 참고해 `.env` 파일을 만들고 `ANTHROPIC_API_KEY`를 채웁니다 (`.env`는 git에 커밋되지 않습니다).
3. `npm start` 후 `http://localhost:3000`으로 접속합니다.

서버는 `claude-opus-5` 모델을 기본으로 쓰며, `CLAUDE_MODEL` 환경변수로 다른 모델(`claude-sonnet-5` 등)로 바꿀 수 있습니다.

파일 구성: `index.html`(화면), `styles.css`(스타일), `questions.js`(질문/꼬리질문 데이터), `app.js`(프론트엔드 로직), `server.js`(AI 꼬리질문용 Express 백엔드).
