import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  GoogleGenAI,
  Modality,
  ThinkingLevel,
  type LiveServerMessage,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

type SupportedLanguage = 'gu' | 'hi' | 'en' | 'es';

interface MedicalIdPayload {
  name?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

function getLanguageName(lang: SupportedLanguage): string {
  switch (lang) {
    case 'gu':
      return 'Gujarati (ગુજરાતી)';
    case 'hi':
      return 'Hindi (हिन्दी)';
    case 'es':
      return 'Spanish (Español)';
    default:
      return 'English';
  }
}

function buildDoctorSystemInstruction(
  lang: SupportedLanguage,
  medicalId?: MedicalIdPayload,
  locationText?: string
): string {
  const langName = getLanguageName(lang);
  const medLines: string[] = [];
  if (medicalId?.name) medLines.push(`Patient Name: ${medicalId.name}`);
  if (medicalId?.bloodGroup) medLines.push(`Blood Group: ${medicalId.bloodGroup}`);
  if (medicalId?.allergies) medLines.push(`Allergies / Conditions: ${medicalId.allergies}`);
  if (medicalId?.emergencyContact) medLines.push(`Emergency Contact: ${medicalId.emergencyContact}`);

  const medContext =
    medLines.length > 0
      ? `\n\nSaved Patient Medical ID on this device:\n${medLines.join('\n')}`
      : '';

  const gpsContext = locationText ? `\n\nCurrent GPS context: ${locationText}` : '';

  return [
    `You are Doctor Dubang, a calm, authoritative, compassionate emergency first-aid triage assistant.`,
    `Always respond strictly in ${langName} unless the user explicitly writes in another language.`,
    `Keep responses concise, structured, and immediately actionable for someone in a stressful medical emergency:`,
    `1. If symptoms sound life-threatening (chest pain, unconsciousness, severe bleeding, difficulty breathing, stroke signs, anaphylaxis), immediately remind them to call 108 (ambulance) or 112 (emergency) right away.`,
    `2. Give 3 to 5 clear, numbered, step-by-step first-aid actions they can perform right now while waiting for medical help.`,
    `3. Ask ONE brief, critical follow-up triage question at the end (for example: whether the person is conscious and breathing normally).`,
    `4. Never invent prescriptions or dosages for controlled drugs, and keep formatting clean without markdown code blocks.`,
    medContext,
    gpsContext,
  ].join('\n');
}

function buildLiveVoiceInstruction(
  lang: SupportedLanguage,
  medicalContext?: string
): string {
  const langName = getLanguageName(lang);
  return [
    `You are Doctor Dubang, an emergency first-aid voice assistant speaking live with someone who may be in an urgent medical situation.`,
    `Speak calmly, clearly, and warmly in ${langName}.`,
    `Give short, direct, spoken step-by-step first-aid instructions (2 to 3 sentences per turn so the caller can follow along easily).`,
    `If the situation sounds life-threatening, remind them immediately to dial 108 or 112 on speakerphone.`,
    `Ask one short clarifying question at a time (e.g., "Are they breathing?" or "Is there heavy bleeding?").`,
    medicalContext ? `Patient Medical ID context: ${medicalContext}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function extractGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      message: 'API access denied. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('400')) {
    return {
      status: 400,
      message: 'Invalid Gemini request or API key. Please check Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Rate limit reached. Please wait a moment and try again.',
    };
  }
  return { status: 500, message: raw || 'Failed to reach Doctor Dubang AI service.' };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'doctor-dubang' });
  });

  app.post('/api/first-aid/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        language = 'gu',
        medicalId,
        locationText,
      } = req.body as {
        message?: string;
        history?: ChatHistoryItem[];
        language?: SupportedLanguage;
        medicalId?: MedicalIdPayload;
        locationText?: string;
      };

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const ai = getAiClient();
      const contents = [
        ...history.slice(-10).map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }],
        })),
        {
          role: 'user',
          parts: [{ text: message.trim() }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: buildDoctorSystemInstruction(language, medicalId, locationText),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Empty response from Doctor Dubang AI.' });
        return;
      }

      res.json({ reply });
    } catch (err) {
      const parsed = extractGeminiError(err);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  app.post('/api/first-aid/tts', async (req, res) => {
    try {
      const { text } = req.body as { text?: string };
      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Text is required for speech generation.' });
        return;
      }

      const cleanText = text.replace(/[*#_`]/g, '').trim().slice(0, 1200);
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: 'Calm, reassuring, clear emergency physician giving first-aid guidance',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({ error: 'Unable to synthesize speech audio.' });
        return;
      }

      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (err) {
      const parsed = extractGeminiError(err);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  app.post('/api/first-aid/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm', language = 'gu' } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        language?: SupportedLanguage;
      };

      if (!audioBase64) {
        res.status(400).json({ error: 'Audio data is required.' });
        return;
      }

      const ai = getAiClient();
      const langName = getLanguageName(language);
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: `Transcribe the spoken emergency message accurately. Preferred language context: ${langName}. Return only the transcribed text without extra commentary.`,
            },
          ],
        },
      });

      const transcript = response.text?.trim() ?? '';
      res.json({ transcript });
    } catch (err) {
      const parsed = extractGeminiError(err);
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  const server = http.createServer(app);

  // WebSocket bridge for Doctor Dubang Two-Way Live Voice Call
  const wss = new WebSocketServer({ server, path: '/api/live-voice' });

  wss.on('connection', async (clientWs, req) => {
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let closed = false;

    try {
      const reqUrl = new URL(req.url || '/api/live-voice', `http://${req.headers.host || 'localhost'}`);
      const langParam = (reqUrl.searchParams.get('lang') || 'gu') as SupportedLanguage;
      const validLang: SupportedLanguage = ['gu', 'hi', 'en', 'es'].includes(langParam)
        ? langParam
        : 'gu';
      const medicalContext = reqUrl.searchParams.get('medicalContext') || '';

      const ai = getAiClient();

      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
          systemInstruction: buildLiveVoiceInstruction(validLang, medicalContext),
        },
        callbacks: {
          onopen: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'ready' }));
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            const serverContent = message.serverContent;
            if (serverContent?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'inputTranscript',
                  text: serverContent.inputTranscription.text,
                })
              );
            }
            if (serverContent?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'outputTranscript',
                  text: serverContent.outputTranscription.text,
                })
              );
            }

            for (const part of serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  })
                );
              }
            }

            if (serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            if (serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          },
          onerror: (err) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err instanceof Error ? err.message : 'Voice stream error.',
                })
              );
            }
          },
          onclose: () => {
            if (!closed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
        },
      });

      clientWs.on('message', (raw) => {
        if (!liveSession) return;
        try {
          const payload = JSON.parse(raw.toString()) as {
            type?: string;
            audio?: string;
            text?: string;
          };
          if (payload.audio) {
            liveSession.sendRealtimeInput({
              audio: {
                data: payload.audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } else if (payload.text) {
            liveSession.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch {
          // Ignore malformed client frame
        }
      });

      clientWs.on('close', () => {
        closed = true;
        if (liveSession) {
          try {
            liveSession.close();
          } catch {
            // Ignore close error
          }
          liveSession = null;
        }
      });
    } catch (err) {
      const parsed = extractGeminiError(err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'error', message: parsed.message }));
        clientWs.close();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Doctor Dubang server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
