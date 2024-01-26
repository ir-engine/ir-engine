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

import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { useHookstate } from '@hookstate/core'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { LODList } from '../../constants/GLTFPresets'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { List } from '../layout/List'

type LODVariantDescriptor = {
  params: ModelTransformParameters
  suffix: string
  variantMetadata: Record<string, any>[]
}

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

const ImageCompressionBox = () => {
  const compressProperties = useHookstate<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)

  return (
    <>
      <InputGroup name="fileType" label={'File'}>
        <Typography variant="body2">{t('editor:properties.model.transform.compress') as string}</Typography>
      </InputGroup>

      <div>
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
              <CompoundNumericInput
                value={compressProperties.quality.value}
                onChange={compressProperties.quality.set}
                min={1}
                max={255}
                step={1}
              />
            </InputGroup>
            <InputGroup
              name="compressionLevel"
              label={t('editor:properties.model.transform.compressionLevel')}
              info={t('editor:properties.model.transform.compressionLevelTooltip')}
            >
              <CompoundNumericInput
                value={compressProperties.compressionLevel.value}
                onChange={compressProperties.compressionLevel.set}
                min={0}
                max={6}
                step={1}
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
      </div>
    </>
  )
}

export default function ImportSettingsPanel({ openImportSettings }: { openImportSettings: boolean }) {
  const [defaultImportFolder, setDefaultImportFolder] = useState<string>('/assets/')
  const [LODImportFolder, setLODImportFolder] = useState<string>('/assets/LODS/')
  const [LODGenEnabled, setLODGenEnabled] = useState<boolean>(false)
  const [selectedLODS, setSelectedLods] = useState<ModelTransformParameters[]>(LODList.slice(0, 3))
  const [currentLOD, setCurrentLOD] = useState<ModelTransformParameters>(LODList[0])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [KTXEnabled, setKTXEnabled] = useState<boolean>(false)
  const presetLabels = ['Desktop', 'Mobile', 'XR']

  useEffect(() => {
    handleLODChange()
  }, [currentLOD, currentIndex])

  useEffect(() => {
    if (LODGenEnabled) {
      // Import to LOD folder and default folder
    } else {
      // Import to default folder only
    }
  }, [LODGenEnabled])

  const handleLODChange = () => {
    const newLODS = [...selectedLODS]
    newLODS.splice(currentIndex, 1, currentLOD)
    setSelectedLods(newLODS)
  }

  const handleSaveChanges = () => {
    // Save import settings into global state
  }

  return (
    <Menu open={openImportSettings} maxWidth={'lg'} header={'Import Settings'}>
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
          control={<Checkbox onChange={() => setLODGenEnabled(!LODGenEnabled)} />}
          label={'Generate LODs'}
        />
        {LODGenEnabled && (
          <>
            <Typography>LODs Folder</Typography>
            <TextField
              defaultValue={'/assets/LODS/'}
              onChange={(event) => {
                setLODImportFolder(event.target.value)
              }}
            />
            <Typography>LODs to Generate</Typography>
            <List>
              {selectedLODS.slice(0, 3).map((LOD, idx) => (
                <FormControl>
                  <TextField select label={LOD.dst} value={LOD.dst}>
                    {LODList.map((sLOD) => (
                      <MenuItem
                        onClick={() => {
                          setCurrentLOD(sLOD)
                          setCurrentIndex(idx)
                        }}
                      >
                        {sLOD.dst}
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
            control={<Checkbox onChange={() => setKTXEnabled(!KTXEnabled)} />}
            label={'Compress to KTX2'}
          />
          {KTXEnabled && <ImageCompressionBox />}
        </Box>
      </Box>
      <Box>
        <Button onClick={() => handleSaveChanges()}>Save Changes</Button>
        <Button>Cancel</Button>
      </Box>
    </Menu>
  )
}
