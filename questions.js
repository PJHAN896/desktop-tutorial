const CATEGORIES = [
  { id: 'personality', label: '인성' },
  { id: 'technical', label: '직무 역량' },
  { id: 'situational', label: '상황/경험' },
  { id: 'nh_audit', label: '농협 전산점검역' },
];

const QUESTIONS = [
  { id: 'p1', category: 'personality', text: '자기소개를 1분 이내로 해주세요.' },
  { id: 'p2', category: 'personality', text: '본인의 장점과 단점은 무엇인가요?' },
  { id: 'p3', category: 'personality', text: '왜 우리 회사에 지원하셨나요?' },
  { id: 'p4', category: 'personality', text: '입사 후 이루고 싶은 목표는 무엇인가요?' },
  { id: 'p5', category: 'personality', text: '스트레스를 받을 때 어떻게 해소하나요?' },
  { id: 'p6', category: 'personality', text: '팀워크에서 본인의 역할은 무엇이라고 생각하나요?' },

  { id: 't1', category: 'technical', text: '본인이 가장 자신 있는 업무 역량은 무엇이고, 그 이유는 무엇인가요?' },
  { id: 't2', category: 'technical', text: '최근에 새로 습득한 지식이나 기술이 있다면 소개해주세요.' },
  { id: 't3', category: 'technical', text: '업무를 검토받거나 피드백을 받을 때 중요하게 생각하는 기준은 무엇인가요?' },
  { id: 't4', category: 'technical', text: '업무상 어려웠던 문제를 어떻게 해결했는지 설명해주세요.' },
  { id: 't5', category: 'technical', text: '새로운 시스템이나 프로세스를 도입할 때 어떤 요소를 고려하나요?' },
  { id: 't6', category: 'technical', text: '본인의 업무 처리 방식(계획-실행-점검)을 설명해주세요.' },

  { id: 's1', category: 'situational', text: '팀 내 갈등을 해결했던 경험을 말씀해주세요.' },
  { id: 's2', category: 'situational', text: '실패했던 프로젝트 경험과 그로부터 배운 점을 말씀해주세요.' },
  { id: 's3', category: 'situational', text: '마감 기한이 촉박했던 상황에서 어떻게 대처했나요?' },
  { id: 's4', category: 'situational', text: '상사나 동료와 의견 충돌이 있었던 경험을 말씀해주세요.' },
  { id: 's5', category: 'situational', text: '예상치 못한 문제가 발생했을 때 대처했던 경험을 말씀해주세요.' },
  { id: 's6', category: 'situational', text: '리더십을 발휘했던 경험이 있다면 말씀해주세요.' },

  { id: 'nh1', category: 'nh_audit', text: '오랜 은행·금융감독기관 경력을 마무리하고 전산점검역(계약직)에 지원하신 이유는 무엇인가요?' },
  { id: 'nh2', category: 'nh_audit', text: '자점감사자로서 업무를 수행할 때 가장 중요하게 생각하는 원칙이나 자세는 무엇인가요?' },
  { id: 'nh3', category: 'nh_audit', text: '일일 전산점검(자점감사) 업무를 수행할 때 어떤 절차와 기준으로 점검 항목을 확인하시나요?' },
  { id: 'nh4', category: 'nh_audit', text: '전산 로그나 거래 데이터에서 이상 징후를 어떻게 식별하고 검증하시나요?' },
  { id: 'nh5', category: 'nh_audit', text: '최근 금융권에서 발생하는 전산·내부통제 사고 유형과 그에 대한 대응 방안에 대해 설명해주세요.' },
  { id: 'nh6', category: 'nh_audit', text: '보유하신 자격증이나 경력이 실제 점검·감사 업무에 어떻게 도움이 되었는지 설명해주세요.' },
  { id: 'nh7', category: 'nh_audit', text: '점검 또는 감사 업무 중 중대한 규정 위반이나 이상 거래를 발견했던 경험과, 그때 어떻게 대처했는지 말씀해주세요.' },
  { id: 'nh8', category: 'nh_audit', text: '점검 대상 영업점 직원과 감사자로서 입장이 부딪혔던 상황이 있다면, 어떻게 해결하셨나요?' },
  { id: 'nh9', category: 'nh_audit', text: '제한된 시간 안에 여러 점검 항목을 처리해야 했던 경험과, 우선순위를 어떻게 정했는지 설명해주세요.' },
  { id: 'nh10', category: 'nh_audit', text: '본인의 판단과 조직(영업점 또는 상급자)의 입장이 다를 때, 감사자로서 어떻게 균형을 맞추시나요?' },
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
