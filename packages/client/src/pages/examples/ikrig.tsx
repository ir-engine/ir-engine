import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createPipeline, registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import { defaultIKPoseComponentValues, IKPose } from '@xrengine/engine/src/ikrig/components/IKPose'
import { IKRig, IKRigComponentType } from '@xrengine/engine/src/ikrig/components/IKRig'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import { IKRigSystem } from '@xrengine/engine/src/ikrig/systems/IKRigSystem'
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
  Scene,
  SkinnedMesh,
  SkeletonHelper,
  Vector2,
  Vector3,
  WebGLRenderer,
  Quaternion
} from 'three'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import Debug from '../../components/Debug'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld, World } from '@xrengine/engine/src/ecs/classes/World'
import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { initRig } from '@xrengine/engine/src/ikrig/functions/RigFunctions'
import { ArmatureType } from '@xrengine/engine/src/ikrig/enums/ArmatureType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

const AnimationSystem = async (): Promise<System> => {
  const animationQuery = defineQuery([AnimationComponent])
  return defineSystem((world: ECSWorld) => {
    const { delta } = world
    for (const entity of animationQuery(world)) {
      const ac = getComponent(entity, AnimationComponent)
      ac.mixer.update(delta)
    }
    return world
  })
}

const RenderSystem = async (): Promise<System> => {
  const currentSize = new Vector2()
  return defineSystem((world: ECSWorld) => {
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
    return world
  })
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

  console.log('RENDER', animationTimeScale, animationTime)

  useEffect(() => {
    if (worldRef.current) {
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
    ;(async function () {
      //initializeEngine()
      // Register our systems to do stuff
      registerSystem(SystemUpdateType.Fixed, AnimationSystem)
      registerSystem(SystemUpdateType.Network, IKRigSystem)
      registerSystem(SystemUpdateType.Free, RenderSystem)

      const fixedPipeline = await createPipeline(SystemUpdateType.Fixed)
      const freePipeline = await createPipeline(SystemUpdateType.Free)
      const networkPipeline = await createPipeline(SystemUpdateType.Network)

      const executePipeline = (world: World, pipeline) => {
        return (delta, elapsedTime) => {
          world.ecsWorld.delta = delta
          world.ecsWorld.time = elapsedTime
          pipeline(world.ecsWorld)
          world.ecsWorld._removedComponents.clear()
        }
      }

      const world = new World()
      worldRef.current = world
      // const world = World.defaultWorld

      const networkExecute = executePipeline(world, networkPipeline)
      window['execute'] = networkExecute
      executeIKRef.current = networkExecute

      Engine.engineTimer = Timer(
        {
          networkUpdate: networkExecute,
          fixedUpdate: executePipeline(world, fixedPipeline),
          update: executePipeline(world, freePipeline)
        },
        Engine.physicsFrameRate,
        Engine.networkFramerate
      )

      initExample(world)
        .then(({ sourceEntity, targetEntities }) => {
          const ac = getComponent(sourceEntity, AnimationComponent)
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

  const animationTimeScaleSelect = (
    <select value={animationTimeScale} onChange={(e) => setAnimationTimeScale(parseFloat(e.target.value))}>
      <option>0</option>
      <option>0.1</option>
      <option>0.2</option>
      <option>0.5</option>
      <option>1</option>
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
    <>
      {animationTimeScaleSelect}
      {doAnimationStepButtons}
      <Debug />
    </>
  )
}

export default Page

async function initExample(world): Promise<{ sourceEntity: Entity; targetEntities: Entity[] }> {
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
  const ANIM_FILE = 'ikrig/anim/Walking.glb'
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
  // const ANIM_FILE = '/models/avatars/Animations.glb'
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

  let rigModel = await LoadGLTF(RIG_FILE)
  // Set up skinned meshes
  let skinnedMeshes = []
  Engine.scene.add(rigModel.scene)
  Engine.scene.add(new SkeletonHelper(rigModel.scene))
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
  // if (!skinnedMesh) {
  //   // try to create skinnedmesh with skeleton from what we have
  //   const hipsBone = rigModel.scene.getObjectByName('Hips')
  //   console.log('hipBone', hipsBone)
  //   const bones = []
  //   hipsBone.traverse((b) => (b.type === 'Bone' ? bones.push(b) : null))
  //   console.log('bones', bones)
  //   skinnedMesh = new SkinnedMesh()
  //   // model.scene.add(skinnedMesh)
  //   hipsBone.parent.add(skinnedMesh)
  //   const skeleton = new Skeleton(bones)
  //   skinnedMesh.bind(skeleton)
  // }

  // Set up entity
  const sourceEntity = createEntity(world.ecsWorld)
  const ac = addComponent(sourceEntity, AnimationComponent, {
    mixer: new AnimationMixer(rigModel.scene),
    animations: animModel.animations,
    animationSpeed: 1
  })
  addComponent(sourceEntity, IKObj, { ref: skinnedMesh })
  addComponent(sourceEntity, IKPose, defaultIKPoseComponentValues())
  addComponent(sourceEntity, IKRig, {
    tpose: null,
    pose: null,
    chains: null,
    points: null,
    sourcePose: null,
    sourceRig: null
  })

  const rig = getComponent(sourceEntity, IKRig) as IKRigComponentType
  const sourcePose = getComponent(sourceEntity, IKPose)

  // TODO check types!
  // @ts-ignore
  rig.sourceRig = skinnedMesh
  rig.sourcePose = sourcePose

  initRig(sourceEntity, null, false, ArmatureType.MIXAMO)

  ////////////////////////////////////////////////////////////////////////////
  let loadModels = []

  // LOAD MESH A
  loadModels.push(
    loadAndSetupModel(
      MODEL_A_FILE,
      sourceEntity,
      new Vector3(1, 0, 0),
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(1, 1, 1).normalize()),
      new Vector3(0.5, 0.5, 0.5),
      ArmatureType.VEGETA
    ).then((entity) => {
      const rig = getComponent(entity, IKRig)
      rig.name = 'rigA-Vegeta'
      sourcePose.targetRigs.push(rig)
      rig.tpose.apply()

      targetEntities.push(entity)
    })
  )
  loadModels.push(
    loadAndSetupModel(
      MODEL_B_FILE,
      sourceEntity,
      new Vector3(-1, 0, 0),
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(-1, 1, 1).normalize()),
      new Vector3(2, 2, 2)
    ).then((entity) => {
      const rig = getComponent(entity, IKRig)
      rig.name = 'rigB'
      sourcePose.targetRigs.push(rig)
      rig.tpose.apply()

      targetEntities.push(entity)
    })
  )
  // loadModels.push(loadAndSetupModel(MODEL_C_FILE, sourceEntity, new Vector3(-2, 0, 0), ArmatureType.TREX).then((entity) => {
  //   const rig = getComponent(entity, IKRig)
  //   rig.name = 'rigTRex'
  //   sourcePose.targetRigs.push(rig)
  //   rig.tpose.apply()
  //
  //   targetEntities.push(entity)
  // }))

  // // TODO: Fix me
  // targetRig.points.head.index = targetRig.points.neck.index // Lil hack cause Head Isn't Skinned Well.

  await Promise.all(loadModels)

  ////////////////////////////////////////////////////////////////////////////

  return { sourceEntity, targetEntities }
}

async function loadAndSetupModel(
  filename,
  sourceEntity,
  position,
  quaternion,
  scale,
  armatureType = ArmatureType.MIXAMO
): Promise<Entity> {
  let targetModel = await LoadGLTF(filename)
  targetModel.scene.position.copy(position)
  targetModel.scene.quaternion.copy(quaternion)
  targetModel.scene.scale.copy(scale)
  Engine.scene.add(targetModel.scene)
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
  addComponent(targetEntity, IKObj, { ref: targetSkinnedMesh })
  addComponent(targetEntity, IKRig, {
    tpose: null,
    pose: null,
    chains: null,
    points: null,
    sourcePose: null,
    sourceRig: null
  })

  const targetRig = getComponent(targetEntity, IKRig)

  targetRig.sourceRig = targetRig
  targetRig.sourcePose = getComponent(sourceEntity, IKPose)

  // Set the skinned mesh reference
  const targetObj = getComponent(targetEntity, IKObj)

  targetRig.pose = new Pose(targetEntity, false)
  targetRig.tpose = new Pose(targetEntity, true) // If Passing a TPose, it must have its world space computed.

  const rootQuaternion = new Quaternion()
  const rootPosition = new Vector3()
  const rootScale = new Vector3()

  targetObj.ref.parent.getWorldQuaternion(rootQuaternion)
  targetObj.ref.parent.getWorldPosition(rootPosition)
  targetObj.ref.parent.getWorldScale(rootScale)

  targetRig.pose.setOffset(rootQuaternion, rootPosition, rootScale)
  targetRig.tpose.setOffset(rootQuaternion, rootPosition, rootScale)
  console.log('---setOffset', rootQuaternion, rootPosition, rootScale)

  //setupIKRig(targetEntity, targetRig)
  initRig(targetEntity, null, false, armatureType)

  for (let index = 0; index < targetObj.ref.skeleton.bones.length; index++) {
    const bone = targetObj.ref.skeleton.bones[index]
    targetRig.tpose.setBone(index, bone.quaternion, bone.position, bone.scale)
  }

  const helper = new SkeletonHelper(targetRig.pose.bones[0].bone)
  Engine.scene.add(helper)

  // TODO: remove it when fixed
  targetRig.points.head.index = targetRig.points.neck.index // Lil hack cause Head Isn't Skinned Well.

  // targetRig.tpose.align_leg(['LeftUpLeg', 'LeftLeg'])
  // targetRig.tpose.align_leg(['RightUpLeg', 'RightLeg'])
  // targetRig.tpose.align_arm_left(['LeftArm', 'LeftForeArm'])
  // targetRig.tpose.align_arm_right(['RightArm', 'RightForeArm'])
  // targetRig.tpose.align_foot('LeftFoot')
  // targetRig.tpose.align_foot('RightFoot')
  //targetRig.tpose.build()

  return targetEntity
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
