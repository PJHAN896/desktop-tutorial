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
  stopCamera();
  resetReplay();
  startTimer();
  input.focus();
}

const voice = {
  recognition: null,
  recognizing: false,
  baseText: '',
  stallTimer: null,
  gotResult: false,
};

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const STALL_TIMEOUT_MS = 6000;
const IOS_FALLBACK_MSG = '응답이 없어요. iOS Safari는 음성 인식이 불안정할 수 있어요 — 키보드의 마이크 아이콘으로 입력해보세요.';

function clearStallTimer() {
  if (voice.stallTimer) {
    clearTimeout(voice.stallTimer);
    voice.stallTimer = null;
  }
}

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

  if (IS_IOS) {
    micStatus.textContent = 'iOS Safari는 음성 인식이 불안정할 수 있어요. 안 되면 키보드의 마이크 아이콘을 써보세요.';
  }

  voice.recognition = new SpeechRecognitionCtor();
  voice.recognition.lang = 'ko-KR';
  voice.recognition.continuous = true;
  voice.recognition.interimResults = true;

  voice.recognition.addEventListener('result', (event) => {
    voice.gotResult = true;
    clearStallTimer();
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
    clearStallTimer();
    voice.recognizing = false;
    updateMicButton();
  });

  voice.recognition.addEventListener('error', (event) => {
    clearStallTimer();
    voice.recognizing = false;
    updateMicButton();
    if (event.error === 'not-allowed') {
      micStatus.textContent = '마이크 권한을 허용해주세요.';
    } else if (IS_IOS) {
      micStatus.textContent = IOS_FALLBACK_MSG;
    } else {
      micStatus.textContent = `음성 인식 오류: ${event.error}`;
    }
  });

  micBtn.addEventListener('click', toggleVoiceInput);
}

function toggleVoiceInput() {
  if (!voice.recognition) return;
  if (voice.recognizing) {
    clearStallTimer();
    voice.recognition.stop();
    return;
  }
  const current = document.getElementById('answer-input').value;
  voice.baseText = current ? `${current} ` : '';
  voice.recognizing = true;
  voice.gotResult = false;
  document.getElementById('mic-status').textContent = '듣고 있어요…';
  voice.recognition.start();
  updateMicButton();

  clearStallTimer();
  voice.stallTimer = setTimeout(() => {
    if (voice.recognizing && !voice.gotResult) {
      try {
        voice.recognition.stop();
      } catch (e) {
        /* already stopped */
      }
      voice.recognizing = false;
      updateMicButton();
      document.getElementById('mic-status').textContent = IS_IOS
        ? IOS_FALLBACK_MSG
        : '응답이 없어요. 다시 시도하거나 직접 입력해주세요.';
    }
  }, STALL_TIMEOUT_MS);
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
  clearStallTimer();
  if (voice.recognizing && voice.recognition) {
    voice.recognition.stop();
  }
  voice.recognizing = false;
  voice.baseText = '';
  const micStatus = document.getElementById('mic-status');
  if (micStatus) {
    micStatus.textContent = IS_IOS && voice.recognition
      ? 'iOS Safari는 음성 인식이 불안정할 수 있어요. 안 되면 키보드의 마이크 아이콘을 써보세요.'
      : '';
  }
}

const camera = {
  stream: null,
  recorder: null,
  chunks: [],
  active: false,
  recordedUrl: null,
  audioContext: null,
  analyser: null,
  volumeTimer: null,
  volumeSamples: [],
};

function getSupportedVideoMimeType() {
  if (!window.MediaRecorder) return '';
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function setupCamera() {
  const camBtn = document.getElementById('camera-btn');
  const camStatus = document.getElementById('camera-status');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    camBtn.disabled = true;
    camBtn.textContent = '카메라 녹화 미지원';
    camStatus.textContent = '이 브라우저는 카메라 녹화를 지원하지 않아요. 카메라 없이도 연습은 그대로 가능해요.';
    return;
  }
  camBtn.addEventListener('click', toggleCamera);
}

function startVolumeMonitor(stream) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || stream.getAudioTracks().length === 0) return;
  camera.audioContext = new AudioCtx();
  const source = camera.audioContext.createMediaStreamSource(stream);
  camera.analyser = camera.audioContext.createAnalyser();
  camera.analyser.fftSize = 2048;
  source.connect(camera.analyser);

  camera.volumeSamples = [];
  const buffer = new Float32Array(camera.analyser.fftSize);
  camera.volumeTimer = setInterval(() => {
    camera.analyser.getFloatTimeDomainData(buffer);
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i += 1) sumSquares += buffer[i] * buffer[i];
    camera.volumeSamples.push(Math.sqrt(sumSquares / buffer.length));
  }, 150);
}

function stopVolumeMonitor() {
  if (camera.volumeTimer) {
    clearInterval(camera.volumeTimer);
    camera.volumeTimer = null;
  }
  if (camera.audioContext) {
    camera.audioContext.close();
    camera.audioContext = null;
  }
  camera.analyser = null;
}

