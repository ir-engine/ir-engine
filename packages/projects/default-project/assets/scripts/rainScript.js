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

import {
  Euler,
  MathUtils,
  NormalBlending,
  Quaternion,
  Vector3
} from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js'
import {
  getComponent,
  getMutableComponent,
  setComponent
} from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts'
import { createEntity } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/EntityFunctions.tsx'
import { defineQuery } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx'
import { UUIDComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/UUIDComponent.ts'
import { GLTFComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/gltf/GLTFComponent.tsx'
import { ParticleSystemComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/ParticleSystemComponent.ts'
import { SourceComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SourceComponent.ts'
import { NameComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/common/NameComponent.ts'
import { VisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { EntityTreeComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/EntityTree.tsx'
import { TransformComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts'

const gltf = defineQuery([GLTFComponent])()[0]
const rainTexture = 'https://localhost:8642/projects/ir-engine/default-project/assets/raindrop.png'
const setupParticleSystem = () => {
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: gltf })
  setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
  setComponent(entity, VisibleComponent)
  setComponent(entity, SourceComponent, getComponent(gltf, SourceComponent))
  setComponent(entity, ParticleSystemComponent)
  return entity
}

const setupRain = (entity) => {
  const particleSystem = getMutableComponent(entity, ParticleSystemComponent)
  const particle = particleSystem.value
  particleSystem.systemParameters.duration.set(2)
  particleSystem.systemParameters.shape.set({ type: 'sphere', radius: 1 })
  particleSystem._refresh.set((particle._refresh + 1) % 1000)
  particleSystem.systemParameters.texture.set(rainTexture)
  particleSystem.systemParameters.transparent.set(true)
  particleSystem.systemParameters.startLife.set({ type: 'ConstantValue', value: 1.1 })
  particleSystem.systemParameters.startSize.set({ type: 'IntervalValue', a: 0.01, b: 0.02 })
  particleSystem.systemParameters.startSpeed.set({ type: 'IntervalValue', a: 0.01, b: 3 })
  particleSystem.systemParameters.startRotation.set({ type: 'ConstantValue', value: 0 })
  particleSystem.systemParameters.startColor.set({ type: 'ConstantColor', color: { r: 0.3, g: 0.5, b: 0.9, a: 0.3 } })
  particleSystem.systemParameters.emissionOverTime.set({ type: 'ConstantValue', value: 1000 })
  particleSystem._refresh.set((particle._refresh + 1) % 1000)

  const rainForce = {
    type: 'ApplyForce',
    direction: [0, -100, 0],
    magnitude: {
      type: 'ConstantValue',
      value: 1
    }
  }
  particleSystem.behaviorParameters.set([...JSON.parse(JSON.stringify(particle.behaviorParameters)), rainForce])
  particleSystem._refresh.set((particle._refresh + 1) % 1000)
}

const setupCloud = (entity) => {
  const particleSystem = getMutableComponent(entity, ParticleSystemComponent)
  const particle = particleSystem.value
  particleSystem.systemParameters.shape.set({ type: 'sphere', radius: 1 })
  particleSystem._refresh.set((particle._refresh + 1) % 1000)
  particleSystem.systemParameters.transparent.set(true)
  particleSystem.systemParameters.startSize.set({ type: 'IntervalValue', a: 0.6, b: 0.01 })
  particleSystem.systemParameters.startColor.set({ type: 'ConstantColor', color: { r: 0.6, g: 0.6, b: 0.6, a: 0.1 } })
  particleSystem.systemParameters.emissionOverTime.set({ type: 'ConstantValue', value: 800 })
  particleSystem.systemParameters.blending.set(NormalBlending)

  particleSystem._refresh.set((particle._refresh + 1) % 1000)
}

const cloudParticleEntity = setupParticleSystem()
setComponent(cloudParticleEntity, NameComponent, 'cloudParticleObject')
setComponent(cloudParticleEntity, TransformComponent, {
  position: new Vector3(0, 30, 0),
  scale: new Vector3(20, 4, 20)
})
setupCloud(cloudParticleEntity)

const rainParticleSystem = setupParticleSystem()
setComponent(rainParticleSystem, NameComponent, 'rainParticleObject')
setComponent(rainParticleSystem, TransformComponent, {
  position: new Vector3(0, 30, 0),
  rotation: new Quaternion().setFromEuler(new Euler(MathUtils.DEG2RAD * 90, 0, 0)),
  scale: new Vector3(20, 20, 1)
})
setupRain(rainParticleSystem)
