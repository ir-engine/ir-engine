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
import { LODList, LODVariantDescriptor } from '@etherealengine/editor/src/constants/GLTFPresets'
import { ImportSettingsState } from '@etherealengine/editor/src/services/ImportSettingsState'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { BooleanInput } from '@etherealengine/ui/src/components/editor/input/Boolean'
import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import Modal from '../../../../primitives/tailwind/Modal'
import Slider from '../../../../primitives/tailwind/Slider'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

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

const ImageCompressionBox = ({ compressProperties }) => {
  return (
    <>
      {/*<InputGroup name="fileType" label={'File'} className='justify-start'>
        <Typography variant="body2">{t('editor:properties.model.transform.compress') as string}</Typography>
        </InputGroup>*/}
      <InputGroup
        name="mode"
        label={t('editor:properties.model.transform.mode')}
        info={t('editor:properties.model.transform.modeTooltip')}
      >
        <SelectInput
          options={[
            { label: 'ETC1S', value: 'ETC1S' },
            { label: 'UASTC', value: 'UASTC' }
          ]}
          value={compressProperties.mode.value}
          onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="flipY"
        label={t('editor:properties.model.transform.flipY')}
        info={t('editor:properties.model.transform.flipYTooltip')}
      >
        <BooleanInput value={compressProperties.flipY.value} onChange={compressProperties.flipY.set} />
      </InputGroup>
      <InputGroup
        name="linear"
        label={t('editor:properties.model.transform.srgb')}
        info={t('editor:properties.model.transform.srgbTooltip')}
      >
        <BooleanInput value={compressProperties.srgb.value} onChange={compressProperties.srgb.set} />
      </InputGroup>
      <InputGroup
        name="mipmaps"
        label={t('editor:properties.model.transform.mipmaps')}
        info={t('editor:properties.model.transform.mipmapsTooltip')}
      >
        <BooleanInput value={compressProperties.mipmaps.value} onChange={compressProperties.mipmaps.set} />
      </InputGroup>
      <InputGroup
        name="normalMap"
        label={t('editor:properties.model.transform.normalMap')}
        info={t('editor:properties.model.transform.normalMapTooltip')}
      >
        <BooleanInput value={compressProperties.normalMap.value} onChange={compressProperties.normalMap.set} />
      </InputGroup>
      {compressProperties.mode.value === 'ETC1S' && (
        <>
          <InputGroup
            name="quality"
            label={t('editor:properties.model.transform.quality')}
            info={t('editor:properties.model.transform.qualityTooltip')}
          >
            <Slider
              value={compressProperties.quality.value}
              onChange={compressProperties.quality.set}
              min={1}
              max={255}
              step={1}
              onRelease={compressProperties.quality.set}
            />
          </InputGroup>
          <InputGroup
            name="compressionLevel"
            label={t('editor:properties.model.transform.compressionLevel')}
            info={t('editor:properties.model.transform.compressionLevelTooltip')}
          >
            <Slider
              value={compressProperties.compressionLevel.value}
              onChange={compressProperties.compressionLevel.set}
              min={0}
              max={6}
              step={1}
              onRelease={compressProperties.compressionLevel.set}
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
            <SelectInput
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
            <BooleanInput
              value={compressProperties.uastcZstandard.value}
              onChange={compressProperties.uastcZstandard.set}
            />
          </InputGroup>
        </>
      )}
    </>
  )
}

