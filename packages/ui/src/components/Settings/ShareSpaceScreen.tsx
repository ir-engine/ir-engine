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

import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useState } from 'react'

interface ShareSpaceScreenProps {
  navigateTo: (screen: string) => void
}

const ShareSpaceScreen: React.FC<ShareSpaceScreenProps> = () => {
  const [shareLink, setShareLink] = useState('')
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  useEffect(() => {
    // Set the share link to the current URL
    setShareLink(window.location.href)
  }, [])

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setShowCopyNotification(true)
    setTimeout(() => {
      setShowCopyNotification(false)
    }, 3000)
  }

  const shareToMetaQuest = () => {
    // Implement Meta Quest sharing functionality
    console.log('Sharing to Meta Quest')
  }

  const shareByEmailOrPhone = () => {
    // Implement email/phone sharing functionality
    console.log('Opening email/phone sharing dialog')
  }

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
          onClick={copyLinkToClipboard}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Copy Direct Link
        </button>

        <button
          onClick={shareToMetaQuest}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Share to Meta Quest
        </button>

        <button
          onClick={shareByEmailOrPhone}
          className="w-full rounded-full bg-white/20 py-3 text-center text-white hover:bg-white/30"
        >
          Share by email or phone
        </button>
      </div>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-gray-800/90 px-6 py-3 text-white">
          Direct Link Has Been Copied.
        </div>
      )}
    </div>
  )
}

export default ShareSpaceScreen
