import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createPipeline, registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import { defaultIKPoseComponentValues, IKPose } from '@xrengine/engine/src/ikrig/components/IKPose'
import { IKRig } from '@xrengine/engine/src/ikrig/components/IKRig'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import { IKRigSystem } from '@xrengine/engine/src/ikrig/systems/IKRigSystem'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React, { useEffect } from 'react'
import {
  AmbientLight,
  AnimationMixer,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  Vector3,
  WebGLRenderer
} from 'three'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import Debug from '../../components/Debug'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld, World } from '@xrengine/engine/src/ecs/classes/World'
import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { initRig, setReference } from '@xrengine/engine/src/ikrig/functions/RigFunctions'
import { ArmatureType } from '@xrengine/engine/src/ikrig/enums/ArmatureType'

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
  return defineSystem((world: ECSWorld) => {
    Engine.renderer.render(Engine.scene, Engine.camera)
    return world
  })
}

const STEP_BY_STEP_MODE = false

// This is a functional React component
const Page = () => {
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
      // const world = World.defaultWorld

      // TODO: support multiple worlds
      // TODO: wrap timer in the world or the world in the timer, abstract all this away into a function call

      const networkExecute = executePipeline(world, networkPipeline)
      window['execute'] = networkExecute

      Engine.engineTimer = Timer(
        {
          networkUpdate: STEP_BY_STEP_MODE ? () => {} : networkExecute,
          fixedUpdate: executePipeline(world, fixedPipeline),
          update: executePipeline(world, freePipeline)
        },
        Engine.physicsFrameRate,
        Engine.networkFramerate
      )

      initExample(world).catch((e) => {
        console.error('Failed to init example', e)
      })

      Engine.engineTimer.start()
    })()
  }, [])
  // Some JSX to keep the compiler from complaining
  return <Debug />
}

export default Page

async function initExample(world) {
  await initThree() // Set up the three.js scene with grid, light, etc

  // initDebug()

  ////////////////////////////////////////////////////////////////////////////
  // const ANIM_FILE = 'ikrig2/anim/Walking.gltf'
  // const MODEL_A_FILE = 'ikrig2/models/vegeta.gltf'
  // const ANIMATION_INDEX = 0

  const ANIM_FILE = 'ikrig/anim/Walking.glb'
  const MODEL_A_FILE = 'ikrig/models/vegeta.glb'
  const MODEL_B_FILE = 'ikrig/anim/Walking.glb'
  const MODEL_C_FILE = 'ikrig/models/robo_trex.gltf'
  const ANIMATION_INDEX = 12

  // LOAD SOURCE
  let model = await LoadGLTF(ANIM_FILE)
  console.log('Animations model is', model)
  console.log('Animations:')
  model.animations.forEach((a, i) => console.log(i, a.name))
  // Set up skinned meshes
  let skinnedMeshes = []
  Engine.scene.add(model.scene)
  Engine.scene.add(new SkeletonHelper(model.scene))
  model.scene.traverse((node) => {
    if (node.children)
      node.children.forEach((n) => {
        if (n.type === 'SkinnedMesh') skinnedMeshes.push(n)
        // n.visible = false
      })
  })
  let skinnedMesh = skinnedMeshes.sort((a, b) => {
    return a.skeleton.bones.length - b.skeleton.bones.length
  })[0]
  console.log('skinnedMesh', skinnedMesh)
  if (!skinnedMesh) {
    // try to create skinnedmesh with skeleton from what we have
    const hipsBone = model.scene.getObjectByName('Hips')
    console.log('hipBone', hipsBone)
    const bones = []
    hipsBone.traverse((b) => (b.type === 'Bone' ? bones.push(b) : null))
    console.log('bones', bones)
    skinnedMesh = new SkinnedMesh()
    // model.scene.add(skinnedMesh)
    hipsBone.parent.add(skinnedMesh)
    const skeleton = new Skeleton(bones)
    skinnedMesh.bind(skeleton)
  }

  // Set up entity
  let sourceEntity = createEntity(world.ecsWorld)
  const ac = addComponent(sourceEntity, AnimationComponent, {
    mixer: new AnimationMixer(model.scene),
    animations: model.animations,
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

  const rig = getComponent(sourceEntity, IKRig)
  const sourcePose = getComponent(sourceEntity, IKPose)

  rig.sourceRig = skinnedMesh
  rig.sourcePose = sourcePose

  ac.mixer
    .clipAction(model.animations[ANIMATION_INDEX])
    .setEffectiveTimeScale(STEP_BY_STEP_MODE ? 0 : 0.2)
    .play()
  console.log('CLIP', ac.mixer.clipAction(model.animations[ANIMATION_INDEX]))
  window['CLIP'] = ac.mixer.clipAction(model.animations[ANIMATION_INDEX])

  initRig(sourceEntity, null, false, ArmatureType.MIXAMO)

  ////////////////////////////////////////////////////////////////////////////

  // LOAD MESH A
  loadAndSetupModel(MODEL_A_FILE, sourceEntity, new Vector3(1, 0, 0), ArmatureType.VEGETA).then((rig) => {
    sourcePose.targetRigs.push(rig)
    rig.tpose.apply()
  })
  loadAndSetupModel(MODEL_B_FILE, sourceEntity, new Vector3(-1, 0, 0)).then((rig) => {
    sourcePose.targetRigs.push(rig)
    rig.tpose.apply()
  })
  loadAndSetupModel(MODEL_C_FILE, sourceEntity, new Vector3(-2, 0, 0), ArmatureType.TREX).then((rig) => {
    sourcePose.targetRigs.push(rig)
    rig.tpose.apply()
  })

  // // TODO: Fix me
  // targetRig.points.head.index = targetRig.points.neck.index // Lil hack cause Head Isn't Skinned Well.

  ////////////////////////////////////////////////////////////////////////////
}

async function loadAndSetupModel(filename, sourceEntity, position, armatureType = ArmatureType.MIXAMO) {
  let targetModel = await LoadGLTF(filename)
  targetModel.scene.position.copy(position)
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
  targetRig.pose.setOffset(targetObj.ref.quaternion, targetObj.ref.position, targetObj.ref.scale)
  targetRig.tpose.setOffset(targetObj.ref.quaternion, targetObj.ref.position, targetObj.ref.scale)
  //setupIKRig(targetEntity, targetRig)
  initRig(targetEntity, null, false, armatureType)

  for (let index = 0; index < targetObj.ref.skeleton.bones.length; index++) {
    const bone = targetObj.ref.skeleton.bones[index]
    targetRig.tpose.setBone(index, bone.quaternion, bone.position, bone.scale)
  }

  const helper = new SkeletonHelper(targetRig.pose.bones[0].bone)
  Engine.scene.add(helper)

  // targetRig.tpose.align_leg(['LeftUpLeg', 'LeftLeg'])
  // targetRig.tpose.align_leg(['RightUpLeg', 'RightLeg'])
  // targetRig.tpose.align_arm_left(['LeftArm', 'LeftForeArm'])
  // targetRig.tpose.align_arm_right(['RightArm', 'RightForeArm'])
  // targetRig.tpose.align_foot('LeftFoot')
  // targetRig.tpose.align_foot('RightFoot')
  //targetRig.tpose.build()

  return targetRig
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
