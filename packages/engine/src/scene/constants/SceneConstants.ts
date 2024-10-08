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
export const SceneComplexityWeights = {
  verticesWeight: 0.5,
  trianglesWeight: 1.0,
  texturesMBWeight: 1.0,
  lightsWeight: 1.2,
  drawCallsWeight: 1.5,
  shaderComplexityWeight: 1.0
}

// these are thresholds for the scene complexity
export const SceneComplexity = {
  VeryLight: { label: 'Very Light', value: 50000 } as const,
  Light: { label: 'Light', value: 100000 } as const,
  Medium: { label: 'Medium', value: 150000 } as const,
  Heavy: { label: 'Heavy', value: 200000 } as const,
  VeryHeavy: { label: 'Very Heavy', value: 300000 } as const
}

export type SceneComplexityCategoryType = (typeof SceneComplexity)[keyof typeof SceneComplexity]['label']
export type SceneComplexityValueType = (typeof SceneComplexity)[keyof typeof SceneComplexity]['value']
