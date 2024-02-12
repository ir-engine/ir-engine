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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { getMutableState } from '@etherealengine/hyperflux'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Label from '@etherealengine/ui/src/primitives/tailwind/Label'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import Radios from '@etherealengine/ui/src/primitives/tailwind/Radio'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import { useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function AddEditProjectModal() {
  const { t } = useTranslation()

  const destinationRepoUrl = useHookstate('')
  const sourceRepoUrl = useHookstate('')

  return (
    <Modal
      title={t('admin:components.project.addProject')}
      onClose={() => getMutableState(PopoverState).element.set(null)}
      onSubmit={() => {}}
      className="w-[50vw]"
    >
      <div className="grid gap-6">
        <Input
          label={`${t('admin:components.project.destination')} (${t('admin:components.project.githubUrl')})`}
          value={destinationRepoUrl.value}
          onChange={(event) => destinationRepoUrl.set(event.target.value)}
        />
        <Input
          label={`${t('admin:components.project.source')} (${t('admin:components.project.githubUrl')})`}
          value={sourceRepoUrl.value}
          onChange={(event) => sourceRepoUrl.set(event.target.value)}
        />
        <Input label={t('admin:components.project.branchData')} type="select" value={''} onChange={() => {}} />
        <Input label={t('admin:components.project.commitData')} type="select" value={''} onChange={() => {}} />
        <Text>{t('admin:components.project.autoUpdate')}</Text>
        <div className="flex w-full">
          <div className="w-1/2">
            <Label className="mb-4">{t('admin:components.project.autoUpdateMode')}</Label>
            <Radios
              className="grid-flow-col"
              options={[
                { name: t('admin:components.project.prod'), value: 'prod' },
                { name: t('admin:components.project.dev'), value: 'dev' }
              ]}
              currentValue={null}
              onChange={(value) => {}}
            />
          </div>
          <div className="w-1/2">
            <Input
              label={t('admin:components.project.autoUpdateInterval')}
              type="select"
              value={''}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
