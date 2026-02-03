import { useEffect, useState, useCallback } from "react"
import { useLoaderData, useFetcher, useSearchParams, useNavigate } from "react-router"
import {
  getTodayParent,
  switchDay,
  isPaybackDay,
  getDebtInfo,
  importState,
  exportState,
} from "../lib/day-logic"

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const syncParam = url.searchParams.get("sync")

  if (syncParam) {
    importState(syncParam)
  }

  return {
    parent: getTodayParent(),
    isPayback: isPaybackDay(),
    debt: getDebtInfo(),
    didSync: !!syncParam,
  }
}

export async function action() {
  switchDay()
  return {
    parent: getTodayParent(),
    isPayback: isPaybackDay(),
    debt: getDebtInfo(),
    didSync: false,
  }
}

export default function Home() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showSyncToast, setShowSyncToast] = useState(false)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncCode, setSyncCode] = useState("")
  const [pasteCode, setPasteCode] = useState("")

  const current = fetcher.data ?? data
  const { parent, isPayback, debt } = current
  const isSubmitting = fetcher.state === "submitting"

  const isMamae = parent === "mamae"
  const emoji = isMamae ? "🌺" : "🌴"
  const title = isMamae ? "Dia da Mamãe" : "Dia do Papai"
  const bgClass = isMamae ? "bg-mamae" : "bg-papai"

  useEffect(() => {
    if (searchParams.has("sync")) {
      setShowSyncToast(true)
      navigate("/", { replace: true })
      const timer = setTimeout(() => setShowSyncToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, navigate])

  useEffect(() => {
    document.body.classList.remove("mamae-day", "papai-day")
    document.body.classList.add(isMamae ? "mamae-day" : "papai-day")

    const themeColor = isMamae ? "#ffafcc" : "#a8e6cf"
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor)
  }, [isMamae])

  const openSyncModal = useCallback(() => {
    setSyncCode(exportState())
    setPasteCode("")
    setShowSyncModal(true)
  }, [])

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(syncCode)
    setShowCopyToast(true)
    setTimeout(() => setShowCopyToast(false), 2000)
  }, [syncCode])

  const handlePasteSync = useCallback(() => {
    if (pasteCode.trim()) {
      const success = importState(pasteCode.trim())
      if (success) {
        setShowSyncModal(false)
        setShowSyncToast(true)
        setTimeout(() => setShowSyncToast(false), 3000)
        navigate("/", { replace: true })
      }
    }
  }, [pasteCode, navigate])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setPasteCode(text)
      }
    } catch {
      // Clipboard access denied
    }
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
            onClick={openSyncModal}
          >
            🔗 Sincronizar
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

      {showSyncModal && (
        <div className="modal-overlay" onClick={() => setShowSyncModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSyncModal(false)}>✕</button>

            <h3 className="modal-title">🔗 Sincronizar</h3>

            <div className="sync-section">
              <p className="sync-label">Seu código:</p>
              <div className="code-box">
                <code className="sync-code">{syncCode}</code>
                <button className="copy-btn" onClick={handleCopyCode}>
                  📋 Copiar
                </button>
              </div>
              <p className="sync-hint">Envie este código para o outro celular</p>
            </div>

            <div className="sync-divider">ou</div>

            <div className="sync-section">
              <p className="sync-label">Colar código recebido:</p>
              <div className="paste-box">
                <input
                  type="text"
                  className="paste-input"
                  value={pasteCode}
                  onChange={(e) => setPasteCode(e.target.value)}
                  placeholder="Cole o código aqui"
                />
                <button className="paste-btn" onClick={handlePasteFromClipboard}>
                  📋
                </button>
              </div>
              <button
                className="apply-btn"
                onClick={handlePasteSync}
                disabled={!pasteCode.trim()}
              >
                ✅ Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSyncToast && (
        <div className="toast toast-sync">✅ Sincronizado!</div>
      )}
      {showCopyToast && (
        <div className="toast toast-share">📋 Código copiado!</div>
      )}
    </div>
  )
}
