const FILLER_WORDS = ['음..', '음...', '그니까', '뭐랄까', '약간요', '어..', '어...', '막 그냥', '아무튼'];
const SITUATION_KEYWORDS = ['당시', '그때', '상황에서', '프로젝트에서', '업무 중', '팀에서', '입사'];
const ACTION_KEYWORDS = ['저는', '제가', '시도했', '해결하기 위해', '노력했', '진행했', '제안했', '설득했'];
const RESULT_KEYWORDS = ['결과', '배웠', '성장', '개선되', '달성', '해결되', '성공적으로'];
const NUMBER_PATTERN = /[0-9]|퍼센트|%/;

function analyzeAnswer(category, rawText) {
  const text = rawText.trim();
  const length = text.length;
  const feedback = [];
  let score = 70;

  if (length === 0) {
    return { score: 0, feedback: [{ type: 'warn', text: '답변이 비어 있습니다. 내용을 입력해주세요.' }], missing: ['situation', 'action', 'result'] };
  }

  if (length < 40) {
    score -= 30;
    feedback.push({ type: 'warn', text: '답변이 다소 짧습니다. 구체적인 상황과 예시를 더 추가해보세요.' });
  } else if (length > 800) {
    score -= 10;
    feedback.push({ type: 'warn', text: '답변이 다소 깁니다. 핵심만 간결하게 정리해보세요.' });
  } else {
    score += 10;
    feedback.push({ type: 'good', text: '답변 길이가 적절합니다.' });
  }

  const fillerHit = FILLER_WORDS.find((f) => text.includes(f));
  if (fillerHit) {
    score -= 10;
    feedback.push({ type: 'warn', text: `"${fillerHit}"와 같은 군더더기 표현이 보입니다. 문장을 다듬으면 더 깔끔해집니다.` });
  }

  if (NUMBER_PATTERN.test(text)) {
    score += 10;
    feedback.push({ type: 'good', text: '구체적인 수치나 데이터를 언급해 답변의 설득력을 높였습니다.' });
  } else {
    feedback.push({ type: 'tip', text: '가능하다면 구체적인 수치나 성과를 덧붙이면 더 설득력이 높아집니다.' });
  }

  const missing = [];
  if (category === 'situational') {
    const hasSituation = SITUATION_KEYWORDS.some((k) => text.includes(k));
    const hasAction = ACTION_KEYWORDS.some((k) => text.includes(k));
    const hasResult = RESULT_KEYWORDS.some((k) => text.includes(k));
    if (!hasSituation) missing.push('situation');
    if (!hasAction) missing.push('action');
    if (!hasResult) missing.push('result');

    if (missing.length === 0) {
      score += 10;
      feedback.push({ type: 'good', text: '상황(Situation)-행동(Action)-결과(Result)의 흐름이 잘 드러납니다.' });
    } else {
      const labels = { situation: '상황', action: '행동', result: '결과' };
      score -= missing.length * 12;
      feedback.push({
        type: 'warn',
        text: `STAR 구조 중 ${missing.map((m) => labels[m]).join(', ')} 부분이 부족해 보입니다. 이 부분을 보강하면 답변이 훨씬 설득력 있어집니다.`,
      });
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, feedback, missing };
}

function pickFollowUp(missing) {
  const key = missing.length > 0 ? missing[0] : 'generic';
  const pool = FOLLOW_UPS[key] || FOLLOW_UPS.generic;
  return pool[Math.floor(Math.random() * pool.length)];
}

const state = {
  session: [],
  currentIndex: 0,
  currentScore: 0,
  currentFeedback: null,
  timerId: null,
  timerSeconds: 0,
};

const views = {
  home: document.getElementById('view-home'),
  practice: document.getElementById('view-practice'),
  feedback: document.getElementById('view-feedback'),
  summary: document.getElementById('view-summary'),
  history: document.getElementById('view-history'),
};

function showView(name) {
  Object.values(views).forEach((v) => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
  document.getElementById('nav-home').classList.toggle('active', name !== 'history');
  document.getElementById('nav-history').classList.toggle('active', name === 'history');
}

function renderCategoryGrid() {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const label = document.createElement('label');
    label.className = 'category-option';
    label.innerHTML = `<input type="checkbox" value="${cat.id}" checked> ${cat.label}`;
    grid.appendChild(label);
  });
}