function analyzeVoiceAudio(samples) {
  if (!samples || samples.length < 5) return [];
  const avg = samples.reduce((sum, s) => sum + s, 0) / samples.length;
  const variance = samples.reduce((sum, s) => sum + (s - avg) ** 2, 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  const silenceRatio = samples.filter((s) => s < 0.02).length / samples.length;

  const feedback = [];
  if (silenceRatio > 0.35) {
    feedback.push({
      type: 'warn',
      text: `답변 중 침묵 구간이 전체의 약 ${Math.round(silenceRatio * 100)}%였어요. 짧은 정리는 괜찮지만 너무 자주 끊기면 자신감이 없어 보일 수 있어요.`,
    });
  } else {
    feedback.push({ type: 'good', text: '말이 끊기지 않고 비교적 매끄럽게 이어졌어요.' });
  }

  if (avg < 0.015) {
    feedback.push({ type: 'tip', text: '목소리가 전반적으로 작게 녹음됐어요. 마이크에 조금 더 가까이서 또렷하게 말해보세요.' });
  }

  if (stdDev < 0.01) {
    feedback.push({ type: 'tip', text: '목소리 톤이 비교적 단조로웠어요. 강조하고 싶은 부분에서 강약을 주면 더 설득력 있게 들려요.' });
  } else {
    feedback.push({ type: 'good', text: '목소리에 강약이 있어 듣기 좋았어요.' });
  }

  return feedback;
}

async function toggleCamera() {
  if (camera.active) {
    stopCamera();
    return;
  }
  const camBtn = document.getElementById('camera-btn');
  const camStatus = document.getElementById('camera-status');
  const preview = document.getElementById('camera-preview');

  try {
    camera.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
  } catch (error) {
    camStatus.textContent = '카메라·마이크 권한을 허용해주세요. (카메라 없이도 연습은 계속할 수 있어요)';
    return;
  }

  preview.srcObject = camera.stream;
  preview.classList.remove('hidden');
  camera.active = true;
  camBtn.textContent = '📹 카메라 끄기';
  camBtn.classList.add('active');
  camStatus.textContent = '';

  camera.chunks = [];
  const mimeType = getSupportedVideoMimeType();
  try {
    camera.recorder = mimeType ? new MediaRecorder(camera.stream, { mimeType }) : new MediaRecorder(camera.stream);
  } catch (error) {
    camStatus.textContent = '이 브라우저에서는 녹화를 시작할 수 없어요. 카메라 미리보기만 가능합니다.';
    return;
  }
  camera.recorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size > 0) camera.chunks.push(event.data);
  });
  camera.recorder.start();
  startVolumeMonitor(camera.stream);
}

function stopCameraRecording() {
  return new Promise((resolve) => {
    if (!camera.recorder || camera.recorder.state === 'inactive') {
      resolve(null);
      return;
    }
    camera.recorder.addEventListener('stop', () => {
      const mimeType = camera.recorder.mimeType || 'video/webm';
      if (camera.recordedUrl) URL.revokeObjectURL(camera.recordedUrl);
      camera.recordedUrl = camera.chunks.length ? URL.createObjectURL(new Blob(camera.chunks, { type: mimeType })) : null;
      resolve(camera.recordedUrl);
    }, { once: true });
    camera.recorder.stop();
  });
}

function stopCamera() {
  const camBtn = document.getElementById('camera-btn');
  const preview = document.getElementById('camera-preview');
  stopVolumeMonitor();
  if (camera.recorder && camera.recorder.state !== 'inactive') camera.recorder.stop();
  if (camera.stream) camera.stream.getTracks().forEach((track) => track.stop());
  camera.stream = null;
  camera.active = false;
  preview.classList.add('hidden');
  preview.srcObject = null;
  camBtn.textContent = '📹 카메라로 연습하기';
  camBtn.classList.remove('active');
}

function resetReplay() {
  const replayCard = document.getElementById('replay-card');
  const replayVideo = document.getElementById('replay-video');
  replayCard.classList.add('hidden');
  replayVideo.removeAttribute('src');
  replayVideo.load();
}

async function submitAnswer() {
  const input = document.getElementById('answer-input');
  const text = input.value;
  stopTimer();
  if (voice.recognizing && voice.recognition) voice.recognition.stop();
  const item = state.session[state.currentIndex];
  const { score, feedback, missing } = analyzeAnswer(item.question.category, text);

  const wasRecording = camera.active;
  const recordedUrl = wasRecording ? await stopCameraRecording() : null;
  const voiceFeedback = wasRecording ? analyzeVoiceAudio(camera.volumeSamples) : [];
  stopCamera();
  renderReplay(recordedUrl);

  const combinedFeedback = feedback.concat(voiceFeedback);
  item.answer = text;
  item.score = score;
  item.feedback = combinedFeedback;
  item.missing = missing;
  item.seconds = state.timerSeconds;

  renderFeedback(score, combinedFeedback);
  showView('feedback');
  loadFollowUp(item, missing);
}

function renderReplay(url) {
  const replayCard = document.getElementById('replay-card');
  const replayVideo = document.getElementById('replay-video');
  if (url) {
    replayVideo.src = url;
    replayCard.classList.remove('hidden');
  } else {
    resetReplay();
  }
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

document.getElementById('nav-home').addEventListener('click', () => {
  stopCamera();
  showView('home');
});
document.getElementById('nav-history').addEventListener('click', () => {
  stopCamera();
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
setupCamera();
showView('home');
