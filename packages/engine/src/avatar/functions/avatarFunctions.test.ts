import assert from 'assert'
import { AnimationClip, Group, Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import AvatarBoneMatching from '@xrengine/engine/src/avatar/AvatarBoneMatching'

import { loadGLTFAssetNode } from '../../../tests/util/loadGLTFAssetNode'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { IKPoseComponent } from '../../ikrig/components/IKPoseComponent'
import { IKRigComponent, IKRigTargetComponent } from '../../ikrig/components/IKRigComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { AnimationState } from '../animations/AnimationState'
import { AvatarAnimationGraph } from '../animations/AvatarAnimationGraph'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import {
  animateAvatarModel,
  boneMatchAvatarModel,
  loadAvatarForUser,
  rigAvatarModel,
  setupAvatarModel
} from './avatarFunctions'
import { createAvatar } from './createAvatar'

const githubPath = 'https://raw.githubusercontent.com/XRFoundation/test-assets/main/avatars/'
const assetPaths = ['reallusion/Allison.glb', 'mixamo/vanguard.fbx', 'mixamo/vanguard.glb', 'vrm/test2.vrm']

before(async () => {
  await loadDRACODecoder()
})

describe('avatarFunctions Integration', async () => {
  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })
  })

  describe('loadAvatarForEntity', () => {
    it('should bone match, and rig avatar', async function () {
      this.timeout(60 * 1000)
      // clear cache to not potentially leak data between tests
      AssetLoader.Cache.clear()
      const world = useWorld()
      Engine.userId = world.hostId
      Engine.hasJoinedWorld = true

      await Promise.all(
        assetPaths.map(async (asset, i) => {
          // set up avatar entity
          const entity = createEntity()
          const networkObject = addComponent(entity, NetworkObjectComponent, {
            // remote owner
            ownerId: Engine.userId,
            ownerIndex: 0,
            networkId: i as NetworkId,
            prefab: '',
            parameters: {}
          })

          createAvatar({
            prefab: 'avatar',
            parameters: { position: new Vector3(), rotation: new Quaternion() },
            type: 'network.SPAWN_OBJECT',
            networkId: networkObject.networkId,
            ownerIndex: 0,
            $from: Engine.userId,
            $to: 'all',
            $tick: Engine.currentWorld.fixedTick,
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
            if (!hasComponent(entity, IKRigComponent)) return
          }

          assert(hasComponent(entity, IKRigComponent))
          assert(hasComponent(entity, IKPoseComponent))
          assert(hasComponent(entity, IKRigTargetComponent))
          const avatarComponent = getComponent(entity, AvatarComponent)

          assert(avatarComponent.modelContainer.children.length)
          assert(avatarComponent.avatarHeight > 0)
          assert(avatarComponent.avatarHalfHeight > 0)

          const { boneStructure } = getComponent(entity, IKRigComponent)
          assert(boneStructure)
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

      addComponent(entity, AnimationComponent, {
        mixer: null!,
        animations: [] as AnimationClip[],
        animationSpeed: 1
      })

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
