import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getComponent,
  removeComponent,
  defineQuery
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import { defaultIKPoseComponentValues, IKPoseComponent } from '@xrengine/engine/src/ikrig/components/IKPoseComponent'
import { IKRigComponent, IKRigComponentType } from '@xrengine/engine/src/ikrig/components/IKRigComponent'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import SkeletonRigSystem from '@xrengine/engine/src/ikrig/systems/SkeletonRigSystem'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React, { useEffect, useRef, useState } from 'react'
import {
  AmbientLight,
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Group,
  SkeletonHelper,
  SkinnedMesh,
  Skeleton,
  Vector2,
  Vector3,
  WebGLRenderer,
  Bone
} from 'three'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import Debug from '../../components/Debug'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { addRig, addTargetRig } from '@xrengine/engine/src/ikrig/functions/RigFunctions'
import { ArmatureType } from '@xrengine/engine/src/ikrig/enums/ArmatureType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { bonesData, bonesData2 } from '../../../../engine/src/avatar/DefaultSkeletonBones'
import { SkeletonUtils } from '../../../../engine/src/avatar/SkeletonUtils'

const AnimationSystem = async (world: World): Promise<System> => {
  const animationQuery = defineQuery([AnimationComponent])
  return () => {
    const { delta } = world
    for (const entity of animationQuery(world)) {
      const ac = getComponent(entity, AnimationComponent)
      ac.mixer.update(delta)
    }
  }
}

const RenderSystem = async (): Promise<System> => {
  const currentSize = new Vector2()
  return () => {
    const width = window.innerWidth
    const height = window.innerHeight
    Engine.renderer.getSize(currentSize)
    const needsResize = currentSize.x !== width || currentSize.y !== height

    if (needsResize) {
      const curPixelRatio = Engine.renderer.getPixelRatio()
      if (curPixelRatio !== window.devicePixelRatio) Engine.renderer.setPixelRatio(window.devicePixelRatio)

      if ((Engine.camera as PerspectiveCamera).isPerspectiveCamera) {
        const cam = Engine.camera as PerspectiveCamera
        cam.aspect = width / height
        cam.updateProjectionMatrix()
      }

      Engine.renderer.setSize(width, height, true)
      // Engine.effectComposer.setSize(width, height, false)
    }
    Engine.renderer.render(Engine.scene, Engine.camera)
  }
}

