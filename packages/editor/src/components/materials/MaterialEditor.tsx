import React, { useCallback, useEffect } from 'react'
import { Material, Texture } from 'three'

import styles from '@etherealengine/editor/src/components/layout/styles.module.scss'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@etherealengine/engine/src/assets/functions/createReadableTexture'
import {
  changeMaterialPrototype,
  materialFromId,
  prototypeFromId
} from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { MaterialLibraryState } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { getMutableState, none, useState } from '@etherealengine/hyperflux'

import { Box, Divider, Stack } from '@mui/material'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { accessSelectionState } from '../../services/SelectionServices'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'

export default function MaterialEditor({ material, ...rest }: { ['material']: Material }) {
  if (material === undefined) return <></>
  const materialLibrary = useState(getMutableState(MaterialLibraryState))
  const materialComponent = materialLibrary.materials[material.uuid]
  const prototypeComponent = materialLibrary.prototypes[materialComponent.prototype.value]
  const loadingData = useState(false)
  const selectionState = accessSelectionState()
  const prototypes = Object.values(materialLibrary.prototypes.value).map((prototype) => ({
    label: prototype.prototypeId,
    value: prototype.prototypeId
  }))
  const thumbnails = useState<Record<string, string>>({})

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
  }, [materialComponent.parameters, materialComponent.material.uuid, materialComponent.prototype])

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
            selectionState.value.selectedEntities.filter((val) => typeof val === 'string') as string[],
            material.uuid,
            [{ [k]: prop }]
          )
          materialComponent.parameters[k].set(prop)
        }}
        defaults={loadingData.value ? {} : prototypeComponent.arguments.value}
        thumbnails={thumbnails.value}
      />
    </div>
  )
}
