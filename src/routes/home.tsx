import { useEffect } from "react"
import { useLoaderData, useFetcher } from "react-router"
import {
  getTodayParent,
  switchDay,
  isPaybackDay,
  getDebtInfo,
} from "../lib/day-logic"

export async function loader() {
  return {
    parent: getTodayParent(),
    isPayback: isPaybackDay(),
    debt: getDebtInfo(),
  }
}

export async function action() {
  switchDay()
  return {
    parent: getTodayParent(),
    isPayback: isPaybackDay(),
    debt: getDebtInfo(),
  }
}

export default function Home() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()

  const current = fetcher.data ?? data
  const { parent, isPayback, debt } = current
  const isSubmitting = fetcher.state === "submitting"

  const isMamae = parent === "mamae"
  const emoji = isMamae ? "🌺" : "🌴"
  const title = isMamae ? "Dia da Mamãe" : "Dia do Papai"
  const bgClass = isMamae ? "bg-mamae" : "bg-papai"

  useEffect(() => {
    document.body.classList.remove("mamae-day", "papai-day")
    document.body.classList.add(isMamae ? "mamae-day" : "papai-day")

    const themeColor = isMamae ? "#ffafcc" : "#a8e6cf"
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor)
  }, [isMamae])

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

        <fetcher.Form method="post">
          <button
            type="submit"
            className="switch-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Trocando..." : "🔄 Trocar dia"}
          </button>
        </fetcher.Form>

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
    </div>
  )
}
