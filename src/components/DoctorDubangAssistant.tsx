import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Square,
  Stethoscope,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  ChatMessage,
  GeoLocationState,
  Language,
  MedicalID,
  QuickSymptom,
} from '../types';
import type { TranslationBundle } from '../i18n/translations';

interface DoctorDubangAssistantProps {
  language: Language;
  medicalId: MedicalID;
  location: GeoLocationState;
  t: TranslationBundle;
}

const AVATAR_URL = '/src/assets/images/doctor_dubang_avatar_1794824787617.jpg';

const QUICK_SYMPTOMS: QuickSymptom[] = [
  {
    id: 'chest',
    labelKey: 'symptomChestPain',
    prompt: 'Emergency: Person is having severe chest pain / possible heart attack. Give immediate first-aid steps.',
  },
  {
    id: 'bleeding',
    labelKey: 'symptomBleeding',
    prompt: 'Emergency: Person has heavy bleeding from an injury or accident. Give immediate first-aid steps.',
  },
  {
    id: 'unconscious',
    labelKey: 'symptomUnconscious',
    prompt: 'Emergency: Person is unconscious or not breathing normally. Give immediate CPR / recovery steps.',
  },
  {
    id: 'choking',
    labelKey: 'symptomChoking',
    prompt: 'Emergency: Person is choking and cannot breathe well. Give immediate Heimlich / first-aid steps.',
  },
  {
    id: 'burn',
    labelKey: 'symptomBurn',
    prompt: 'Emergency: Person has a severe burn. Give immediate safe first-aid steps.',
  },
];

function float32ToBase64Pcm16(float32: Float32Array): string {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 0x8000;
  }
  return float32;
}

