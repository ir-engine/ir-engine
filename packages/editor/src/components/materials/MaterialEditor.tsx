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

import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import Well from '../layout/Well'

export default function MaterialEditor({ material }: { ['material']: Material }) {
  if (material === undefined) return <></>
  const createThumbnails = () => {
    const result = new Map()
    Object.values(material).map((field: Texture) => {
      if (field?.isTexture) {
        const txr = createReadableTexture(field, { width: 256, height: 256 })
        if (txr.source?.data?.src) {
          result.set(field, txr.source.data.src)
        } else {
          const dataUrl = txr.source.data.getContext('webgl2').canvas.toDataURL()
          result.set(field, dataUrl)
        }
      }
    })
    return result
  }
  const createDefaults = () => {
    const result = materialToDefaultArgs(material)
    const thumbs = thumbnails.value
    Object.entries(material).map(([k, v]) => {
      if ((v as Texture)?.isTexture && thumbs.has(v)) {
        result[k] = { type: 'texture', preview: thumbs.get(v)! }
      } else if ((v as Color)?.isColor) {
        result[k] = { type: 'color' }
      } else if (typeof v === 'number') {
        result[k] = { type: 'float' }
      }
    })
    return result
  }
  const thumbnails = useHookstate(createThumbnails())
  const defaults = useHookstate(createDefaults())

  function clearThumbs() {
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
  }

  const matId = useHookstate(material.uuid)

  useEffect(() => {
    if (matId.value !== material.uuid) {
      matId.set(material.uuid)
    }
  })

  useHookEffect(() => {
    clearThumbs()
    thumbnails.set(createThumbnails())
    defaults.set(createDefaults())
    return clearThumbs
  }, [matId])

  function onChangeMaterialType(nuType) {
    const newDefaultArgs = materialTypeToDefaultArgs(nuType)
    const oldParmKeys = new Set(Object.keys(materialToDefaultArgs(material)))
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
        values={material}
        onChange={(k) => async (val) => {
          if (defaults.value[k].type === 'texture' && typeof val === 'string') {
            if (val) {
              material[k] = await AssetLoader.loadAsync(val)
            } else {
              material[k] = undefined
            }
            URL.revokeObjectURL(defaults.value[k].preview)
            defaults.merge((_defaults) => {
              delete _defaults[k].preview
              return _defaults
            })
          }
          material.needsUpdate = true
        }}
        defaults={defaults.value}
      />
    </Fragment>
  )
}
