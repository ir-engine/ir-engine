/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { isShareAvailable } from '@ir-engine/spatial/src/common/functions/DetectFeatures'
import { motion, Variant } from 'motion/react'
import React, { useEffect, useRef } from 'react'
import { useShareMenu } from '../../hooks/useShareMenu'

interface ShareDrawerProps {
  onClose?: () => void
}

export default function ShareDrawer({ onClose }: ShareDrawerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { shareOnApps, shareLink } = useShareMenu()

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

  const handleShareByEmail = () => {
    if (isShareAvailable) {
      // Use native Web Share API if available
      shareOnApps()
    } else {
      // Fallback to mailto link
      const subject = encodeURIComponent('Join me in this space!')
      const body = encodeURIComponent(`Check out this space: ${shareLink}`)
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    }
    onClose?.()
  }

  const handleShareByPhone = () => {
    if (isShareAvailable) {
      // Use native Web Share API if available
      shareOnApps()
    } else {
      // Fallback to SMS link (works on mobile devices)
      const message = encodeURIComponent(`Check out this space: ${shareLink}`)
      window.open(`sms:?body=${message}`, '_blank')
    }
    onClose?.()
  }

  const handleCancel = () => {
    onClose?.()
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
      className="absolute bottom-0 w-full rounded-t-2xl bg-gray-800"
      ref={ref}
    >
      <div className="flex flex-col gap-3 p-6">
        {/* Share by Email Button */}
        <button
          onClick={handleShareByEmail}
          className="w-full rounded-xl bg-gray-700 py-4 text-center font-medium text-white transition-colors hover:bg-gray-600"
        >
          Share by Email
        </button>

        {/* Share by Phone Button */}
        <button
          onClick={handleShareByPhone}
          className="w-full rounded-xl bg-gray-700 py-4 text-center font-medium text-white transition-colors hover:bg-gray-600"
        >
          Share by Phone
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="w-full rounded-xl bg-transparent py-4 text-center font-medium text-white transition-colors hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
