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

import React, { useCallback, useEffect } from 'react'
import { Material, Texture } from 'three'

import styles from '@etherealengine/editor/src/components/layout/styles.module.scss'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@etherealengine/engine/src/assets/functions/createReadableTexture'
import { LibraryEntryType } from '@etherealengine/engine/src/renderer/materials/constants/LibraryEntry'
import {
  changeMaterialPrototype,
  entryId,
  materialFromId,
  prototypeFromId
} from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { removeMaterialPlugin } from '@etherealengine/engine/src/renderer/materials/functions/MaterialPluginFunctions'
import { MaterialLibraryState } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { getMutableState, getState, none, State, useHookstate } from '@etherealengine/hyperflux'

import { Box, Divider, Stack } from '@mui/material'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'
import { Button } from '../inputs/Button'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import PaginatedList from '../layout/PaginatedList'

export default function MaterialEditor({ material, ...rest }: { material: Material }) {
  if (material === undefined) return <></>
  const materialLibrary = useHookstate(getMutableState(MaterialLibraryState))
  const materialComponent = materialLibrary.materials[material.uuid]
  const prototypeComponent = materialLibrary.prototypes[materialComponent.prototype.value]
  const loadingData = useHookstate(false)
  const prototypes = Object.values(materialLibrary.prototypes.value).map((prototype) => ({
    label: prototype.prototypeId,
    value: prototype.prototypeId
  }))
  const thumbnails = useHookstate<Record<string, string>>({})

  const createThumbnails = useCallback(async () => {
    const result = {} as Record<string, string>
    await Promise.allSettled(
      Object.entries(material).map(([k, field]: [string, Texture]) => {
        if (field?.isTexture) {
          try {
            return createReadableTexture(field, { maxDimensions: { width: 256, height: 256 }, url: true }).then(
              (src) => {
                result[k] = src as string
              }
            )
          } catch (e) {
            console.warn('failed loading thumbnail: ' + e)
          }
        }
      })
    )
    return result
  }, [materialComponent.parameters, materialComponent.material, materialComponent.prototype])

  const checkThumbs = useCallback(async () => {
    thumbnails.promised && (await thumbnails.promise)
    const thumbnailVals = thumbnails.value
    Object.entries(thumbnailVals).map(([k, v]) => {
      if (!material[k]) {
        URL.revokeObjectURL(v)
        thumbnails[k].set(none)
      }
    })
  }, [])

  const clearThumbs = useCallback(async () => {
    thumbnails.promised && (await thumbnails.promise)
    Object.values(thumbnails.value).map(URL.revokeObjectURL)
    thumbnails.set({})
  }, [])

  useEffect(() => {
    loadingData.set(true)
    clearThumbs()
      .then(createThumbnails)
      .then((nuThumbs) => {
        thumbnails.set(nuThumbs)
        loadingData.set(false)
      })
  }, [materialComponent.prototype, materialComponent.material])

  useEffect(() => {
    checkThumbs()
  }, [materialComponent.parameters])

  const selectedPlugin = useHookstate('vegetation')

  return (
    <div {...rest}>
      <InputGroup name="Name" label="Name">
        <StringInput value={materialComponent.material.name.value} onChange={materialComponent.material.name.set} />
      </InputGroup>
      <InputGroup name="Source" label="Source">
        <div className={styles.contentContainer}>
          <Box className="Box" sx={{ padding: '8px', overflow: 'scroll' }}>
            <Stack className="Stack" spacing={2} direction="column" alignContent={'center'}>
              <Stack className="Stack" spacing={2} direction="row" alignContent={'flex-start'}>
                <div>
                  <label>Type:</label>
                </div>
                <div>{materialComponent.src.type.value}</div>
              </Stack>
              <Stack className="Stack" spacing={2} direction="row">
                <div>
                  <label>Path:</label>
                </div>
                <div>{materialComponent.src.value.path}</div>
              </Stack>
            </Stack>
          </Box>
        </div>
      </InputGroup>
      <br />
      {!loadingData.value && (
        <InputGroup name="Prototype" label="Prototype">
          <SelectInput
            value={materialComponent.prototype.value}
            options={prototypes}
            onChange={(protoId) => {
              const nuMat = changeMaterialPrototype(material, protoId)
              materialComponent.set(materialFromId(nuMat!.uuid))
              prototypeComponent.set(prototypeFromId(materialComponent.prototype.value))
            }}
          />
        </InputGroup>
      )}
      <Divider className={styles.divider} />
      <br />
      <ParameterInput
        entity={material.uuid}
        values={loadingData.value ? {} : materialComponent.parameters.value}
        onChange={(k) => async (val) => {
          let prop
          if (prototypeComponent.arguments.value[k].type === 'texture' && typeof val === 'string') {
            if (val) {
              prop = await AssetLoader.loadAsync(val)
            } else {
              prop = undefined
            }
          } else {
            prop = val
          }
          EditorControlFunctions.modifyMaterial(
            getState(SelectionState).selectedEntities.filter((val) => typeof val === 'string') as string[],
            entryId(materialComponent.value, LibraryEntryType.MATERIAL),
            [{ [k]: prop }]
          )
          materialComponent.parameters[k].set(prop)
        }}
        defaults={loadingData.value ? {} : prototypeComponent.arguments.value}
        thumbnails={thumbnails.value}
      />
      <br />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #fff',
          borderRadius: '4px',
          padding: '4px'
        }}
      >
        <SelectInput
          value={selectedPlugin.value}
          options={Object.keys(materialLibrary.plugins.value).map((key) => ({ label: key, value: key }))}
          onChange={selectedPlugin.set}
        />
        <Button
          onClick={() => {
            materialComponent.plugins.set(materialComponent.plugins.value.concat(selectedPlugin.value))
          }}
        >
          Add Plugin
        </Button>
      </div>
      <PaginatedList
        list={materialComponent.plugins}
        element={(plugin: State<string>) => {
          return (
            <div className={styles.contentContainer}>
              <InputGroup name="Plugin" label="Plugin">
                <SelectInput
                  value={plugin.value}
                  options={Object.keys(materialLibrary.plugins.value).map((key) => ({ label: key, value: key }))}
                  onChange={plugin.set}
                />
              </InputGroup>
              <Button
                onClick={() => {
                  removeMaterialPlugin(material, plugin.value)
                  materialComponent.plugins.set(materialComponent.plugins.value.filter((val) => val !== plugin.value))
                }}
                style={{ backgroundColor: '#f00' }}
              >
                x
              </Button>
            </div>
          )
        }}
      />
    </div>
  )
}
