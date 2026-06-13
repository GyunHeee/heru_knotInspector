export type BreakIntervalMinutes = 30 | 60 | 120

export type BreakReminderSettings = {
  enabled: boolean
  intervalMinutes: BreakIntervalMinutes
}

export const BREAK_REMINDER_STORAGE_KEY = "knot-inspector-break-reminder-settings"

export const DEFAULT_BREAK_REMINDER_SETTINGS: BreakReminderSettings = {
  enabled: true,
  intervalMinutes: 60,
}

export function normalizeBreakReminderSettings(
  value: Partial<BreakReminderSettings> | null | undefined,
): BreakReminderSettings {
  const intervalMinutes = value?.intervalMinutes

  return {
    enabled: value?.enabled ?? DEFAULT_BREAK_REMINDER_SETTINGS.enabled,
    intervalMinutes:
      intervalMinutes === 30 || intervalMinutes === 60 || intervalMinutes === 120
        ? intervalMinutes
        : DEFAULT_BREAK_REMINDER_SETTINGS.intervalMinutes,
  }
}

export function loadBreakReminderSettings(): BreakReminderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_BREAK_REMINDER_SETTINGS
  }

  try {
    const storedValue = window.localStorage.getItem(BREAK_REMINDER_STORAGE_KEY)

    if (!storedValue) {
      return DEFAULT_BREAK_REMINDER_SETTINGS
    }

    return normalizeBreakReminderSettings(
      JSON.parse(storedValue) as Partial<BreakReminderSettings>,
    )
  } catch {
    return DEFAULT_BREAK_REMINDER_SETTINGS
  }
}

export function saveBreakReminderSettings(settings: BreakReminderSettings) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(BREAK_REMINDER_STORAGE_KEY, JSON.stringify(settings))
}
