import assert from 'assert'
import { AnimationClip, Group, Vector3 } from 'three'

import { loadGLTFAssetNode } from '../../../tests/util/loadGLTFAssetNode'
import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { IKPoseComponent } from '../../ikrig/components/IKPoseComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AnimationState } from '../animation/AnimationState'
import { AvatarAnimationGraph } from '../animation/AvatarAnimationGraph'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { animateAvatarModel, boneMatchAvatarModel, rigAvatarModel } from './avatarFunctions'

before(async () => {
  await loadDRACODecoder()
})

const testGLTF = '/packages/projects/default-project/public/avatars/CyberbotRed.glb'

describe('avatarFunctions Unit', async () => {
  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
  })

  let assetModel
  before(async () => {
    assetModel = await loadGLTFAssetNode(testGLTF)
  })

  describe('boneMatchAvatarModel', () => {
    it('should set up bone matching', async () => {
      const entity = createEntity()
      const boneStructure = boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))

      assert(boneStructure.Hips)
      assert(boneStructure.Head)
      assert(boneStructure.Neck)
      assert(boneStructure.Spine || boneStructure.Spine1 || boneStructure.Spine2)
      assert(boneStructure.LeftFoot)
      assert(boneStructure.RightFoot)
      assert((boneStructure.RightArm || boneStructure.RightForeArm) && boneStructure.RightHand)
      assert((boneStructure.LeftArm || boneStructure.LeftForeArm) && boneStructure.LeftHand)
      assert((boneStructure.RightUpLeg || boneStructure.RightLeg) && boneStructure.RightFoot)
      assert((boneStructure.LeftUpLeg || boneStructure.LeftLeg) && boneStructure.LeftFoot)
    })
  })

  describe('rigAvatarModel', () => {
    it('should add rig to skeleton', async () => {
      const entity = createEntity()
      const boneStructure = boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))
      const rootSkeleton = rigAvatarModel(entity)(boneStructure)

      assert.equal(typeof rootSkeleton, 'object')
      assert(hasComponent(entity, IKPoseComponent))
    })
  })

  describe('animateAvatarModel', () => {
    it('should assign passed group as new animation mixer root', () => {
      const entity = createEntity()

      const animationComponentData = {
        mixer: null!,
        animations: [] as AnimationClip[],
        animationSpeed: 1
      }

      addComponent(entity, AnimationComponent, animationComponentData)
      addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })

      addComponent(entity, AvatarAnimationComponent, {
        animationGraph: new AvatarAnimationGraph(),
        currentState: new AnimationState(),
        prevState: new AnimationState(),
        prevVelocity: new Vector3()
      })

      const group = new Group()
      animateAvatarModel(entity)(group)

      assert.equal(getComponent(entity, AnimationComponent).mixer.getRoot(), group)
    })
  })
})
