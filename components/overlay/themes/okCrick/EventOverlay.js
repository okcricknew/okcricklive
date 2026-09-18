"use client"

import { useEffect, useState, useRef } from "react"
import { useOverlay } from "../../core/OverlayProvider"
import styles from "./eventOverlay.module.css"

export default function EventOverlay() {
  const match = useOverlay()
  const [eventData, setEventData] = useState(null)

  const lastBallIdRef = useRef(null)
  const initialLengthRef = useRef(null)
  const timerRef = useRef(null)

  // Preload asset images for smooth render
  useEffect(() => {
    const eventImages = [
      "/themes/OkCrick/main-event-bg.png",
      "/themes/OkCrick/event-left.png",
      "/themes/OkCrick/event-right.png"
    ]

    eventImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  const ballHistory = match?.ballHistory || []
  const lastBall = ballHistory[ballHistory.length - 1]

  useEffect(() => {
    if (!lastBall) return

    const ballId = `${lastBall.over}-${lastBall.ball}-${lastBall.runs}-${lastBall.type}-${!!lastBall.wicketInfo}-${ballHistory.length}`

    if (initialLengthRef.current === null) {
      initialLengthRef.current = ballHistory.length
      if (ballHistory.length > 1) {
        lastBallIdRef.current = ballId
        return
      }
    }

    if (lastBallIdRef.current === ballId) return
    lastBallIdRef.current = ballId

    let event = null

    if (lastBall.type === "OUT" || lastBall.wicketInfo) {
      event = "WICKET"
    } else if (lastBall.type === "NB") {
      event = "FREE HIT"
    } else if (lastBall.type === "NORMAL") {
      if (Number(lastBall.runs) === 6) event = "SIX"
      else if (Number(lastBall.runs) === 4) event = "FOUR"
    }

    if (event) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setEventData({
        type: event,
        id: ballHistory.length
      })

      // 6.5s animation sync timing
      timerRef.current = setTimeout(() => {
        setEventData(null)
      }, 6500)
    }
  }, [match?.ballHistory, lastBall, ballHistory.length])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  if (!eventData) return null

  const getFilterStyle = (type) => {
    switch (type) {
      case "WICKET":
        return { filter: "invert(20%) sepia(90%) saturate(5000%) hue-rotate(330deg) brightness(95%)" }
      case "SIX":
        return { filter: "invert(65%) sepia(85%) saturate(2000%) hue-rotate(90deg) brightness(115%)" }
      case "FOUR":
        return { filter: "invert(70%) sepia(60%) saturate(3000%) hue-rotate(150deg) brightness(105%)" }
      case "FREE HIT":
        return { filter: "invert(75%) sepia(70%) saturate(2500%) hue-rotate(0deg) brightness(105%)" }
      default:
        return {}
    }
  }

  return (
    <div className={styles.overlayRoot}>
      <div className={styles.lowerThird}>
        <div className={styles.eventWrapper}>
          <div className={styles.pngLayerFix}>

            {/* LAYER 1: BACKGROUND MASK */}
            <div className={styles.layer}>
              <img 
                src="/themes/OkCrick/main-event-bg.png" 
                className={`${styles.img} ${styles.eventBgMask}`} 
                style={getFilterStyle(eventData.type)}
                alt="event-bg" 
              />
            </div>

            {/* LAYER 2: TEXT */}
            <div className={styles.layer}>
              <div className={styles.titleWrap}>
                <div className={styles.eventText}>{eventData.type}</div>
              </div>
            </div>

            {/* LAYER 3: PARDA PANELS */}
            <div className={styles.layer}>
              <img 
                src="/themes/OkCrick/event-left.png" 
                className={`${styles.img} ${styles.eventLeft}`} 
                alt="parda-left" 
              />
              <img 
                src="/themes/OkCrick/event-right.png" 
                className={`${styles.img} ${styles.eventRight}`} 
                alt="parda-right" 
              />
            </div>

          </div>

          {/* Invisible Preload fallback */}
          <div style={{ display: "none" }}>
            <img src="/themes/OkCrick/main-event-bg.png" alt="preload" />
            <img src="/themes/OkCrick/event-left.png" alt="preload" />
            <img src="/themes/OkCrick/event-right.png" alt="preload" />
          </div>
        </div>
      </div>
    </div>
  )
}
