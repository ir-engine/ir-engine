import { System, Entity } from "ecsy"
import { RendererComponent } from "../components/RendererComponent"
import { CameraComponent } from "../../camera/components/CameraComponent"
import { SceneComponent } from "../../common/components/SceneComponent"
import { EffectComposer, RenderPass, EffectPass, Effect, SSAOEffect, DepthOfFieldEffect } from "postprocessing"
import { DefaultPostProcessingSchema } from "../defaults/DefaultPostProcessingSchema"
import { Behavior } from "../../common/interfaces/Behavior"
export class WebGLRendererSystem extends System {
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
      entity.getComponent(RendererComponent).composer.render(delta)
    })
  }
}

export const resize: Behavior = entity => {
  const rendererComponent = entity.getComponent(RendererComponent)

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
