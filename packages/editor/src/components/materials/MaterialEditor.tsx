import { useHookEffect, useHookstate } from '@hookstate/core'
import React, { Fragment, useEffect } from 'react'
import { Color, Material, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import { materialToDefaultArgs } from '@xrengine/engine/src/renderer/materials/Utilities'

import ParameterInput from '../inputs/ParameterInput'

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

  return (
    <Fragment>
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
