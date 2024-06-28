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

import React, { ChangeEvent, useCallback, useEffect } from 'react'

import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { State } from '@etherealengine/hyperflux'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'

export default function GLTFTransformProperties({
  transformParms,
  onChange
}: {
  transformParms: State<ModelTransformParameters>
  onChange: (transformParms: ModelTransformParameters) => void
}) {
  const { t } = useTranslation()
  const onChangeTransformParm = useCallback((scope: State<any>) => {
    return (value: typeof scope.value) => {
      scope.set(value)
      onChange(JSON.parse(JSON.stringify(transformParms.value)))
    }
  }, [])

  const onChangeTransformStringParm = useCallback((scope: State<any>) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      scope.set(e.target.value)
    }
  }, [])

  const onChangeParameter = useCallback(
    (scope: State<any>, key: string) => (val: any) => {
      scope[key].set(val)
      onChange(JSON.parse(JSON.stringify(transformParms.value)))
    },
    []
  )

  useEffect(() => {
    console.log('transformParms', transformParms)
  }, [transformParms])

  return (
    <>
      <div className="grid grid-cols-4 gap-2 border-b border-theme-primary pb-6">
        <div className="col-span-1 flex flex-col justify-around gap-y-2">
          <Text
            fontSize="xs"
            fontWeight="medium"
            className="block px-2 py-0.5 text-right leading-[1.125rem] text-[#D3D5D9]"
            style={{
              textWrap: 'nowrap' // tailwind class is not working
            }}
          >
            {t('editor:properties.model.transform.dst')}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="medium"
            className="px-2 py-0.5 text-right leading-[1.125rem] text-[#D3D5D9]"
            style={{
              textWrap: 'nowrap' // tailwind class is not working
            }}
          >
            {t('editor:properties.model.transform.resourceUri')}
          </Text>
        </div>
        <div className="col-span-3 flex flex-col justify-around gap-y-2">
          <Input
            value={transformParms?.dst.value || ''}
            onChange={(e) => {
              transformParms.dst.set(e.target.value)
            }}
            className="px-2 py-0.5 font-['Figtree'] text-sm text-[#9CA0AA]"
          />
          <Input
            value={transformParms?.resourceUri.value || ''}
            onChange={(e) => {
              transformParms.resourceUri.set(e.target.value)
            }}
            className="px-2 py-0.5 font-['Figtree'] text-sm text-[#9CA0AA]"
          />
        </div>
      </div>
    </>
  )
}
