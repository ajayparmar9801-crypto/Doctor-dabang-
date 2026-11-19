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
  Type,
  type LiveServerMessage,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getPrivateMapsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
    ''
  );
}

function redactSecrets(text: string): string {
  return text.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_KEY]');
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

function parseErrorBodyMessage(raw: string): { code?: number; status?: string; message?: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return {};
  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { code?: number; status?: string; message?: string };
      code?: number;
      status?: string;
      message?: string;
    };
    if (parsed.error) return parsed.error;
    return parsed;
  } catch {
    return {};
  }
}

function isRetryableGeminiError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const upper = raw.toUpperCase();
  return (
    upper.includes('503') ||
    upper.includes('UNAVAILABLE') ||
    upper.includes('HIGH DEMAND') ||
    upper.includes('OVERLOADED') ||
    upper.includes('429') ||
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('ECONNRESET') ||
    upper.includes('ETIMEDOUT') ||
    upper.includes('UPSTREAM_TIMEOUT')
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function runWithGeminiFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  if (fallbackFn) {
    try {
      return await withTimeout(primaryFn(), 8000, 'UPSTREAM_TIMEOUT');
    } catch (primaryErr) {
      if (!isRetryableGeminiError(primaryErr)) {
        throw primaryErr;
      }
      await sleep(300);
      try {
        return await withTimeout(fallbackFn(), 10000, 'UPSTREAM_TIMEOUT');
      } catch (fallbackErr) {
        if (!isRetryableGeminiError(fallbackErr)) {
          throw fallbackErr;
        }
        await sleep(500);
        return await withTimeout(fallbackFn(), 10000, 'UPSTREAM_TIMEOUT');
      }
    }
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await withTimeout(primaryFn(), 12000, 'UPSTREAM_TIMEOUT');
    } catch (err) {
      lastErr = err;
      if (!isRetryableGeminiError(err) || attempt === 1) {
        break;
      }
      await sleep(450);
    }
  }
  throw lastErr;
}

