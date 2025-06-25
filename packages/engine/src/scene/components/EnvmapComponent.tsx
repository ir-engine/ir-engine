/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Shader } from 'three'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineMaterialPlugin } from '@ir-engine/engine/src/material/defineMaterialPlugin'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import {
  envmapParsReplaceLambert,
  envmapPhysicalParsReplace,
  envmapReplaceLambert,
  worldposReplace
} from '../classes/BPCEMShader'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

export const EnvMapComponent = defineComponent({
  name: 'EnvMapComponent',
  jsonID: 'EE_envmap',

  schema: S.Object({
    type: S.LiteralUnion(Object.values(EnvMapSourceType), { default: EnvMapSourceType.Skybox }),
    envMapSourceColor: T.Color('#8080FF'),
    envMapSourceURL: S.String(),
    envMapCubemapURL: S.String(),
    envMapSourceEntityUUID: S.EntityID(),
    envMapIntensity: S.Number({ default: 1 })
  }),

  errors: ['MISSING_FILE']
})

export const BoxProjectionPlugin = defineMaterialPlugin({
  name: 'BoxProjectionPlugin',

  jsonID: 'IR_envmap_box_projection',

  uniforms: S.Object({
    cubeMapSize: T.Vec3(),
    cubeMapPos: T.Vec3()
  }),

  onApply: (shader: Shader) => {
    const shaderType = shader.shaderType
    const isPhysical = shaderType === 'MeshStandardMaterial' || shaderType === 'MeshPhysicalMaterial'
    const isSupported = isPhysical || shaderType === 'MeshLambertMaterial' || shaderType === 'MeshPhongMaterial'
    if (!isSupported) return

    if (isPhysical) {
      if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition'))
        shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <envmap_physical_pars_fragment>',
        envmapPhysicalParsReplace
      )
    } else {
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_pars_fragment>', envmapParsReplaceLambert)
      shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_fragment>', envmapReplaceLambert)
    }
  }
})
