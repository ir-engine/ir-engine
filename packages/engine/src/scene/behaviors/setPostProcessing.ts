import { Behavior } from '../../common/interfaces/Behavior';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export const setPostProcessing: Behavior = (entity, args: { options: any }) => {
  WebGLRendererSystem.instance?.configurePostProcessing(args.options);
};