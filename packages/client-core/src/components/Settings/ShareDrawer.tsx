import { motion, Variant } from 'motion/react'
import React, { useEffect, useRef } from 'react'

interface ShareDrawerProps {
  onClose?: () => void
}

export default function ShareDrawer({ onClose }: ShareDrawerProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onClickAway = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

  useEffect(() => {
    if (!ref || !ref.current) return
    const container = ref?.current.parentElement
    container?.addEventListener('click', onClickAway)
    return () => {
      container?.removeEventListener('click', onClickAway)
    }
  }, [ref])

  const variants: Record<string, Variant> = {
    down: {
      y: '100%',
      opacity: 0
    },
    up: {
      y: '0%',
      opacity: 1
    }
  }

  return (
    <motion.div
      initial="down"
      animate="up"
      exit="down"
      variants={variants}
      transition={{
        y: { type: 'tween', duration: 0.2 },
        opacity: { duration: 0.2 }
      }}
      className="absolute bottom-0 h-[300px] w-full bg-slate-700"
      ref={ref}
    >
      Test
    </motion.div>
  )
}