function extractGeminiError(err: unknown): { status: number; message: string } {
  const raw = redactSecrets(err instanceof Error ? err.message : String(err));
  const jsonInfo = parseErrorBodyMessage(raw);
  const combinedUpper = `${raw} ${jsonInfo.status || ''} ${jsonInfo.message || ''}`.toUpperCase();

  if (combinedUpper.includes('MISSING_GEMINI_API_KEY')) {
    return {
      status: 503,
      message: 'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (combinedUpper.includes('UPSTREAM_TIMEOUT')) {
    return {
      status: 504,
      message: 'Doctor Dubang AI timed out due to heavy server load. Please retry in a moment or call 108/112 immediately.',
    };
  }
  if (
    combinedUpper.includes('API_KEY_INVALID') ||
    combinedUpper.includes('API KEY EXPIRED') ||
    combinedUpper.includes('API KEY NOT VALID') ||
    combinedUpper.includes('REVOKED') ||
    combinedUpper.includes('PERMISSION_DENIED') ||
    jsonInfo.code === 403 ||
    combinedUpper.includes('403')
  ) {
    return {
      status: 403,
      message: 'Server API key is invalid, revoked, or restricted. Please update GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (jsonInfo.code === 400 || combinedUpper.includes('INVALID_ARGUMENT')) {
    return {
      status: 400,
      message: jsonInfo.message || 'Invalid AI request parameters. Please check Settings > Secrets.',
    };
  }
  if (
    jsonInfo.code === 429 ||
    combinedUpper.includes('RESOURCE_EXHAUSTED') ||
    combinedUpper.includes('429')
  ) {
    return {
      status: 429,
      message: 'AI rate limit reached. Please wait a few seconds and try again.',
    };
  }
  if (
    jsonInfo.code === 503 ||
    combinedUpper.includes('UNAVAILABLE') ||
    combinedUpper.includes('HIGH DEMAND') ||
    combinedUpper.includes('503')
  ) {
    return {
      status: 503,
      message: 'Doctor Dubang AI is experiencing temporary high demand. Please retry in a few seconds or call 108/112 in an emergency.',
    };
  }
  if (jsonInfo.code === 404 || combinedUpper.includes('NOT_FOUND')) {
    return {
      status: 502,
      message: 'Configured AI model could not be reached. Please try again shortly.',
    };
  }

  return {
    status: 500,
    message: jsonInfo.message || raw || 'Failed to reach Doctor Dubang AI service.',
  };
}

function formatMapsProxyError(
  httpStatus: number,
  apiError?: { status?: string; message?: string }
): { status: number; quotaExceeded?: boolean; keyIssue?: boolean; error: string } {
  const rawMsg = redactSecrets(apiError?.message || '');
  const upper = `${rawMsg} ${apiError?.status || ''}`.toUpperCase();

  if (httpStatus === 429 || apiError?.status === 'RESOURCE_EXHAUSTED') {
    return {
      status: 429,
      quotaExceeded: true,
      error: 'Google Maps Platform quota reached. You can still view verified centers and open Google Maps links.',
    };
  }
  if (
    httpStatus === 403 ||
    upper.includes('PERMISSION_DENIED') ||
    upper.includes('API_KEY') ||
    upper.includes('REVOKED') ||
    upper.includes('EXPIRED')
  ) {
    return {
      status: 403,
      keyIssue: true,
      error: 'Google Maps server key is revoked, restricted, or unauthorized. Verified clinic directory and direct Google Maps links remain active.',
    };
  }
  return {
    status: httpStatus >= 400 ? httpStatus : 502,
    error: rawMsg || 'Unable to load Google hospital places right now.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'doctor-dubang',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      mapsConfigured: Boolean(getPrivateMapsApiKey()),
    });
  });

  app.post('/api/hospitals/nearby', async (req, res) => {
    try {
      const apiKey = getPrivateMapsApiKey();
      if (!apiKey) {
        res.status(503).json({
          keyIssue: true,
          error: 'Google Maps API key is not configured on the server.',
        });
        return;
      }

      const {
        lat,
        lng,
        radius = 8000,
        language = 'en',
      } = req.body as {
        lat?: number;
        lng?: number;
        radius?: number;
        language?: SupportedLanguage;
      };

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        res.status(400).json({ error: 'Valid latitude and longitude are required.' });
        return;
      }

      const fieldMask = [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.googleMapsUri',
        'places.primaryType',
        'places.currentOpeningHours',
      ].join(',');

      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            includedTypes: ['hospital', 'doctor'],
            maxResultCount: 12,
            rankPreference: 'DISTANCE',
            languageCode: language,
            locationRestriction: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: Math.min(Math.max(Number(radius) || 8000, 500), 50000),
              },
            },
          }),
        }
      );

      const data = (await response.json()) as {
        places?: Array<{
          id?: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
          nationalPhoneNumber?: string;
          internationalPhoneNumber?: string;
          googleMapsUri?: string;
          primaryType?: string;
          currentOpeningHours?: { openNow?: boolean };
        }>;
        error?: { status?: string; message?: string };
      };

      if (!response.ok) {
        const mapped = formatMapsProxyError(response.status, data.error);
        res.status(mapped.status).json(mapped);
        return;
      }

      const hospitals = (data.places || [])
        .filter((p) => p.location?.latitude !== undefined && p.location?.longitude !== undefined)
        .map((p) => ({
          id: p.id || `g-${Math.random().toString(36).slice(2, 10)}`,
          placeId: p.id || '',
          name: p.displayName?.text || 'Hospital',
          category: p.primaryType === 'hospital' ? 'hospital' : 'health_center',
          address: p.formattedAddress || 'Address unavailable',
          phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
          lat: p.location!.latitude!,
          lng: p.location!.longitude!,
          emergency24x7: p.primaryType === 'hospital',
          ambulanceAvailable: p.primaryType === 'hospital',
          icuBedsAvailable: 0,
          verified: false,
          googleMapsUri: p.googleMapsUri || '',
          source: 'google' as const,
          isOpenNow: p.currentOpeningHours?.openNow,
        }));

      res.json({ hospitals });
    } catch (err) {
      res.status(500).json({
        error: redactSecrets(
          err instanceof Error ? err.message : 'Unable to fetch nearby hospitals.'
        ),
      });
    }
  });

  app.post('/api/hospitals/search', async (req, res) => {
    try {
      const apiKey = getPrivateMapsApiKey();
      if (!apiKey) {
        res.status(503).json({
          keyIssue: true,
          error: 'Google Maps API key is not configured on the server.',
        });
        return;
      }

      const { query, lat, lng, language = 'en' } = req.body as {
        query?: string;
        lat?: number;
        lng?: number;
        language?: SupportedLanguage;
      };

      if (!query || !query.trim()) {
        res.status(400).json({ error: 'Search query is required.' });
        return;
      }

      const fieldMask = [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.googleMapsUri',
        'places.primaryType',
        'places.currentOpeningHours',
      ].join(',');

      const bodyPayload: Record<string, unknown> = {
        textQuery: `${query.trim()} hospital emergency health center`,
        pageSize: 10,
        languageCode: language,
      };

      if (typeof lat === 'number' && typeof lng === 'number') {
        bodyPayload.locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 25000.0,
          },
        };
      }

      const response = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      const data = (await response.json()) as {
        places?: Array<{
          id?: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
          nationalPhoneNumber?: string;
          internationalPhoneNumber?: string;
          googleMapsUri?: string;
          primaryType?: string;
          currentOpeningHours?: { openNow?: boolean };
        }>;
        error?: { status?: string; message?: string };
      };

      if (!response.ok) {
        const mapped = formatMapsProxyError(response.status, data.error);
        res.status(mapped.status).json(mapped);
        return;
      }

      const hospitals = (data.places || [])
        .filter((p) => p.location?.latitude !== undefined && p.location?.longitude !== undefined)
        .map((p) => ({
          id: p.id || `g-${Math.random().toString(36).slice(2, 10)}`,
          placeId: p.id || '',
          name: p.displayName?.text || 'Hospital',
          category: p.primaryType === 'hospital' ? 'hospital' : 'health_center',
          address: p.formattedAddress || 'Address unavailable',
          phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
          lat: p.location!.latitude!,
          lng: p.location!.longitude!,
          emergency24x7: p.primaryType === 'hospital',
          ambulanceAvailable: p.primaryType === 'hospital',
          icuBedsAvailable: 0,
          verified: false,
          googleMapsUri: p.googleMapsUri || '',
          source: 'google' as const,
          isOpenNow: p.currentOpeningHours?.openNow,
        }));

      res.json({ hospitals });
    } catch (err) {
      res.status(500).json({
        error: redactSecrets(
          err instanceof Error ? err.message : 'Unable to search hospitals.'
        ),
      });
    }
  });

  app.post('/api/emergency/ai-inform', async (req, res) => {
    try {
      const {
        language = 'gu',
        medicalId,
        location,
        symptomSummary,
        targetHospital,
      } = req.body as {
        language?: SupportedLanguage;
        medicalId?: MedicalIdPayload;
        location?: { lat?: number; lng?: number };
        symptomSummary?: string;
        targetHospital?: { name?: string; phone?: string; address?: string };
      };

      const ai = getAiClient();
      const langName = getLanguageName(language);
      const gpsUrl =
        typeof location?.lat === 'number' && typeof location?.lng === 'number'
          ? `https://www.google.com/maps?q=${location.lat.toFixed(6)},${location.lng.toFixed(6)}`
          : 'GPS not locked';

      const prompt = [
        `Compose an emergency hospital pre-arrival notification brief to help save a patient.`,
        `Target Hospital/Health Center: ${targetHospital?.name || 'Nearest Emergency Hospital'} (${targetHospital?.address || ''})`,
        `Patient Name: ${medicalId?.name || 'Unknown Patient'}`,
        `Blood Group: ${medicalId?.bloodGroup || 'Unknown'}`,
        `Allergies / Chronic Conditions: ${medicalId?.allergies || 'None reported'}`,
        `Emergency Contact: ${medicalId?.emergencyContact || 'Not provided'}`,
        `Reported Emergency / Symptoms: ${symptomSummary || 'Urgent medical SOS triggered'}`,
        `Live GPS Link: ${gpsUrl}`,
        `Write the brief clearly in ${langName} (and include key clinical labels so ER/paramedic staff understand immediately). Keep it under 120 words, structured and urgent.`,
      ].join('\n');

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          dispatchBrief: {
            type: Type.STRING,
            description: 'Concise emergency pre-arrival hospital notification brief.',
          },
          urgencyLevel: {
            type: Type.STRING,
            description: 'One of: critical, high, moderate',
          },
        },
        required: ['dispatchBrief', 'urgencyLevel'],
      };

      const response = await runWithGeminiFallback(
        () =>
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema,
            },
          }),
        () =>
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema,
            },
          })
      );

      const raw = (response.text || '{}').trim();
      const parsed = JSON.parse(raw) as {
        dispatchBrief?: string;
        urgencyLevel?: string;
      };
      const urgency =
        parsed.urgencyLevel === 'critical' ||
        parsed.urgencyLevel === 'high' ||
        parsed.urgencyLevel === 'moderate'
          ? parsed.urgencyLevel
          : 'critical';

      res.json({
        dispatchBrief:
          parsed.dispatchBrief ||
          `EMERGENCY ALERT for ${targetHospital?.name || 'Hospital'}: ${symptomSummary || 'Urgent SOS'}. GPS: ${gpsUrl}`,
        urgencyLevel: urgency,
      });
    } catch (err) {
      const parsed = extractGeminiError(err);
      res.status(parsed.status).json({ error: parsed.message });
    }
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

      const systemInstruction = buildDoctorSystemInstruction(
        language,
        medicalId,
        locationText
      );

      const response = await runWithGeminiFallback(
        () =>
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          }),
        () =>
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents,
            config: {
              systemInstruction,
            },
          })
      );

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
      const response = await runWithGeminiFallback(() =>
        ai.models.generateContent({
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
        })
      );

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
      const response = await runWithGeminiFallback(() =>
        ai.models.generateContent({
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
        })
      );

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
              const parsed = extractGeminiError(err);
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: parsed.message,
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
