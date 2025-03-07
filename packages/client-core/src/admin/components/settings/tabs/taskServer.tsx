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

import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'

const TaskServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const settingTaskServer = useFind(engineSettingPath, {
    query: {
      category: 'task-server',
      paginate: false
    }
  }).data

  const ports = settingTaskServer.filter((el) => el.key === EngineSettings.TaskServer.Port).map((el) => el.value)
  const processIntervals = settingTaskServer
    .filter((el) => el.key === EngineSettings.TaskServer.ProcessInterval)
    .map((el) => el.value)

  return (
    <Accordion
      title={t('admin:components.setting.taskServer.taskServer')}
      subtitle={t('admin:components.setting.taskServer.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.taskServer.port'),
            position: 'top'
          }}
          value={ports.join(', ')}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.taskServer.processInterval'),
            position: 'top'
          }}
          value={processIntervals.join(', ')}
          disabled
        />
      </div>
    </Accordion>
  )
})

export default TaskServerTab
