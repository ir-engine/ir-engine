/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { PiSquaresFourThin } from 'react-icons/pi'

import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { useTranslation } from 'react-i18next'

export default function Toolbar() {
  const { t } = useTranslation()

  return (
    <div className="bg-theme-primary flex items-center justify-between">
      <Button variant="outline" rounded="none" startIcon={<PiSquaresFourThin />} className="border-0 bg-transparent" />
      <div className="bg-theme-surface-main flex items-center gap-2.5 rounded-full p-0.5">
        <div className="rounded-2xl px-2.5">{t('editor:toolbar.lbl-simple')}</div>
        <div className="bg-blue-primary rounded-2xl px-2.5">{t('editor:toolbar.lbl-advanced')}</div>
      </div>
      <Button rounded="none">{t('editor:toolbar.lbl-publish')}</Button>
    </div>
  )
}