export function DoctorDubangAssistant({
  language,
  medicalId,
  location,
  t,
}: DoctorDubangAssistantProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: t.initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Voice Call (Live API) states
  const [voiceCallState, setVoiceCallState] = useState<
    'idle' | 'connecting' | 'active'
  >('idle');
  const [liveCaption, setLiveCaption] = useState('');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);

  // Single-clip mic recording states
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // TTS read-aloud states
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Live API Refs (avoid stale closures in audio callbacks)
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const liveUserTranscriptRef = useRef<string>('');
  const liveBotTranscriptRef = useRef<string>('');

  // Keep welcome message localized if user switches language before chatting
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], text: t.initialGreeting }];
      }
      return prev;
    });
  }, [t.initialGreeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, liveCaption]);

  useEffect(() => {
    return () => {
      stopLiveVoiceCall();
      stopTtsAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const stopTtsAudio = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = '';
      audioElRef.current = null;
    }
    setPlayingMsgId(null);
  };

  const playMessageTts = async (msgId: string, text: string) => {
    if (playingMsgId === msgId) {
      stopTtsAudio();
      return;
    }
    stopTtsAudio();
    setPlayingMsgId(msgId);
    try {
      const res = await fetch('/api/first-aid/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      const data = (await res.json()) as {
        audioBase64?: string;
        mimeType?: string;
        error?: string;
      };
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Could not generate voice audio.');
      }

      const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
      audioElRef.current = audio;
      audio.onended = () => setPlayingMsgId(null);
      audio.onerror = () => setPlayingMsgId(null);
      await audio.play();
    } catch (err) {
      setPlayingMsgId(null);
      setErrorText(err instanceof Error ? err.message : 'Unable to play voice audio.');
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText ?? inputText).trim();
    if (!trimmed || isSending) return;

    setErrorText(null);
    if (!overrideText) setInputText('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: formatTime(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsSending(true);

    const locationText =
      location.status === 'ready' &&
      location.lat !== undefined &&
      location.lng !== undefined
        ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
        : undefined;

    try {
      const res = await fetch('/api/first-aid/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          language,
          medicalId,
          locationText,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Unable to get first-aid guidance.');
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (autoReadAloud) {
        void playMessageTts(botMsg.id, botMsg.text);
      }
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : 'Failed to connect to Doctor Dubang.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleSingleVoiceInput = async () => {
    if (voiceCallState !== 'idle') return;

    if (isRecordingClip && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingClip(false);
      return;
    }

    setErrorText(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      recordedChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          const base64Audio = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = String(reader.result || '');
              resolve(result.split(',')[1] || '');
            };
            reader.onerror = () => reject(new Error('Failed to read audio recording.'));
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/first-aid/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType,
              language,
            }),
          });
          const data = (await res.json()) as { transcript?: string; error?: string };
          if (!res.ok) throw new Error(data.error || 'Transcription failed.');
          if (data.transcript?.trim()) {
            await sendMessage(data.transcript.trim());
          }
        } catch (err) {
          setErrorText(
            err instanceof Error ? err.message : 'Unable to transcribe audio.'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecordingClip(true);
    } catch {
      setErrorText('Microphone permission is required for voice input.');
      setIsRecordingClip(false);
    }
  };

  const clearScheduledAudio = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Ignore already stopped sources
      }
    }
    activeSourcesRef.current = [];
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsModelSpeaking(false);
  };

  const playLivePcmChunk = (base64Audio: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;

    const float32 = base64Pcm16ToFloat32(base64Audio);
    const buffer = outCtx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = outCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startAt = Math.max(now, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;

    activeSourcesRef.current.push(source);
    setIsModelSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsModelSpeaking(false);
      }
    };
  };

  const stopLiveVoiceCall = () => {
    clearScheduledAudio();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((tr) => tr.stop());
      micStreamRef.current = null;
    }
    if (inputCtxRef.current) {
      void inputCtxRef.current.close();
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      void outputCtxRef.current.close();
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    liveUserTranscriptRef.current = '';
    liveBotTranscriptRef.current = '';
    setLiveCaption('');
    setVoiceCallState('idle');
  };

  const startLiveVoiceCall = async () => {
    if (voiceCallState !== 'idle') {
      stopLiveVoiceCall();
      return;
    }

    stopTtsAudio();
    setErrorText(null);
    setVoiceCallState('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const medSummary = [
        medicalId.name ? `Name: ${medicalId.name}` : '',
        medicalId.bloodGroup ? `Blood: ${medicalId.bloodGroup}` : '',
        medicalId.allergies ? `Allergies: ${medicalId.allergies}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/api/live-voice?lang=${encodeURIComponent(
        language
      )}&medicalContext=${encodeURIComponent(medSummary)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type: string;
            audio?: string;
            text?: string;
            message?: string;
          };

          if (msg.type === 'ready') {
            setVoiceCallState('active');
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (ev) => {
              if (ws.readyState !== WebSocket.OPEN) return;
              const channelData = ev.inputBuffer.getChannelData(0);
              const base64 = float32ToBase64Pcm16(channelData);
              ws.send(JSON.stringify({ audio: base64 }));
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          } else if (msg.type === 'audio' && msg.audio) {
            playLivePcmChunk(msg.audio);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            liveUserTranscriptRef.current += msg.text;
            setLiveCaption(liveUserTranscriptRef.current);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            liveBotTranscriptRef.current += msg.text;
            setLiveCaption(liveBotTranscriptRef.current);
          } else if (msg.type === 'interrupted') {
            clearScheduledAudio();
          } else if (msg.type === 'turnComplete') {
            const userChunk = liveUserTranscriptRef.current.trim();
            const botChunk = liveBotTranscriptRef.current.trim();
            const additions: ChatMessage[] = [];
            if (userChunk) {
              additions.push({
                id: `lv-u-${Date.now()}`,
                role: 'user',
                text: userChunk,
                timestamp: formatTime(),
                isVoiceTranscript: true,
              });
            }
            if (botChunk) {
              additions.push({
                id: `lv-a-${Date.now() + 1}`,
                role: 'assistant',
                text: botChunk,
                timestamp: formatTime(),
                isVoiceTranscript: true,
              });
            }
            if (additions.length > 0) {
              setMessages((prev) => [...prev, ...additions]);
            }
            liveUserTranscriptRef.current = '';
            liveBotTranscriptRef.current = '';
            setLiveCaption('');
          } else if (msg.type === 'error') {
            setErrorText(msg.message || 'Voice call error occurred.');
            stopLiveVoiceCall();
          } else if (msg.type === 'closed') {
            stopLiveVoiceCall();
          }
        } catch {
          // Ignore invalid socket JSON
        }
      };

      ws.onerror = () => {
        setErrorText('Could not establish live voice connection.');
        stopLiveVoiceCall();
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          stopLiveVoiceCall();
        }
      };
    } catch {
      setErrorText('Microphone permission is required for a live voice call.');
      stopLiveVoiceCall();
    }
  };

  return (
    <section
      id="doctor-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Doctor Dubang Header */}
      <div className="bg-blue-700 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {avatarError ? (
            <div className="w-11 h-11 rounded-full bg-blue-800 border border-blue-500 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            </div>
          ) : (
            <img
              src={AVATAR_URL}
              alt="Doctor Dubang"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-11 h-11 rounded-full object-cover border border-blue-400 shrink-0 bg-blue-800"
            />
          )}
          <div className="min-w-0">
            <h2 className="font-display font-bold text-base leading-tight truncate">
              Doctor Dubang
            </h2>
            <p className="text-xs text-blue-100 mt-0.5 truncate">
              {voiceCallState === 'active'
                ? t.voiceLiveStatus
                : voiceCallState === 'connecting'
                  ? t.connectingVoice
                  : t.doctorSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoReadAloud((prev) => !prev)}
            title={autoReadAloud ? t.readAloudOn : t.readAloudOff}
            aria-label={autoReadAloud ? t.readAloudOn : t.readAloudOff}
            className={`min-h-[40px] min-w-[40px] px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              autoReadAloud
                ? 'bg-blue-900 border-blue-400 text-white'
                : 'bg-blue-800/70 border-blue-500/70 text-blue-100 hover:bg-blue-800'
            }`}
          >
            {autoReadAloud ? (
              <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {autoReadAloud ? t.readAloudOn : t.readAloudOff}
            </span>
          </button>

          <button
            type="button"
            onClick={startLiveVoiceCall}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              voiceCallState === 'idle'
                ? 'bg-white text-blue-800 hover:bg-blue-50 shadow-sm'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {voiceCallState === 'idle' ? (
              <>
                <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.startVoiceCall}</span>
              </>
            ) : (
              <>
                <PhoneOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.endVoiceCall}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Voice Activity Bar */}
      {(voiceCallState !== 'idle' || isRecordingClip) && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-1 h-5 shrink-0" aria-hidden="true">
            <span className="w-1 h-4 bg-blue-700 rounded-full voice-wave-bar" />
            <span
              className="w-1 h-5 bg-blue-700 rounded-full voice-wave-bar"
              style={{ animationDelay: '0.15s' }}
            />
            <span
              className="w-1 h-3.5 bg-blue-700 rounded-full voice-wave-bar"
              style={{ animationDelay: '0.3s' }}
            />
            <span
              className="w-1 h-5 bg-blue-700 rounded-full voice-wave-bar"
              style={{ animationDelay: '0.45s' }}
            />
          </div>
          <p className="text-xs font-semibold text-blue-900 truncate">
            {isRecordingClip
              ? t.recordingVoice
              : voiceCallState === 'connecting'
                ? t.connectingVoice
                : liveCaption
                  ? liveCaption
                  : isModelSpeaking
                    ? t.voiceSpeaking
                    : t.voiceListening}
          </p>
        </div>
      )}

      {/* Quick Emergency Triage Buttons */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto">
        {QUICK_SYMPTOMS.map((symptom) => (
          <button
            key={symptom.id}
            type="button"
            disabled={isSending}
            onClick={() => void sendMessage(t[symptom.labelKey])}
            className="min-h-[36px] whitespace-nowrap shrink-0 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-800 border border-slate-300 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {t[symptom.labelKey]}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {errorText && (
        <div
          role="alert"
          className="mx-4 mt-3 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-3"
        >
          <span>{errorText}</span>
          <button
            type="button"
            onClick={() => setErrorText(null)}
            className="text-red-700 font-semibold hover:underline shrink-0 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat Transcript */}
      <div className="p-4 sm:p-5 h-[340px] lg:h-[420px] overflow-y-auto space-y-3.5 bg-slate-50/70">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const isPlaying = playingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  isAssistant
                    ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-xs'
                    : 'bg-blue-700 text-white rounded-tr-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isAssistant ? 'text-blue-800' : 'text-blue-100'
                    }`}
                  >
                    {isAssistant ? 'Doctor Dubang' : 'You'}
                    <span className="font-normal opacity-75"> · {msg.timestamp}</span>
                  </span>

                  {isAssistant && (
                    <button
                      type="button"
                      onClick={() => void playMessageTts(msg.id, msg.text)}
                      className="text-xs font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>{t.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.playAudio}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {(isSending || isTranscribing) && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200 text-slate-600 rounded-2xl rounded-tl-sm px-4 py-3 text-xs font-medium">
              {isTranscribing ? t.transcribingVoice : t.thinkingLabel}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSingleVoiceInput()}
          disabled={voiceCallState !== 'idle' || isTranscribing}
          title={t.speakLabel}
          aria-label={t.speakLabel}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-50 ${
            isRecordingClip
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
          }`}
        >
          {isRecordingClip ? (
            <MicOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Mic className="w-5 h-5" aria-hidden="true" />
          )}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.inputPlaceholder}
          className="flex-1 min-w-0 min-h-[44px] border border-slate-300 rounded-xl px-3.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600"
        />

        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={!inputText.trim() || isSending}
          aria-label={t.sendLabel}
          className="min-h-[44px] px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t.sendLabel}</span>
        </button>
      </div>
    </section>
  );
}
