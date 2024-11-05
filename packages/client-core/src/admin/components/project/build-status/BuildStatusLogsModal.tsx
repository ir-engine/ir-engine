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

import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { BuildStatusType } from '@ir-engine/common/src/schema.type.module'
import { Input } from '@ir-engine/ui'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import CopyText from '@ir-engine/ui/src/primitives/tailwind/CopyText'
import Label from '@ir-engine/ui/src/primitives/tailwind/Label'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { PopoverState } from '../../../../common/services/PopoverState'

const BuildStatusBadgeVariant = {
  success: 'success',
  ended: 'neutral',
  pending: 'neutral',
  failed: 'danger'
}

export function BuildStatusBadge({ status }: { status: string }) {
  return <Badge label={status} variant={BuildStatusBadgeVariant[status] || 'neutral'} className="w-20 rounded" />
}

export function getStartOrEndDate(dateString: string, endDate = false) {
  return endDate && !dateString ? t('admin:components.buildStatus.running') : toDisplayDateTime(dateString)
}

export default function BuildStatusLogsModal({ buildStatus }: { buildStatus: BuildStatusType }) {
  const { t } = useTranslation()

  return (
    <Modal
      className="w-[50vw]"
      title={t('admin:components.buildStatus.viewLogs')}
      onClose={() => PopoverState.hidePopupover()}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <Input
          disabled
          value={buildStatus.id}
          labelProps={{
            text: t('admin:components.buildStatus.columns.id'),
            position: 'top'
          }}
        />
        <div>
          <Label className="mb-2">{t('admin:components.buildStatus.columns.status')}</Label>
          <BuildStatusBadge status={buildStatus.status} />
        </div>
        <Input
          disabled
          labelProps={{
            text: t('admin:components.buildStatus.columns.dateStarted'),
            position: 'top'
          }}
          value={getStartOrEndDate(buildStatus.dateStarted)}
        />
        <Input
          disabled
          labelProps={{
            text: t('admin:components.buildStatus.columns.dateEnded'),
            position: 'top'
          }}
          value={getStartOrEndDate(buildStatus.dateEnded)}
        />
        <div className="col-span-2 max-h-[50vh] overflow-auto">
          <pre className="relative text-wrap bg-stone-300 px-4 py-2 text-sm font-[var(--lato)] dark:bg-stone-800">
            <div className="sticky right-0 top-0 float-right ml-[-100%] h-[calc(100%-1px)] w-[calc(100%-1px)]">
              <CopyText text={buildStatus.logs} className="sticky" />
            </div>
            {buildStatus.logs}
          </pre>
        </div>
      </div>
    </Modal>
  )
}
