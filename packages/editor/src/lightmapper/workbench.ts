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

import * as THREE from 'three'

import { AtlasMap, renderAtlas } from './atlas'
import { computeAutoUV2Layout } from './AutoUV2'
import { DEFAULT_LIGHT_PROBE_SETTINGS, LightProbeSettings } from './lightProbe'

export interface Workbench {
  aoMode: boolean
  aoDistance: number
  emissiveMultiplier: number
  bounceMultiplier: number

  lightScene: THREE.Scene
  atlasMap: AtlasMap

  // lightmap output
  irradiance: THREE.Texture
  irradianceData: Float32Array

  // sampler settings
  settings: LightProbeSettings
}

const DEFAULT_LIGHTMAP_SIZE = 64
const DEFAULT_TEXELS_PER_UNIT = 2
const DEFAULT_AO_DISTANCE = 3

// global conversion of display -> physical emissiveness
// this is useful because emissive textures normally do not produce enough light to bounce to scene,
// and simply increasing their emissiveIntensity would wash out the user-visible display colours
const DEFAULT_EMISSIVE_MULTIPLIER = 32

// flags for marking up objects in scene
// read-only flag allows preventing UV2 generation but can also allow objects that have UV2 and should be
// in light scene, but are ignored in atlas and have their own lightmap
export const LIGHTMAP_IGNORE_FLAG = Symbol('lightmap ignore flag')
export const LIGHTMAP_READONLY_FLAG = Symbol('lightmap read-only flag')

const hasOwnProp = Object.prototype.hasOwnProperty
export function objectHasFlag(object: THREE.Object3D, flag: symbol) {
  return hasOwnProp.call(object.userData, flag)
}

// hacky way to report current object flag while doing traverseSceneItems
export let traversalStateIsReadOnly = false

// based on traverse() in https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js
export function* traverseSceneItems(
  root: THREE.Object3D,
  ignoreReadOnly?: boolean,
  onIgnored?: (object: THREE.Object3D) => void
) {
  const stack = [root]
  const readOnlyStack = [false]

  while (stack.length > 0) {
    const current = stack.pop()!
    const inheritReadOnly = readOnlyStack.pop()!

    // skip everything invisible and inside opt-out wrappers
    if (
      !current.visible ||
      objectHasFlag(current, LIGHTMAP_IGNORE_FLAG) ||
      (ignoreReadOnly && objectHasFlag(current, LIGHTMAP_READONLY_FLAG))
    ) {
      if (onIgnored) {
        onIgnored(current)
      }
      continue
    }

    // compute readOnly flag for current object (either directly flagged or inheriting parent's flag)
    const activeReadOnly = inheritReadOnly || objectHasFlag(current, LIGHTMAP_READONLY_FLAG)

    // report to consumer
    traversalStateIsReadOnly = activeReadOnly
    yield current

    // recurse, letting children inherit the active/inherited readOnly flag
    for (const childObject of current.children) {
      stack.push(childObject)
      readOnlyStack.push(activeReadOnly)
    }
  }
}

function createRendererTexture(
  atlasWidth: number,
  atlasHeight: number,
  textureFilter: THREE.MagnificationTextureFilter
): [THREE.Texture, Float32Array] {
  const atlasSize = atlasWidth * atlasHeight
  const data = new Float32Array(4 * atlasSize)

  // not filling texture with test pattern because this goes right into light probe computation
  const texture = new THREE.DataTexture(data, atlasWidth, atlasHeight, THREE.RGBAFormat, THREE.FloatType)

  // set desired texture filter (no mipmaps supported due to the nature of lightmaps)
  texture.magFilter = textureFilter
  texture.minFilter = textureFilter
  texture.generateMipmaps = false

  return [texture, data]
}

// @todo use work manager (though maybe not RAF based?)
function requestNextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export type SamplerSettings = Partial<LightProbeSettings>
export interface WorkbenchSettings {
  ao?: boolean
  aoDistance?: number
  emissiveMultiplier?: number
  bounceMultiplier?: number // crank up from 1 (default) to light up the corners
  lightMapSize?: number | [number, number]
  textureFilter?: THREE.MagnificationTextureFilter
  texelsPerUnit?: number
  samplerSettings?: SamplerSettings
}

export async function initializeWorkbench(
  scene: THREE.Scene,
  props: WorkbenchSettings,
  requestWork: () => Promise<THREE.WebGLRenderer>
) {
  const {
    ao,
    aoDistance,
    emissiveMultiplier,
    bounceMultiplier,
    lightMapSize,
    textureFilter,
    texelsPerUnit,
    samplerSettings
  } = props

  const settings = {
    ...DEFAULT_LIGHT_PROBE_SETTINGS,
    ...samplerSettings
  }

  // parse the convenience setting
  const [initialWidth, initialHeight] = lightMapSize
    ? [
        typeof lightMapSize === 'number' ? lightMapSize : lightMapSize[0],
        typeof lightMapSize === 'number' ? lightMapSize : lightMapSize[1]
      ]
    : [undefined, undefined]

  // wait a bit for responsiveness
  await requestNextTick()

  // perform UV auto-layout in next tick

  const [computedWidth, computedHeight] = computeAutoUV2Layout(
    initialWidth,
    initialHeight,
    traverseSceneItems(scene, true),
    {
      texelsPerUnit: texelsPerUnit || DEFAULT_TEXELS_PER_UNIT
    }
  )

  const lightMapWidth = computedWidth || DEFAULT_LIGHTMAP_SIZE
  const lightMapHeight = computedHeight || DEFAULT_LIGHTMAP_SIZE

  await requestNextTick()

  // create renderer texture
  const [irradiance, irradianceData] = createRendererTexture(
    lightMapWidth,
    lightMapHeight,
    textureFilter || THREE.LinearFilter
  )

  irradiance.name = 'Rendered irradiance map'

  // perform atlas mapping
  const gl = await requestWork()
  const atlasMap = renderAtlas(gl, lightMapWidth, lightMapHeight, traverseSceneItems(scene, true))

  // set up workbench
  return {
    aoMode: !!ao,
    aoDistance: aoDistance || DEFAULT_AO_DISTANCE,
    emissiveMultiplier: emissiveMultiplier === undefined ? DEFAULT_EMISSIVE_MULTIPLIER : emissiveMultiplier,
    bounceMultiplier: bounceMultiplier === undefined ? 1 : bounceMultiplier,

    lightScene: scene,
    atlasMap,

    irradiance,
    irradianceData,

    settings: settings
  }
}
