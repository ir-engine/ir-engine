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
import StringInput from '../inputs/StringInput'
import Well from '../layout/Well'

export default function MaterialEditor({ material }: { ['material']: Material }) {
  if (material === undefined) return <></>
  const createThumbnails = () => {
    const result = new Map<string, string>()
    Object.entries(material).map(([k, field]: [string, Texture]) => {
      if (field?.isTexture) {
        const src = createReadableTexture(field, { maxDimensions: { width: 256, height: 256 }, url: true }) as string
        result.set(k, src)
      }
    })
    return result
  }
  const createDefaults = () => {
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
  const thumbnails = useHookstate(createThumbnails())
  const defaults = useHookstate(createDefaults())

  function clearThumbs() {
    ;[...thumbnails.value.values()].map(URL.revokeObjectURL)
    thumbnails.value.clear()
  }

  const matId = useHookstate(material.uuid)
  const matName = useHookstate(material.name)

  useEffect(() => {
    if (matId.value !== material.uuid) {
      matId.set(material.uuid)
    }
  })

  useHookEffect(() => {
    clearThumbs()
    thumbnails.set(createThumbnails())
    defaults.set(createDefaults())
    matName.set(material.name)
    return clearThumbs
  }, [matId])

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
              _defaults[k].preview = createReadableTexture(material[k], { url: true }) as string
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
