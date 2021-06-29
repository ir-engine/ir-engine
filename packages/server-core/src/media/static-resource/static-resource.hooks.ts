import { HookContext } from '@feathersjs/feathers';
import { hooks } from '@feathersjs/authentication';
import dauria from 'dauria';
import removeRelatedResources from '@xrengine/server-core/src/hooks/remove-related-resources';
import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics';
import addAssociations from '@xrengine/server-core/src/hooks/add-associations';
import replaceThumbnailLink from '@xrengine/server-core/src/hooks/replace-thumbnail-link';

const { authenticate } = hooks;

export default {
  before: {
    all: [],
    find: [
      collectAnalytics(),
    ],
    get: [],
    create: [
      authenticate('jwt'),
      (context: HookContext): HookContext => {
        if (!context.data.uri && context.params.file) {
          const file = context.params.file;
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
          console.log("uri is", uri);
          const url = dauria.getBase64DataURI(file.buffer, file.mimetype);
          const mimeType = context.data.mimeType ?? file.mimetype;
          console.log("mimeType is", file.mimetype);
          const name = context.data.name ?? file.name;
          context.data = { uri: uri, mimeType: mimeType, name: name };
        }
        return context;
      }
    ],
    update: [
      authenticate('jwt')
    ],
    patch: [
      authenticate('jwt'),
      replaceThumbnailLink()
    ],
    remove: [
      authenticate('jwt'),
      removeRelatedResources()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
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
