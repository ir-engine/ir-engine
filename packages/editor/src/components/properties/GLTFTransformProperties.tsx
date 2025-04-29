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

import React from 'react'

import { ModelTransformParameters } from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { State } from '@ir-engine/hyperflux'
import { Checkbox, Input, Select } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

function CheckBoxParam({
  className,
  label,
  info,
  state
}: {
  className?: string
  label: string
  info?: string
  state: State<boolean>
}) {
  return (
    <div className={twMerge(`my-2.5 grid grid-cols-4 items-center gap-x-2 ${className ?? ''}`)}>
      <div className="col-span-1 col-start-2 text-right">
        <InputGroup label={label} info={info}>
          <div></div>
        </InputGroup>
      </div>

      <div className="col-span-2 col-start-3">
        <Checkbox
          checked={state.value}
          onChange={() => {
            state.set((v) => !v)
          }}
        />
      </div>
    </div>
  )
}

function TextParam({
  label,
  info,
  state,
  parseFunction = (value: string) => value
}: {
  label: string
  info?: string
  state: State<string | number>
  parseFunction?: (value: string) => string | number
}) {
  return (
    <div className="my-1 grid grid-cols-4 items-center gap-x-2">
      <div className="col-span-1 col-start-2 text-right">
        <InputGroup
          label={label}
          // fontWeight="medium"
          // fontSize="xs"
          info={info}
        >
          <div></div>
        </InputGroup>
      </div>

      <div className="col-span-2 col-start-3">
        <Input
          value={state.value}
          onChange={(e) => {
            state.set(parseFunction(e.target.value))
          }}
        />
      </div>
    </div>
  )
}

