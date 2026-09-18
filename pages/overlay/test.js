"use client"

import { OverlayProvider } from "../../components/overlay/core/OverlayProvider"
import ThemeProvider from "../../components/overlay/core/ThemeProvider"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function TestOverlay() {

  const router = useRouter()
  const { tId, matchId } = router.query

  // ✅ router ready fix (important)
  if (!router.isReady) return <div>Loading...</div>

  if (!tId || !matchId) {
    return <div>Invalid Params</div>
  }

  return (
    <OverlayProvider tId={tId} matchId={matchId}>
      
      {/* ✅ Debug Panel (remove later) */}
      <OverlayDebugger />

      <ThemeProvider />

    </OverlayProvider>
  )
}
