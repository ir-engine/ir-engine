import { System, Entity } from "ecsy"
import { RendererComponent } from "../components/RendererComponent"
import { CameraComponent } from "../../camera/components/CameraComponent"
import { SceneComponent } from "../../common/components/SceneComponent"
import { EffectComposer, RenderPass, EffectPass } from "postprocessing"
import { DefaultPostProcessingSchema } from "../defaults/DefaultPostProcessingSchema"
export class RendererSystem extends System {
  onResize() {
    RendererComponent.instance.needsResize = true
  }

  init() {
    RendererComponent.instance.needsResize = true
    this.onResize = this.onResize.bind(this)
    window.addEventListener("resize", this.onResize, false)
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }

  configurePostProcessing(entity: Entity) {
    const renderer = entity.getMutableComponent(RendererComponent)
    const composer = new EffectComposer(renderer.renderer)
    renderer.composer = composer
    // This sets up the render
    composer.addPass(new RenderPass(SceneComponent.instance.scene, CameraComponent.instance.camera))
    if (renderer.postProcessingSchema == undefined) renderer.postProcessingSchema = DefaultPostProcessingSchema
    renderer.postProcessingSchema.passes.forEach(pass => {
      composer.addPass(new EffectPass(CameraComponent.instance.camera, new pass.effect(pass.effect.options)))
    })
  }

  execute(delta: number) {
    this.queries.renderers.added.forEach((entity: Entity) => this.configurePostProcessing(entity))

    this.queries.renderers.results.forEach((entity: Entity) => {
      const rendererComponent = entity.getComponent(RendererComponent)

      if (rendererComponent.needsResize) {
        const canvas = rendererComponent.renderer.domElement
        const curPixelRatio = rendererComponent.renderer.getPixelRatio()

        if (curPixelRatio !== window.devicePixelRatio) rendererComponent.renderer.setPixelRatio(window.devicePixelRatio)

        const width = canvas.clientWidth
        const height = canvas.clientHeight

        CameraComponent.instance.camera.aspect = width / height
        CameraComponent.instance.camera.updateProjectionMatrix()

        rendererComponent.renderer.setSize(width, height, false)
        rendererComponent.renderer.needsResize = false
      }
      rendererComponent.composer.render(delta)
    })
  }
}

RendererSystem.queries = {
  renderers: {
    components: [RendererComponent],
    listen: {
      added: true
    }
  }
}
