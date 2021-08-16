import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createPipeline, registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import { IKPose } from '@xrengine/engine/src/ikrig/components/IKPose'
import { IKRig } from '@xrengine/engine/src/ikrig/components/IKRig'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import { initDebug, setupIKRig } from '@xrengine/engine/src/ikrig/functions/IKFunctions'
import { IKRigSystem } from '@xrengine/engine/src/ikrig/systems/IKRigSystem'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React, { useEffect } from 'react'
import {
  AmbientLight,
  AnimationClip,
  AnimationMixer,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  SkeletonHelper,
  WebGLRenderer
} from 'three'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import Debug from '../../../components/Debug'
import { defineQuery, defineSystem, System } from '../../../../../engine/src/ecs/bitecs'
import { ECSWorld, World } from '../../../../../engine/src/ecs/classes/World'
import { Timer } from '../../../../../engine/src/common/functions/Timer'
import { setReference } from '../../../../../engine/src/ikrig/functions/RigFunctions'

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

// This is a functional React component
const Page = () => {
  useEffect(() => {
    ;(async function () {
      initializeEngine()
      // Register our systems to do stuff
      registerSystem(SystemUpdateType.Fixed, AnimationSystem)
      registerSystem(SystemUpdateType.Fixed, IKRigSystem)
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

      const world = World.defaultWorld

      // TODO: support multiple worlds
      // TODO: wrap timer in the world or the world in the timer, abstract all this away into a function call

      Engine.engineTimer = Timer(
        {
          networkUpdate: executePipeline(world, networkPipeline),
          fixedUpdate: executePipeline(world, fixedPipeline),
          update: executePipeline(world, freePipeline)
        },
        Engine.physicsFrameRate,
        Engine.networkFramerate
      )

      await initThree() // Set up the three.js scene with grid, light, etc

      initDebug()

      ////////////////////////////////////////////////////////////////////////////

      // LOAD SOURCE
      let model = await LoadGLTF('ikrig/anim/Walking.glb')
      console.log('Model is', model)
      // Set up skinned meshes
      let skinnedMeshes = []
      Engine.scene.add(model.scene)
      Engine.scene.add(new SkeletonHelper(model.scene))
      model.scene.traverse((node) => {
        if (node.children)
          node.children.forEach((n) => {
            if (n.type === 'SkinnedMesh') skinnedMeshes.push(n)
            n.visible = false
          })
      })
      let skinnedMesh = skinnedMeshes.sort((a, b) => {
        return a.skeleton.bones.length - b.skeleton.bones.length
      })[0]

      // Set up entity
      let sourceEntity = createEntity()
      const ac = addComponent(sourceEntity, AnimationComponent, {
        mixer: new AnimationMixer(model.scene),
        animations: model.animations,
        animationSpeed: 1
      })
      addComponent(sourceEntity, IKObj, { ref: model.scene })
      addComponent(sourceEntity, IKPose, { ref: null })
      addComponent(sourceEntity, IKRig, { sourceRig: skinnedMesh })

      const rig = getComponent(sourceEntity, IKRig)
      const sourcePose = getComponent(sourceEntity, IKPose)

      rig.sourceRig = skinnedMesh
      rig.sourcePose = getComponent(sourceEntity, IKPose)

      setReference(sourceEntity, skinnedMesh)
      ac.mixer.clipAction(clips[3]).play()

      // Set up poses
      rig.pose = new Pose(sourceEntity, false)
      rig.tpose = new Pose(sourceEntity, true) // If Passing a TPose, it must have its world space computed.

      //-----------------------------------------
      // Apply Node's Starting Transform as an offset for poses.
      // This is only important when computing World Space Transforms when
      // dealing with specific skeletons, like Mixamo stuff.
      // Need to do this to render things correctly
      // TODO: Verify the numbers of this vs the original
      let objRoot = getComponent(sourceEntity, IKObj).ref // Obj is a ThreeJS Component
      rig.pose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)
      rig.tpose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)

      setupIKRig(rig)
      rig.tpose.apply()

      ////////////////////////////////////////////////////////////////////////////

      // LOAD MESH A
      let targetModel = await LoadGLTF('ikrig/models/vegeta.glb')
      targetModel.scene.position.set(0, 0, 0)
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

      // Create entity
      let targetEntity = createEntity()
      addComponent(targetEntity, IKObj, {})
      addComponent(targetEntity, IKRig, {})

      let targetRig = getComponent(targetEntity, IKRig)

      targetRig.sourceRig = targetRig
      targetRig.sourcePose = getComponent(sourceEntity, IKPose)

      // Set the skinned mesh reference
      let targetObj = getComponent(targetEntity, IKObj)
      setReference(targetEntity, targetSkinnedMesh)

      targetRig.pose = new Pose(targetEntity, false)
      targetRig.tpose = new Pose(targetEntity, true) // If Passing a TPose, it must have its world space computed.
      targetRig.pose.setOffset(targetObj.ref.quaternion, targetObj.ref.position, targetObj.ref.scale)
      targetRig.tpose.setOffset(targetObj.ref.quaternion, targetObj.ref.position, targetObj.ref.scale)
      setupIKRig(targetRig)

      for (let index = 0; index < targetObj.ref.skeleton.bones.length; index++) {
        let bone = targetObj.ref.skeleton.bones[index]
        targetRig.tpose.setBone(index, bone.quaternion, bone.position, bone.scale)
      }

      const helper = new SkeletonHelper(targetRig.pose.bones[0])
      Engine.scene.add(helper)

      // targetRig.tpose.align_leg( ["LeftUpLeg", "LeftLeg"] )
      // targetRig.tpose.align_leg( ["RightUpLeg", "RightLeg"] )
      // targetRig.tpose.align_arm_left( ["LeftArm", "LeftForeArm"] )
      // targetRig.tpose.align_arm_right( ["RightArm", "RightForeArm"] )
      // targetRig.tpose.align_foot( "LeftFoot" )
      // targetRig.tpose.align_foot( "RightFoot" )
      // targetRig.tpose.build();

      sourcePose.targetRigs.push(targetRig)

      targetRig.tpose.apply()

      // // TODO: Fix me
      targetRig.points.head.index = targetRig.points.neck.index // Lil hack cause Head Isn't Skinned Well.

      ////////////////////////////////////////////////////////////////////////////

      Engine.engineTimer.start()
    })()
  }, [])
  // Some JSX to keep the compiler from complaining
  return <Debug />
}

export default Page

async function initThree() {
  // Set up rendering and basic scene for demo
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas) // adds the canvas to the body element

  let w = window.innerWidth,
    h = window.innerHeight

  let ctx = canvas.getContext('webgl2') //, { alpha: false }
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