// This is a functional React component
const Page = () => {
  const [animationTimeScale, setAnimationTimeScale] = useState(1)
  const [animationIndex, setAnimationIndex] = useState(3)
  const [animationTime, setAnimationTime] = useState(0.6225028089213559)
  const [animationsList, setAnimationsList] = useState<AnimationClip[]>([])
  const worldRef = useRef<World>(null)
  const executeIKRef = useRef<(delta: number, elapsedTime: number) => void>(null)
  const sourceEntityRef = useRef<Entity>(null)
  const animationClipActionRef = useRef<AnimationAction>(null)
  const customModelEntityRef = useRef<Entity>(null)
  const customModelSkeletonHelperRef = useRef<SkeletonHelper>(null)

  console.log('RENDER', animationTimeScale, animationTime)

  useEffect(() => {
    if (animationClipActionRef.current) {
      console.log('useEffect animationTimeScale, set:', animationTimeScale)
      animationClipActionRef.current.setEffectiveTimeScale(animationTimeScale)
    }
  }, [animationTimeScale])

  useEffect(() => {
    if (animationClipActionRef.current) {
      animationClipActionRef.current.time = animationTime
    }
  }, [animationTime])

  useEffect(() => {
    if (sourceEntityRef.current) {
      console.log('switch animation to', animationIndex)

      const ac = getComponent(sourceEntityRef.current, AnimationComponent)
      const clipAction = ac.mixer.clipAction(ac.animations[animationIndex])
      console.log('new anim', ac.animations[animationIndex].name)
      console.log('new clip', clipAction)
      clipAction.setEffectiveTimeScale(animationTimeScale).play()

      animationClipActionRef.current.crossFadeTo(clipAction, 1, false)

      console.log('CLIP', clipAction)
      window['CLIP'] = clipAction

      animationClipActionRef.current = clipAction

      if (customModelEntityRef.current) {
        const ac = getComponent(customModelEntityRef.current, AnimationComponent)
        ac.mixer.stopAllAction()
        const newClipAction = ac.mixer.clipAction(ac.animations[animationIndex])
        newClipAction.setEffectiveTimeScale(animationTimeScale).play()
      }
    }
  }, [animationIndex])

  useEffect(() => {
    ;(async function () {
      await initializeEngine({ scene: { disabled: true } })
      // Register our systems to do stuff
      registerSystem(SystemUpdateType.UPDATE, Promise.resolve({ default: AnimationSystem }))
      registerSystem(SystemUpdateType.UPDATE, Promise.resolve({ default: SkeletonRigSystem }))
      registerSystem(SystemUpdateType.UPDATE, Promise.resolve({ default: RenderSystem }))
      await Engine.defaultWorld.initSystems()

      initExample()
        .then(({ sourceEntity, targetEntities }) => {
          const ac = getComponent(sourceEntity, AnimationComponent)
          setAnimationsList([...ac.animations])
          const clipAction = ac.mixer.clipAction(ac.animations[animationIndex])
          clipAction.time = animationTime
          clipAction.setEffectiveTimeScale(animationTimeScale).play()
          //ac.mixer.timeScale = animationTimeScale
          clipAction.play()
          console.log('CLIP', clipAction)
          window['CLIP'] = clipAction

          sourceEntityRef.current = sourceEntity
          animationClipActionRef.current = clipAction
        })
        .catch((e) => {
          console.error('Failed to init example', e)
        })

      document.body.style.overflow = 'hidden'

      Engine.engineTimer.start()
    })()
  }, [])

  function doAnimationStepTime(time: number) {
    setAnimationTime(animationClipActionRef.current.time + time)
    setAnimationTimeScale(0)
  }
  function doAnimationStepFrame() {
    const clip = animationClipActionRef.current.getClip()
    let nextAnimationTime = clip.tracks[0].times.find((currentValue) => {
      return currentValue > animationClipActionRef.current.time
    })
    if (typeof animationTime === 'undefined' || animationClipActionRef.current.time === nextAnimationTime) {
      nextAnimationTime = clip.tracks[0].times[0]
    }
    setAnimationTime(nextAnimationTime)
    setAnimationTimeScale(0)
  }

  function loadGLTFfromFile(input: HTMLInputElement) {
    if (!input.files) {
      return
    }
    const objectURL = window.URL.createObjectURL(input.files[0])

    if (customModelEntityRef.current) {
      // cleanup
      const obj = getComponent(customModelEntityRef.current, IKObj)
      console.log('obj', obj)
      obj.ref.parent.removeFromParent()
      removeEntity(customModelEntityRef.current)
      customModelSkeletonHelperRef.current.removeFromParent()

      customModelSkeletonHelperRef.current = null
      customModelEntityRef.current = null
    }

    const sourceSkeleton = getComponent(sourceEntityRef.current, IKObj).ref

    const justLoad = false
    if (justLoad) {
      LoadGLTF(objectURL)
        .then((gltf) => {
          const helper = new SkeletonHelper(gltf.scene)
          Engine.scene.add(helper)
          Engine.scene.add(gltf.scene)
        })
        .finally(() => {
          window.URL.revokeObjectURL(objectURL)
        })
    } else {
      const result = getBaseSkeletonGroup()

      loadAndSetupModel(
        objectURL,
        result.group,
        sourceEntityRef.current,
        new Vector3(0, 0, 0),
        new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI),
        new Vector3(1, 1, 1)
      )
        .then(({ entity, skeletonHelper }) => {
          const rig = getComponent(entity, IKRigComponent)
          rig.name = 'custom'
          // rig.tpose.apply()

          console.log('target rig', rig.name, rig)

          const ac = addComponent(entity, AnimationComponent, {
            mixer: new AnimationMixer(rig.pose.skeleton.bones[0].parent),
            animations: animationsList,
            animationSpeed: 1
          })
          // const ac = getComponent(entity, AnimationComponent)
          const clipAction = ac.mixer.clipAction(ac.animations[17])
          clipAction.setEffectiveTimeScale(animationTimeScale).play()
          clipAction.play()

          customModelEntityRef.current = entity
          customModelSkeletonHelperRef.current = skeletonHelper
        })
        .catch((error) => {
          alert('Failed to load avatar, check console for more info')
          console.error(error)
        })
        .finally(() => {
          window.URL.revokeObjectURL(objectURL)
        })
    }
  }

  const animationTimeScaleSelect = (
    <select value={animationTimeScale} onChange={(e) => setAnimationTimeScale(parseFloat(e.target.value))}>
      <option>0</option>
      <option>0.1</option>
      <option>0.2</option>
      <option>0.5</option>
      <option>1</option>
    </select>
  )

  const animationsOptions = animationsList.map((clip, index) => (
    <option value={index} key={clip.uuid}>
      {clip.name}
    </option>
  ))
  const animationsSelect = (
    <select value={animationIndex} onChange={(e) => setAnimationIndex(parseInt(e.target.value))}>
      {animationsOptions}
    </select>
  )

  const doAnimationStepButtons = (
    <span>
      <button onClick={() => doAnimationStepTime(0.1)}>Anim step 0.1 </button>
      <button onClick={() => doAnimationStepFrame()}>Anim step frame </button>
    </span>
  )

  // Some JSX to keep the compiler from complaining
  return (
    <div style={{ position: 'absolute' }}>
      anim:{animationsSelect}
      timescale:{animationTimeScaleSelect}
      {doAnimationStepButtons}
      <input type="file" onChange={(e) => loadGLTFfromFile(e.target)} />
      <Debug />
    </div>
  )
}

