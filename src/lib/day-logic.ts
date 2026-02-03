type Parent = "mamae" | "papai"

interface SwitchEvent {
  date: string
  originalParent: Parent
}

interface DayState {
  switches: SwitchEvent[]
}

const STORAGE_KEY = "dia-de-quem-state"
const BASE_DATE = "2026-02-02"
const BASE_PARENT: Parent = "mamae"

function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function daysBetween(date1: string, date2: string): number {
  const d1 = parseLocalDate(date1)
  const d2 = parseLocalDate(date2)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr)
  date.setDate(date.getDate() + days)
  return getDateString(date)
}

function getBaseParentForDate(dateStr: string): Parent {
  const days = daysBetween(BASE_DATE, dateStr)
  return days % 2 === 0 ? BASE_PARENT : (BASE_PARENT === "mamae" ? "papai" : "mamae")
}

function oppositeParent(parent: Parent): Parent {
  return parent === "mamae" ? "papai" : "mamae"
}

export function loadState(): DayState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return { switches: [] }
}

function saveState(state: DayState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getParentForDate(dateStr: string = getDateString()): Parent {
  const state = loadState()

  for (const sw of state.switches) {
    if (sw.date === dateStr) {
      return oppositeParent(sw.originalParent)
    }
    if (addDays(sw.date, 1) === dateStr || addDays(sw.date, 2) === dateStr) {
      return sw.originalParent
    }
  }

  return getBaseParentForDate(dateStr)
}

export function getTodayParent(): Parent {
  return getParentForDate(getDateString())
}

export function canSwitchToday(): boolean {
  const state = loadState()
  const today = getDateString()

  for (const sw of state.switches) {
    if (addDays(sw.date, 1) === today || addDays(sw.date, 2) === today) {
      return false
    }
  }

  return true
}

export function switchDay(): { success: boolean; newParent: Parent } {
  const today = getDateString()

  if (!canSwitchToday()) {
    return { success: false, newParent: getTodayParent() }
  }

  const state = loadState()
  const originalParent = getBaseParentForDate(today)

  const existingIndex = state.switches.findIndex(sw => sw.date === today)
  if (existingIndex !== -1) {
    state.switches.splice(existingIndex, 1)
  } else {
    state.switches.push({ date: today, originalParent })
  }

  const thirtyDaysAgo = addDays(today, -30)
  state.switches = state.switches.filter(sw => sw.date >= thirtyDaysAgo)

  saveState(state)
  return { success: true, newParent: getTodayParent() }
}

export function isPaybackDay(): boolean {
  const state = loadState()
  const today = getDateString()

  for (const sw of state.switches) {
    if (addDays(sw.date, 1) === today || addDays(sw.date, 2) === today) {
      return true
    }
  }

  return false
}
