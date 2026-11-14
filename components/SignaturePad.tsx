'use client'

import { useEffect, useRef, useState } from 'react'

// Finger/mouse/stylus signature box. Works on phones (touch) and computers (mouse).
// Calls onChange with a PNG data URL when the applicant has drawn something, or '' when cleared.
export default function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const inkRef = useRef(false)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1a1a6e'
  }, [])

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pointFromEvent(e)
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !canvasRef.current || !last.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const p = pointFromEvent(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!inkRef.current) {
      inkRef.current = true
      setHasInk(true)
    }
  }

  function handleUp() {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    if (canvasRef.current && inkRef.current) {
      onChange(canvasRef.current.toDataURL('image/png'))
    }
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    inkRef.current = false
    setHasInk(false)
    onChange('')
  }

  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded bg-white relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
          style={{ width: '100%', height: '160px', touchAction: 'none', display: 'block' }}
          aria-label="Signature box: sign here with your finger or mouse"
        />
        {!hasInk && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none">
            Sign here with your finger
          </p>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400">Draw your signature in the box above.</p>
        <button type="button" onClick={clear} className="text-xs text-chm-red hover:underline">
          Clear signature
        </button>
      </div>
    </div>
  )
}
