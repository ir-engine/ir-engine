import assert from 'assert'
import { BoxGeometry, Material, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, ShaderMaterial } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { SceneOptions } from '../../systems/SceneObjectSystem'
import { useSimpleMaterial, useStandardMaterial } from './SimpleMaterialFunctions'

SceneOptions.instance = new SceneOptions()
SceneOptions.instance.boxProjection = true

describe('SimpleMaterialFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  describe('useSimpleMaterial()', () => {
    it('replaces materials with ShaderMaterial', () => {
      const mat = new MeshStandardMaterial()
      const obj3d = new Mesh(new BoxGeometry(), mat)
      useSimpleMaterial(obj3d as any)

      assert(obj3d.material instanceof ShaderMaterial)
      assert(obj3d.userData.prevMaterial === mat)
    })
  })

  describe('useStandardMaterial()', () => {
    it('does nothing if there no material', () => {
      const obj3d = new Object3D()
      useStandardMaterial(obj3d as Mesh<any, MeshStandardMaterial>)

      assert(!obj3d.userData.material)
    })

    it('restores previous material', () => {
      const mat = new MeshStandardMaterial()
      const obj3d = new Mesh(new BoxGeometry(), new MeshPhongMaterial())
      obj3d.receiveShadow = true
      EngineRenderer.instance.csm = { setupMaterial() {} } as any
      obj3d.userData.prevMaterial = mat

      useStandardMaterial(obj3d as any)

      assert(obj3d.material === (mat as any))
      assert((obj3d.material as any).envMapIntensity === SceneOptions.instance.envMapIntensity)
      assert(typeof obj3d.userData.prevMaterial === 'undefined')
    })
  })
})
