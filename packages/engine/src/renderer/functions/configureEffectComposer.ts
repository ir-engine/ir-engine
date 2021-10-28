import { BlendFunction, EffectComposer, EffectPass, RenderPass, TextureEffect } from 'postprocessing'
import { Engine } from "../../ecs/classes/Engine"
import { getAllComponentsOfType } from "../../ecs/functions/ComponentFunctions"
import { EffectMap } from "../../scene/classes/PostProcessing"
import { PostProcessingComponent } from "../../scene/components/PostProcessingComponent"

export const configureEffectComposer = (): void => {
  const { scene, camera } = Engine

  if (!Engine.effectComposer) Engine.effectComposer = new EffectComposer(Engine.renderer)
  else Engine.effectComposer.removeAllPasses()

  const renderPass = new RenderPass(scene, camera)
  Engine.effectComposer.addPass(renderPass)

  const components = getAllComponentsOfType(PostProcessingComponent)
  if (!Array.isArray(components) || components.length <= 0) return

  const effects: any[] = []
  const postProcessingComponent = components[0]
  const effectKeys = EffectMap.keys()

  for (let key of effectKeys) {
    const pass = postProcessingComponent[key]

    if (pass && pass.active) {
      effects.push(pass.effect)
    }
  }

  if (effects.length) {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: postProcessingComponent.depthDownsamplingPass.texture
    })

    Engine.effectComposer.addPass(postProcessingComponent.depthDownsamplingPass)
    Engine.effectComposer.addPass(new EffectPass(Engine.camera, ...effects, textureEffect))
  }
}