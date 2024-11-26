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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { KTX2EncodeArguments } from '@ir-engine/engine/src/assets/constants/CompressionParms'
import { NO_PROXY, State, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Checkbox, Input } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import NumericInput from '@ir-engine/ui/src/components/editor/input/Numeric'
import Label from '@ir-engine/ui/src/primitives/tailwind/Label'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import { LODList, LODVariantDescriptor } from '../../constants/GLTFPresets'
import { ImportSettingsState } from '../../services/ImportSettingsState'

const UASTCFlagOptions = [
  { label: 'Fastest', value: 0 },
  { label: 'Faster', value: 1 },
  { label: 'Default', value: 2 },
  { label: 'Slower', value: 3 },
  { label: 'Very Slow', value: 4 },
  { label: 'Mask', value: 0xf },
  { label: 'UASTC Error', value: 8 },
  { label: 'BC7 Error', value: 16 },
  { label: 'Faster Hints', value: 64 },
  { label: 'Fastest Hints', value: 128 },
  { label: 'Disable Flip and Individual', value: 256 }
]

const ImageCompressionBox = ({ compressProperties }: { compressProperties: State<KTX2EncodeArguments> }) => {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('editor:properties.model.transform.compress')}</Text>
      <Select
        labelProps={{
          text: t('editor:properties.model.transform.mode'),
          position: 'top'
        }}
        options={[
          { label: 'ETC1S', value: 'ETC1S' },
          { label: 'UASTC', value: 'UASTC' }
        ]}
        value={compressProperties.mode.value}
        onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
      />
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.flipY.value}
          onChange={compressProperties.flipY.set}
          label={t('editor:properties.model.transform.flipY')}
        />
        <Tooltip content={t('editor:properties.model.transform.flipYTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.srgb.value}
          onChange={compressProperties.srgb.set}
          label={t('editor:properties.model.transform.srgb')}
        />
        <Tooltip content={t('editor:properties.model.transform.srgbTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.mipmaps.value}
          onChange={compressProperties.mipmaps.set}
          label={t('editor:properties.model.transform.mipmaps')}
        />
        <Tooltip content={t('editor:properties.model.transform.mipmapsTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.normalMap.value}
          onChange={compressProperties.normalMap.set}
          label={t('editor:properties.model.transform.normalMap')}
        />
        <Tooltip content={t('editor:properties.model.transform.normalMapTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      {compressProperties.mode.value === 'ETC1S' && (
        <>
          <InputGroup
            name="quality"
            label={t('editor:properties.model.transform.quality')}
            info={t('editor:properties.model.transform.qualityTooltip')}
          >
            <NumericInput
              value={compressProperties.quality.value}
              onChange={compressProperties.quality.set}
              min={1}
              max={255}
            />
          </InputGroup>
          <InputGroup
            name="compressionLevel"
            label={t('editor:properties.model.transform.compressionLevel')}
            info={t('editor:properties.model.transform.compressionLevelTooltip')}
          >
            <NumericInput
              value={compressProperties.compressionLevel.value}
              onChange={compressProperties.compressionLevel.set}
              min={0}
              max={6}
            />
          </InputGroup>
        </>
      )}
      {compressProperties.mode.value === 'UASTC' && (
        <>
          <InputGroup
            name="uastcFlags"
            label={t('editor:properties.model.transform.uastcFlags')}
            info={t('editor:properties.model.transform.uastcFlagsTooltip')}
          >
            <Select
              options={UASTCFlagOptions}
              value={compressProperties.uastcFlags.value}
              onChange={(val: number) => compressProperties.uastcFlags.set(val)}
            />
          </InputGroup>
          <InputGroup
            name="uastcZstandard"
            label={t('editor:properties.model.transform.uastcZstandard')}
            info={t('editor:properties.model.transform.uastcZstandardTooltip')}
          >
            <Toggle value={compressProperties.uastcZstandard.value} onChange={compressProperties.uastcZstandard.set} />
          </InputGroup>
        </>
      )}
    </>
  )
}

export default function ImportSettingsPanel() {
  const importSettingsState = useHookstate(getMutableState(ImportSettingsState))
  const compressProperties = useHookstate(getMutableState(ImportSettingsState).imageSettings.get(NO_PROXY))

  const [defaultImportFolder, setDefaultImportFolder] = useState<string>(importSettingsState.importFolder.value)
  const [LODImportFolder, setLODImportFolder] = useState<string>(importSettingsState.LODFolder.value)
  const [LODGenEnabled, setLODGenEnabled] = useState<boolean>(importSettingsState.LODsEnabled.value)
  const [selectedLODS, setSelectedLods] = useState<LODVariantDescriptor[]>(
    importSettingsState.selectedLODS.get(NO_PROXY) as LODVariantDescriptor[]
  )
  const [currentLOD, setCurrentLOD] = useState<LODVariantDescriptor>(
    importSettingsState.selectedLODS[0].get(NO_PROXY) as LODVariantDescriptor
  )
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [KTXEnabled, setKTXEnabled] = useState<boolean>(importSettingsState.imageCompression.value)

  const presetLabels = ['LOD0', 'LOD1', 'LOD2']

  useEffect(() => {
    handleLODChange()
  }, [currentLOD, currentIndex])

  const handleLODChange = () => {
    const newLODS = [...selectedLODS]
    newLODS.splice(currentIndex, 1, currentLOD)
    setSelectedLods(newLODS)
  }

  const handleSaveChanges = () => {
    importSettingsState.importFolder.set(defaultImportFolder)
    importSettingsState.LODFolder.set(LODImportFolder)
    importSettingsState.LODsEnabled.set(LODGenEnabled)
    importSettingsState.imageCompression.set(KTXEnabled)
    importSettingsState.imageSettings.set(compressProperties.get(NO_PROXY))
    importSettingsState.selectedLODS.set(selectedLODS)
    handleCancel()
  }

  const handleCancel = () => {
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title="Import Settings"
      onSubmit={handleSaveChanges}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <Input
        value={defaultImportFolder}
        onChange={(event) => setDefaultImportFolder(event.target.value)}
        labelProps={{
          text: 'Default Import Folder',
          position: 'top'
        }}
      />
      <Checkbox checked={LODGenEnabled} onChange={() => setLODGenEnabled(!LODGenEnabled)} label={'Generate LODs'} />
      {LODGenEnabled && (
        <>
          <Input
            labelProps={{
              text: 'LODs Folder',
              position: 'top'
            }}
            value={LODImportFolder}
            onChange={(event) => setLODImportFolder(event?.target.value)}
          />
          <Label>LODs to Generate</Label>
          {selectedLODS.slice(0, 3).map((LOD, idx) => (
            <Select
              labelProps={{
                text: LOD.params.dst,
                position: 'top'
              }}
              key={idx}
              options={LODList.map((sLOD) => ({ label: sLOD.params.dst, value: sLOD as any }))}
              value={LOD.params.dst}
              onChange={(value) => {
                setCurrentLOD(value as any)
                setCurrentIndex(idx)
              }}
            />
          ))}
        </>
      )}
      <Text>Image Compression Settings</Text>
      <Checkbox label={'Compress to KTX2'} checked={KTXEnabled} onChange={() => setKTXEnabled(!KTXEnabled)} />
      {KTXEnabled && <ImageCompressionBox compressProperties={compressProperties} />}
    </Modal>
  )
}
