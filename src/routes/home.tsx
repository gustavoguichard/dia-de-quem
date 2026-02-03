import { useLoaderData, useFetcher } from "react-router"
import {
  getTodayParent,
  canSwitchToday,
  switchDay,
  isPaybackDay,
} from "../lib/day-logic"

export async function loader() {
  return {
    parent: getTodayParent(),
    canSwitch: canSwitchToday(),
    isPayback: isPaybackDay(),
  }
}

export async function action() {
  const result = switchDay()
  return {
    parent: result.newParent,
    canSwitch: canSwitchToday(),
    isPayback: isPaybackDay(),
  }
}

export default function Home() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()

  const current = fetcher.data ?? data
  const { parent, canSwitch, isPayback } = current
  const isSubmitting = fetcher.state === "submitting"

  const isMamae = parent === "mamae"
  const emoji = isMamae ? "🌺" : "🌴"
  const title = isMamae ? "Dia da Mamãe" : "Dia do Papai"
  const bgClass = isMamae ? "bg-mamae" : "bg-papai"

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
            disabled={!canSwitch || isSubmitting}
          >
            {isSubmitting ? (
              "Trocando..."
            ) : canSwitch ? (
              <>🔄 Trocar dia</>
            ) : (
              <>🚫 Não pode trocar hoje</>
            )}
          </button>
        </fetcher.Form>

        {!canSwitch && (
          <p className="hint">
            Hoje é dia de troca, não dá pra trocar de novo!
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