export default function GLTFTransformProperties({
  transformParms,
  itemCount = 1
}: {
  transformParms: State<ModelTransformParameters>
  itemCount: number
}) {
  const { t } = useTranslation()

  return (
    transformParms && (
      <>
        {itemCount === 1 && (
          <div className="mb-6 grid grid-cols-4 gap-2 border-b  pb-6">
            <div className="col-span-1 flex flex-col justify-around gap-y-2">
              <InputGroup
                label={t('editor:properties.model.transform.dst')}
                className="block px-2 py-0.5 text-right leading-[1.125rem]"
                info={t('editor:properties.model.transform.info-dst')}
              >
                <div></div>
              </InputGroup>
              <InputGroup
                label={t('editor:properties.model.transform.resourceUri')}
                className="px-2 py-0.5 text-right leading-[1.125rem]"
                info={t('editor:properties.model.transform.info-resourceUri')}
              >
                <div></div>
              </InputGroup>
            </div>
            <div className="col-span-3 flex flex-col justify-around gap-y-2">
              <Input
                value={transformParms.dst.value}
                onChange={(e) => {
                  transformParms.dst.set(e.target.value)
                }}
              />
              <Input
                value={transformParms.resourceUri.value}
                onChange={(e) => {
                  transformParms.resourceUri.set(e.target.value)
                }}
              />
            </div>
          </div>
        )}
        {itemCount > 1 && (
          <div className="mb-6 grid grid-cols-4 gap-2 border-b  pb-6">
            <div className="col-span-1 flex flex-col justify-around gap-y-2">
              <Text
                fontSize="xs"
                fontWeight="medium"
                className="block px-2 py-0.5 text-right leading-[1.125rem] "
                style={{
                  textWrap: 'nowrap' // tailwind class is not working
                }}
              >
                {t('editor:properties.model.transform.dst')}
              </Text>
            </div>
            <div className="col-span-3 flex flex-col justify-around gap-y-2">
              <Input value={`${itemCount} Items`} disabled={true} />
            </div>
          </div>
        )}

        <Accordion title="Materials">
          <div className="my-1 grid grid-cols-4 items-center gap-x-2">
            <div className="col-span-1 col-start-2 text-right">
              <InputGroup
                label={t('editor:properties.model.transform.textureFormat')}
                info={t('editor:properties.model.transform.info-textureFormat')}
              >
                <div></div>
              </InputGroup>
            </div>

            <div className="col-span-2 col-start-3">
              <Select
                options={[
                  { label: 'Default', value: 'default' },
                  { label: 'JPG', value: 'jpg' },
                  { label: 'KTX2', value: 'ktx2' },
                  { label: 'PNG', value: 'png' },
                  { label: 'WebP', value: 'webp' }
                ]}
                onChange={(value) => {
                  // @ts-ignore
                  transformParms.textureFormat.set(value)
                }}
                value={transformParms.textureFormat.value}
              />
            </div>
          </div>

          <TextParam
            label={t('editor:properties.model.transform.maxTextureSize')}
            info={t('editor:properties.model.transform.info-maxTextureSize')}
            state={transformParms.maxTextureSize}
            parseFunction={parseInt}
          />

          <TextParam
            label={t('editor:properties.model.transform.simplifyRatio')}
            info={t('editor:properties.model.transform.info-simplifyRatio')}
            state={transformParms.simplifyRatio}
            parseFunction={parseFloat}
          />

          <TextParam
            label={t('editor:properties.model.transform.simplifyErrorThreshold')}
            info={t('editor:properties.model.transform.info-simplifyErrorThreshold')}
            state={transformParms.simplifyErrorThreshold}
            parseFunction={parseFloat}
          />

          <div className="my-1 grid grid-cols-4 items-center gap-x-2">
            <div className="col-span-1 col-start-2 text-right">
              <InputGroup
                label={t('editor:properties.model.transform.textureCompressionType')}
                info={t('editor:properties.model.transform.info-textureCompressionType')}
              >
                <div></div>
              </InputGroup>
            </div>

            <div className="col-span-2 col-start-3">
              <Select
                options={[
                  { label: 'UASTC', value: 'uastc' },
                  { label: 'ETC1', value: 'etc1' }
                ]}
                onChange={(value) => {
                  // @ts-ignore
                  transformParms.textureCompressionType.set(value)
                }}
                value={transformParms.textureCompressionType.value}
              />
            </div>
          </div>

          <TextParam
            label={t('editor:properties.model.transform.ktx2Quality')}
            info={t('editor:properties.model.transform.info-ktx2Quality')}
            state={transformParms.textureCompressionQuality}
            parseFunction={parseFloat}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.split')}
            info={t('editor:properties.model.transform.info-split')}
            state={transformParms.split}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.combineMaterials')}
            info={t('editor:properties.model.transform.info-combineMaterials')}
            state={transformParms.combineMaterials}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.palette')}
            info={t('editor:properties.model.transform.info-palette')}
            state={transformParms.palette.enabled}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.flipY')}
            info={t('editor:properties.model.transform.info-flipY')}
            state={transformParms.flipY}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.linear')}
            info={t('editor:properties.model.transform.info-linear')}
            state={transformParms.linear}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.mipmaps')}
            info={t('editor:properties.model.transform.info-mipmaps')}
            state={transformParms.mipmap}
          />
        </Accordion>

        <Accordion title="Meshes">
          <CheckBoxParam
            label={t('editor:properties.model.transform.instance')}
            info={t('editor:properties.model.transform.info-instance')}
            state={transformParms.instance}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.join')}
            info={t('editor:properties.model.transform.info-join')}
            state={transformParms.join.enabled}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.weldVertices')}
            info={t('editor:properties.model.transform.info-weldVertices')}
            state={transformParms.weld.enabled}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.useMeshoptimizer')}
            info={t('editor:properties.model.transform.info-useMeshoptimizer')}
            state={transformParms.meshoptCompression.enabled}
          />

          <CheckBoxParam
            className={'text-nowrap'}
            label={t('editor:properties.model.transform.useDraco')}
            info={t('editor:properties.model.transform.info-useDraco')}
            state={transformParms.dracoCompression.enabled}
          />
        </Accordion>

        <Accordion title="Scene">
          <CheckBoxParam
            label={t('editor:properties.model.transform.removeDuplicates')}
            info={t('editor:properties.model.transform.info-removeDuplicates')}
            state={transformParms.dedup}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.flatten')}
            info={t('editor:properties.model.transform.info-flatten')}
            state={transformParms.flatten}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.pruneUnused')}
            info={t('editor:properties.model.transform.info-pruneUnused')}
            state={transformParms.prune}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.reorder')}
            info={t('editor:properties.model.transform.info-reorder')}
            state={transformParms.reorder}
          />
        </Accordion>

        <Accordion title="Animation">
          <CheckBoxParam
            label={t('editor:properties.model.transform.resampleAnimations')}
            info={t('editor:properties.model.transform.info-resampleAnimations')}
            state={transformParms.resample}
          />
        </Accordion>
      </>
    )
  )
}
