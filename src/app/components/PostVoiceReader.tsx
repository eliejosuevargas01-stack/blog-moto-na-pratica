'use client';

import { useEffect, useState } from "react";
import { PauseCircle, PlayCircle } from "lucide-react";

interface PostVoiceReaderProps {
  title: string;
  content: string;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PostVoiceReader({ title, content }: PostVoiceReaderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supportsSpeech = typeof window.speechSynthesis !== "undefined";
    if (!supportsSpeech) {
      setIsReady(false);
      return;
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((voice) =>
        /pt(-|_)br|portuguese/i.test(voice.lang) && /female|feminina/i.test(voice.name)
      );
      const fallback = voices.find((voice) => /pt(-|_)br|portuguese/i.test(voice.lang));
      const chosen = preferred || fallback || voices[0];
      setVoiceName(chosen?.name || null);
      setIsReady(true);
    };

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleToggle = () => {
    if (typeof window === "undefined") return;

    const fullText = `${stripHtml(title)}. ${stripHtml(content)}`;

    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      return;
    }

    if (typeof window.speechSynthesis === "undefined") {
      setIsReady(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) =>
      /pt(-|_)br|portuguese/i.test(voice.lang) && /female|feminina/i.test(voice.name)
    );
    const fallback = voices.find((voice) => /pt(-|_)br|portuguese/i.test(voice.lang));
    if (preferred || fallback) {
      utterance.voice = preferred || fallback;
    }

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/20"
    >
      {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
      {isPlaying ? "Pausar leitura" : isReady ? `Ouvir artigo${voiceName ? " · voz pronta" : ""}` : "Carregando voz..."}
    </button>
  );
}
