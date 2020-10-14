import { HookContext } from '@feathersjs/feathers';
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils';

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result } = context;
    const loggedInUser = extractLoggedInUserFromParams(context.params);
    const user = await context.app.service('user').get(loggedInUser.userId);
    await context.app.service('party-user').create({
      partyId: result.id,
      isOwner: result.locationId == null ? true : user.location_admins.find(locationAdmin => locationAdmin.locationId === result.locationId) != null,
      userId: loggedInUser.userId
    }, context.params);
    await context.app.service('user').patch(loggedInUser.userId, {
      partyId: result.id
    });
    const owner = await context.app.service('user').get(loggedInUser.userId);
    if (owner.instanceId != null) {
      await context.app.service('party').patch(result.id, { instanceId: owner.instanceId }, context.params);
    }
    return context;
  };
};
