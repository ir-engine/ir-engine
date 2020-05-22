import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'
import { v1 as uuidv1 } from 'uuid'
import config from 'config'

import getBasicMimetype from '../../util/get-basic-mimetype'
import setResponseStatus from '../../hooks/set-response-status-code'
import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body'

import addUriToFile from '../../hooks/add-uri-to-file'
import reformatUploadResult from '../../hooks/reformat-upload-result'
import makeS3FilesPublic from '../../hooks/make-s3-files-public'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const createOwnedFile = (options = {}) => {
  return async (context: HookContext) => {
    const { data, params } = context
    const body = params.body || {}

    const resourceData = {
      owned_file_id: body.fileId,
      name: data.name || body.name,
      url: data.uri || data.url,
      key: (data.uri || data.url).replace(`${(config.get('aws.s3.baseUrl') as string)}/${(config.get('aws.s3.static_resource_bucket') as string)}/`, ''),
      content_type: data.mime_type || params.mime_type,
      metadata: data.metadata || body.metadata,
      state: 'active',
      account_id: '1dfdd93f3a7e748870ae36b0f3ea6f84',
      content_length: params.file.size
    }

    /* if (context.params.skipResourceCreation === true) {
      context.result = await context.app.service('owned-file').patch(context.params.patchId, {
        url: resourceData.url,
        metadata: resourceData.metadata
      })
    } else { */
    if (context.params.parentResourceId) {
      (resourceData as any).parentResourceId = context.params.parentResourceId
    }
    (resourceData as any).type = getBasicMimetype(resourceData.content_type)
    const savedFile = await context.app.service('owned-file').create(resourceData)
    context.result = {
      // This is to fulfill the spoke response, as spoke is expecting the below object
      file_id: savedFile.owned_file_id,
      meta: {
        access_token: uuidv1(),
        expected_content_type: savedFile.content_type,
        promotion_token: null
      },
      origin: savedFile.url
    }
    // }
    return context
  }
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [/* authenticate('jwt') ,attachOwnerIdInSavingContact('account_id'), */addUriToFile(), makeS3FilesPublic()],
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
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
