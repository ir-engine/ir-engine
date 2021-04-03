import addUUID from '@xr3ngine/server-core/src/hooks/add-uuid';
import addUploadPath from '@xr3ngine/server-core/src/hooks/add-upload-path';
import * as authentication from '@feathersjs/authentication';

import addUriToFile from '@xr3ngine/server-core/src/hooks/add-uri-to-file';
import reformatUploadResult from '@xr3ngine/server-core/src/hooks/reformat-upload-result';
import makeS3FilesPublic from '@xr3ngine/server-core/src/hooks/make-s3-files-public';
import uploadThumbnail from '@xr3ngine/server-core/src/hooks/upload-thumbnail';
import setLoggedInUser from '@xr3ngine/server-core/src/hooks/set-loggedin-user-in-body';
import createResource from '@xr3ngine/server-core/src/hooks/create-static-resource';
import * as commonHooks from 'feathers-hooks-common';

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [],
    find: [commonHooks.disallow()],
    get: [],
    create: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        authenticate('jwt'),
        setLoggedInUser('userId')
      ), addUUID(), addUploadPath(), addUriToFile(), makeS3FilesPublic()],
    update: [commonHooks.disallow()],
    patch: [commonHooks.disallow()],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [reformatUploadResult(), createResource(), uploadThumbnail()],
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
