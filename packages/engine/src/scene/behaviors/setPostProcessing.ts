import { Behavior } from '../../common/interfaces/Behavior';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export const setPostProcessing: Behavior = (entity, args: { options: any }) => {
  const options = args.options;
  if (WebGLRendererSystem.instance !== undefined) {
    const usePostProcessing = (options !== undefined && Object.keys(options).length > 0);
    if (usePostProcessing) {
      WebGLRendererSystem.instance.configurePostProcessing(options);
    }
  }
};