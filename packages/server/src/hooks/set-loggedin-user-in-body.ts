import { HookContext } from '@feathersjs/feathers';
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils';

// This will attach the owner ID in the contact while creating/updating list item
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const loggedInUser = extractLoggedInUserFromParams(context.params);
    if (Array.isArray(context.data)) {
      context.data = context.data.map((item: any) => {
        return {
          ...item,
          [propertyName]: loggedInUser.userId
        };
      });
    } else {
      context.data = {
        ...context.data,
        [propertyName]: loggedInUser.userId
      };
      context.params.body = {
        ...context.params.body,
        [propertyName]: loggedInUser.userId
      };
    }

    return context;
  };
};
