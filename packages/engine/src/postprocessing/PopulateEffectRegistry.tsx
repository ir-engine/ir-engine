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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PresentationSystemGroup } from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { useEffect } from 'react'
import { bloomAddToEffectRegistry } from './BloomEffect'
import { brightnessContrastAddToEffectRegistry } from './BrightnessContrastEffect'
import { chromaticAberrationAddToEffectRegistry } from './ChromaticAberrationEffect'
import { colorAverageAddToEffectRegistry } from './ColorAverageEffect'
import { colorDepthAddToEffectRegistry } from './ColorDepthEffect'
import { depthOfFieldAddToEffectRegistry } from './DepthOfFieldEffect'
import { dotScreenAddToEffectRegistry } from './DotScreenEffect'
import { fxaaAddToEffectRegistry } from './FXAAEffect'
import { glitchAddToEffectRegistry } from './GlitchEffect'
import { gridAddToEffectRegistry } from './GridEffect'
import { hueSaturationAddToEffectRegistry } from './HueSaturationEffect'
import { lut1DAddToEffectRegistry } from './LUT1DEffect'
import { lut3DAddToEffectRegistry } from './LUT3DEffect'
import { lensDistortionAddToEffectRegistry } from './LensDistortionEffect'
import { linearTosRGBAddToEffectRegistry } from './LinearTosRGBEffect'
import { motionBlurAddToEffectRegistry } from './MotionBlurEffect'
import { noiseAddToEffectRegistry } from './NoiseEffect'
import { pixelationAddToEffectRegistry } from './PixelationEffect'
import { smaaAddToEffectRegistry } from './SMAAEffect'
import { ssaoAddToEffectRegistry } from './SSAOEffect'
import { ssgiAddToEffectRegistry } from './SSGIEffect'
import { ssrAddToEffectRegistry } from './SSREffect'
import { scanlineAddToEffectRegistry } from './ScanlineEffect'
import { shockWaveAddToEffectRegistry } from './ShockWaveEffect'
import { traaAddToEffectRegistry } from './TRAAEffect'
import { textureAddToEffectRegistry } from './TextureEffect'
import { tiltShiftAddToEffectRegistry } from './TiltShiftEffect'
import { toneMappingAddToEffectRegistry } from './ToneMappingEffect'
import { vignetteAddToEffectRegistry } from './VignetteEffect'

export const populateEffectRegistry = () => {
  // registers the effects
  bloomAddToEffectRegistry()
  brightnessContrastAddToEffectRegistry()
  chromaticAberrationAddToEffectRegistry()
  colorAverageAddToEffectRegistry()
  colorDepthAddToEffectRegistry()
  depthOfFieldAddToEffectRegistry()
  dotScreenAddToEffectRegistry()
  fxaaAddToEffectRegistry()
  glitchAddToEffectRegistry()
  //GodRaysEffect
  gridAddToEffectRegistry()
  hueSaturationAddToEffectRegistry()
  lensDistortionAddToEffectRegistry()
  linearTosRGBAddToEffectRegistry()
  lut1DAddToEffectRegistry()
  lut3DAddToEffectRegistry()
  motionBlurAddToEffectRegistry()
  noiseAddToEffectRegistry()
  pixelationAddToEffectRegistry()
  scanlineAddToEffectRegistry()
  shockWaveAddToEffectRegistry()
  smaaAddToEffectRegistry()
  ssaoAddToEffectRegistry()
  ssrAddToEffectRegistry()
  ssgiAddToEffectRegistry()
  textureAddToEffectRegistry()
  tiltShiftAddToEffectRegistry()
  toneMappingAddToEffectRegistry()
  traaAddToEffectRegistry()
  vignetteAddToEffectRegistry()
}

export const PostProcessingRegisterSystem = defineSystem({
  uuid: 'ee.engine.PostProcessingRegisterSystem',
  insert: { before: PresentationSystemGroup },
  reactor: () => {
    useEffect(() => populateEffectRegistry(), [])
    return null
  }
})
