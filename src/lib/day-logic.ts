type Parent = "mamae" | "papai"

interface DayState {
  switches: string[]
  debt: number
}

const STORAGE_KEY = "dia-de-quem-state"
const BASE_DATE = "2026-02-02"
const BASE_PARENT: Parent = "mamae"
const MAX_DEBT = 2

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
  return days % 2 === 0 ? BASE_PARENT : "papai"
}

function oppositeParent(parent: Parent): Parent {
  return parent === "mamae" ? "papai" : "mamae"
}

function clampDebt(debt: number): number {
  return Math.max(-MAX_DEBT, Math.min(MAX_DEBT, debt))
}

export function loadState(): DayState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        switches: parsed.switches ?? [],
        debt: parsed.debt ?? 0,
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { switches: [], debt: 0 }
}

function saveState(state: DayState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function getLastSwitchDate(switches: string[]): string | null {
  if (switches.length === 0) return null
  return [...switches].sort().pop() ?? null
}

function findPaybackStart(lastSwitch: string, owedParent: Parent): string {
  let checkDate = addDays(lastSwitch, 1)
  for (let i = 0; i < 10; i++) {
    if (getBaseParentForDate(checkDate) === owedParent) {
      return checkDate
    }
    checkDate = addDays(checkDate, 1)
  }
  return checkDate
}

export function getParentForDate(dateStr: string = getDateString()): Parent {
  const state = loadState()
  const base = getBaseParentForDate(dateStr)

  if (state.switches.includes(dateStr)) {
    return oppositeParent(base)
  }

  if (state.debt === 0) {
    return base
  }

  const lastSwitch = getLastSwitchDate(state.switches)
  if (!lastSwitch || dateStr <= lastSwitch) {
    return base
  }

  const owedParent: Parent = state.debt > 0 ? "papai" : "mamae"
  const paybackStart = findPaybackStart(lastSwitch, owedParent)
  const daysIntoPayback = daysBetween(paybackStart, dateStr)

  if (daysIntoPayback >= 0 && daysIntoPayback < Math.abs(state.debt)) {
    return owedParent
  }

  return base
}

export function getTodayParent(): Parent {
  return getParentForDate(getDateString())
}

export function switchDay(): { success: boolean; newParent: Parent } {
  const today = getDateString()
  const state = loadState()
  const baseParent = getBaseParentForDate(today)

  const isCurrentlySwitched = state.switches.includes(today)

  if (isCurrentlySwitched) {
    state.switches = state.switches.filter((d) => d !== today)
    if (baseParent === "papai") {
      state.debt = clampDebt(state.debt - 1)
    } else {
      state.debt = clampDebt(state.debt + 1)
    }
  } else {
    state.switches.push(today)
    if (baseParent === "papai") {
      state.debt = clampDebt(state.debt + 1)
    } else {
      state.debt = clampDebt(state.debt - 1)
    }
  }

  const thirtyDaysAgo = addDays(today, -30)
  state.switches = state.switches.filter((d) => d >= thirtyDaysAgo)

  saveState(state)
  return { success: true, newParent: getTodayParent() }
}

export function isPaybackDay(): boolean {
  const state = loadState()
  const today = getDateString()

  if (state.debt === 0) return false
  if (state.switches.includes(today)) return false

  const lastSwitch = getLastSwitchDate(state.switches)
  if (!lastSwitch || today <= lastSwitch) return false

  const owedParent: Parent = state.debt > 0 ? "papai" : "mamae"
  const paybackStart = findPaybackStart(lastSwitch, owedParent)
  const daysIntoPayback = daysBetween(paybackStart, today)

  return daysIntoPayback >= 0 && daysIntoPayback < Math.abs(state.debt)
}

export function getDebtInfo(): { owedTo: Parent | null; amount: number } {
  const state = loadState()
  if (state.debt === 0) return { owedTo: null, amount: 0 }
  return {
    owedTo: state.debt > 0 ? "papai" : "mamae",
    amount: Math.abs(state.debt),
  }
}
