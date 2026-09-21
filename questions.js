const CATEGORIES = [
  { id: 'personality', label: '인성' },
  { id: 'technical', label: '기술/직무' },
  { id: 'situational', label: '상황/경험' },
];

const QUESTIONS = [
  { id: 'p1', category: 'personality', text: '자기소개를 1분 이내로 해주세요.' },
  { id: 'p2', category: 'personality', text: '본인의 장점과 단점은 무엇인가요?' },
  { id: 'p3', category: 'personality', text: '왜 우리 회사에 지원하셨나요?' },
  { id: 'p4', category: 'personality', text: '입사 후 이루고 싶은 목표는 무엇인가요?' },
  { id: 'p5', category: 'personality', text: '스트레스를 받을 때 어떻게 해소하나요?' },
  { id: 'p6', category: 'personality', text: '팀워크에서 본인의 역할은 무엇이라고 생각하나요?' },

  { id: 't1', category: 'technical', text: '본인이 가장 자신 있는 기술 스택은 무엇이고, 그 이유는 무엇인가요?' },
  { id: 't2', category: 'technical', text: '최근에 새로 배운 기술이나 개념을 소개해주세요.' },
  { id: 't3', category: 'technical', text: '코드 리뷰에서 중요하게 생각하는 기준은 무엇인가요?' },
  { id: 't4', category: 'technical', text: '기술적으로 어려웠던 문제를 어떻게 해결했는지 설명해주세요.' },
  { id: 't5', category: 'technical', text: '새로운 기술을 도입할 때 어떤 요소를 고려하나요?' },
  { id: 't6', category: 'technical', text: '본인의 개발 프로세스(설계-구현-테스트)를 설명해주세요.' },

  { id: 's1', category: 'situational', text: '팀 내 갈등을 해결했던 경험을 말씀해주세요.' },
  { id: 's2', category: 'situational', text: '실패했던 프로젝트 경험과 그로부터 배운 점을 말씀해주세요.' },
  { id: 's3', category: 'situational', text: '마감 기한이 촉박했던 상황에서 어떻게 대처했나요?' },
  { id: 's4', category: 'situational', text: '상사나 동료와 의견 충돌이 있었던 경험을 말씀해주세요.' },
  { id: 's5', category: 'situational', text: '예상치 못한 문제가 발생했을 때 대처했던 경험을 말씀해주세요.' },
  { id: 's6', category: 'situational', text: '리더십을 발휘했던 경험이 있다면 말씀해주세요.' },
];

const FOLLOW_UPS = {
  situation: [
    '그 상황이 벌어지기 전, 배경이나 맥락을 조금 더 구체적으로 설명해주실 수 있나요?',
    '그 일이 언제, 어떤 팀/프로젝트에서 있었던 일인지 말씀해주세요.',
  ],
  action: [
    '그 상황에서 본인이 구체적으로 어떤 행동을 했는지 더 자세히 말씀해주세요.',
    '다른 선택지도 있었을 텐데, 왜 그 방법을 선택했나요?',
  ],
  result: [
    '그 결과 실제로 어떤 변화가 있었나요? 수치나 사례로 설명해주실 수 있나요?',
    '그 경험을 통해 배운 점은 무엇이었나요?',
  ],
  generic: [
    '만약 다시 같은 상황이 온다면 다르게 할 부분이 있을까요?',
    '그 답변에서 가장 어려웠던 부분은 무엇이었나요?',
    '그 선택이 팀이나 결과에 미친 영향을 조금 더 설명해주실 수 있나요?',
  ],
};

function getCategoryLabel(categoryId) {
  const found = CATEGORIES.find((c) => c.id === categoryId);
  return found ? found.label : categoryId;
}

function pickQuestions(categoryIds, count) {
  const pool = QUESTIONS.filter((q) => categoryIds.includes(q.category));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
