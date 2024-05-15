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

import { EntityUUID, UUIDComponent, getComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { applyIncomingActions, getMutableState } from '@etherealengine/hyperflux'
import { HemisphereLightComponent, TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, Color, Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFSourceState } from './GLTFState'

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
})
