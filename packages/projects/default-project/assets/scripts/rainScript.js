import { defineQuery } from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx"
import { setComponent  , getComponent , getMutableComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts"
import { ParticleSystemComponent  } from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/ParticleSystemComponent.ts"
import { VisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { TransformComponent  } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts"
import { NameComponent } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/common/NameComponent.ts"
import { Vector3 , Quaternion , Euler , MathUtils , NormalBlending} from "https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js";
import {UUIDComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/UUIDComponent.ts"
import {createEntity} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/EntityFunctions.tsx"
import {EntityTreeComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/EntityTree.tsx"
import {SourceComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SourceComponent.ts"
import {GLTFComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/gltf/GLTFComponent.tsx"

const gltf = defineQuery([GLTFComponent])()[0]
const rainTexture = "https://localhost:8642/projects/ir-engine/default-project/assets/raindrop.png"
const setupParticleSystem = () => { 
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, {parentEntity : gltf })
    setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(entity, VisibleComponent)
    setComponent(entity, SourceComponent, getComponent(gltf,SourceComponent))
    setComponent(entity , ParticleSystemComponent)
    return entity
}

const setupRain = (entity) => {
    const particleSystem = getMutableComponent(entity , ParticleSystemComponent)
    const particle = particleSystem.value
    particleSystem.systemParameters.duration.set(2) 
    particleSystem.systemParameters.shape.set({type :'sphere' , radius : 1}) 
    particleSystem._refresh.set((particle._refresh + 1) % 1000)
    particleSystem.systemParameters.texture.set(rainTexture)
    particleSystem.systemParameters.transparent.set(true)
    particleSystem.systemParameters.startLife.set({type : 'ConstantValue', value : 1.1})
    particleSystem.systemParameters.startSize.set({type : 'IntervalValue', a : 0.01 , b: 0.02 })
    particleSystem.systemParameters.startSpeed.set({type : 'IntervalValue',  a : 0.01 , b: 3 } )
    particleSystem.systemParameters.startRotation.set({type : 'ConstantValue', value : 0} )
    particleSystem.systemParameters.startColor.set({type : 'ConstantColor', color : {r: .3, g: .5 , b: .9 , a: .3}} )
    particleSystem.systemParameters.emissionOverTime.set({type : 'ConstantValue', value : 1000} )
    particleSystem._refresh.set((particle._refresh + 1) % 1000)

    const rainForce = {
        type: 'ApplyForce',
        direction: [0, -100 , 0],
        magnitude: {
            type: 'ConstantValue',
            value: 1
        }
        }
    particleSystem.behaviorParameters.set([
      ...JSON.parse(JSON.stringify(particle.behaviorParameters)),
      rainForce
    ])
    particleSystem._refresh.set((particle._refresh + 1) % 1000)

}

const setupCloud = (entity) => {
    const particleSystem = getMutableComponent(entity , ParticleSystemComponent)
    const particle = particleSystem.value
    particleSystem.systemParameters.shape.set({type :'sphere' , radius : 1}) 
    particleSystem._refresh.set((particle._refresh + 1) % 1000)
    particleSystem.systemParameters.transparent.set(true)
    particleSystem.systemParameters.startSize.set({type : 'IntervalValue', a : 0.6  , b: 0.01 })
    particleSystem.systemParameters.startColor.set({type : 'ConstantColor', color : {r: .6, g: .6 , b: .6 , a: .1}} )
    particleSystem.systemParameters.emissionOverTime.set({type : 'ConstantValue', value : 800} )
    particleSystem.systemParameters.blending.set(NormalBlending)

    particleSystem._refresh.set((particle._refresh + 1) % 1000)

}

const cloudParticleEntity  = setupParticleSystem()
setComponent(cloudParticleEntity, NameComponent, "cloudParticleObject")
setComponent(cloudParticleEntity, TransformComponent,{position: new Vector3(0,30,0), scale: new Vector3(20,4,20)})
setupCloud(cloudParticleEntity) 

const rainParticleSystem = setupParticleSystem()
setComponent(rainParticleSystem, NameComponent, "rainParticleObject")
setComponent(rainParticleSystem, TransformComponent,{position: new Vector3(0,30,0) , rotation :new Quaternion().setFromEuler(new Euler( MathUtils.DEG2RAD * 90,0,0)),scale: new Vector3(20,20,1)})
setupRain(rainParticleSystem)





