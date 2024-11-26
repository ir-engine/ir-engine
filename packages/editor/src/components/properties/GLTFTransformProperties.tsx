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
import { Checkbox, Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

function CheckBoxParam({ label, state }: { label: string; state: State<boolean> }) {
  return (
    <div className={twMerge('my-2.5 grid grid-cols-4 items-center gap-x-2')}>
      <div className="col-span-1 col-start-2 text-right">
        <Text fontSize="xs">{label}</Text>
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
  state,
  parseFunction = (value: string) => value
}: {
  label: string
  state: State<string | number>
  parseFunction?: (value: string) => string | number
}) {
  return (
    <div className="my-1 grid grid-cols-4 items-center gap-x-2">
      <div className="col-span-1 col-start-2 text-right">
        <Text fontWeight="medium" fontSize="xs">
          {label}
        </Text>
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
          <div className="mb-6 grid grid-cols-4 gap-2 border-b border-theme-primary pb-6">
            <div className="col-span-1 flex flex-col justify-around gap-y-2">
              <Text
                fontSize="xs"
                fontWeight="medium"
                className="block px-2 py-0.5 text-right leading-[1.125rem] text-theme-gray3"
                style={{
                  textWrap: 'nowrap' // tailwind class is not working
                }}
              >
                {t('editor:properties.model.transform.dst')}
              </Text>
              <Text
                fontSize="xs"
                fontWeight="medium"
                className="px-2 py-0.5 text-right leading-[1.125rem] text-theme-gray3"
                style={{
                  textWrap: 'nowrap' // tailwind class is not working
                }}
              >
                {t('editor:properties.model.transform.resourceUri')}
              </Text>
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
          <div className="mb-6 grid grid-cols-4 gap-2 border-b border-theme-primary pb-6">
            <div className="col-span-1 flex flex-col justify-around gap-y-2">
              <Text
                fontSize="xs"
                fontWeight="medium"
                className="block px-2 py-0.5 text-right leading-[1.125rem] text-theme-gray3"
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

        <Accordion
          title="Materials"
          expandIcon={<HiPlusSmall />}
          shrinkIcon={<HiMinus />}
          titleFontSize="sm"
          className="mb-2 rounded bg-theme-highlight p-2"
        >
          <div className="my-1 grid grid-cols-4 items-center gap-x-2">
            <div className="col-span-1 col-start-2 text-right">
              <Text fontWeight="medium" fontSize="xs">
                {t('editor:properties.model.transform.textureFormat')}
              </Text>
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
            state={transformParms.maxTextureSize}
            parseFunction={parseInt}
          />

          <TextParam
            label={t('editor:properties.model.transform.simplifyRatio')}
            state={transformParms.simplifyRatio}
            parseFunction={parseFloat}
          />

          <TextParam
            label={t('editor:properties.model.transform.simplifyErrorThreshold')}
            state={transformParms.simplifyErrorThreshold}
            parseFunction={parseFloat}
          />

          <div className="my-1 grid grid-cols-4 items-center gap-x-2">
            <div className="col-span-1 col-start-2 text-right">
              <Text fontWeight="medium" fontSize="xs">
                {t('editor:properties.model.transform.textureCompressionType')}
              </Text>
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
            state={transformParms.textureCompressionQuality}
            parseFunction={parseFloat}
          />

          <CheckBoxParam label={t('editor:properties.model.transform.split')} state={transformParms.split} />

          <CheckBoxParam
            label={t('editor:properties.model.transform.combineMaterials')}
            state={transformParms.combineMaterials}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.palette')}
            state={transformParms.palette.enabled}
          />

          <CheckBoxParam label={t('editor:properties.model.transform.flipY')} state={transformParms.flipY} />

          <CheckBoxParam label={t('editor:properties.model.transform.linear')} state={transformParms.linear} />

          <CheckBoxParam label={t('editor:properties.model.transform.mipmaps')} state={transformParms.mipmap} />
        </Accordion>

        <Accordion
          title="Meshes"
          expandIcon={<HiPlusSmall />}
          shrinkIcon={<HiMinus />}
          titleFontSize="sm"
          className="mb-2 rounded bg-theme-highlight p-2"
        >
          <CheckBoxParam label={t('editor:properties.model.transform.instance')} state={transformParms.instance} />

          <CheckBoxParam label={t('editor:properties.model.transform.join')} state={transformParms.join.enabled} />

          <CheckBoxParam
            label={t('editor:properties.model.transform.weldVertices')}
            state={transformParms.weld.enabled}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.useMeshoptimizer')}
            state={transformParms.meshoptCompression.enabled}
          />

          <CheckBoxParam
            label={t('editor:properties.model.transform.useDraco')}
            state={transformParms.dracoCompression.enabled}
          />
        </Accordion>

        <Accordion
          title="Scene"
          expandIcon={<HiPlusSmall />}
          shrinkIcon={<HiMinus />}
          titleFontSize="sm"
          className="mb-2 rounded bg-theme-highlight p-2"
        >
          <CheckBoxParam label={t('editor:properties.model.transform.removeDuplicates')} state={transformParms.dedup} />
          <CheckBoxParam label={t('editor:properties.model.transform.flatten')} state={transformParms.flatten} />
          <CheckBoxParam label={t('editor:properties.model.transform.pruneUnused')} state={transformParms.prune} />
          <CheckBoxParam label={t('editor:properties.model.transform.reorder')} state={transformParms.reorder} />
        </Accordion>

        <Accordion
          title="Animation"
          expandIcon={<HiPlusSmall />}
          shrinkIcon={<HiMinus />}
          titleFontSize="sm"
          className="mb-2 rounded bg-theme-highlight p-2"
        >
          <CheckBoxParam
            label={t('editor:properties.model.transform.resampleAnimations')}
            state={transformParms.resample}
          />
        </Accordion>
      </>
    )
  )
}
