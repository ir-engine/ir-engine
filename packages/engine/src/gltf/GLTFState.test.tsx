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

import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, Color, Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import { defineComponent, defineQuery, EntityUUID, getComponent, UUIDComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import {
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState,
  startReactor
} from '@etherealengine/hyperflux'
import { HemisphereLightComponent, TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { EditorControlFunctions } from '../../../editor/src/functions/EditorControlFunctions'
import { GroundPlaneComponent } from '../scene/components/GroundPlaneComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFSnapshotAction } from './GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from './GLTFState'

const assertSignificantFigures = (actual: number[], expected: number[], figures = 8) => {
  assert.deepStrictEqual(toSignificantFigures(actual, figures), toSignificantFigures(expected, figures))
}

const toSignificantFigures = (array: number[], figures: number) => {
  const multiplier = Math.pow(10, figures)
  return array.map((value) => Math.round(value * multiplier) / multiplier)
}

const timeout = globalThis.setTimeout

describe('GLTFState', () => {
  beforeEach(async () => {
    createEngine()

    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())

    // patch setTimeout to run the callback immediately
    // @ts-ignore
    globalThis.setTimeout = (fn) => fn()
  })

  afterEach(() => {
    globalThis.setTimeout = timeout

    return destroyEngine()
  })

  it('should load a GLTF file with a single node', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)

    assert(nodeEntity)

    const nodeEntityTree = getComponent(nodeEntity, EntityTreeComponent)
    const nodeName = getComponent(nodeEntity, NameComponent)

    assert.equal(nodeEntityTree.parentEntity, gltfEntity)
    assert.equal(nodeName, 'node')
    assert.equal(
      getComponent(nodeEntity, SourceComponent),
      getComponent(gltfEntity, UUIDComponent) + '-' + '/test.gltf'
    )

    GLTFSourceState.unload(gltfEntity)

    applyIncomingActions()

    assert(!UUIDComponent.getEntityByUUID(nodeUUID))
  })

  it('should load a GLTF file with a node and child', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID
    const childUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          children: [1],
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        },
        {
          name: 'child',
          extensions: {
            [UUIDComponent.jsonID]: childUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
    const childEntity = UUIDComponent.getEntityByUUID(childUUID)

    assert(nodeEntity)
    assert(childEntity)

    const nodeEntityTree = getComponent(nodeEntity, EntityTreeComponent)
    const childEntityTree = getComponent(childEntity, EntityTreeComponent)

    assert.equal(nodeEntityTree.parentEntity, gltfEntity)
    assert.equal(childEntityTree.parentEntity, nodeEntity)

    const nodeName = getComponent(nodeEntity, NameComponent)
    const childName = getComponent(childEntity, NameComponent)

    assert.equal(nodeName, 'node')
    assert.equal(childName, 'child')

    GLTFSourceState.unload(gltfEntity)

    applyIncomingActions()

    assert(!UUIDComponent.getEntityByUUID(nodeUUID))
    assert(!UUIDComponent.getEntityByUUID(childUUID))
  })

  it('should load a GLTF file with a node and child with a child', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID
    const childUUID = MathUtils.generateUUID() as EntityUUID
    const grandchildUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          children: [1],
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        },
        {
          name: 'child',
          children: [2],
          extensions: {
            [UUIDComponent.jsonID]: childUUID
          }
        },
        {
          name: 'grandchild',
          extensions: {
            [UUIDComponent.jsonID]: grandchildUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
    const childEntity = UUIDComponent.getEntityByUUID(childUUID)
    const grandChildEntity = UUIDComponent.getEntityByUUID(grandchildUUID)

    assert(nodeEntity)
    assert(childEntity)
    assert(grandChildEntity)

    const nodeEntityTree = getComponent(nodeEntity, EntityTreeComponent)
    const childEntityTree = getComponent(childEntity, EntityTreeComponent)
    const grandChildEntityTree = getComponent(grandChildEntity, EntityTreeComponent)

    assert.equal(nodeEntityTree.parentEntity, gltfEntity)
    assert.equal(childEntityTree.parentEntity, nodeEntity)
    assert.equal(grandChildEntityTree.parentEntity, childEntity)

    const nodeName = getComponent(nodeEntity, NameComponent)
    const childName = getComponent(childEntity, NameComponent)
    const grandChildName = getComponent(grandChildEntity, NameComponent)

    assert.equal(nodeName, 'node')
    assert.equal(childName, 'child')
    assert.equal(grandChildName, 'grandchild')

    GLTFSourceState.unload(gltfEntity)

    applyIncomingActions()

    assert(!UUIDComponent.getEntityByUUID(nodeUUID))
    assert(!UUIDComponent.getEntityByUUID(childUUID))
    assert(!UUIDComponent.getEntityByUUID(grandchildUUID))
  })

  it('should load a GLTF file with a node and child with correct transforms', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID
    const childUUID = MathUtils.generateUUID() as EntityUUID

    const nodeMatrix = new Matrix4()
      .compose(new Vector3(1, 2, 3), new Quaternion().setFromEuler(new Euler(1, 2, 3)), new Vector3(2, 3, 4))
      .toArray()

    const childMatrix = new Matrix4()
      .compose(new Vector3(4, 5, 6), new Quaternion().setFromEuler(new Euler(4, 5, 6)), new Vector3(5, 6, 7))
      .toArray()

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          children: [1],
          // non identity position, rotation and scale
          matrix: nodeMatrix,
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        },
        {
          name: 'child',
          matrix: childMatrix,
          extensions: {
            [UUIDComponent.jsonID]: childUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const node = UUIDComponent.getEntityByUUID(nodeUUID)!
    const child = UUIDComponent.getEntityByUUID(childUUID)!

    assert(node)
    assert(child)

    const nodeTransform = getComponent(node, TransformComponent)
    const childTransform = getComponent(child, TransformComponent)

    assertSignificantFigures(nodeTransform.position.toArray(), new Vector3(1, 2, 3).toArray())
    assertSignificantFigures(
      nodeTransform.rotation.toArray(),
      new Quaternion().setFromEuler(new Euler(1, 2, 3)).toArray()
    )
    assertSignificantFigures(nodeTransform.scale.toArray(), new Vector3(2, 3, 4).toArray())
    assertSignificantFigures(nodeTransform.matrix.toArray(), nodeMatrix)
    assertSignificantFigures(nodeTransform.matrixWorld.toArray(), nodeMatrix)

    assertSignificantFigures(childTransform.position.toArray(), new Vector3(4, 5, 6).toArray())
    assertSignificantFigures(
      childTransform.rotation.toArray(),
      new Quaternion().setFromEuler(new Euler(4, 5, 6)).toArray()
    )
    assertSignificantFigures(childTransform.scale.toArray(), new Vector3(5, 6, 7).toArray())
    assertSignificantFigures(childTransform.matrix.toArray(), childMatrix)
    const childMatrixWorld = new Matrix4().multiplyMatrices(nodeTransform.matrixWorld, childTransform.matrix).toArray()
    assertSignificantFigures(childMatrixWorld, childTransform.matrixWorld.toArray())
  })

  it('should load a GLTF file with a node with ECS extension data', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID,
            [VisibleComponent.jsonID]: true,
            [HemisphereLightComponent.jsonID!]: {
              skyColor: new Color('green').getHex(),
              groundColor: new Color('purple').getHex(),
              intensity: 0.5
            }
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)

    assert.equal(getComponent(nodeEntity!, VisibleComponent), true)
    assert(getComponent(nodeEntity!, HemisphereLightComponent))
    assert.equal(getComponent(nodeEntity!, HemisphereLightComponent).skyColor.getHex(), new Color('green').getHex())
    assert.equal(getComponent(nodeEntity!, HemisphereLightComponent).groundColor.getHex(), new Color('purple').getHex())
    assert.equal(getComponent(nodeEntity!, HemisphereLightComponent).intensity, 0.5)
  })

  it('should update ECS extension via snapshot without removing and reloading it via', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    let onInitCount = 0
    let onRemoveCount = 0

    const refCountComponent = defineComponent({
      name: '__TEST__RefCountComponent',
      jsonID: '__TEST__RefCountComponent',
      onInit(entity) {
        onInitCount++
        return { fakeVal: 0 }
      },
      onRemove(entity, component) {
        onRemoveCount++
      }
    })

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID,
            [VisibleComponent.jsonID]: true,
            [refCountComponent.jsonID!]: {
              fakeVal: 100
            }
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const newSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    newSnapshot.data.nodes![0].extensions![refCountComponent.jsonID!] = {
      fakeVal: 200
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot))
    applyIncomingActions()

    assert.equal(onInitCount, 1)
    assert.equal(onRemoveCount, 0)
  })

  it('should be able to parent a node to a child', () => {
    const parentUUID = MathUtils.generateUUID() as EntityUUID
    const childUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0, 1] }],
      scene: 0,
      nodes: [
        {
          name: 'parent',
          extensions: {
            [UUIDComponent.jsonID]: parentUUID
          }
        },
        {
          name: 'child',
          extensions: {
            [UUIDComponent.jsonID]: childUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    // reparent

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const newSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    newSnapshot.data.scenes![0].nodes = [0]
    newSnapshot.data.nodes![0].children = [1]

    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot))
    applyIncomingActions()

    const parent = UUIDComponent.getEntityByUUID(parentUUID)
    const child = UUIDComponent.getEntityByUUID(childUUID)

    const parentEntityTree = getComponent(parent, EntityTreeComponent)
    const childEntityTree = getComponent(child, EntityTreeComponent)

    assert.equal(parentEntityTree.parentEntity, gltfEntity)
    assert.equal(childEntityTree.parentEntity, parent)
  })

  it('should be able to undo a snapshot', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const newSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    newSnapshot.data.nodes![0].name = 'newName'
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot))
    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
    assert.equal(getComponent(nodeEntity!, NameComponent), 'newName')

    const currentSnapshot = getState(GLTFSnapshotState)[sceneID]
    assert.equal(currentSnapshot.index, 1)
    assert.equal(currentSnapshot.snapshots.length, 2)

    dispatchAction(GLTFSnapshotAction.undo({ source: sceneID, count: 1 }))
    applyIncomingActions()

    const undoneSnapshot = getState(GLTFSnapshotState)[sceneID]

    assert.equal(getComponent(nodeEntity!, NameComponent), 'node')
    assert.equal(undoneSnapshot.index, 0)
    assert.equal(undoneSnapshot.snapshots.length, 2)
  })

  it('should be able to redo a snapshot', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const newSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    newSnapshot.data.nodes![0].name = 'newName'
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot))
    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
    assert.equal(getComponent(nodeEntity!, NameComponent), 'newName')

    dispatchAction(GLTFSnapshotAction.undo({ source: sceneID, count: 1 }))
    applyIncomingActions()

    const undoneSnapshot = getState(GLTFSnapshotState)[sceneID]
    assert.equal(getComponent(nodeEntity!, NameComponent), 'node')

    assert.equal(undoneSnapshot.index, 0)
    assert.equal(undoneSnapshot.snapshots.length, 2)

    dispatchAction(GLTFSnapshotAction.redo({ source: sceneID, count: 1 }))
    applyIncomingActions()

    assert.equal(getComponent(nodeEntity!, NameComponent), 'newName')

    const redoneSnapshot = getState(GLTFSnapshotState)[sceneID]
    assert.equal(redoneSnapshot.index, 1)
    assert.equal(redoneSnapshot.snapshots.length, 2)
  })

  it('should be able to undo multiple times and override with a new snapshot', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const newSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    newSnapshot.data.nodes![0].name = 'newName'
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot))
    applyIncomingActions()

    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 1)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 2)

    const newSnapshot2 = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    newSnapshot2.data.nodes![0].name = 'newName2'
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot2))
    applyIncomingActions()

    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 2)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 3)

    const newSnapshot3 = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    newSnapshot3.data.nodes![0].name = 'newName3'
    dispatchAction(GLTFSnapshotAction.createSnapshot(newSnapshot3))
    applyIncomingActions()

    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 3)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 4)

    dispatchAction(GLTFSnapshotAction.undo({ source: sceneID, count: 1 }))
    applyIncomingActions()

    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 2)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 4)

    dispatchAction(GLTFSnapshotAction.undo({ source: sceneID, count: 1 }))
    applyIncomingActions()

    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 1)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 4)

    const divergedSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    divergedSnapshot.data.nodes![0].name = 'something else'
    dispatchAction(GLTFSnapshotAction.createSnapshot(divergedSnapshot))
    applyIncomingActions()

    const nodeEntity = UUIDComponent.getEntityByUUID(nodeUUID)
    assert.equal(getComponent(nodeEntity!, NameComponent), 'something else')
    assert.equal(getState(GLTFSnapshotState)[sceneID].index, 2)
    assert.equal(getState(GLTFSnapshotState)[sceneID].snapshots.length, 3)
  })

  it('should be able to remove an entity', async () => {
    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [
        {
          nodes: [0, 1, 2, 3, 4, 5, 6]
        }
      ],
      scene: 0,
      nodes: [
        {
          name: 'Settings',
          extensions: {
            EE_uuid: '0d5a20e1-abe2-455e-9963-d5e1e19fca19',
            EE_envmapbake: {
              bakePosition: {
                x: 0,
                y: 0,
                z: 0
              },
              bakePositionOffset: {
                x: 0,
                y: 0,
                z: 0
              },
              bakeScale: {
                x: 1,
                y: 1,
                z: 1
              },
              bakeType: 'Baked',
              resolution: 2048,
              refreshMode: 'OnAwake',
              envMapOrigin: 'https://localhost:8642/projects/default-project/public/scenes/default.envmap.ktx2',
              boxProjection: true
            },
            EE_fog: {
              type: 'linear',
              color: '#FFFFFF',
              density: 0.005,
              near: 1,
              far: 1000,
              timeScale: 1,
              height: 0.05
            },
            EE_camera_settings: {
              fov: 50,
              cameraNearClip: 0.1,
              cameraFarClip: 1000,
              projectionType: 1,
              minCameraDistance: 1,
              maxCameraDistance: 50,
              startCameraDistance: 3,
              cameraMode: 5,
              cameraModeDefault: 2,
              minPhi: -70,
              maxPhi: 85
            },
            EE_postprocessing: {
              effects: {
                SSAOEffect: {
                  isActive: false,
                  blendFunction: 21,
                  distanceScaling: true,
                  depthAwareUpsampling: true,
                  samples: 16,
                  rings: 7,
                  distanceThreshold: 0.125,
                  distanceFalloff: 0.02,
                  minRadiusScale: 1,
                  bias: 0.25,
                  radius: 0.01,
                  intensity: 2,
                  fade: 0.05
                },
                SSREffect: {
                  isActive: false,
                  distance: 10,
                  thickness: 10,
                  autoThickness: false,
                  maxRoughness: 1,
                  blend: 0.9,
                  denoiseIterations: 1,
                  denoiseKernel: 2,
                  denoiseDiffuse: 10,
                  denoiseSpecular: 10,
                  depthPhi: 2,
                  normalPhi: 50,
                  roughnessPhi: 1,
                  envBlur: 0.5,
                  importanceSampling: true,
                  directLightMultiplier: 1,
                  steps: 20,
                  refineSteps: 5,
                  spp: 1,
                  resolutionScale: 1,
                  missedRays: false
                },
                DepthOfFieldEffect: {
                  isActive: false,
                  blendFunction: 23,
                  focusDistance: 0.02,
                  focalLength: 0.5,
                  bokehScale: 1
                },
                BloomEffect: {
                  isActive: true,
                  blendFunction: 28,
                  kernelSize: 2,
                  luminanceThreshold: 1,
                  luminanceSmoothing: 0.1,
                  intensity: 0.2
                },
                ToneMappingEffect: {
                  isActive: false,
                  blendFunction: 23,
                  adaptive: true,
                  resolution: 512,
                  middleGrey: 0.6,
                  maxLuminance: 32,
                  averageLuminance: 1,
                  adaptationRate: 2
                },
                BrightnessContrastEffect: {
                  isActive: false,
                  brightness: 0.05,
                  contrast: 0.1
                },
                HueSaturationEffect: {
                  isActive: false,
                  hue: 0,
                  saturation: -0.15
                },
                ColorDepthEffect: {
                  isActive: false,
                  bits: 16
                },
                LinearTosRGBEffect: {
                  isActive: false
                },
                SSGIEffect: {
                  isActive: false,
                  distance: 10,
                  thickness: 10,
                  autoThickness: false,
                  maxRoughness: 1,
                  blend: 0.9,
                  denoiseIterations: 1,
                  denoiseKernel: 2,
                  denoiseDiffuse: 10,
                  denoiseSpecular: 10,
                  depthPhi: 2,
                  normalPhi: 50,
                  roughnessPhi: 1,
                  envBlur: 0.5,
                  importanceSampling: true,
                  directLightMultiplier: 1,
                  steps: 20,
                  refineSteps: 5,
                  spp: 1,
                  resolutionScale: 1,
                  missedRays: false
                },
                TRAAEffect: {
                  isActive: false,
                  blend: 0.8,
                  constantBlend: true,
                  dilation: true,
                  blockySampling: false,
                  logTransform: false,
                  depthDistance: 10,
                  worldDistance: 5,
                  neighborhoodClamping: true
                },
                MotionBlurEffect: {
                  isActive: false,
                  intensity: 1,
                  jitter: 1,
                  samples: 16
                }
              },
              enabled: false
            },
            EE_media_settings: {
              immersiveMedia: false,
              refDistance: 20,
              rolloffFactor: 1,
              maxDistance: 10000,
              distanceModel: 'linear',
              coneInnerAngle: 360,
              coneOuterAngle: 0,
              coneOuterGain: 0
            },
            EE_render_settings: {
              primaryLight: 'cb045cfd-8daf-4a2b-b764-35625be54a11',
              csm: true,
              cascades: 5,
              toneMapping: 1,
              toneMappingExposure: 0.8,
              shadowMapType: 2
            },
            EE_scene_settings: {
              thumbnailURL: 'https://localhost:8642/projects/default-project/public/scenes/default.thumbnail.jpg',
              loadingScreenURL:
                'https://localhost:8642/projects/default-project/public/scenes/default.loadingscreen.ktx2',
              primaryColor: '#38620D',
              backgroundColor: 'rgb(214, 214, 211)',
              alternativeColor: '#376312',
              sceneKillHeight: -10
            },
            EE_visible: true
          }
        },
        {
          matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2.5, 5, 1],
          name: 'scene preview camera',
          extensions: {
            EE_uuid: 'bb362197-f14d-4da7-9c3c-1ed834386423',
            EE_scene_preview_camera: {}
          }
        },
        {
          name: 'EE_skybox',
          extensions: {
            EE_uuid: 'e7d6bfb1-6390-4a8b-b744-da83b059c2d3',
            EE_visible: true,
            EE_skybox: {
              backgroundColor: 0,
              equirectangularPath: '',
              cubemapPath: 'https://localhost:8642/projects/default-project/assets/skyboxsun25deg/',
              backgroundType: 1,
              skyboxProps: {
                turbidity: 10,
                rayleigh: 1,
                luminance: 1,
                mieCoefficient: 0.004999999999999893,
                mieDirectionalG: 0.99,
                inclination: 0.10471975511965978,
                azimuth: 0.16666666666666666
              }
            }
          }
        },
        {
          name: 'ground plane',
          extensions: {
            EE_uuid: '38793f94-0b92-4ea1-af7b-5ec0e117628d',
            EE_visible: true,
            EE_ground_plane: {
              color: 5799734,
              visible: true
            },
            EE_shadow: {
              cast: false,
              receive: true
            },
            EE_rigidbody: {
              type: 'fixed',
              ccd: false,
              allowRolling: true,
              enabledRotations: [true, true, true],
              canSleep: true,
              gravityScale: 1
            },
            EE_collider: {
              shape: 'plane',
              mass: 1,
              massCenter: {
                x: 0,
                y: 0,
                z: 0
              },
              friction: 0.5,
              restitution: 0.5,
              collisionLayer: 4,
              collisionMask: 3
            }
          }
        },
        {
          matrix: [
            -1, 1.0106430996148606e-15, -1.224646852585167e-16, 0, 1.0106430996148606e-15, 1, 1.2246467991473547e-16, 0,
            1.2246468525851686e-16, 1.2246467991473532e-16, -1, 0, 0, 0, 0, 1
          ],
          name: 'spawn point',
          extensions: {
            EE_uuid: '3e8a430e-9dcf-440e-990c-44ecb8051762',
            EE_visible: true,
            EE_spawn_point: {
              permissionedUsers: []
            }
          }
        },
        {
          name: 'hemisphere light',
          extensions: {
            EE_uuid: 'f77dc4c6-c9a6-433d-8102-4a9a8e1c0ce9',
            EE_visible: true,
            EE_hemisphere_light: {
              skyColor: 16777215,
              groundColor: 16777215,
              intensity: 1
            }
          }
        },
        {
          matrix: [
            0.8201518642540717, 0.2860729507918133, -0.49549287218469207, 0, -2.135677384940138e-9, 0.8660253995220991,
            0.5000000073825887, 0, 0.5721458901019658, -0.41007593712366674, 0.7102723465203864, 0, 0, 10, 0, 1
          ],
          name: 'directional light',
          extensions: {
            EE_uuid: 'cb045cfd-8daf-4a2b-b764-35625be54a11',
            EE_directional_light: {
              color: 16777215,
              intensity: 1,
              cameraFar: 200,
              castShadow: true,
              shadowBias: -0.00001,
              shadowRadius: 1,
              helper: null
            },
            EE_visible: true
          }
        }
      ],
      extensionsUsed: [
        'EE_uuid',
        'EE_envmapbake',
        'EE_fog',
        'EE_camera_settings',
        'EE_postprocessing',
        'EE_media_settings',
        'EE_render_settings',
        'EE_scene_settings',
        'EE_visible',
        'EE_ecs',
        'EE_scene_preview_camera',
        'EE_skybox',
        'EE_resourceId',
        'EE_ground_plane',
        'EE_shadow',
        'EE_rigidbody',
        'EE_collider',
        'EE_spawn_point',
        'EE_hemisphere_light',
        'EE_directional_light'
      ]
    }

    Cache.add('/test.gltf', gltf)

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    applyIncomingActions()

    const sceneID = getComponent(gltfEntity, SourceComponent)
    const groundPlaneQuery = defineQuery([GroundPlaneComponent])
    const groundPlaneEntity = groundPlaneQuery()[0]

    const GLTFSnapshotStateReactor = GLTFSnapshotState.reactor

    const reactor = startReactor(GLTFSnapshotStateReactor)

    let gltfClone = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    let groundPlaneNode = gltfClone.data.nodes!.filter((node) =>
      node.name && node.name == 'ground plane' ? node : undefined
    )[0]
    assert(groundPlaneNode)

    EditorControlFunctions.removeObject([groundPlaneEntity])

    applyIncomingActions()
    reactor.run()
    assert(reactor.errors.length == 0)

    gltfClone = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    groundPlaneNode = gltfClone.data.nodes!.filter((node) =>
      node.name && node.name == 'ground plane' ? node : undefined
    )[0]
    assert(!groundPlaneNode)
  })
})
