import { Hook, HookContext } from '@feathersjs/feathers';
import { v1 } from 'uuid';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    context.params.uuid = context.params.uuid ? context.params.uuid : v1();
    return context;
  };
};
