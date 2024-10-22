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
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

export const UnsupportedDevice = () => {
  const { t } = useTranslation()

  return (
    <Modal className="w-10/12 md:w-6/12" hideFooter>
      <div className="flex flex-col rounded-lg bg-[#0e0f11] px-5 py-10 text-center">
        <div className="mb-10 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#191b1f]">
            <HiOutlineExclamationTriangle className="text-3xl text-[#f43f5e]" />
          </div>
        </div>
        <Text fontSize="2xl" fontWeight="bold" className="capitalize">
          {t('common:unsupportedDevice.title')}
        </Text>
        <Text fontSize="lg" className="mt-4 text-[#b2b5bd]">
          {t('common:unsupportedDevice.description')}
        </Text>
      </div>
    </Modal>
  )
}
