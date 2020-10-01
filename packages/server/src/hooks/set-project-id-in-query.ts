import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return (context: HookContext): HookContext => {
    context.params.query = {
      ...context.params.query,
      projectId: context?.params?.route?.projectId
    };

    return context;
  };
};
