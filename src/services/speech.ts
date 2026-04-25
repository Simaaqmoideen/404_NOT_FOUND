import type { Language } from '../types';

// BCP-47 language codes for Speech Synthesis
const langCodes: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
};

let speaking = false;
const queue: Array<{ text: string; lang: Language }> = [];

function processQueue() {
  if (speaking || queue.length === 0) return;
  const { text, lang } = queue.shift()!;
  speaking = true;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCodes[lang];
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onend = () => {
    speaking = false;
    processQueue();
  };
  utterance.onerror = () => {
    speaking = false;
    processQueue();
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speak(text: string, lang: Language = 'en'): void {
  if (!window.speechSynthesis) return;
  queue.push({ text, lang });
  processQueue();
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
    queue.length = 0;
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
