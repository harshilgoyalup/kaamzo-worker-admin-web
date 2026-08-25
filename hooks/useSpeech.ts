"use client";

import { useState, useCallback, useEffect } from "react";
import { Language } from "../types";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang: Language = "en") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        console.warn("Text-to-Speech is not supported in this environment.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      let targetLang = "en-IN";
      if (lang === "hi") targetLang = "hi-IN";
      if (lang === "pa") targetLang = "pa-IN";

      utterance.lang = targetLang;
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let matchingVoice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(targetLang.slice(0, 2)));
        if (!matchingVoice && lang === "pa") {
          matchingVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.startsWith("en"));
        }
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error("TTS error:", e);
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return { speak, stop, isSpeaking, supported };
}
