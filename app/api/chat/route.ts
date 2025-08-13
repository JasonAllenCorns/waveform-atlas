// /app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createPrompt } from '@/lib/gptPrompt';
import { mockGptResponse } from '@/app/__mocks__/gptResponse';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const useMocks = process.env.USE_MOCK_GPT === 'true';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userInput } = body; // expects structured { targetBPM, mood, ... }

  if (!userInput) {
    return NextResponse.json({ error: 'Missing user input' }, { status: 400 });
  }
  // Optional backdoor mock toggle
  if (useMocks) {
    return NextResponse.json({ content: mockGptResponse.content });
  }

  try {
    const { systemPrompt, userPrompt } = createPrompt(userInput);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    // Parse the GPT response as JSON
    let parsedContent;
    try {
      parsedContent = reply ? JSON.parse(reply) : [];
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid response format from GPT' }, { status: 500 });
    }

    return NextResponse.json({ content: parsedContent });
  } catch (error) {
    console.error('GPT API error:', error);
    return NextResponse.json({ error: 'Failed to generate GPT response' }, { status: 500 });
  }
}