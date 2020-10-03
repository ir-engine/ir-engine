import { HookContext } from '@feathersjs/feathers';
import { hooks } from '@feathersjs/authentication';
import dauria from 'dauria';
import removeRelatedResources from '../../hooks/remove-related-resources';
import collectAnalytics from '../../hooks/collect-analytics';
import addAssociations from '../../hooks/add-associations';
import replaceThumbnailLink from '../../hooks/replace-thumbnail-link';

const { authenticate } = hooks;

export default {
  before: {
    all: [],
    find: [
      collectAnalytics(),
      addAssociations({
        models: [
          {
            model: 'attribution',
            as: 'attribution'
          }
        ]
      })
    ],
    get: [],
    create: [
      authenticate('jwt'),
      (context: HookContext): HookContext => {
        if (!context.data.uri && context.params.file) {
          const file = context.params.file;
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
          const mimeType = context.data.mimeType ?? file.mimetype;
          const name = context.data.name ?? file.name;
          context.data = { uri: uri, mimeType: mimeType, name: name };
        }
        return context;
      }
    ],
    update: [authenticate('jwt')],
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
