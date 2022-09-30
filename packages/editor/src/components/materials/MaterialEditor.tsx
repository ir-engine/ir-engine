import React, { Fragment, useEffect } from 'react'
import { BufferAttribute, Color, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Texture } from 'three'

import styles from '@xrengine/editor/src/components/layout/styles.module.scss'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import bakeToVertices from '@xrengine/engine/src/renderer/materials/functions/bakeToVertices'
import {
  changeMaterialPrototype,
  materialFromId,
  materialToDefaultArgs
} from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { Box, Divider, Stack } from '@mui/material'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { accessSelectionState } from '../../services/SelectionServices'
import { Button } from '../inputs/Button'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Well from '../layout/Well'

export default function MaterialEditor({ material }: { ['material']: Material }) {
  if (material === undefined) return <></>
  const matId = useHookstate(material.uuid)
  const matName = useHookstate(material.name)
  const matPrototype = useHookstate(materialFromId(material.uuid).prototype)

  const createThumbnails = async () => {
    const result = new Map<string, string>()
    await Promise.allSettled(
      Object.entries(material).map(([k, field]: [string, Texture]) => {
        if (field?.isTexture) {
          try {
            return createReadableTexture(field, { maxDimensions: { width: 256, height: 256 }, url: true }).then(
              (src) => {
                result.set(k, src as string)
              }
            )
          } catch (e) {
            console.warn('failed loading thumbnail: ' + e)
          }
        }
      })
    )
    return result
  }

  const selectionState = accessSelectionState()

  const createDefaults = async () => {
    thumbnails.promised && (await thumbnails.promise)
    const result = materialToDefaultArgs(material)!
    const thumbs = thumbnails.value
    Object.entries(material).map(([k, v]) => {
      if ((v as Texture)?.isTexture && thumbs.has(k)) {
        result[k] = { type: 'texture', preview: thumbs.get(k)! }
      } else if ((v as Color)?.isColor) {
        result[k] = { type: 'color' }
      } else if (typeof v === 'number') {
        result[k] = { type: 'float' }
      }
    })
    return result
  }

  const prototypes = useHookstate(
    [...MaterialLibrary.prototypes.values()].map((prototype) => ({
      label: prototype.prototypeId,
      value: prototype.prototypeId
    }))
  )
  const thumbnails = useHookstate(new Map<string, string>())
  const defaults = useHookstate(new Object())
  const matSrc = useHookstate(materialFromId(matId.value).src)

  const clearThumbs = async () => {
    thumbnails.promised && (await thumbnails.promise)
    defaults.promised && (await defaults.promise)
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
  }

  useHookEffect(() => {
    clearThumbs().then(() => {
      matName.set(material.name)
      const matEntry = materialFromId(material.uuid)
      matPrototype.set(matEntry.prototype)
      matSrc.set(matEntry.src)
      thumbnails.set(createThumbnails())
      defaults.set(createDefaults())
    })
    return () => {
      clearThumbs()
    }
  }, [matId, matPrototype])

  useEffect(() => {
    if (matId.value !== material.uuid) {
      matId.set(material.uuid)
    }
  })

  return (
    <Fragment>
      <InputGroup name="Name" label="Name">
        <StringInput
          value={matName.value}
          onChange={(nuName) => {
            matName.set(nuName)
            material.name = nuName
          }}
        />
      </InputGroup>
      {!(thumbnails.promised || defaults.promised) && (
        <InputGroup name="Prototype" label="Prototype">
          <SelectInput
            value={matPrototype.value}
            options={prototypes.value}
            onChange={(protoId) => {
              changeMaterialPrototype(material, protoId)
              matPrototype.set(protoId)
            }}
          />
        </InputGroup>
      )}
      <InputGroup name="Source" label="Source">
        <div className={styles.contentContainer}>
          <Box className="Box" sx={{ padding: '8px', overflow: 'scroll' }}>
            <Stack className="Stack" spacing={2} direction="column" alignContent={'center'}>
              <Stack className="Stack" spacing={2} direction="row" alignContent={'flex-start'}>
                <div>
                  <label>Type:</label>
                </div>
                <div>{matSrc.value.type}</div>
              </Stack>
              <Stack className="Stack" spacing={2} direction="row">
                <div>
                  <label>Path:</label>
                </div>
                <div>{matSrc.value.path}</div>
              </Stack>
            </Stack>
          </Box>
        </div>
      </InputGroup>
      <br />
      <Divider className={styles.divider} />
      <br />
      <ParameterInput
        entity={material.uuid}
        values={thumbnails.promised ? {} : material}
        onChange={(k) => async (val) => {
          defaults.merge((_defaults) => {
            delete _defaults[k].preview
            return _defaults
          })
          let prop
          if (defaults.value[k].type === 'texture' && typeof val === 'string') {
            if (val) {
              prop = await AssetLoader.loadAsync(val)
              const preview = (await createReadableTexture(prop, { url: true })) as string
              defaults.merge((_defaults) => {
                _defaults[k].preview = preview
                return _defaults
              })
            } else {
              prop = undefined
            }

            URL.revokeObjectURL(defaults.value[k].preview)
          } else {
            prop = val
          }
          const properties = [Object.fromEntries([[k, prop]])]
          executeCommandWithHistory({
            type: EditorCommands.MODIFY_MATERIAL,
            affectedNodes: selectionState.value.selectedEntities.filter((val) => typeof val === 'string') as string[],
            materialId: material.uuid,
            properties
          })
        }}
        defaults={thumbnails.promised || defaults.promised ? {} : defaults.value}
      />
      {
        <Button
          onClick={async () => {
            bakeToVertices(material as MeshStandardMaterial, [
              { field: 'map', attribName: 'uv' },
              { field: 'lightMap', attribName: 'uv2' }
            ])
          }}
        >
          Bake Light Map to Vertex Colors
        </Button>
      }
    </Fragment>
  )
}
