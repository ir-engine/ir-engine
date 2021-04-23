import { Behavior } from '../../common/interfaces/Behavior';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export const setPostProcessing: Behavior = (entity, args: {}) => {
    const options=args["objArgs"]["options"];
    if(WebGLRendererSystem.instance!==undefined){
        const usePostProcessing=(options!==undefined && Object.keys(options).length>0);
        if(usePostProcessing){
            WebGLRendererSystem.instance.configurePostProcessing(options);
            WebGLRendererSystem.usePostProcessing=usePostProcessing;
        }

    }

};