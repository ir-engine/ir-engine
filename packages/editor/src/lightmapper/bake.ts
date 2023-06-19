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

import { scanAtlasTexels } from './atlas'
import { withLightProbe } from './lightProbe'
import { Workbench } from './workbench'

const MAX_PASSES = 2

// offsets for 3x3 brush
const offDirX = [1, 1, 0, -1, -1, -1, 0, 1]
const offDirY = [0, 1, 1, 1, 0, -1, -1, -1]

function storeLightMapValue(
  atlasData: Float32Array,
  atlasWidth: number,
  totalTexelCount: number,
  texelIndex: number,
  rgba: THREE.Vector4,
  passOutputData: Float32Array
) {
  // read existing texel value (if adding)
  const mainOffTexelBase = texelIndex * 4

  rgba.w = 1 // reset alpha to 1 to indicate filled pixel

  // main texel write
  rgba.toArray(passOutputData, mainOffTexelBase)

  // propagate combined value to 3x3 brush area
  const texelX = texelIndex % atlasWidth
  const texelRowStart = texelIndex - texelX

  for (let offDir = 0; offDir < 8; offDir += 1) {
    const offX = offDirX[offDir]
    const offY = offDirY[offDir]

    const offRowX = (atlasWidth + texelX + offX) % atlasWidth
    const offRowStart = (totalTexelCount + texelRowStart + offY * atlasWidth) % totalTexelCount
    const offTexelBase = (offRowStart + offRowX) * 4

    // fill texel if it will not/did not receive real computed data otherwise;
    // also ensure strong neighbour values (not diagonal) take precedence
    // (using layer output data to check for past writes since it is re-initialized per pass)
    const offTexelFaceEnc = atlasData[offTexelBase + 2]
    const isStrongNeighbour = offX === 0 || offY === 0
    const isUnfilled = passOutputData[offTexelBase + 3] === 0

    if (offTexelFaceEnc === 0 && (isStrongNeighbour || isUnfilled)) {
      // no need to separately read existing value for brush-propagated texels
      rgba.toArray(passOutputData, offTexelBase)
    }
  }
}

export async function runBakingPasses(workbench: Workbench, requestWork: () => Promise<THREE.WebGLRenderer>) {
  await withLightProbe(workbench.aoMode, workbench.aoDistance, workbench.settings, async (renderLightProbeBatch) => {
    const { atlasMap, irradiance, irradianceData } = workbench
    const { width: atlasWidth, height: atlasHeight } = atlasMap
    const totalTexelCount = atlasWidth * atlasHeight

    // set up output buffer for texel data
    const passOutputData = new Float32Array(4 * totalTexelCount)

    for (let passCount = 0; passCount < MAX_PASSES; passCount += 1) {
      // reset output buffer "empty pixel" status (alpha channel)
      passOutputData.fill(0)

      // main work iteration
      let texelsDone = false
      const texelIterator = scanAtlasTexels(atlasMap, () => {
        texelsDone = true
      })

      while (!texelsDone) {
        const gl = await requestWork()

        for (const { texelIndex, rgba } of renderLightProbeBatch(gl, workbench.lightScene, texelIterator)) {
          // store resulting total illumination
          storeLightMapValue(atlasMap.data, atlasWidth, totalTexelCount, texelIndex, rgba, passOutputData)
        }
      }

      // pass is complete, apply the computed texels into active lightmap
      // (used in the next pass and final display)
      irradianceData.set(passOutputData)
      irradiance.needsUpdate = true
    }
  })
}

// debug probe @todo rewrite
/*
  const { renderLightProbeBatch: debugProbeBatch, debugLightProbeTexture } =
    useLightProbe(
      workbenchRef.current.aoMode,
      workbenchRef.current.aoDistance,
      workbenchRef.current.settings
    );
  const debugProbeRef = useRef(false);
  useFrame(({ gl }) => {
    // run only once
    if (debugProbeRef.current) {
      return;
    }
    debugProbeRef.current = true;

    const { atlasMap } = workbenchRef.current;

    const startX = 1;
    const startY = 1;
    function* debugIterator() {
      yield getTexelInfo(atlasMap, atlasMap.width * startY + startX);
    }

    for (const _item of debugProbeBatch(
      gl,
      workbenchRef.current.lightScene,
      debugIterator()
    )) {
      // no-op (not consuming the data)
    }
  });

  // report debug texture
  useEffect(() => {
    if (onDebugLightProbeRef.current) {
      onDebugLightProbeRef.current(debugLightProbeTexture);
    }
  }, [debugLightProbeTexture]);
*/