export default Page

function getBaseSkeletonGroup(): { group: Group; skinnedMesh: SkinnedMesh } {
  const bones = []
  bonesData2.forEach((data) => {
    const bone = new Bone()
    bone.name = data.name
    bone.position.fromArray(data.position)
    bone.quaternion.fromArray(data.quaternion)
    bone.scale.fromArray(data.scale)
    bones.push(bone)
  })

  bonesData2.forEach((data, index) => {
    if (data.parentIndex !== null) {
      bones[data.parentIndex].add(bones[index])
    }
  })

  const group = new Group()
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)
  group.add(skinnedMesh)
  group.add(bones[0]) // we assume that root bone is the first one

  return { group, skinnedMesh }
}

async function initExample(): Promise<{ sourceEntity: Entity; targetEntities: Entity[] }> {
  await initThree() // Set up the three.js scene with grid, light, etc

  // initDebug()

  ////////////////////////////////////////////////////////////////////////////
  // const ANIM_FILE = 'ikrig2/anim/Walking.gltf'
  // const MODEL_A_FILE = 'ikrig2/models/vegeta.gltf'
  // const ANIMATION_INDEX = 0

  /*
  ikrig/anim/Walking.glb animations
  0 - 'driving'
  1 - 'idle'
  2 - 'run_backward'
  3 - 'run_forward'
  4 - 'run_left'
  5 - 'run_right'
  6 - 'tpose'
  7 - 'vehicle_enter_driver'
  8 - 'vehicle_enter_passenger'
  9 - 'vehicle_exit_driver'
  10 - 'vehicle_exit_passenger'
  11 - 'walk_backward'
  12 - 'walk_forward'
  13 - 'walk_left'
  14 - 'walk_right'
   */
  // const ANIM_FILE = 'ikrig/anim/Walking.glb'
  /*
  0 - 'clapping'
  1 - 'cry'
  2 - 'dance1'
  3 - 'dance2'
  4 - 'dance3'
  5 - 'dance4'
  6 - 'defeat'
  7 - 'idle'
  8 - 'jump'
  9 - 'kiss'
  10 - 'laugh'
  11 - 'run_backward'
  12 - 'run_forward'
  13 - 'run_left'
  14 - 'run_right'
  15 - 'tpose'
  16 - 'walk_backward'
  17 - 'walk_forward'
  18 - 'walk_left'
  19 - 'walk_right'
  20 - 'wave'
   */
  const ANIM_FILE = '/models/avatars/Animations.glb'
  const RIG_FILE = 'ikrig/anim/Walking.glb'
  const MODEL_A_FILE = 'ikrig/models/vegeta.gltf'
  const MODEL_B_FILE = 'ikrig/anim/Walking.glb'
  const MODEL_C_FILE = 'ikrig/models/robo_trex.gltf'
  const MODEL_D_FILE = '/models/avatars/Allison.glb'
  const ANIMATION_INDEX = 3

  const targetEntities = []

  // LOAD SOURCE
  let animModel = await LoadGLTF(ANIM_FILE)
  console.log('Animations model is', animModel)
  console.log('Animations:')
  animModel.animations.forEach((a, i) => console.log(i, a.name))
  const hipsBone = animModel.scene.getObjectByName('Hips')
  const bones = []
  const mapBoneToIndex = new Map<any, number>()
  hipsBone.traverse((child) => {
    mapBoneToIndex.set(child, bones.length)
    bones.push({
      name: child.name,
      parentIndex: null,
      position: child.position.toArray(),
      quaternion: child.quaternion.toArray(),
      scale: child.scale.toArray()
    })
  })
  hipsBone.traverse((child) => {
    if (!mapBoneToIndex.has(child.parent)) {
      return
    }
    const index = mapBoneToIndex.get(child)
    const parentIndex = mapBoneToIndex.get(child.parent)
    bones[index].parentIndex = parentIndex
  })
  console.log('AM BONES', bones)

  let rigModel = await LoadGLTF(RIG_FILE)
  // Set up skinned meshes
  let skinnedMeshes = []
  rigModel.scene.position.set(0, 0, -1)
  rigModel.scene.traverse((node) => {
    if (node.children)
      node.children.forEach((n) => {
        if (n.type === 'SkinnedMesh') skinnedMeshes.push(n)
        // n.visible = false
      })
  })
  let skinnedMesh: SkinnedMesh = skinnedMeshes.sort((a, b) => {
    return a.skeleton.bones.length - b.skeleton.bones.length
  })[0]

  console.log('skinnedMesh', skinnedMesh)
  // if (true || !skinnedMesh) {
  //   console.log('create new mesh')
  //   // try to create skinnedmesh with skeleton from what we have
  //   const hipsBone = rigModel.scene.getObjectByName('Hips')
  //   skinnedMesh.removeFromParent()
  //
  //   console.log('hipBone', hipsBone)
  //   const bones = []
  //   const remove = []
  //   hipsBone.traverse((b) => {
  //     if (b.type === 'Bone') {
  //       bones.push(b)
  //     } else {
  //       let bone = new Bone()
  //       bone.position.copy(b.position)
  //       bone.quaternion.copy(b.quaternion)
  //       bone.scale.copy(b.scale)
  //       b.parent.add(bone)
  //
  //       bones.push(bone)
  //       remove.push(b)
  //     }
  //   })
  //   remove.forEach((b) => b.parent.remove(b))
  //   remove.length = 0
  //
  //   skinnedMesh = new SkinnedMesh()
  //   // model.scene.add(skinnedMesh)
  //   hipsBone.parent.add(skinnedMesh)
  //   const skeleton = new Skeleton(bones)
  //   skinnedMesh.bind(skeleton)
  // }

  {
    // create xrengine type of skeleton to use with xrengine animations
    const hipsBone = rigModel.scene.getObjectByName('Hips')
    hipsBone.removeFromParent()
    skinnedMesh.removeFromParent()

    const result = getBaseSkeletonGroup()
    skinnedMesh = result.skinnedMesh
    rigModel.scene.add(result.group)
  }

  Engine.scene.add(rigModel.scene)
  Engine.scene.add(new SkeletonHelper(rigModel.scene))

  // Set up entity
  const sourceEntity = createEntity()
  const ac = addComponent(sourceEntity, AnimationComponent, {
    mixer: new AnimationMixer(rigModel.scene),
    animations: animModel.animations,
    animationSpeed: 1
  })

  const rig = addRig(sourceEntity, skinnedMesh.parent, null, false, ArmatureType.MIXAMO)
  addComponent(sourceEntity, IKPoseComponent, defaultIKPoseComponentValues())

  console.log('source rig', rig)

  ////////////////////////////////////////////////////////////////////////////
  let loadModels = []

  // LOAD MESH A
  loadModels.push(
    loadAndSetupModel(
      MODEL_A_FILE,
      skinnedMesh.parent,
      sourceEntity,
      new Vector3(1, 0, -2),
      new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(-1, 0, 1).normalize()),
      new Vector3(0.5, 0.5, 0.5)
    ).then(({ entity }) => {
      const rig = getComponent(entity, IKRigComponent)
      rig.name = 'rigA-Vegeta'
      rig.tpose.apply()

      console.log('target rig', rig.name, rig)

      const ac = addComponent(entity, AnimationComponent, {
        mixer: new AnimationMixer(rig.pose.skeleton.bones[0].parent),
        animations: animModel.animations,
        animationSpeed: 1
      })
      // const ac = getComponent(entity, AnimationComponent)
      const clipAction = ac.mixer.clipAction(ac.animations[17])
      clipAction.setEffectiveTimeScale(1).play()
      clipAction.play()

      targetEntities.push(entity)
    })
  )
  loadModels.push(
    loadAndSetupModel(
      MODEL_B_FILE,
      skinnedMesh.parent,
      sourceEntity,
      new Vector3(-1, 0, -2),
      new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(1, 0, 1).normalize()),
      new Vector3(1, 1.2, 1)
    ).then(({ entity }) => {
      const rig = getComponent(entity, IKRigComponent)
      rig.name = 'rigB'
      rig.tpose.apply()

      console.log('target rig', rig.name, rig)

      targetEntities.push(entity)
    })
  )
  loadModels.push(
    loadAndSetupModel(
      MODEL_C_FILE,
      skinnedMesh.parent,
      sourceEntity,
      new Vector3(-2, 0, -2),
      new Quaternion(),
      new Vector3(1, 1, 1),
      ArmatureType.TREX
    ).then(({ entity }) => {
      const rig = getComponent(entity, IKRigComponent)
      rig.name = 'rigTRex'
      rig.tpose.apply()

      const ac = addComponent(entity, AnimationComponent, {
        mixer: new AnimationMixer(rig.pose.skeleton.bones[0].parent),
        animations: animModel.animations,
        animationSpeed: 1
      })
      // const ac = getComponent(entity, AnimationComponent)
      const clipAction = ac.mixer.clipAction(ac.animations[2])
      clipAction.setEffectiveTimeScale(1).play()
      clipAction.play()

      targetEntities.push(entity)
    })
  )

  await Promise.all(loadModels)

  ////////////////////////////////////////////////////////////////////////////

  return { sourceEntity, targetEntities }
}

