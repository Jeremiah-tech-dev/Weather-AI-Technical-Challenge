import { useEffect, useRef, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const bgRef   = useRef(null)
  const mainRef = useRef(null)
  const [brandShow, setBrandShow] = useState(false)
  const [subShow,   setSubShow]   = useState(false)
  const [pct,       setPct]       = useState('0%')
  const [pctHide,   setPctHide]   = useState(false)

  useEffect(() => {
    const splash   = document.getElementById('fp-splash')
    const bgCanvas = bgRef.current
    const mainCanvas = mainRef.current
    const bgCtx  = bgCanvas.getContext('2d')
    const mCtx   = mainCanvas.getContext('2d')

    const CW = 240, CH = 310
    const LEAF_CX = 115, LEAF_CY = 125
    const ROT = -40 * Math.PI / 180
    const ASSEMBLE = 115

    function resizeBg() {
      bgCanvas.width  = splash.offsetWidth
      bgCanvas.height = splash.offsetHeight
    }
    resizeBg()
    window.addEventListener('resize', resizeBg)

    const off    = document.createElement('canvas')
    off.width    = CW; off.height = CH
    const offCtx = off.getContext('2d')

    function traceleaf(ctx) {
      ctx.beginPath()
      ctx.moveTo(0, -100)
      ctx.bezierCurveTo( 30,-86,  60,-44,  64, -6)
      ctx.bezierCurveTo( 67, 30,  50, 72,  16, 96)
      ctx.bezierCurveTo(  6,104,  -6,104, -16, 96)
      ctx.bezierCurveTo(-50, 72, -67, 30, -64, -6)
      ctx.bezierCurveTo(-60,-44, -30,-86,   0,-100)
      ctx.closePath()
    }

    function drawShape() {
      offCtx.clearRect(0, 0, CW, CH)
      offCtx.save()
      offCtx.translate(LEAF_CX, LEAF_CY)
      offCtx.rotate(ROT)

      traceleaf(offCtx)
      const hg = offCtx.createLinearGradient(-64, 0, 64, 0)
      hg.addColorStop(0,    '#0c5a1e')
      hg.addColorStop(0.18, '#187830')
      hg.addColorStop(0.42, '#35b84f')
      hg.addColorStop(0.5,  '#4fd468')
      hg.addColorStop(0.58, '#35b84f')
      hg.addColorStop(0.82, '#187830')
      hg.addColorStop(1,    '#0c5a1e')
      offCtx.fillStyle = hg
      offCtx.fill()

      traceleaf(offCtx)
      const vg = offCtx.createLinearGradient(0, -100, 0, 100)
      vg.addColorStop(0,   'rgba(200,255,210,0.18)')
      vg.addColorStop(0.4, 'rgba(255,255,255,0.06)')
      vg.addColorStop(1,   'rgba(0,0,0,0.15)')
      offCtx.fillStyle = vg
      offCtx.fill()

      offCtx.lineCap = 'round'
      offCtx.beginPath()
      offCtx.moveTo(0, -100)
      offCtx.bezierCurveTo(2, -30, 2, 30, 0, 100)
      offCtx.strokeStyle = '#082e0e'
      offCtx.lineWidth   = 3.5
      offCtx.stroke()

      const veins = [
        [ -82,  28, -90,  14, -88 ],
        [ -60,  46, -72,  23, -70 ],
        [ -38,  56, -52,  28, -50 ],
        [ -15,  61, -28,  31, -28 ],
        [   8,  60,  -6,  30,  -8 ],
        [  30,  52,  18,  26,  16 ],
        [  52,  38,  42,  19,  42 ],
        [  74,  22,  66,  11,  66 ],
      ]

      veins.forEach(function(v, i) {
        var sy=v[0], ex=v[1], ey=v[2], cx=v[3], cy=v[4]
        var lw = Math.max(0.6, 1.9 - i * 0.15)
        offCtx.lineWidth   = lw
        offCtx.strokeStyle = '#083a14'
        offCtx.globalAlpha = 0.88 - i * 0.03
        offCtx.beginPath()
        offCtx.moveTo(0, sy)
        offCtx.quadraticCurveTo(cx, cy, ex, ey)
        offCtx.stroke()
        offCtx.beginPath()
        offCtx.moveTo(0, sy)
        offCtx.quadraticCurveTo(-cx, cy, -ex, ey)
        offCtx.stroke()
        if (i < 5) {
          offCtx.lineWidth   = lw * 0.55
          offCtx.globalAlpha = 0.45
          var mx = (ex + cx) / 2, my = (ey + cy) / 2, tl = 7
          offCtx.beginPath(); offCtx.moveTo(mx, my); offCtx.lineTo(mx + tl, my - tl * 0.35); offCtx.stroke()
          offCtx.beginPath(); offCtx.moveTo(-mx, my); offCtx.lineTo(-mx - tl, my - tl * 0.35); offCtx.stroke()
        }
      })

      offCtx.globalAlpha = 1
      offCtx.restore()

      var cos_r = Math.cos(ROT), sin_r = Math.sin(ROT)
      var bx = LEAF_CX + (0 * cos_r - 100 * sin_r)
      var by = LEAF_CY + (0 * sin_r + 100 * cos_r)
      var stemEx = bx - 20
      var stemEy = Math.min(by + 84, CH - 8)

      offCtx.lineCap    = 'round'
      offCtx.lineJoin   = 'round'
      offCtx.strokeStyle = '#1a6b2a'
      offCtx.lineWidth = 4.5
      offCtx.beginPath()
      offCtx.moveTo(bx, by)
      offCtx.bezierCurveTo(bx - 5, by + 27, stemEx + 6, stemEy - 27, stemEx, stemEy)
      offCtx.stroke()

      offCtx.lineWidth = 3
      offCtx.beginPath()
      offCtx.moveTo(stemEx - 10, stemEy - 14)
      offCtx.lineTo(stemEx,       stemEy)
      offCtx.lineTo(stemEx + 10,  stemEy - 14)
      offCtx.stroke()

      var brSx = bx - 10, brSy = by + 44
      var brEx = brSx - 34, brEy = brSy + 8
      offCtx.lineWidth = 3
      offCtx.beginPath()
      offCtx.moveTo(brSx, brSy)
      offCtx.bezierCurveTo(brSx - 14, brSy - 10, brEx + 12, brEy - 5, brEx, brEy)
      offCtx.stroke()

      offCtx.lineWidth = 2
      offCtx.beginPath()
      offCtx.moveTo(brEx + 12, brEy - 10)
      offCtx.lineTo(brEx,       brEy)
      offCtx.lineTo(brEx + 13,  brEy + 5)
      offCtx.stroke()
    }

    drawShape()

    var imgData = offCtx.getImageData(0, 0, CW, CH).data
    var targets = []
    for (var py = 0; py < CH; py += 3) {
      for (var px = 0; px < CW; px += 3) {
        var idx = (py * CW + px) * 4
        if (imgData[idx + 3] > 55) {
          targets.push({ ltx: px, lty: py, r: imgData[idx], g: imgData[idx+1], b: imgData[idx+2] })
        }
      }
    }

    var N = targets.length
    var SCX = function() { return bgCanvas.width  / 2 }
    var SCY = function() { return bgCanvas.height / 2 }
    var lox = function() { return SCX() - CW / 2 }
    var loy = function() { return SCY() - CH / 2 - 26 }

    var particles = targets.map(function(t, i) {
      var sa = i * 0.215
      var sr = Math.min(i * 0.44, 52)
      return {
        x: SCX() + Math.cos(sa) * sr,
        y: SCY() + Math.sin(sa) * sr,
        vx: 0, vy: 0,
        ltx: t.ltx, lty: t.lty,
        r: t.r, g: t.g, b: t.b,
        size:  0.9 + Math.random() * 1.5,
        hue:   115 + Math.random() * 25,
        sat:   50  + Math.random() * 30,
        lit:   32  + Math.random() * 28,
        delay: ASSEMBLE + Math.floor(Math.random() * 55),
        settled: false,
        alpha:   0
      }
    })

    var frame      = 0
    var brandShown = false
    var settled    = 0
    var rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      frame++

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
      mCtx.clearRect(0, 0, CW, CH)
      settled = 0

      for (var i = 0; i < N; i++) {
        var p = particles[i]

        if (frame < ASSEMBLE) {
          var sa2 = i * 0.215
          var sr2 = Math.min(i * 0.44, 52) + Math.sin(frame * 0.09 + i * 0.05) * 5
          var tx2 = SCX() + Math.cos(sa2 + frame * 0.013) * sr2
          var ty2 = SCY() + Math.sin(sa2 + frame * 0.013) * sr2
          p.x += (tx2 - p.x) * 0.11
          p.y += (ty2 - p.y) * 0.11
          p.alpha = Math.min(1, p.alpha + 0.055)
          bgCtx.save()
          bgCtx.globalAlpha = p.alpha * 0.88
          bgCtx.beginPath()
          bgCtx.arc(p.x, p.y, p.size * 1.25, 0, Math.PI * 2)
          bgCtx.fillStyle   = 'hsl(' + p.hue + ',' + p.sat + '%,' + p.lit + '%)'
          bgCtx.shadowColor = '#28d44a'
          bgCtx.shadowBlur  = 9
          bgCtx.fill()
          bgCtx.restore()
          continue
        }

        if (frame <= p.delay) {
          bgCtx.save()
          bgCtx.globalAlpha = 0.55
          bgCtx.beginPath()
          bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          bgCtx.fillStyle = 'hsl(' + p.hue + ',' + p.sat + '%,' + p.lit + '%)'
          bgCtx.fill()
          bgCtx.restore()
          continue
        }

        if (!p.settled) {
          var ttx = lox() + p.ltx
          var tty = loy() + p.lty
          var dx  = ttx - p.x
          var dy  = tty - p.y
          p.vx = (p.vx + dx * 0.055) * 0.80
          p.vy = (p.vy + dy * 0.055) * 0.80
          p.x += p.vx
          p.y += p.vy
          if (Math.hypot(dx, dy) < 1.0) { p.settled = true; p.x = ttx; p.y = tty }
          bgCtx.save()
          bgCtx.globalAlpha = 0.38
          bgCtx.beginPath()
          bgCtx.arc(p.x, p.y, p.size * 1.35, 0, Math.PI * 2)
          bgCtx.fillStyle   = 'hsl(' + p.hue + ',' + p.sat + '%,' + p.lit + '%)'
          bgCtx.shadowColor = '#3ddc5a'
          bgCtx.shadowBlur  = 11
          bgCtx.fill()
          bgCtx.restore()
        }

        if (p.settled) {
          settled++
          mCtx.save()
          mCtx.globalAlpha = 0.88
          mCtx.beginPath()
          mCtx.arc(p.ltx, p.lty, p.size, 0, Math.PI * 2)
          mCtx.fillStyle   = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')'
          mCtx.shadowColor = '#3ddc5a'
          mCtx.shadowBlur  = 3
          mCtx.fill()
          mCtx.restore()
        }
      }

      var progress = frame < ASSEMBLE ? 0 : Math.min(100, Math.round((settled / N) * 100))
      setPct(progress + '%')

      if (progress >= 96 && !brandShown) {
        brandShown = true
        setBrandShow(true)
        setTimeout(() => setSubShow(true), 300)
        setTimeout(() => setPctHide(true), 900)
        // transition to landing after animation completes
        setTimeout(() => {
          cancelAnimationFrame(rafId)
          onDone()
        }, 2800)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeBg)
    }
  }, []) // eslint-disable-line

  return (
    <div id="fp-splash" style={{
      width: '100vw', height: '100vh', background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <canvas ref={bgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={mainRef} width={240} height={310} style={{ display: 'block' }} />
        <div style={{
          fontFamily: "'Georgia','Times New Roman',serif",
          fontSize: '38px', fontWeight: 700, letterSpacing: '10px',
          color: '#1a4d25', textTransform: 'uppercase', marginTop: '10px',
          opacity: brandShow ? 1 : 0, transform: brandShow ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 1.5s ease, transform 1.5s ease'
        }}>FarmPulse</div>
        <div style={{
          fontFamily: "'Georgia','Times New Roman',serif",
          fontSize: '11px', letterSpacing: '4px', color: '#5aaa6a',
          textTransform: 'uppercase', marginTop: '8px',
          opacity: subShow ? 1 : 0, transform: subShow ? 'translateY(0)' : 'translateY(5px)',
          transition: 'opacity 1.5s ease, transform 1.5s ease'
        }}>Powered by Weather-AI</div>
        <div style={{
          fontFamily: "'Courier New',monospace", fontSize: '13px',
          letterSpacing: '3px', color: '#888', marginTop: '16px', minHeight: '20px',
          opacity: pctHide ? 0 : 1, transition: 'opacity 0.8s ease'
        }}>{pct}</div>
      </div>
    </div>
  )
}
