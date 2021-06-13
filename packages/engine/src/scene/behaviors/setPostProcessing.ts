import { Behavior } from '../../common/interfaces/Behavior';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export const setPostProcessing: Behavior = (entity, args: { options: any }) => {
  if (WebGLRendererSystem.instance !== undefined) {
    const { usePostProcessing } = args.options;
    if (usePostProcessing) {
      WebGLRendererSystem.instance.configurePostProcessing(args.options);
    }
  }
};