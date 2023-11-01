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

import { useEffect } from 'react'
import {
  AdditiveBlending,
  Blending,
  BufferGeometry,
  Material,
  MeshBasicMaterial,
  Object3D,
  Texture,
  Vector2,
  Vector3
} from 'three'
import { Behavior, BehaviorFromJSON, ParticleSystem, ParticleSystemJSONParameters, RenderMode } from 'three.quarks'
import matches from 'ts-matches'

import { NO_PROXY, none } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { getBatchRenderer } from '../systems/ParticleSystemSystem'
import getFirstMesh from '../util/meshUtils'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

/*
SHAPE TYPES
*/
export type PointShapeJSON = {
  type: 'point'
}

export const POINT_SHAPE_DEFAULT: PointShapeJSON = {
  type: 'point'
}

export type SphereShapeJSON = {
  type: 'sphere'
  radius?: number
}

export const SPHERE_SHAPE_DEFAULT: SphereShapeJSON = {
  type: 'sphere',
  radius: 1
}

export type ConeShapeJSON = {
  type: 'cone'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export const CONE_SHAPE_DEFAULT: ConeShapeJSON = {
  type: 'cone',
  radius: 1,
  arc: 0.2,
  thickness: 4,
  angle: 30
}

export type DonutShapeJSON = {
  type: 'donut'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export const DONUT_SHAPE_DEFAULT: DonutShapeJSON = {
  type: 'donut',
  radius: 1,
  arc: 30,
  thickness: 0.5,
  angle: 15
}

export type MeshShapeJSON = {
  type: 'mesh_surface'
  mesh?: string
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
  mesh: ''
}

export type GridShapeJSON = {
  type: 'grid'
  width?: number
  height?: number
  column?: number
  row?: number
}

export const GRID_SHAPE_DEFAULT: GridShapeJSON = {
  type: 'grid',
  width: 1,
  height: 1,
  column: 1,
  row: 1
}

export type EmitterShapeJSON =
  | PointShapeJSON
  | SphereShapeJSON
  | ConeShapeJSON
  | MeshShapeJSON
  | GridShapeJSON
  | DonutShapeJSON

/*
/SHAPE TYPES
*/

/*
VALUE GENERATOR TYPES
*/

export type ConstantValueJSON = {
  type: 'ConstantValue'
  value: number
}

export type IntervalValueJSON = {
  type: 'IntervalValue'
  a: number
  b: number
}

export type BezierFunctionJSON = {
  function: {
    p0: number
    p1: number
    p2: number
    p3: number
  }
  start: number
}

export type PiecewiseBezierValueJSON = {
  type: 'PiecewiseBezier'
  functions: BezierFunctionJSON[]
}

export type ValueGeneratorJSON = ConstantValueJSON | IntervalValueJSON | PiecewiseBezierValueJSON

export const ValueGeneratorJSONDefaults: Record<string, ValueGeneratorJSON> = {
  ConstantValue: {
    type: 'ConstantValue',
    value: 1
  },
  IntervalValue: {
    type: 'IntervalValue',
    a: 0,
    b: 1
  },
  PiecewiseBezier: {
    type: 'PiecewiseBezier',
    functions: [
      {
        function: {
          p0: 0,
          p1: 0,
          p2: 1,
          p3: 1
        },
        start: 0
      }
    ]
  }
}

/*
/VALUE GENERATOR TYPES
*/

/*
COLOR GENERATOR TYPES
*/

export type ColorJSON = {
  r: number
  g: number
  b: number
  a: number
}

export type ConstantColorJSON = {
  type: 'ConstantColor'
  color: ColorJSON
}

export type ColorRangeJSON = {
  type: 'ColorRange'
  a: ColorJSON
  b: ColorJSON
}

export type RandomColorJSON = {
  type: 'RandomColor'
  a: ColorJSON
  b: ColorJSON
}

export type ColorGradientFunctionJSON = {
  function: ColorRangeJSON
  start: number
}

export type ColorGradientJSON = {
  type: 'Gradient'
  functions: ColorGradientFunctionJSON[]
}

export type ColorGeneratorJSON = ConstantColorJSON | ColorRangeJSON | RandomColorJSON | ColorGradientJSON

export const ColorGeneratorJSONDefaults: Record<string, ColorGeneratorJSON> = {
  ConstantColor: {
    type: 'ConstantColor',
    color: { r: 1, g: 1, b: 1, a: 1 }
  },
  ColorRange: {
    type: 'ColorRange',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  RandomColor: {
    type: 'RandomColor',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  Gradient: {
    type: 'Gradient',
    functions: [
      {
        function: {
          type: 'ColorRange',
          a: { r: 1, g: 1, b: 1, a: 1 },
          b: { r: 1, g: 1, b: 1, a: 1 }
        },
        start: 0
      }
    ]
  }
}

/*
/COLOR GENERATOR TYPES
*/

/*
ROTATION GENERATOR TYPES
*/

export type AxisAngleGeneratorJSON = {
  type: 'AxisAngle'
  axis: [number, number, number]
  angle: ValueGeneratorJSON
}

export type EulerGeneratorJSON = {
  type: 'Euler'
  angleX: ValueGeneratorJSON
  angleY: ValueGeneratorJSON
  angleZ: ValueGeneratorJSON
}

export type RandomQuatGeneratorJSON = {
  type: 'RandomQuat'
}

export type RotationGeneratorJSON = AxisAngleGeneratorJSON | EulerGeneratorJSON | RandomQuatGeneratorJSON

export const RotationGeneratorJSONDefaults: Record<string, RotationGeneratorJSON> = {
  AxisAngle: {
    type: 'AxisAngle',
    axis: [0, 1, 0],
    angle: {
      type: 'ConstantValue',
      value: 0
    }
  },
  Euler: {
    type: 'Euler',
    angleX: {
      type: 'ConstantValue',
      value: 0
    },
    angleY: {
      type: 'ConstantValue',
      value: 0
    },
    angleZ: {
      type: 'ConstantValue',
      value: 0
    }
  },
  RandomQuat: {
    type: 'RandomQuat'
  }
}
/*
/ROTATION GENERATOR TYPES
*/

/*
BEHAVIOR TYPES
*/

//  SEQUENCER
export type TextureSequencerJSON = {
  scaleX: number
  scaleY: number
  position: Vector3
  locations: Vector2[]
  src: string
  threshold: number
}

export type SequencerJSON = TextureSequencerJSON

export type ApplySequencesJSON = {
  type: 'ApplySequences'
  delay: number
  sequencers: {
    range: IntervalValueJSON
    sequencer: SequencerJSON
  }[]
}

export type BurstParametersJSON = {
  time: number
  count: number
  cycle: number
  interval: number
  probability: number
}
//  /SEQUENCER

export type ApplyForceBehaviorJSON = {
  type: 'ApplyForce'
  direction: [number, number, number]
  magnitude: ValueGeneratorJSON
}

export type NoiseBehaviorJSON = {
  type: 'Noise'
  frequency: [number, number, number]
  power: [number, number, number]
}

export type TurbulenceFieldBehaviorJSON = {
  type: 'TurbulenceField'
  scale: [number, number, number]
  octaves: number
  velocityMultiplier: [number, number, number]
  timeScale: [number, number, number]
}

export type GravityForceBehaviorJSON = {
  type: 'GravityForce'
  center: [number, number, number]
  magnitude: number
}

export type ColorOverLifeBehaviorJSON = {
  type: 'ColorOverLife'
  color: ColorGeneratorJSON
}

export type RotationOverLifeBehaviorJSON = {
  type: 'RotationOverLife'
  angularVelocity: ValueGeneratorJSON
  dynamic: boolean
}

export type Rotation3DOverLifeBehaviorJSON = {
  type: 'Rotation3DOverLife'
  angularVelocity: RotationGeneratorJSON
  dynamic: boolean
}

export type SizeOverLifeBehaviorJSON = {
  type: 'SizeOverLife'
  size: ValueGeneratorJSON
}

export type SpeedOverLifeBehaviorJSON = {
  type: 'SpeedOverLife'
  speed: ValueGeneratorJSON
}

export type FrameOverLifeBehaviorJSON = {
  type: 'FrameOverLife'
  frame: ValueGeneratorJSON
}

export type ForceOverLifeBehaviorJSON = {
  type: 'ForceOverLife'
  x: ValueGeneratorJSON
  y: ValueGeneratorJSON
  z: ValueGeneratorJSON
}

export type OrbitOverLifeBehaviorJSON = {
  type: 'OrbitOverLife'
  orbitSpeed: ValueGeneratorJSON
  axis: [number, number, number]
}

export type WidthOverLengthBehaviorJSON = {
  type: 'WidthOverLength'
  width: ValueGeneratorJSON
}

export type ChangeEmitDirectionBehaviorJSON = {
  type: 'ChangeEmitDirection'
  angle: ValueGeneratorJSON
}

export type EmitSubParticleSystemBehaviorJSON = {
  type: 'EmitSubParticleSystem'
  subParticleSystem: string
  useVelocityAsBasis: boolean
}

export type BehaviorJSON =
  | ApplyForceBehaviorJSON
  | NoiseBehaviorJSON
  | TurbulenceFieldBehaviorJSON
  | GravityForceBehaviorJSON
  | ColorOverLifeBehaviorJSON
  | RotationOverLifeBehaviorJSON
  | Rotation3DOverLifeBehaviorJSON
  | SizeOverLifeBehaviorJSON
  | SpeedOverLifeBehaviorJSON
  | FrameOverLifeBehaviorJSON
  | ForceOverLifeBehaviorJSON
  | OrbitOverLifeBehaviorJSON
  | WidthOverLengthBehaviorJSON
  | ChangeEmitDirectionBehaviorJSON
  | EmitSubParticleSystemBehaviorJSON
  | ApplySequencesJSON

/*
  SYSTEM TYPES
*/

export type RendererSettingsJSON = {
  startLength: ValueGeneratorJSON
  followLocalOrigin: boolean
}

export const BehaviorJSONDefaults: { [type: string]: BehaviorJSON } = {
  ApplySequences: {
    type: 'ApplySequences',
    delay: 0,
    sequencers: []
  },
  ApplyForce: {
    type: 'ApplyForce',
    direction: [0, 1, 0],
    magnitude: {
      type: 'ConstantValue',
      value: 1
    }
  },
  Noise: {
    type: 'Noise',
    frequency: [1, 1, 1],
    power: [1, 1, 1]
  },
  TurbulenceField: {
    type: 'TurbulenceField',
    scale: [1, 1, 1],
    octaves: 3,
    velocityMultiplier: [1, 1, 1],
    timeScale: [1, 1, 1]
  },
  GravityForce: {
    type: 'GravityForce',
    center: [0, 0, 0],
    magnitude: 1
  },
  ColorOverLife: {
    type: 'ColorOverLife',
    color: {
      type: 'ConstantColor',
      color: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      }
    }
  },
  RotationOverLife: {
    type: 'RotationOverLife',
    angularVelocity: {
      type: 'ConstantValue',
      value: 0.15
    },
    dynamic: false
  },
  Rotation3DOverLife: {
    type: 'Rotation3DOverLife',
    angularVelocity: {
      type: 'RandomQuat'
    },
    dynamic: false
  },
  SizeOverLife: {
    type: 'SizeOverLife',
    size: {
      type: 'ConstantValue',
      value: 0
    }
  },
  SpeedOverLife: {
    type: 'SpeedOverLife',
    speed: {
      type: 'ConstantValue',
      value: 1
    }
  },
  FrameOverLife: {
    type: 'FrameOverLife',
    frame: {
      type: 'ConstantValue',
      value: 0
    }
  },
  ForceOverLife: {
    type: 'ForceOverLife',
    x: {
      type: 'ConstantValue',
      value: 0
    },
    y: {
      type: 'ConstantValue',
      value: 1
    },
    z: {
      type: 'ConstantValue',
      value: 0
    }
  },
  OrbitOverLife: {
    type: 'OrbitOverLife',
    orbitSpeed: {
      type: 'ConstantValue',
      value: 0
    },
    axis: [0, 1, 0]
  },
  WidthOverLength: {
    type: 'WidthOverLength',
    width: {
      type: 'ConstantValue',
      value: 1
    }
  },
  ChangeEmitDirection: {
    type: 'ChangeEmitDirection',
    angle: {
      type: 'ConstantValue',
      value: 1.4
    }
  },
  EmitSubParticleSystem: {
    type: 'EmitSubParticleSystem',
    subParticleSystem: '',
    useVelocityAsBasis: false
  }
}

/*
/BEHAVIOR TYPES
*/

export type ExtraSystemJSON = {
  instancingGeometry: string
  startColor: ColorGeneratorJSON
  startRotation: ValueGeneratorJSON
  startSize: ValueGeneratorJSON
  startSpeed: ValueGeneratorJSON
  startLife: ValueGeneratorJSON
  behaviors: BehaviorJSON[]
  emissionBursts: BurstParametersJSON[]
  rendererEmitterSettings?: RendererSettingsJSON
}

export type ExpandedSystemJSON = ParticleSystemJSONParameters & ExtraSystemJSON

export type ParticleSystemMetadata = {
  geometries: { [key: string]: BufferGeometry }
  materials: { [key: string]: Material }
  textures: { [key: string]: Texture }
}

export type ParticleSystemComponentType = {
  systemParameters: ExpandedSystemJSON
  behaviorParameters: BehaviorJSON[]

  system?: ParticleSystem | undefined
  behaviors?: Behavior[] | undefined
  _loadIndex: number
  _refresh: number
}

export const ParticleSystemJSONParametersValidator = matches.shape({
  version: matches.string,
  autoDestroy: matches.boolean,
  looping: matches.boolean,
  duration: matches.number,
  shape: matches.shape({
    type: matches.string,
    radius: matches.number.optional(),
    arc: matches.number.optional(),
    thickness: matches.number.optional(),
    angle: matches.number.optional(),
    mesh: matches.string.optional()
  }),
  startLife: matches.object,
  startSpeed: matches.object,
  startRotation: matches.object,
  startSize: matches.object,
  startColor: matches.object,
  emissionOverTime: matches.object,
  emissionOverDistance: matches.object,
  onlyUsedByOther: matches.boolean,
  rendererEmitterSettings: matches
    .shape({
      startLength: matches.object.optional(),
      followLocalOrigin: matches.boolean.optional()
    })
    .optional(),
  renderMode: matches.natural,
  speedFactor: matches.number,
  texture: matches.string,
  instancingGeometry: matches.object.optional(),
  startTileIndex: matches.natural,
  uTileCount: matches.natural,
  vTileCount: matches.natural,
  blending: matches.natural,
  behaviors: matches.arrayOf(matches.any),
  worldSpace: matches.boolean
})

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS: ExpandedSystemJSON = {
  version: '1.0',
  autoDestroy: false,
  looping: true,
  prewarm: false,
  material: '',
  duration: 5,
  shape: { type: 'point' },
  startLife: {
    type: 'IntervalValue',
    a: 1,
    b: 2
  },
  startSpeed: {
    type: 'IntervalValue',
    a: 0.1,
    b: 5
  },
  startRotation: {
    type: 'IntervalValue',
    a: 0,
    b: 300
  },
  startSize: {
    type: 'IntervalValue',
    a: 0.025,
    b: 0.45
  },
  startColor: {
    type: 'ConstantColor',
    color: { r: 1, g: 1, b: 1, a: 0.1 }
  },
  emissionOverTime: {
    type: 'ConstantValue',
    value: 400
  },
  emissionOverDistance: {
    type: 'ConstantValue',
    value: 0
  },
  emissionBursts: [],
  onlyUsedByOther: false,
  rendererEmitterSettings: {
    startLength: {
      type: 'ConstantValue',
      value: 1
    },
    followLocalOrigin: true
  },
  renderMode: RenderMode.BillBoard,
  texture: '/static/editor/dot.png',
  instancingGeometry: '',
  startTileIndex: {
    type: 'ConstantValue',
    value: 0
  },
  uTileCount: 1,
  vTileCount: 1,
  blending: AdditiveBlending,
  behaviors: [],
  worldSpace: true
}

export const ParticleSystemComponent = defineComponent({
  name: 'EE_ParticleSystem',
  jsonID: 'particle-system',
  onInit: (entity) => {
    return {
      systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
      behaviorParameters: [],
      _loadIndex: 0,
      _refresh: 0
    } as ParticleSystemComponentType
  },
  onSet: (entity, component, json) => {
    !!json?.systemParameters &&
      component.systemParameters.set({
        ...JSON.parse(JSON.stringify(component.systemParameters.value)),
        ...json.systemParameters
      })

    !!json?.behaviorParameters && component.behaviorParameters.set(JSON.parse(JSON.stringify(json.behaviorParameters)))
    ;(!!json?.systemParameters || !!json?.behaviorParameters) &&
      component._refresh.set((component._refresh.value + 1) % 1000)
  },
  onRemove: (entity, component) => {
    if (component.system.value) {
      removeObjectFromGroup(entity, component.system.value.emitter as unknown as Object3D)
      component.system.get(NO_PROXY)?.dispose()
      component.system.set(none)
    }
    component.behaviors.set(none)
  },
  toJSON: (entity, component) => ({
    systemParameters: JSON.parse(JSON.stringify(component.systemParameters.value)),
    behaviorParameters: JSON.parse(JSON.stringify(component.behaviorParameters.value))
  }),
  reactor: function () {
    const entity = useEntityContext()
    const componentState = useComponent(entity, ParticleSystemComponent)
    const component = componentState.value
    const batchRenderer = getBatchRenderer()!

    useEffect(() => {
      if (component.system) {
        const emitterAsObj3D = component.system.emitter as unknown as Object3D
        if (emitterAsObj3D.userData['_refresh'] === component._refresh) return
        removeObjectFromGroup(entity, emitterAsObj3D)
        component.system.dispose()
        componentState.system.set(none)
      }

      function initParticleSystem(systemParameters: ParticleSystemJSONParameters, metadata: ParticleSystemMetadata) {
        const nuSystem = ParticleSystem.fromJSON(systemParameters, metadata, {})
        batchRenderer.addSystem(nuSystem)
        componentState.behaviors.set(
          component.behaviorParameters.map((behaviorJSON) => {
            const behavior = BehaviorFromJSON(behaviorJSON, nuSystem)
            nuSystem.addBehavior(behavior)
            return behavior
          })
        )

        const emitterAsObj3D = nuSystem.emitter as unknown as Object3D
        emitterAsObj3D.userData['_refresh'] = component._refresh
        addObjectToGroup(entity, emitterAsObj3D)
        componentState.system.set(nuSystem)
      }

      const doLoadEmissionGeo =
        component.systemParameters.shape.type === 'mesh_surface' &&
        AssetLoader.getAssetClass(component.systemParameters.shape.mesh ?? '') === AssetClass.Model

      const doLoadInstancingGeo =
        component.systemParameters.instancingGeometry &&
        AssetLoader.getAssetClass(component.systemParameters.instancingGeometry) === AssetClass.Model

      const doLoadTexture =
        component.systemParameters.texture &&
        AssetLoader.getAssetClass(component.systemParameters.texture) === AssetClass.Image

      const loadDependencies: Promise<any>[] = []
      const metadata: ParticleSystemMetadata = { textures: {}, geometries: {}, materials: {} }

      //add dud material
      componentState.systemParameters.material.set('dud')
      const dudMaterial = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: component.systemParameters.transparent ?? true,
        blending: component.systemParameters.blending as Blending
      })
      metadata.materials['dud'] = dudMaterial

      const processedParms = JSON.parse(JSON.stringify(component.systemParameters)) as ExpandedSystemJSON

      function loadGeoDependency(src: string) {
        return new Promise((resolve) => {
          AssetLoader.load(src, {}, ({ scene }: GLTF) => {
            const geo = getFirstMesh(scene)?.geometry
            !!geo && (metadata.geometries[src] = geo)
            resolve(null)
          })
        })
      }

      doLoadEmissionGeo &&
        loadDependencies.push(
          new Promise((resolve) => {
            AssetLoader.load(component.systemParameters.shape.mesh!, {}, ({ scene }: GLTF) => {
              const mesh = getFirstMesh(scene)
              mesh && (metadata.geometries[component.systemParameters.shape.mesh!] = mesh.geometry)
              resolve(null)
            })
          })
        )

      doLoadInstancingGeo && loadDependencies.push(loadGeoDependency(component.systemParameters.instancingGeometry!))

      doLoadTexture &&
        loadDependencies.push(
          new Promise((resolve) => {
            AssetLoader.load(component.systemParameters.texture!, {}, (texture: Texture) => {
              metadata.textures[component.systemParameters.texture!] = texture
              dudMaterial.map = texture
              resolve(null)
            })
          })
        )

      componentState._loadIndex.set(componentState._loadIndex.value + 1)
      const currentIndex = componentState._loadIndex.value
      Promise.all(loadDependencies).then(() => {
        currentIndex === componentState._loadIndex.value && initParticleSystem(processedParms, metadata)
      })
    }, [componentState._refresh])
    return null
  }
})
