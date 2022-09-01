import { useHookEffect, useHookstate } from '@hookstate/core'
import React, { Fragment, useEffect } from 'react'
import { Color, Material, Mesh, MeshBasicMaterial, MeshMatcapMaterial, MeshStandardMaterial, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import {
  extractDefaults,
  materialToDefaultArgs,
  materialTypeToDefaultArgs,
  materialTypeToLibraryName
} from '@xrengine/engine/src/renderer/materials/Utilities'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { EditorAction } from '../../services/EditorServices'
import { accessSelectionState } from '../../services/SelectionServices'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Well from '../layout/Well'

export default function MaterialEditor({ material }: { ['material']: Material }) {
  if (material === undefined) return <></>

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
  const thumbnails = useHookstate(new Map<string, string>())
  const defaults = useHookstate(new Object())

  async function clearThumbs() {
    thumbnails.promised && (await thumbnails.promise)
    defaults.promised && (await defaults.promise)
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
  }

  const matId = useHookstate(material.uuid)
  const matName = useHookstate(material.name)

  useHookEffect(() => {
    clearThumbs().then(async () => {
      thumbnails.set(await createThumbnails())
      defaults.set(await createDefaults())
      matName.set(material.name)
    })
    return () => {
      clearThumbs()
    }
  }, [matId])

  useEffect(() => {
    if (matId.value !== material.uuid) {
      matId.set(material.uuid)
    }
  })

  function onChangeMaterialType(nuType) {
    const newDefaultArgs = materialTypeToDefaultArgs(nuType)!
    const oldParmKeys = new Set(Object.keys(materialToDefaultArgs(material)!))
    const newParmKeys = new Set(Object.keys(newDefaultArgs))
    const allKeys = [...oldParmKeys.values(), ...newParmKeys.values()].filter((x, i, arr) => arr.indexOf(x) === i)
    const overlap = allKeys.filter((key) => oldParmKeys.has(key) && newParmKeys.has(key))
    const overlapParms = Object.fromEntries(overlap.map((k) => [k, material[k]]))
    const newParms = { ...extractDefaults(newDefaultArgs), ...overlapParms }
    const newMaterial = MaterialLibrary[materialTypeToLibraryName(nuType)](newParms).material
    const scene = Engine.instance.currentWorld.scene
    scene.traverse((child: Mesh) => {
      if (!child?.isMesh) return
      let childMats = child.material instanceof Material ? [child.material] : child.material
      childMats.map((childMat, i) => {
        if (childMat === material) {
          if (childMats.length > 1) {
            ;(child.material as Material[])[i] = newMaterial
          } else {
            child.material = newMaterial
          }
        }
      })
    })
  }

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
      <Well>
        <InputGroup name="Material Type" label="Material Type">
          <SelectInput
            options={[
              {
                label: 'Basic',
                value: 'MeshBasicMaterial'
              },
              {
                label: 'Standard',
                value: 'MeshStandardMaterial'
              },
              {
                label: 'Matcap',
                value: 'MeshMatcapMaterial'
              }
            ]}
            value={material.type}
            onChange={onChangeMaterialType}
          />
        </InputGroup>
      </Well>
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
            const preview = (await createReadableTexture(material[k], { url: true })) as string
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
