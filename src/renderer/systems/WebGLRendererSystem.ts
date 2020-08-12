import { DepthOfFieldEffect, Effect, EffectComposer, EffectPass, RenderPass, SSAOEffect } from "postprocessing"
import { CameraComponent } from "../../camera/components/CameraComponent"
import { SceneComponent } from "../../common/components/SceneComponent"
import { Behavior } from "../../common/interfaces/Behavior"
import { Attributes, Entity, System } from "../../ecs"
import { RendererComponent } from "../components/RendererComponent"
import { DefaultPostProcessingSchema } from "../defaults/DefaultPostProcessingSchema"
export class WebGLRendererSystem extends System {
  init(attributes?: Attributes): void {
    throw new Error("Method not implemented.")
  }
  onResize() {
    RendererComponent.instance.needsResize = true
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }

  isInitialized: boolean

  configurePostProcessing(entity: Entity) {
    const renderer = entity.getMutableComponent(RendererComponent)
    if (renderer.postProcessingSchema == undefined) renderer.postProcessingSchema = DefaultPostProcessingSchema
    const composer = new EffectComposer(renderer.renderer)
    renderer.composer = composer
    const renderPass = new RenderPass(SceneComponent.instance.scene, CameraComponent.instance.camera)
    console.log(renderPass.camera)
    console.log(renderPass.scene)
    renderPass.scene = SceneComponent.instance.scene
    renderPass.camera = CameraComponent.instance.camera
    composer.addPass(renderPass)
    composer.scene = SceneComponent.instance.scene
    composer.camera = CameraComponent.instance.camera
    // // This sets up the render
    const passes: any[] = []
    renderer.postProcessingSchema.effects.forEach((pass: any) => {
      if (typeof pass.effect === typeof SSAOEffect)
        passes.push(new (pass.effect as Effect)(CameraComponent.instance.camera, {}, pass.effect.options))
      else if (typeof pass.effect === typeof DepthOfFieldEffect)
        passes.push(new (pass.effect as Effect)(CameraComponent.instance.camera, pass.effect.options))
      else passes.push(new (pass.effect as Effect)(pass.effect.options))
    })
    composer.addPass(new EffectPass(CameraComponent.instance.camera, ...passes))
  }

  execute(delta: number) {
    this.queries.renderers.added.forEach((entity: Entity) => {
      RendererComponent.instance.needsResize = true
      this.onResize = this.onResize.bind(this)
      window.addEventListener("resize", this.onResize, false)
      this.configurePostProcessing(entity)
    })

    this.queries.renderers.results.forEach((entity: Entity) => {
      entity.getComponent<RendererComponent>(RendererComponent).composer.render(delta)
    })
  }
}

export const resize: Behavior = entity => {
  const rendererComponent = entity.getComponent<RendererComponent>(RendererComponent)

  if (rendererComponent.needsResize) {
    const canvas = rendererComponent.renderer.domElement
    const curPixelRatio = rendererComponent.renderer.getPixelRatio()

    if (curPixelRatio !== window.devicePixelRatio) rendererComponent.renderer.setPixelRatio(window.devicePixelRatio)

    const width = canvas.clientWidth
    const height = canvas.clientHeight

    CameraComponent.instance.camera.aspect = width / height
    CameraComponent.instance.camera.updateProjectionMatrix()

    rendererComponent.renderer.setSize(width, height)
    rendererComponent.renderer.needsResize = false
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
