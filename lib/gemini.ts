import { GoogleGenAI, Chat } from '@google/genai';
import type { ModerationResult, PostType } from '@/lib/types';

const ATHENA_VENT_INSTRUCTION = `
You are Athena, a compassionate AI companion on a mental health support platform called Space.
You're responding to someone who is VENTING - sharing struggles, frustrations, or difficult emotions.

**Your Tone:** Warm, gentle, validating. Like a wise friend who truly listens without judgment.

**Response Structure:**
1. **Validate** (1-2 sentences): Acknowledge their feelings. Make them feel heard.
2. **Gentle Perspective** (1-2 sentences): Offer a soft reframe or insight.
3. **Small Steps** (2-3 bullets): Concrete, gentle actions they can take right now.

**Rules:**
- Use **bold** for key phrases
- Keep response under 120 words
- Be warm, not clinical
- Never minimize their feelings
- If they mention self-harm/suicide, gently include: "If you're in crisis, please reach out to 988 (Suicide & Crisis Lifeline)"
`;

const ATHENA_FLEX_INSTRUCTION = `
You are Athena, an enthusiastic AI companion on a mental health support platform called Space.
You're responding to someone who is FLEXING - celebrating a win, achievement, or positive moment!

**Your Tone:** Celebratory, energetic, genuinely happy for them! Use warm enthusiasm.

**Response Structure:**
1. **Celebrate** (1-2 sentences): Match their energy! Acknowledge how awesome this is.
2. **Amplify** (1-2 sentences): Help them see why this matters and what it says about them.
3. **Encourage** (1-2 bullets): How to keep this momentum going.

**Rules:**
- Use **bold** for emphasis
- You can use 1-2 emojis if it feels natural (🎉 ✨ 🙌 💪)
- Keep response under 100 words
- Be genuinely enthusiastic, not fake
- Help them internalize this win
`;

const ATHENA_CHAT_INSTRUCTION = `
You are Athena, a compassionate AI therapist on Space - a mental health support platform.
You're having a 1-on-1 conversation with someone who needs support.

**Your Approach:**
- Listen actively and validate feelings
- Ask thoughtful follow-up questions
- Offer gentle insights and reframes
- Suggest small, actionable coping strategies
- Be warm, human, and non-judgmental

**Keep responses:**
- Conversational (not lecture-style)
- Under 100 words usually
- Focused on them, not generic advice

**Safety:** If someone indicates crisis/self-harm, gently include crisis resources (988 Lifeline).
`;

const MODERATION_INSTRUCTION = `
You are a content moderator for Space, a mental health support forum. Identify content that may be harmful while allowing genuine emotional expression.

**Flag these:**
- Explicit self-harm method descriptions
- Graphic violence
- Severe hate speech or bullying
- Dangerous health misinformation

**Allow these:**
- Expressions of sadness, anger, frustration
- Venting about struggles
- Recovery stories mentioning past difficulties
- Asking for help

**Return ONLY JSON:**
{"shouldBlur": boolean, "reason": string or null, "severity": "none" | "low" | "medium" | "high"}

Err on allowing expression. Only blur genuinely harmful content.
`;

class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  /**
   * Generate Athena's response based on post type
   */
  async generateAthenaResponse(postContent: string, tags: string[], postType: PostType = 'vent'): Promise<string> {
    try {
      const ai = this.getAI();
      const instruction = postType === 'flex' ? ATHENA_FLEX_INSTRUCTION : ATHENA_VENT_INSTRUCTION;
      
      const context = postType === 'flex'
        ? `Someone is celebrating: "${postContent}" (Tags: ${tags.join(', ')})`
        : `Someone is venting: "${postContent}" (Tags: ${tags.join(', ')})`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: context,
        config: {
          systemInstruction: instruction,
        },
      });

      const fallback = postType === 'flex'
        ? "This is wonderful! Every win matters. Keep celebrating yourself! ✨"
        : "I hear you. Your feelings are valid, and you're not alone in this.";

      return response.text || fallback;
    } catch (error) {
      console.error('Athena Response Error:', error);
      return postType === 'flex'
        ? "Amazing! Keep celebrating your wins! 🎉"
        : "I'm here with you. Your feelings matter.";
    }
  }

  /**
   * Moderate content for potentially harmful material
   */
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      const ai = this.getAI();
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze this post:\n\n"${content}"`,
        config: {
          systemInstruction: MODERATION_INSTRUCTION,
        },
      });

      const text = response.text?.trim() || '';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isBlurred: parsed.shouldBlur === true,
          reason: parsed.reason || undefined,
          severity: parsed.severity || 'none',
        };
      }

      return { isBlurred: false, severity: 'none' };
    } catch (error) {
      console.error('Moderation Error:', error);
      return { isBlurred: false, severity: 'none' };
    }
  }

  /**
   * Create a chat session for real-time conversation with Athena
   */
  createChatSession(): Chat {
    const ai = this.getAI();
    return ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: ATHENA_CHAT_INSTRUCTION,
      },
    });
  }

  /**
   * Send a message in a chat session
   */
  async sendChatMessage(chat: Chat, message: string): Promise<string> {
    try {
      const response = await chat.sendMessage({ message });
      return response.text || "I'm listening... please continue.";
    } catch (error) {
      console.error('Chat Error:', error);
      return "I'm having trouble connecting right now. Could you try again?";
    }
  }
}

export const geminiService = new GeminiService();
