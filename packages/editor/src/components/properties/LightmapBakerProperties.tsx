import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LinearFilter, TextureFilter, WebGLRenderer } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ComponentType } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BoolArg, FloatArg, ObjectArg } from '@etherealengine/engine/src/renderer/materials/constants/DefaultArgs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Typography } from '@mui/material'

import { bakeLightmaps } from '../../lightmapper/lightmap'
import { WorkbenchSettings } from '../../lightmapper/workbench'
import { Button } from '../inputs/Button'
import ParameterInput from '../inputs/ParameterInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import Well from '../layout/Well'

export default function LightmapBakerProperties({
  modelState
}: {
  modelState: State<ComponentType<typeof ModelComponent>>
}) {
  const { t } = useTranslation()
  const bakeProperties = useHookstate<WorkbenchSettings>(() => ({
    ao: false,
    aoDistance: 0.05,
    bounceMultiplier: 1,
    emissiveMultiplier: 1,
    lightMapSize: 1024,
    texelsPerUnit: 16,
    samplerSettings: {
      targetSize: 64,
      offset: 0,
      near: 0.05,
      far: 50
    }
  }))

  const baking = useHookstate(false)

  const doLightmapBake = useCallback(async () => {
    const scene = modelState.scene.value
    if (!scene) throw Error('model has no scene')
    baking.set(true)
    const bakeRenderer = new WebGLRenderer()
    const disposeRenderer = () => {
      bakeRenderer.dispose()
      baking.set(false)
    }
    try {
      const lightmap = await bakeLightmaps(scene, bakeProperties.value, async () => bakeRenderer)
      disposeRenderer()
      return lightmap
    } catch (e) {
      disposeRenderer()
      throw e
    }
  }, [modelState.scene])

  return (
    <>
      <CollapsibleBlock label={'Bake Lightmaps'}>
        <Well>
          <ParameterInput
            entity={modelState.src.value}
            values={bakeProperties.value}
            defaults={{
              ao: BoolArg,
              aoDistance: { ...FloatArg, default: 0.01 },
              bounceMultiplier: { ...FloatArg, default: 1 },
              emissiveMultiplier: { ...FloatArg, default: 1 },
              lightMapSize: { ...FloatArg, default: 1024 },
              texelsPerUnit: { ...FloatArg, default: 16 },
              samplerSettings: {
                ...ObjectArg,
                default: {
                  targetSize: { ...FloatArg, default: 64 },
                  offset: FloatArg,
                  near: { ...FloatArg, default: 0.05 },
                  far: { ...FloatArg, default: 50 }
                }
              }
            }}
            onChange={(k: keyof WorkbenchSettings) => {
              return (val) => {
                bakeProperties[k].set(val)
              }
            }}
          />
        </Well>
        {!baking.value && <Button onClick={doLightmapBake}>Bake Lightmaps</Button>}
        {baking.value && <Typography variant="subtitle1">Baking...</Typography>}
      </CollapsibleBlock>
    </>
  )
}
