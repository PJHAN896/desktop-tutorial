import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5';

app.post('/api/followup', async (req, res) => {
  const { category, question, answer } = req.body || {};
  if (!question || !answer) {
    res.status(400).json({ error: 'question and answer are required' });
    return;
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      output_config: { effort: 'low' },
      system:
        '당신은 신중하고 노련한 한국어 면접관입니다. 지원자의 답변을 읽고, 더 깊이 파고들어야 할 지점을 짚는 자연스러운 꼬리질문을 딱 1개, 1~2문장으로 만드세요. 질문 문장만 출력하고 따옴표, 번호, 설명은 붙이지 마세요.',
      messages: [
        {
          role: 'user',
          content: `카테고리: ${category || '일반'}\n원래 질문: ${question}\n지원자의 답변: ${answer}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const followup = textBlock && textBlock.text ? textBlock.text.trim() : '';
    if (!followup) {
      res.status(502).json({ error: 'empty response from model' });
      return;
    }
    res.json({ followup });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      res.status(500).json({ error: 'server is missing a valid ANTHROPIC_API_KEY' });
    } else if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'rate limited, try again shortly' });
    } else if (error instanceof Anthropic.APIError) {
      res.status(502).json({ error: `Claude API error: ${error.message}` });
    } else {
      console.error(error);
      res.status(500).json({ error: 'unexpected server error' });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`면접 연습 서버 실행 중: http://localhost:${port}`);
});
