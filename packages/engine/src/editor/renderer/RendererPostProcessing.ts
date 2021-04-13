import { NearestFilter, RGBFormat, WebGLRenderTarget } from "three";
import { BlendFunction } from "../../renderer/postprocessing/blending/BlendFunction";
import { EffectComposer } from "../../renderer/postprocessing/core/EffectComposer";
import { DepthOfFieldEffect } from "../../renderer/postprocessing/DepthOfFieldEffect";
import { OutlineEffect } from "../../renderer/postprocessing/OutlineEffect";
import { DepthDownsamplingPass } from "../../renderer/postprocessing/passes/DepthDownsamplingPass";
import { EffectPass } from "../../renderer/postprocessing/passes/EffectPass";
import { NormalPass } from "../../renderer/postprocessing/passes/NormalPass";
import { RenderPass } from "../../renderer/postprocessing/passes/RenderPass";
import { SSAOEffect } from "../../renderer/postprocessing/SSAOEffect";
import { TextureEffect } from "../../renderer/postprocessing/TextureEffect";
import PostProcessing from "../../scene/classes/PostProcessing";


/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

export default function configurePostProcessing(node: PostProcessing, scene, camera, renderer, isRemoved = false) {
    if (!node.visible || isRemoved)
        return null;
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const passes: any[] = [];
    const normalPass = new NormalPass(scene, camera, {
        renderTarget: new WebGLRenderTarget(1, 1, {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBFormat,
            stencilBuffer: false
        })
    });
    const depthDownsamplingPass = new DepthDownsamplingPass({
        normalBuffer: normalPass.texture,
        resolutionScale: 0.5
    });
    const normalDepthBuffer = depthDownsamplingPass.texture;
    let pass;
    Object.keys(node.postProcessingOptions).forEach((key: any) => {
        pass = node.postProcessingOptions[key];
        const effect = node.effectType[key].effect;

        if (pass.isActive)
            if (effect === SSAOEffect) {
                passes.push(new effect(camera, normalPass.texture, { ...pass, normalDepthBuffer }));
            }
            else if (effect === DepthOfFieldEffect)
                passes.push(new effect(camera, pass))
            else if (effect === OutlineEffect) {
                const eff = new effect(scene, camera, pass)
                passes.push(eff);
                composer.outlineEffect = eff;
            }
            else passes.push(new effect(pass))
    })
    const textureEffect = new TextureEffect({
        blendFunction: BlendFunction.SKIP,
        texture: depthDownsamplingPass.texture
    });
    if (passes.length) {
        composer.addPass(depthDownsamplingPass);
        composer.addPass(new EffectPass(camera, ...passes, textureEffect));
    }
    return composer;
}