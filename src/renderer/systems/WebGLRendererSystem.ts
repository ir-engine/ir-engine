import { DepthOfFieldEffect, Effect, EffectComposer, EffectPass, RenderPass, SSAOEffect } from "postprocessing"
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
export class WebGLRendererSystem extends System {
  init(attributes?: Attributes): void {
    registerComponent(RendererComponent)
    // Create the Three.js WebGL renderer
    const renderer = new WebGLRenderer({
      antialias: true
    })
    // Add the renderer to the body of the HTML document
    document.body.appendChild(renderer.domElement)
    // Create the Renderer singleton
    addComponent(createEntity(), RendererComponent, {
      renderer: renderer
    })
  }
  onResize() {
    RendererComponent.instance.needsResize = true
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }

  isInitialized: boolean

  configurePostProcessing(entity: Entity) {
    const renderer = getMutableComponent<RendererComponent>(entity, RendererComponent)
    if (renderer.postProcessingSchema == undefined) renderer.postProcessingSchema = DefaultPostProcessingSchema
    const composer = new EffectComposer(renderer.renderer)
    renderer.composer = composer
    const renderPass = new RenderPass(SceneManager.instance.scene, CameraComponent.instance.camera)
    console.log(renderPass.camera)
    console.log(renderPass.scene)
    renderPass.scene = SceneManager.instance.scene
    renderPass.camera = CameraComponent.instance.camera
    composer.addPass(renderPass)
    composer.scene = SceneManager.instance.scene
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
    this.queryResults.renderers.added.forEach((entity: Entity) => {
      RendererComponent.instance.needsResize = true
      this.onResize = this.onResize.bind(this)
      window.addEventListener("resize", this.onResize, false)
      this.configurePostProcessing(entity)
    })

    this.queryResults.renderers.results.forEach((entity: Entity) => {
      getComponent<RendererComponent>(entity, RendererComponent).composer.render(delta)
    })
  }
}

export const resize: Behavior = entity => {
  const rendererComponent = getComponent<RendererComponent>(entity, RendererComponent)

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

WebGLRendererSystem.systemQueries = {
  renderers: {
    components: [RendererComponent],
    listen: {
      added: true
    }
  }
}
