import { EffectComposer } from "../../postprocessing/core/EffectComposer"
import { RenderPass } from "../../postprocessing/passes/RenderPass"
import { Effect } from "../../postprocessing/effects/Effect"
import { EffectPass } from "../../postprocessing/passes/EffectPass"
import { SSAOEffect } from "../../postprocessing/effects/SSAOEffect"
import { DepthOfFieldEffect } from "../../postprocessing/effects/DepthOfFieldEffect"

import { WebGLRenderer } from "three"
import { CameraComponent } from "../../camera/components/CameraComponent"
import { SceneManager } from "../../common/classes/SceneManager"
import { Behavior } from "../../common/interfaces/Behavior"
import { RendererComponent } from "../components/RendererComponent"
import { DefaultPostProcessingSchema } from "../defaults/DefaultPostProcessingSchema"
import { System, Attributes } from "../../ecs/classes/System"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"
import { addComponent, createEntity, getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions"
import { Entity } from "../../ecs/classes/Entity"
import { Engine } from "../../ecs"
export class WebGLRendererSystem extends System {
  constructor(attributes?: Attributes){
    super(attributes)
        // Create the Three.js WebGL renderer


  }
  init(attributes?: Attributes): void {
    console.log("init called!!")
    registerComponent(RendererComponent)
    // Create the Renderer singleton
    addComponent(createEntity(), RendererComponent)
    const renderer = new WebGLRenderer({
      antialias: true
    })
    Engine.renderer = renderer
    // Add the renderer to the body of the HTML document
    document.body.appendChild(Engine.renderer.domElement)
  }
  onResize() {
    RendererComponent.instance.needsResize = true
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }

  isInitialized: boolean

  configurePostProcessing(entity: Entity) {
    const rendererComponent = getMutableComponent<RendererComponent>(entity, RendererComponent)
    if (rendererComponent.postProcessingSchema == undefined) rendererComponent.postProcessingSchema = DefaultPostProcessingSchema
    const composer = new EffectComposer(Engine.renderer)
    rendererComponent.composer = composer
    const renderPass = new RenderPass(SceneManager.instance.scene, CameraComponent.instance.camera)
    renderPass.scene = SceneManager.instance.scene
    renderPass.camera = CameraComponent.instance.camera
    composer.addPass(renderPass)
    // // This sets up the render
    // const passes: any[] = []
    // renderer.postProcessingSchema.effects.forEach((pass: any) => {
    //   if (typeof pass.effect === typeof SSAOEffect)
    //     passes.push(new (pass.effect as Effect)(CameraComponent.instance.camera, {}, pass.effect.options))
    //   else if (typeof pass.effect === typeof DepthOfFieldEffect)
    //     passes.push(new (pass.effect as Effect)(CameraComponent.instance.camera, pass.effect.options))
    //   else passes.push(new (pass.effect as Effect)(pass.effect.options))
    // })
    // composer.addPass(new EffectPass(CameraComponent.instance.camera, ...passes))
  }

  execute(delta: number) {
    this.queryResults.renderers.added.forEach((entity: Entity) => {
      RendererComponent.instance.needsResize = true
      this.onResize = this.onResize.bind(this)
      window.addEventListener("resize", this.onResize, false)
      this.configurePostProcessing(entity)
    })

    this.queryResults.renderers.all.forEach((entity: Entity) => {
      getComponent<RendererComponent>(entity, RendererComponent).composer.render(delta)
    })
  }
}

export const resize: Behavior = entity => {
  const rendererComponent = getComponent<RendererComponent>(entity, RendererComponent)

  if (rendererComponent.needsResize) {
    const canvas = Engine.renderer.domElement
    const curPixelRatio = Engine.renderer.getPixelRatio()

    if (curPixelRatio !== window.devicePixelRatio) Engine.renderer.setPixelRatio(window.devicePixelRatio)

    const width = canvas.clientWidth
    const height = canvas.clientHeight

    CameraComponent.instance.camera.aspect = width / height
    CameraComponent.instance.camera.updateProjectionMatrix()

    Engine.renderer.setSize(width, height)
    RendererComponent.instance.needsResize = false
  }
}

WebGLRendererSystem.queries = {
  renderers: {
    components: [RendererComponent],
    listen: {
      added: true
    }
  }
}
