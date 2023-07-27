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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WebGLRenderer } from 'three'

import { ComponentType } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BoolArg, FloatArg } from '@etherealengine/engine/src/renderer/materials/constants/DefaultArgs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Grid, Typography } from '@mui/material'

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
              texelsPerUnit: { ...FloatArg, default: 16 }
            }}
            onChange={(k: keyof WorkbenchSettings) => {
              return (val) => {
                bakeProperties[k].set(val)
              }
            }}
          />
          <Grid
            container
            spacing={2}
            style={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              outline: 'solid 1px #fff',
              borderRadius: '0.5rem',
              paddingBottom: '1rem',
              width: 'auto',
              margin: '1rem',
              overflow: 'overlay'
            }}
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1">Sampler Settings</Typography>
            </Grid>
            <Grid item xs>
              <ParameterInput
                entity={modelState.src.value}
                values={bakeProperties.samplerSettings.value ?? {}}
                defaults={{
                  targetSize: { ...FloatArg, default: 64 },
                  offset: FloatArg,
                  near: { ...FloatArg, default: 0.05 },
                  far: { ...FloatArg, default: 50 }
                }}
                onChange={(k: string) => {
                  return (val) => {
                    bakeProperties.samplerSettings[k].set(val)
                  }
                }}
              />
            </Grid>
          </Grid>
        </Well>
        {!baking.value && <Button onClick={doLightmapBake}>Bake Lightmaps</Button>}
        {baking.value && <Typography variant="subtitle1">Baking...</Typography>}
      </CollapsibleBlock>
    </>
  )
}
