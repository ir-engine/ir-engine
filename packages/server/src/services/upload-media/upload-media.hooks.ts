import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';

import addThumbnailFileId from '../../hooks/add-thumbnail-file-id';
import addUriToFile from '../../hooks/add-uri-to-file';
import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body';
import createOwnedFile from '../../hooks/create-owned-file';
import logRequest from '../../hooks/log-request';
import makeS3FilesPublic from '../../hooks/make-s3-files-public';
import reformatUploadResult from '../../hooks/reformat-upload-result';
import removePreviousThumbnail from '../../hooks/remove-previous-thumbnail';
import setResponseStatus from '../../hooks/set-response-status-code';

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [authenticate('jwt'), attachOwnerIdInSavingContact('userId'), addUriToFile(), makeS3FilesPublic()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [reformatUploadResult(), addThumbnailFileId(), removePreviousThumbnail(), createOwnedFile(), setResponseStatus(200)],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
