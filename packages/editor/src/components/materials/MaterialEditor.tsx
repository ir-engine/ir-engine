import React, { Fragment, useEffect } from 'react'
import { Color, Material, Mesh, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import {
  changeMaterialPrototype,
  materialFromId,
  materialToDefaultArgs
} from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { accessSelectionState } from '../../services/SelectionServices'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'

export default function MaterialEditor({ material }: { ['material']: Material }) {
  if (material === undefined) return <></>
  const matId = useHookstate(material.uuid)
  const matName = useHookstate(material.name)
  const matPrototype = useHookstate(materialFromId(material.uuid).prototype)

  const createThumbnails = async () => {
    const result = new Map<string, string>()
    await Promise.all(
      Object.entries(material).map(([k, field]: [string, Texture]) => {
        if (field?.isTexture) {
          return createReadableTexture(field, { maxDimensions: { width: 256, height: 256 }, url: true }).then((src) => {
            result.set(k, src as string)
          })
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

  const clearThumbs = async () => {
    thumbnails.promised && (await thumbnails.promise)
    defaults.promised && (await defaults.promise)
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
  }

  useHookEffect(() => {
    clearThumbs().then(() => {
      matName.set(material.name)
      matPrototype.set(materialFromId(material.uuid).prototype)
    })
    return () => {
      clearThumbs()
    }
  }, [matId])

  useHookEffect(() => {
    clearThumbs().then(() => {
      thumbnails.set(createThumbnails())
      defaults.set(createDefaults())
    })
  }, [matPrototype])

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
      <ParameterInput
        entity={material.uuid}
        values={thumbnails.promised ? {} : material}
        onChange={(k) => async (val) => {
          let prop
          if (defaults.value[k].type === 'texture' && typeof val === 'string') {
            if (val) {
              prop = await AssetLoader.loadAsync(val)
            } else {
              prop = undefined
            }
            URL.revokeObjectURL(defaults.value[k].preview)
            const preview = (await createReadableTexture(prop, { url: true })) as string
            defaults.merge((_defaults) => {
              delete _defaults[k].preview
              _defaults[k].preview = preview
              return _defaults
            })
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
    </Fragment>
  )
}
