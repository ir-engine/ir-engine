import assert from 'assert'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { Group } from 'three'
import fs from 'fs'
import path from 'path'
import { getLoader } from '../../assets/functions/LoadGLTF'
import { setupAvatar, setupAvatarIKRig } from './avatarFunctions'
import { IKPoseComponent } from '../../ikrig/components/IKPoseComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import appRootPath from 'app-root-path'
import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { AvatarComponent } from '../components/AvatarComponent'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import AvatarBoneMatching from '@xrengine/engine/src/avatar/AvatarBoneMatching'
import { ArmatureType } from '../../ikrig/enums/ArmatureType'
import { AssetLoader } from '../../assets/classes/AssetLoader'

const testVRMModel = path.join(appRootPath.path, '/packages/projects/default-project/public/avatars/CyberbotRed.glb')
const testRealModel = path.join(appRootPath.path, '/packages/projects/default-project/public/avatars/CyberbotRed.glb')
const testMixamoModel = path.join(appRootPath.path, '/packages/projects/default-project/public/avatars/CyberbotRed.glb')

describe('avatarFunctions', async () => {
  await loadDRACODecoder()

  const loadAsset = async (url) => {
    return new Promise((resolve, reject) => {
      AssetLoader.load(
        {
          url,
          castShadow: true,
          receiveShadow: true
        },
        (model: any) => {
          const parent = new Group()
          const root = new Group()
          root.add(model.scene)
          parent.add(root)
          resolve(parent)
        }
      )
    })
  }

  const loadVRM = async () => {
    return loadAsset(testVRMModel)
  }

  const loadReallusion = async () => {
    return loadAsset(testRealModel)
  }

  const loadMixamo = async () => {
    return loadAsset(testMixamoModel)
  }

  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
  })

  afterEach(async () => {})

  describe('setupAvatar', () => {
    it('should set up bone matching', async () => {
      // get asset data
      const asset = (await loadMixamo()) as any
      const boneStructure = AvatarBoneMatching(SkeletonUtils.clone(asset))
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

    it('should set up ikrig', async () => {
      // get asset data
      const asset = (await loadMixamo()) as any
      const entity = createEntity()
      const boneStructure = AvatarBoneMatching(SkeletonUtils.clone(asset))
      const rootSkeleton = setupAvatarIKRig(entity, ArmatureType.MIXAMO, boneStructure)
      assert(rootSkeleton)
      assert(getComponent(entity, IKPoseComponent))
    })

    it('should set up mixamo', async () => {
      // get asset data
      const asset = (await loadMixamo()) as any

      // mock avatar entity

      const entity = createEntity()

      setupAvatar(entity, SkeletonUtils.clone(asset))

      // assert something
      assert(getComponent(entity, AvatarComponent))
      assert(getComponent(entity, AnimationComponent))
      assert(getComponent(entity, AvatarAnimationComponent))
    })

    it('should set up vrm', async () => {
      // get asset data
      const asset = (await loadVRM()) as any

      // mock avatar entity

      const entity = createEntity()
      setupAvatar(entity, SkeletonUtils.clone(asset))
      // assert something
      assert(getComponent(entity, AvatarComponent))
      assert(getComponent(entity, AnimationComponent))
      assert(getComponent(entity, AvatarAnimationComponent))
    })

    it('should set up reallusion', async () => {
      // get asset data
      const asset = (await loadReallusion()) as any

      // mock avatar entity

      const entity = createEntity()
      setupAvatar(entity, SkeletonUtils.clone(asset))
      // assert something
      assert(getComponent(entity, AvatarComponent))
      assert(getComponent(entity, AnimationComponent))
      assert(getComponent(entity, AvatarAnimationComponent))
    })
  })
})
