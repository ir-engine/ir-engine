import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { Component } from '@xrengine/engine/src/ecs/classes/Component'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { execute } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { addComponent, createEntity, getMutableComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import { IKPose } from '@xrengine/engine/src/ikrig/components/IKPose'
import IKRig from '@xrengine/engine/src/ikrig/components/IKRig'
import Obj from '@xrengine/engine/src/ikrig/components/Obj'
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
import Debug from '../../../components/Debug'

class AnimationComponent extends Component<AnimationComponent> {
  mixer: AnimationMixer = null
  animations: AnimationClip[] = []
}
class AnimationSystem extends System {
  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    for (const entity of this.queryResults.animation.all) {
      let ac = getMutableComponent(entity, AnimationComponent)
      ac.mixer.update(delta)
    }
  }
}

AnimationSystem.queries = {
  animation: {
    components: [AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

class RenderSystem extends System {
  updateType = SystemUpdateType.Fixed

  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    Engine.renderer.render(Engine.scene, Engine.camera)
  }
}

// This is a functional React component
const Page = () => {
  useEffect(() => {
    ;(async function () {
      // Register our systems to do stuff
      registerSystem(AnimationSystem)
      registerSystem(IKRigSystem)
      registerSystem(RenderSystem)
      await Promise.all(Engine.systems.map((system) => system.initialize()))

      Engine.engineTimer = Timer(
        {
          networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
          fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
          update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
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
      addComponent(sourceEntity, AnimationComponent)
      addComponent(sourceEntity, Obj)
      addComponent(sourceEntity, IKPose)
      addComponent(sourceEntity, IKRig)

      const rig = getMutableComponent(sourceEntity, IKRig)
      const sourcePose = getMutableComponent(sourceEntity, IKPose)

      rig.sourceRig = rig
      rig.sourcePose = getMutableComponent(sourceEntity, IKPose)

      // Set up the Object3D
      let obj = getMutableComponent(sourceEntity, Obj)
      obj.setReference(skinnedMesh)

      // Set up animations
      let ac = getMutableComponent(sourceEntity, AnimationComponent)
      const mixer = new AnimationMixer(obj.ref)
      const clips = model.animations
      ac.mixer = mixer
      ac.animations = clips
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
      let objRoot = getMutableComponent(sourceEntity, Obj).ref // Obj is a ThreeJS Component
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
      addComponent(targetEntity, Obj)
      addComponent(targetEntity, IKRig)

      let targetRig = getMutableComponent(targetEntity, IKRig)

      targetRig.sourceRig = targetRig
      targetRig.sourcePose = getMutableComponent(sourceEntity, IKPose)

      // Set the skinned mesh reference
      let targetObj = getMutableComponent(targetEntity, Obj)
      targetObj.setReference(targetSkinnedMesh)

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