function getSelectedCategories() {
  return Array.from(document.querySelectorAll('#category-grid input:checked')).map((el) => el.value);
}

function startSession() {
  const categories = getSelectedCategories();
  if (categories.length === 0) {
    alert('카테고리를 하나 이상 선택해주세요.');
    return;
  }
  const count = parseInt(document.getElementById('question-count').value, 10);
  const questions = pickQuestions(categories, count);
  if (questions.length === 0) {
    alert('선택한 카테고리에 문항이 없습니다.');
    return;
  }
  state.session = questions.map((q) => ({ question: q, answer: '', score: null, feedback: null }));
  state.currentIndex = 0;
  showQuestion();
  showView('practice');
}

function startTimer() {
  stopTimer();
  state.timerSeconds = 0;
  updateTimerLabel();
  state.timerId = setInterval(() => {
    state.timerSeconds += 1;
    updateTimerLabel();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerLabel() {
  const m = String(Math.floor(state.timerSeconds / 60)).padStart(2, '0');
  const s = String(state.timerSeconds % 60).padStart(2, '0');
  document.getElementById('timer-label').textContent = `${m}:${s}`;
}

function showQuestion() {
  const item = state.session[state.currentIndex];
  document.getElementById('progress-label').textContent = `${state.currentIndex + 1} / ${state.session.length}`;
  document.getElementById('question-category').textContent = getCategoryLabel(item.question.category);
  document.getElementById('question-text').textContent = item.question.text;
  const input = document.getElementById('answer-input');
  input.value = '';
  document.getElementById('char-count').textContent = '0';
  resetVoiceInput();
  startTimer();
  input.focus();
}

const voice = {
  recognition: null,
  recognizing: false,
  baseText: '',
};

function setupSpeechRecognition() {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('mic-btn');
  const micStatus = document.getElementById('mic-status');

  if (!SpeechRecognitionCtor) {
    micBtn.disabled = true;
    micBtn.textContent = '음성 입력 미지원';
    micStatus.textContent = '이 브라우저는 음성 인식을 지원하지 않아요. Chrome에서 사용해보세요.';
    return;
  }

  voice.recognition = new SpeechRecognitionCtor();
  voice.recognition.lang = 'ko-KR';
  voice.recognition.continuous = true;
  voice.recognition.interimResults = true;

  voice.recognition.addEventListener('result', (event) => {
    let finalText = '';
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interimText += transcript;
    }
    if (finalText) voice.baseText += finalText;
    const input = document.getElementById('answer-input');
    input.value = (voice.baseText + interimText).trim();
    document.getElementById('char-count').textContent = input.value.length;
  });

  voice.recognition.addEventListener('end', () => {
    voice.recognizing = false;
    updateMicButton();
  });

  voice.recognition.addEventListener('error', (event) => {
    voice.recognizing = false;
    updateMicButton();
    micStatus.textContent = event.error === 'not-allowed'
      ? '마이크 권한을 허용해주세요.'
      : `음성 인식 오류: ${event.error}`;
  });

  micBtn.addEventListener('click', toggleVoiceInput);
}

function toggleVoiceInput() {
  if (!voice.recognition) return;
  if (voice.recognizing) {
    voice.recognition.stop();
    return;
  }
  const current = document.getElementById('answer-input').value;
  voice.baseText = current ? `${current} ` : '';
  voice.recognizing = true;
  document.getElementById('mic-status').textContent = '듣고 있어요…';
  voice.recognition.start();
  updateMicButton();
}

function updateMicButton() {
  const micBtn = document.getElementById('mic-btn');
  const micStatus = document.getElementById('mic-status');
  if (voice.recognizing) {
    micBtn.classList.add('recording');
    micBtn.textContent = '■ 중지';
  } else {
    micBtn.classList.remove('recording');
    micBtn.textContent = '🎤 음성으로 입력';
    if (micStatus.textContent === '듣고 있어요…') micStatus.textContent = '';
  }
}

function resetVoiceInput() {
  if (voice.recognizing && voice.recognition) {
    voice.recognition.stop();
  }
  voice.baseText = '';
  const micStatus = document.getElementById('mic-status');
  if (micStatus) micStatus.textContent = '';
}

function submitAnswer() {
  const input = document.getElementById('answer-input');
  const text = input.value;
  stopTimer();
  if (voice.recognizing && voice.recognition) voice.recognition.stop();
  const item = state.session[state.currentIndex];
  const { score, feedback, missing } = analyzeAnswer(item.question.category, text);
  item.answer = text;
  item.score = score;
  item.feedback = feedback;
  item.missing = missing;
  item.seconds = state.timerSeconds;
  renderFeedback(score, feedback);
  showView('feedback');
  loadFollowUp(item, missing);
}

function renderFeedback(score, feedback) {
  document.getElementById('score-value').textContent = score;
  const circle = document.getElementById('score-circle');
  circle.className = 'score-circle ' + (score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low');

  const list = document.getElementById('feedback-list');
  list.innerHTML = '';
  feedback.forEach((f) => {
    const li = document.createElement('li');
    li.className = `feedback-item feedback-${f.type}`;
    li.textContent = f.text;
    list.appendChild(li);
  });

  const isLast = state.currentIndex === state.session.length - 1;
  document.getElementById('next-btn').textContent = isLast ? '결과 보기' : '다음 질문';
}

async function loadFollowUp(item, missing) {
  const followupCard = document.getElementById('followup-card');
  const followupLabel = document.getElementById('followup-label');
  const followupText = document.getElementById('followup-text');
  followupCard.classList.remove('hidden');
  followupLabel.textContent = '꼬리질문';
  followupText.textContent = '생성 중…';

  try {
    const response = await fetch('/api/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: item.question.category,
        question: item.question.text,
        answer: item.answer,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('followup request failed');
    const data = await response.json();
    if (!data.followup) throw new Error('empty followup');
    followupLabel.textContent = 'AI 꼬리질문';
    followupText.textContent = data.followup;
  } catch (error) {
    followupLabel.textContent = '꼬리질문';
    followupText.textContent = pickFollowUp(missing);
  }
}

function goNext() {
  if (state.currentIndex < state.session.length - 1) {
    state.currentIndex += 1;
    showQuestion();
    showView('practice');
  } else {
    finishSession();
  }
}

function finishSession() {
  const average = Math.round(
    state.session.reduce((sum, item) => sum + (item.score || 0), 0) / state.session.length
  );
  document.getElementById('summary-average').textContent = `평균 점수: ${average}점`;

  const list = document.getElementById('summary-list');
  list.innerHTML = '';
  state.session.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'summary-item';
    li.innerHTML = `<span class="tag">${getCategoryLabel(item.question.category)}</span>
      <span class="summary-question">${item.question.text}</span>
      <span class="summary-score">${item.score}점</span>`;
    list.appendChild(li);
  });

  saveHistory(average);
  showView('summary');
}

function saveHistory(average) {
  const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
  history.unshift({
    date: new Date().toISOString(),
    average,
    items: state.session.map((item) => ({
      category: item.question.category,
      question: item.question.text,
      answer: item.answer,
      score: item.score,
      seconds: item.seconds,
    })),
  });
  localStorage.setItem('interviewHistory', JSON.stringify(history.slice(0, 50)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  list.innerHTML = '';
  if (history.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  history.forEach((session) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const date = new Date(session.date);
    const dateLabel = date.toLocaleString('ko-KR');
    li.innerHTML = `<div class="history-head">
        <span>${dateLabel}</span>
        <span class="summary-score">평균 ${session.average}점</span>
      </div>
      <div class="history-body">
        ${session.items
          .map(
            (it) =>
              `<div class="history-line"><span class="tag">${getCategoryLabel(it.category)}</span> ${it.question} — ${it.score}점</div>`
          )
          .join('')}
      </div>`;
    list.appendChild(li);
  });
}

document.getElementById('nav-home').addEventListener('click', () => showView('home'));
document.getElementById('nav-history').addEventListener('click', () => {
  renderHistory();
  showView('history');
});
document.getElementById('start-btn').addEventListener('click', startSession);
document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
document.getElementById('next-btn').addEventListener('click', goNext);
document.getElementById('restart-btn').addEventListener('click', () => showView('home'));
document.getElementById('answer-input').addEventListener('input', (e) => {
  document.getElementById('char-count').textContent = e.target.value.length;
});

renderCategoryGrid();
setupSpeechRecognition();
showView('home');
