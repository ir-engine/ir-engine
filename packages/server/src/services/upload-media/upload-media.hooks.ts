import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';
import { v1 as uuidv1 } from 'uuid';
import config from '../../config';

import getBasicMimetype from '../../util/get-basic-mimetype';
import setResponseStatus from '../../hooks/set-response-status-code';
import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body';

import addUriToFile from '../../hooks/add-uri-to-file';
import reformatUploadResult from '../../hooks/reformat-upload-result';
import makeS3FilesPublic from '../../hooks/make-s3-files-public';

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const logRequest = (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data, params } = context;
    if(context.error){
      console.log("***** Error");
      console.log(context.error);
    }
    const body = params.body || {};
    console.log(body);
    return context;
  };
};

const createOwnedFile = (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data, params } = context;
    const body = params.body || {};

    const domain: string = config.aws.cloudfront.domain;
    let savedFile;
    if (body.projectId) { // Check if projectId is sent by the client and update thumbnail URL instead of creating new resource
      const { thumbnailOwnedFileId } = await context.app.service('collection').Model.findOne({
        where: {
          sid: body.projectId
        }
      });
      savedFile = await context.app.service('static-resource').patch(thumbnailOwnedFileId, {
        url: data.uri || data.url
      });
    } else {
        const resourceData = {
        id: body.fileId,
        name: data.name || body.name,
        url: data.uri || data.url,
        key: (data.uri || data.url)
          .replace(`https://${domain}/`, ''),

        content_type: data.mimeType || params.mimeType,
        userId: body.userId,
        metadata: data.metadata || body.metadata
      };

      /* if (context.params.skipResourceCreation === true) {
        context.result = await context.app.service('owned-file').patch(context.params.patchId, {
          url: resourceData.url,
          metadata: resourceData.metadata
        })
      } else { */
      if (context.params.parentResourceId) {
        (resourceData as any).parentResourceId = context.params.parentResourceId;
      }
      (resourceData as any).type = getBasicMimetype(resourceData.content_type);

      // Remap input from Editor to fit
      const modifiedResourceData = {
        ...resourceData,
        mimeType: resourceData.content_type
      };
      savedFile = await context.app.service('static-resource').create(modifiedResourceData);
    }
    context.result = {
      // This is to fulfill the editor response, as editor is expecting the below object
      file_id: savedFile.id,
      meta: {
        access_token: uuidv1(), // TODO: authenticate upload with bearer token
        expected_content_type: savedFile.mimeType,
        promotion_token: null
      },
      origin: savedFile.url
    };
    // }
    return context;
  };
};

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [disallow()],
    create: [authenticate('jwt'), attachOwnerIdInSavingContact('userId'), addUriToFile(), makeS3FilesPublic()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [reformatUploadResult(), createOwnedFile(), setResponseStatus(200)],
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
