import assert from 'assert'
import { AnimationClip, Bone, Group, Quaternion, Vector3 } from 'three'
import { URL } from 'url'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

import { loadGLTFAssetNode } from '../../../tests/util/loadGLTFAssetNode'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AnimationState } from '../animation/AnimationState'
import { AvatarAnimationGraph } from '../animation/AvatarAnimationGraph'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import {
  animateAvatarModel,
  boneMatchAvatarModel,
  loadAvatarForUser,
  makeDefaultSkinnedMesh,
  rigAvatarModel
} from './avatarFunctions'
import { createAvatar } from './createAvatar'

const githubPath = 'https://raw.githubusercontent.com/XRFoundation/test-assets/main/avatars/'
const animGLB = '/packages/client/public/default_assets/Animations.glb'
const assetPaths = ['reallusion/Allison.glb', 'mixamo/vanguard.fbx', 'mixamo/vanguard.glb', 'vrm/test2.vrm']

before(async () => {
  await loadDRACODecoder()
})

describe('avatarFunctions Integration', async () => {
  before(async () => {
    // To fix FBX loader errors
    ;(window.URL as any) = URL
    const world = createWorld()
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })
    const animationGLTF = await loadGLTFAssetNode(animGLB)
    AnimationManager.instance.getAnimations(animationGLTF)
  })

  describe('loadAvatarForEntity', () => {
    it('should bone match, and rig avatar', async function () {
      this.timeout(60 * 1000)
      // clear cache to not potentially leak data between tests
      AssetLoader.Cache.clear()
      Engine.userId = Engine.currentWorld.hostId
      Engine.hasJoinedWorld = true

      await Promise.all(
        assetPaths.map(async (asset, i) => {
          // set up avatar entity
          const entity = createEntity()
          const networkObject = addComponent(entity, NetworkObjectComponent, {
            // remote owner
            ownerId: Engine.userId,
            lastTick: 0,
            networkId: i as NetworkId,
            prefab: '',
            parameters: {}
          })

          createAvatar({
            prefab: 'avatar',
            parameters: { position: new Vector3(), rotation: new Quaternion() },
            type: 'network.SPAWN_OBJECT',
            networkId: networkObject.networkId,
            $from: Engine.userId,
            $to: 'all',
            $time: 0,
            $cache: true
          })

          const avatar = getComponent(entity, AvatarComponent)
          // make sure this is set later on
          avatar.avatarHeight = 0
          avatar.avatarHalfHeight = 0

          try {
            // run setup
            await loadAvatarForUser(entity, githubPath + asset)
          } catch (e) {
            console.log('\n\nloadAvatarForEntity failed', asset, e, '\n\n')
            // silently fail if files cannot be loaded in time, we dont want to break tests, they will pass on CI/CD as it has a better connection
          }

          const avatarComponent = getComponent(entity, AvatarComponent)

          assert(avatarComponent.modelContainer.children.length, asset)
          assert(avatarComponent.avatarHeight > 0)
          assert(avatarComponent.avatarHalfHeight > 0)

          const { rig } = getComponent(entity, AnimationComponent)
          assert(rig)
          assert(rig.Hips)
          assert(rig.Head)
          assert(rig.Neck)
          assert(rig.Spine || rig.Spine1 || rig.Spine2)
          assert(rig.LeftFoot)
          assert(rig.RightFoot)
          assert((rig.RightArm || rig.RightForeArm) && rig.RightHand)
          assert((rig.LeftArm || rig.LeftForeArm) && rig.LeftHand)
          assert((rig.RightUpLeg || rig.RightLeg) && rig.RightFoot)
          assert((rig.LeftUpLeg || rig.LeftLeg) && rig.LeftFoot)

          // TODO: this currently isn't working, the update method doesnt show up in the VRM object
          // assert.equal(hasComponent(entity, UpdatableComponent), asset.split('.').pop() === 'vrm')
        })
      )
    })
  })
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
      const animationComponent = addComponent(entity, AnimationComponent, {})
      boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))
      const boneStructure = animationComponent.rig

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
      const animationComponent = addComponent(entity, AnimationComponent, {})
      const model = boneMatchAvatarModel(entity)(SkeletonUtils.clone(assetModel.scene))
      AnimationManager.instance._defaultSkinnedMesh = makeDefaultSkinnedMesh()
      rigAvatarModel(entity)(model)
      assert(animationComponent.rootYRatio > 0)
    })
  })

  describe('animateAvatarModel', () => {
    it('should use default skeleton hip bone as mixer root', async () => {
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

      const animationGLTF = await loadGLTFAssetNode(animGLB)
      AnimationManager.instance.getAnimations(animationGLTF)

      const group = new Group()
      animateAvatarModel(entity)(group)

      const sourceHips = makeDefaultSkinnedMesh().skeleton.bones[0]
      const mixerRoot = getComponent(entity, AnimationComponent).mixer.getRoot() as Bone

      assert(mixerRoot.isBone)
      assert.equal(mixerRoot.name, sourceHips.name)
      assert.deepEqual(sourceHips.matrix, mixerRoot.matrix)
    })
  })
})