async function loadAndSetupModel(
  filename,
  baseSourceMesh,
  sourceEntity,
  position,
  quaternion,
  scale,
  armatureType = ArmatureType.MIXAMO
): Promise<{ entity: Entity; skeletonHelper: SkeletonHelper }> {
  let targetModel = await LoadGLTF(filename)

  // Engine.scene.add(new SkeletonHelper(targetModel.scene));
  let targetSkinnedMeshes = []
  targetModel.scene.traverse((node) => {
    if (node.children) {
      node.children.forEach((n) => {
        if (n.type === 'SkinnedMesh') {
          targetSkinnedMeshes.push(n)
        }
      })
    }
  })
  let targetSkinnedMesh = targetSkinnedMeshes.sort((a, b) => {
    return a.skeleton.bones.length - b.skeleton.bones.length
  })[0]

  console.log('targetSkinnedMesh', targetSkinnedMesh)

  // Create entity
  let targetEntity = createEntity()
  // addComponent(targetEntity, IKObj, { ref: targetSkinnedMesh })
  // addComponent(targetEntity, IKRigComponent, {
  //   tpose: new Pose(targetSkinnedMesh, true), // If Passing a TPose, it must have its world space computed.
  //   pose: new Pose(targetSkinnedMesh, false),
  //   chains: null,
  //   points: null,
  //   sourcePose: getComponent(sourceEntity, IKPoseComponent)
  //   // sourceRig: null
  // })
  //
  // const targetRig = getComponent(targetEntity, IKRigComponent)
  //
  // // Set the skinned mesh reference
  // const targetObj = getComponent(targetEntity, IKObj)
  //

  //setupIKRig(targetEntity, targetRig)
  // TODO: we need to pass nearest common parent of bones and skinned mesh to addRig function
  const rootBone = targetSkinnedMesh.skeleton.bones.find((b) => b.parent.type !== 'Bone')

  const model = new Group()
  model.add(rootBone.parent)
  // const model = targetRig.pose.bones[0].bone.parent

  model.position.copy(position)
  model.quaternion.copy(quaternion)
  model.scale.copy(scale)
  Engine.scene.add(model)

  const targetRig = addTargetRig(targetEntity, rootBone.parent, null, false, armatureType)

  // Set the skinned mesh reference
  const targetObj = getComponent(targetEntity, IKObj)

  // for (let index = 0; index < targetObj.ref.skeleton.bones.length; index++) {
  //   const bone = targetObj.ref.skeleton.bones[index]
  //   targetRig.tpose.setBone(index, bone.quaternion, bone.position, bone.scale)
  // }

  const helper = new SkeletonHelper(targetRig.pose.bones[0].bone)
  Engine.scene.add(helper)

  // targetRig.tpose.align_leg(['LeftUpLeg', 'LeftLeg'])
  // targetRig.tpose.align_leg(['RightUpLeg', 'RightLeg'])
  // targetRig.tpose.align_arm_left(['LeftArm', 'LeftForeArm'])
  // targetRig.tpose.align_arm_right(['RightArm', 'RightForeArm'])
  // targetRig.tpose.align_foot('LeftFoot')
  // targetRig.tpose.align_foot('RightFoot')
  //targetRig.tpose.build()

  {
    // animated rig
    const rig = addRig(targetEntity, SkeletonUtils.clone(baseSourceMesh), null, false, ArmatureType.MIXAMO)
    addComponent(targetEntity, IKPoseComponent, defaultIKPoseComponentValues())
  }

  return { entity: targetEntity, skeletonHelper: helper }
}

async function initThree() {
  // Set up rendering and basic scene for demo
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas) // adds the canvas to the body element

  const w = window.innerWidth,
    h = window.innerHeight

  const ctx = canvas.getContext('webgl2') //, { alpha: false }
  // @ts-ignore
  Engine.renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true })

  Engine.renderer.setClearColor(0x3a3a3a, 1)
  Engine.renderer.setSize(w, h)

  Engine.scene = new Scene()
  Engine.scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444))

  Engine.camera = new PerspectiveCamera(45, w / h, 0.01, 1000)
  Engine.camera.position.set(2, 1, 5)
  Engine.camera.rotation.set(0, 0.3, 0)

  const controls = new OrbitControls(Engine.camera, canvas)
  controls.minDistance = 0.1
  controls.maxDistance = 10
  controls.target.set(0, 1.25, 0)
  controls.update()

  Engine.scene.add(Engine.camera)

  let light = new DirectionalLight(0xffffff, 1.0)
  light.position.set(4, 10, 1)
  Engine.scene.add(light)

  Engine.scene.add(new AmbientLight(0x404040))
}
