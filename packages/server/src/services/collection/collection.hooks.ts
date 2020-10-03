// import * as authentication from '@feathersjs/authentication'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query';
import addAssociations from '../../hooks/add-associations';
import collectAnalytics from '../../hooks/collect-analytics';
import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';

function processCollectionEntities (collection: any): any {
  const entitesObject: { [key: string]: {} } = {};
  const collectionJson = collection.toJSON();
  let rootEntity: any = null;
  collectionJson.entities.forEach((entity: any) => {
    if (entity.parent === null) {
      delete entity.parent;
      delete entity.index;
      rootEntity = entity;
    }
    entitesObject[entity.entityId] = entity;
  });
  collectionJson.root = rootEntity?.entityId;
  collectionJson.entities = entitesObject;
  return collectionJson;
}

/* function processCollectionsEntities () {
  return (context: HookContext): HookContext => {
    context.result = context.result.map(processCollectionEntities)
    return context
  }
} */

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [collectAnalytics(), authenticate('jwt')], /* authenticate('jwt') */
    find: [
      attachOwnerIdInQuery('userId'),
      addAssociations({
        models: [
          {
            model: 'entity',
            include: [
              {
                model: 'component'
              }
            ]
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'entity',
            include: [
              {
                model: 'component'
              }
            ]
          }
        ]
      })
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      // processCollectionsEntities()
    ],
    get: [
      (context: HookContext): HookContext => {
        context.result = processCollectionEntities(context.result);
        return context;
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