export function ImportSettingsPanel() {
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
      title={'Import Settings'}
      onSubmit={() => handleSaveChanges()}
      onClose={() => handleCancel()}
      className="w-[50vw] max-w-2xl"
    >
      <div className="flex flex-col items-start gap-2 bg-theme-primary px-2">
        <div className="mb-6">
          <p className="text-lg font-medium">Default Import Folder</p>
          <StringInput value={defaultImportFolder} onChange={(val) => setDefaultImportFolder(val)} />
        </div>
        <div className="mb-6">
          <p className="text-lg font-medium">glTF / glB</p>
          <label className="mt-1 inline-flex items-center">
            <InputGroup name="LODGenEnabled" label={'Generate LODs'}>
              <BooleanInput
                value={LODGenEnabled}
                onChange={(val) => {
                  setLODGenEnabled(val)
                }}
              />
            </InputGroup>
          </label>
          {LODGenEnabled && (
            <div className="mt-4">
              <p className="text-lg font-medium">LODs Folder</p>
              <StringInput value={'LODS/'} onChange={(val) => setLODImportFolder(val)} />
              <p className="mt-4 text-lg font-medium">LODs to Generate</p>
              {selectedLODS.slice(0, 3).map((LOD, idx) => (
                <InputGroup name={`${presetLabels[idx]}`} label={`${presetLabels[idx]}`}>
                  <SelectInput
                    options={LODList.map((sLOD) => ({
                      label: sLOD.params.dst,
                      value: sLOD.params.dst
                    }))}
                    value={LOD.params.dst}
                    onChange={(val) => {
                      setCurrentLOD(LODList.find((sLOD) => sLOD.params.dst === val) ?? LODList[0])
                      setCurrentIndex(idx)
                    }}
                  />
                </InputGroup>
              ))}
            </div>
          )}
        </div>
        <div className="mb-6">
          <p className="text-lg font-medium">Images</p>
          <p className="mt-4 text-lg font-medium">Compression Settings</p>
          <div className="mt-2">
            <InputGroup name="KTXEnabled" label={'Compress to KTX2'}>
              <BooleanInput
                value={KTXEnabled}
                onChange={(val) => {
                  setKTXEnabled(val)
                }}
              />
            </InputGroup>
            {KTXEnabled && <ImageCompressionBox compressProperties={compressProperties} />}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ImportSettingsPanel

/*<Menu open maxWidth={'lg'} header={}>
      <Box>
        <Typography>Default Import Folder</Typography>
        <TextField
          defaultValue={'/assets/'}
          onChange={(event) => {
            setDefaultImportFolder(event.target.value)
          }}
        />
      </Box>
      <Box>
        <Typography>glTF / glB</Typography>
        <FormControlLabel
          control={<Checkbox checked={LODGenEnabled} onChange={() => setLODGenEnabled(!LODGenEnabled)} />}
          label={'Generate LODs'}
        />
        {LODGenEnabled && (
          <>
            <Typography>LODs Folder</Typography>
            <TextField
              defaultValue={'LODS/'}
              onChange={(event) => {
                setLODImportFolder(event.target.value)
              }}
            />
            <Typography>LODs to Generate</Typography>
            <List>
              {selectedLODS.slice(0, 3).map((LOD, idx) => (
                <FormControl>
                  <TextField select label={LOD.params.dst} value={LOD.params.dst}>
                    {LODList.map((sLOD) => (
                      <MenuItem
                        onClick={() => {
                          setCurrentLOD(sLOD)
                          setCurrentIndex(idx)
                        }}
                      >
                        {sLOD.params.dst}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormHelperText>{presetLabels[idx]}</FormHelperText>
                </FormControl>
              ))}
            </List>
          </>
        )}
      </Box>
      <Box>
        <Typography>Images</Typography>
        <Typography>Compression Settings</Typography>
        <Box>
          <FormControlLabel
            control={<Checkbox checked={KTXEnabled} onChange={() => setKTXEnabled(!KTXEnabled)} />}
            label={'Compress to KTX2'}
          />
          {KTXEnabled && <ImageCompressionBox compressProperties={compressProperties} />}
        </Box>
      </Box>
      <Box>
        <Button onClick={() => handleSaveChanges()}>Save Changes</Button>
        <Button onClick={() => handleCancel()}>Cancel</Button>
      </Box>
      </Menu>*/
