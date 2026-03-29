import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function buildPrompt(
  topic: string,
  triggerType: string,
  silentUsers?: string[]
): string {
  if (triggerType === 'individual_silence') {
    const names = silentUsers?.join(', ') ?? 'a student';
    return `In a group discussion about "${topic}", the student(s) ${names} have been silent for over 60 seconds. 
    Generate a warm, encouraging question (1-2 sentences) directed at them to help them contribute. 
    Make it specific to the topic and easy to answer. 
    Reply in English. Only provide the question, no preamble.`;
  }

  if (triggerType === 'group_silence') {
    return `In a group discussion about "${topic}", the entire group has been silent for over 30 seconds.
    Generate a thought-provoking follow-up question (1-2 sentences) to re-energize the discussion.
    Make it open-ended and relevant to the topic.
    Reply in English. Only provide the question, no preamble.`;
  }

  if (triggerType === 'time_warning') {
    return `A group discussion about "${topic}" is approaching its end (80% of time elapsed).
    Generate a brief reminder (1-2 sentences) to guide the group toward summarizing their key points.
    Be encouraging and concise.
    Reply in English. Only provide the message, no preamble.`;
  }

  return `Generate a helpful discussion prompt for the topic: "${topic}"`;
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, triggerType, silentUsers, sessionId, groupId } = await request.json();

    if (!topic || !triggerType) {
      return NextResponse.json({ error: 'topic and triggerType required' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    let message: string;

    if (apiKey) {
      // Call DeepSeek API
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful AI assistant for classroom group discussions. Keep responses concise and encouraging.',
            },
            {
              role: 'user',
              content: buildPrompt(topic, triggerType, silentUsers),
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      message = data.choices?.[0]?.message?.content ?? 'What are your thoughts on this topic so far?';
    } else {
      // Fallback messages when API key is not configured
      const fallbacks: Record<string, string> = {
        individual_silence: `${silentUsers?.[0] ?? 'You'}, what do you think about "${topic}"? Your perspective is valuable!`,
        group_silence: `Let's keep the discussion going! What aspect of "${topic}" do you find most interesting?`,
        time_warning: `We're almost out of time! Let's summarize the key points we've discussed about "${topic}".`,
      };
      message = fallbacks[triggerType] ?? 'What are your thoughts on the discussion so far?';
    }

    // Save the AI prompt to the database
    if (sessionId && groupId) {
      await supabase.from('ai_prompts').insert({
        group_id: groupId,
        session_id: sessionId,
        trigger_type: triggerType,
        content: message,
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('AI guidance error:', error);
    return NextResponse.json({ error: 'Failed to generate guidance' }, { status: 500 });
  }
}
