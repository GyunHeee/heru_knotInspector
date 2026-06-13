export type VoiceSettings = {
  enabled: boolean
  rate: number
  volume: number
}

export const VOICE_SETTINGS_STORAGE_KEY = "knot-inspector-voice-settings"

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  rate: 0.9,
  volume: 1,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeVoiceSettings(value: Partial<VoiceSettings> | null | undefined): VoiceSettings {
  return {
    enabled: value?.enabled ?? DEFAULT_VOICE_SETTINGS.enabled,
    rate: clamp(value?.rate ?? DEFAULT_VOICE_SETTINGS.rate, 0.5, 1.5),
    volume: clamp(value?.volume ?? DEFAULT_VOICE_SETTINGS.volume, 0, 1),
  }
}

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_VOICE_SETTINGS
  }

  try {
    const storedValue = window.localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY)

    if (!storedValue) {
      return DEFAULT_VOICE_SETTINGS
    }

    return normalizeVoiceSettings(JSON.parse(storedValue) as Partial<VoiceSettings>)
  } catch {
    return DEFAULT_VOICE_SETTINGS
  }
}

export function saveVoiceSettings(settings: VoiceSettings) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function speakKorean(text: string, settings: VoiceSettings) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !settings.enabled) {
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "ko-KR"
  utterance.rate = settings.rate
  utterance.volume = settings.volume
  window.speechSynthesis.speak(utterance)
}
