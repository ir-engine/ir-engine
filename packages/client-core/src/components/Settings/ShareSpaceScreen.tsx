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

import { useHookstate } from '@hookstate/core'
import { AnimatePresence } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import React from 'react'
import { createPortal } from 'react-dom'
import { useShareMenu } from '../../hooks/useShareMenu'
import ShareDrawer from './ShareDrawer'

interface ShareSpaceScreenProps {
  navigateTo: (screen: string) => void
}

const ShareSpaceScreen: React.FC<ShareSpaceScreenProps> = () => {
  const { shareLink, copyLinkToClipboard, questLink, inviteLink } = useShareMenu()
  const contentDiv = document.getElementById('settings-menu-content')!
  const openDrawer = useHookstate(false)

  const portal = createPortal(
    <AnimatePresence>{openDrawer.value && <ShareDrawer onClose={() => openDrawer.set(false)} />}</AnimatePresence>,
    contentDiv
  )

  return (
    <div className="xs:gap-6 flex h-full flex-col items-center justify-between p-4 md:flex-row md:items-start md:justify-center md:gap-5">
      {/* QR Code */}
      <div className={' flex flex-1 flex-col justify-center'}>
        <div className="rounded-lg bg-white p-4">
          <QRCodeSVG className="h-[130px] w-[130px]" value={shareLink} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full flex-col gap-3">
        <button
          onClick={() => copyLinkToClipboard(inviteLink)}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Copy Direct Link
        </button>

        <button
          onClick={() => copyLinkToClipboard(questLink)}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Share to Meta Quest
        </button>

        <button
          onClick={() => openDrawer.set(!openDrawer.value)}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Share by email or phone
        </button>
      </div>
      {portal}
    </div>
  )
}

export default ShareSpaceScreen
