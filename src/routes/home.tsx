import { useEffect, useState, useCallback } from "react"
import { useLoaderData, useFetcher } from "react-router"
import {
  fetchStateFromCloud,
  switchDay,
  subscribeToChanges,
  getParentForState,
  isPaybackDayForState,
  getDebtInfoForState,
} from "../lib/day-logic"

interface LoaderData {
  parent: "mamae" | "papai"
  isPayback: boolean
  debt: { owedTo: "mamae" | "papai" | null; amount: number }
}

export async function loader(): Promise<LoaderData> {
  const state = await fetchStateFromCloud()
  return {
    parent: getParentForState(state),
    isPayback: isPaybackDayForState(state),
    debt: getDebtInfoForState(state),
  }
}

export async function action(): Promise<LoaderData> {
  const result = await switchDay()
  return {
    parent: result.newParent,
    isPayback: isPaybackDayForState(result.newState),
    debt: getDebtInfoForState(result.newState),
  }
}

export default function Home() {
  const initialData = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const [liveData, setLiveData] = useState<LoaderData | null>(null)
  const [showSyncToast, setShowSyncToast] = useState(false)

  const data = liveData ?? fetcher.data ?? initialData
  const { parent, isPayback, debt } = data
  const isSubmitting = fetcher.state === "submitting"

  const isMamae = parent === "mamae"
  const emoji = isMamae ? "🌺" : "🌴"
  const title = isMamae ? "Dia da Mamãe" : "Dia do Papai"
  const bgClass = isMamae ? "bg-mamae" : "bg-papai"

  useEffect(() => {
    const unsubscribe = subscribeToChanges((newState) => {
      setLiveData({
        parent: getParentForState(newState),
        isPayback: isPaybackDayForState(newState),
        debt: getDebtInfoForState(newState),
      })
      setShowSyncToast(true)
      setTimeout(() => setShowSyncToast(false), 3000)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (fetcher.data) {
      setLiveData(null)
    }
  }, [fetcher.data])

  useEffect(() => {
    document.body.classList.remove("mamae-day", "papai-day")
    document.body.classList.add(isMamae ? "mamae-day" : "papai-day")

    const themeColor = isMamae ? "#ffafcc" : "#a8e6cf"
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor)
  }, [isMamae])

  const handleRefresh = useCallback(async () => {
    const state = await fetchStateFromCloud()
    setLiveData({
      parent: getParentForState(state),
      isPayback: isPaybackDayForState(state),
      debt: getDebtInfoForState(state),
    })
  }, [])

  return (
    <div className={`container ${bgClass}`}>
      <div className="sun" />
      <div className="clouds">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      <main className="content">
        <h1 className="greeting">Oi, Kai! 👋</h1>

        <div className="day-card">
          <span className="emoji">{emoji}</span>
          <h2 className="title">{title}</h2>
          {isPayback && (
            <p className="payback-badge">🔄 Dia de troca!</p>
          )}
        </div>

        <div className="button-group">
          <fetcher.Form method="post">
            <button
              type="submit"
              className="switch-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Trocando..." : "🔄 Trocar dia"}
            </button>
          </fetcher.Form>

          <button
            type="button"
            className="share-button"
            onClick={handleRefresh}
          >
            🔄 Atualizar
          </button>
        </div>

        {debt.owedTo && debt.amount > 0 && (
          <p className="hint">
            {debt.owedTo === "papai" ? "Papai" : "Mamãe"} tem {debt.amount} {debt.amount === 1 ? "dia" : "dias"} guardado{debt.amount === 1 ? "" : "s"}
          </p>
        )}
      </main>

      <div className="decorations">
        <span className="deco deco-1">🦜</span>
        <span className="deco deco-2">🥥</span>
        <span className="deco deco-3">🌊</span>
        <span className="deco deco-4">🐢</span>
        <span className="deco deco-5">🍍</span>
      </div>

      {showSyncToast && (
        <div className="toast toast-sync">✅ Atualizado!</div>
      )}
    </div>
  )
}
