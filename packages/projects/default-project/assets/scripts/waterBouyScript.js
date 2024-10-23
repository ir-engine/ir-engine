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

import { defineQuery } from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx"
import { setComponent  , getComponent , getMutableComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts"
import { VisibleComponent , setVisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { TransformComponent  } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts"
import { NameComponent } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/common/NameComponent.ts"
import { Vector3 , Quaternion , Euler , MathUtils , Color , TextureLoader , RepeatWrapping  , DoubleSide} from "https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js";
import {UUIDComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/UUIDComponent.ts"
import {createEntity} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/EntityFunctions.tsx"
import {EntityTreeComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/EntityTree.tsx"
import {SourceComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SourceComponent.ts"
import {GLTFComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/gltf/GLTFComponent.tsx"
import { getState} from  "https://localhost:3000/@fs/root/ir-engine/packages/hyperflux/src/functions/StateFunctions.ts"
import {EngineState } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/EngineState.ts"
import { defineSystem  } from  "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemFunctions.ts" 
import { AnimationSystemGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemGroups.ts'
import {PrimitiveGeometryComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/PrimitiveGeometryComponent.ts"
import {GeometryTypeEnum} from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/constants/GeometryTypeEnum.ts"
import {MeshComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/MeshComponent.ts"

const gltf = defineQuery([GLTFComponent])()[0]

const waterColor = new Color('skyblue')
const buoyancyConstant = 9.8;  // Buoyancy force constant (like gravity but upwards)
const waterSurfaceY = .5;      // Y level of the water surface
const floaterMass = 1;         // Mass of the floater
const dampingFactor = 0.05;    // To reduce oscillations
let boatVelocityY = 0;    // Vertical velocity of the boat

let time = 0;  // Time accumulator for the bobbing effect
const bobbingAmplitude = 0.1;  // Amplitude of the bobbing effect
const bobbingSpeed = 0.02;      // Speed of the bobbing effect
const smoothingFactor = 0.01;    // How quickly the boat reaches the target position (lower values mean smoother, slower motion)
let targetY = 0;  // Target Y position that includes both buoyancy and bobbing effects

const generateWater = () => {
    const entity = createEntity();
    setComponent(entity, EntityTreeComponent, {parentEntity : gltf })
    setComponent(entity, NameComponent, `water`);
    setComponent(entity, UUIDComponent, UUIDComponent.generateUUID());
    setVisibleComponent(entity, true);
    setComponent(entity, TransformComponent, {
        position: new Vector3(0,-3,0),
        scale: new Vector3(10, 7, 10)
    });
    setComponent(entity, SourceComponent, getComponent(gltf,SourceComponent))
    setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryTypeEnum.BoxGeometry });
    getMutableComponent(entity, MeshComponent ).material.color.set(waterColor);


    return entity;
};


const generateFloater = () => {
    const entity = createEntity();
    setComponent(entity, EntityTreeComponent, {parentEntity : gltf })
    setComponent(entity, NameComponent, `boat`);
    setComponent(entity, UUIDComponent, UUIDComponent.generateUUID());
    setVisibleComponent(entity, true);
    setComponent(entity, TransformComponent, {
        position: new Vector3(0,1,0),
    });
    setComponent(entity, SourceComponent, getComponent(gltf,SourceComponent))
    setComponent(entity, PrimitiveGeometryComponent, { geometryType: GeometryTypeEnum.BoxGeometry });
    return entity;
};


const water = generateWater()
const boat = generateFloater()



const execute = () => {
    const boatTransform = getComponent(boat, TransformComponent);
    const boatPosition = boatTransform.position;

    const submersionDepth = waterSurfaceY - boatPosition.y;

    if (submersionDepth > 0) {
        const buoyancyForce = buoyancyConstant * submersionDepth * floaterMass;

        const damping = boatVelocityY * dampingFactor;

        boatVelocityY += (buoyancyForce - damping) / floaterMass;
    } else {
        boatVelocityY -= buoyancyConstant * 0.1; // Adjust gravity effect if needed
    }

    targetY = boatPosition.y + boatVelocityY;

    if (targetY < waterSurfaceY) {
        targetY = waterSurfaceY
        boatVelocityY = 0;  
    }

    time += bobbingSpeed;
    const bobbingOffset = Math.sin(time) * bobbingAmplitude;

    targetY += bobbingOffset;

    const smoothedY = MathUtils.lerp(boatPosition.y, targetY, smoothingFactor);

    setComponent(boat, TransformComponent, {
        position: new Vector3(boatPosition.x, smoothedY, boatPosition.z)
    });
};

export const waterBouySystem = defineSystem({
    uuid: 'ee.editor.waterBouySystem',
    insert: { before: AnimationSystemGroup },
    execute
});