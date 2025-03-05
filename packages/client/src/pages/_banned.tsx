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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdWarning } from 'react-icons/md'

export default function UserBanned() {
  const { t } = useTranslation()
  return (
    <Modal
      id="user-banned-modal"
      className="pointer-events-auto fixed inset-0 z-[10000] m-auto flex h-[250px] w-[600px] rounded-xl bg-surface-1 [&>div]:flex [&>div]:w-full [&>div]:flex-col"
      hideFooter={true}
      rawChildren={
        <div className="flex w-full flex-col items-center gap-6 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white">
            <MdWarning />
          </div>
          <span className="text-center text-text-secondary">{t('user:common.userBannedMessage') as string}</span>
          <span className="text-center text-text-secondary">
            {t('user:common.userBannedMessageDescription') as string}
          </span>
        </div>
      }
    />
  )
}
