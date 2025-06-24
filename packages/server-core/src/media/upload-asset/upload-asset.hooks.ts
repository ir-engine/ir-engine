/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { disallow } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest } from '@feathersjs/errors'
import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { HookContext } from '../../../declarations'
import { isValidFileType } from '../FileUtil'

/**
 * Track upload asset metrics and tracing
 */
const trackUploadAsset = async (context: HookContext) => {
  if (!context.result) return context

  const metricsService = context.app.get('metricsService')
  const createFileUploadSpan = context.app.get('createFileUploadSpan')

  if (!metricsService && !createFileUploadSpan) return context

  try {
    const files = context.arguments?.[1]?.files || []
    const data = context.arguments?.[0] || {}
    const uploadType = data.type || 'unknown'
    const project = data.args?.project

    for (const file of files) {
      if (!file) continue

      const fileName = file.originalname || 'unknown'
      const mimeType = file.mimetype || 'application/octet-stream'
      const sizeBytes = file.size || file.buffer?.length || 0
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() || '' : ''

      // Calculate upload duration (approximate)
      const uploadDuration = context.params?.uploadStartTime ? (Date.now() - context.params.uploadStartTime) / 1000 : 0

      // Track with Prometheus metrics
      if (metricsService) {
        metricsService.trackFileUpload(
          uploadType,
          mimeType,
          fileExtension,
          sizeBytes,
          uploadDuration,
          project,
          'success'
        )
      }

      // Track with OpenTelemetry (detailed logging)
      if (createFileUploadSpan) {
        await createFileUploadSpan(fileName, uploadType, mimeType, sizeBytes, project, async (span: any) => {
          // Add additional attributes to the span
          span.setAttributes({
            'upload.type': uploadType,
            'upload.duration_seconds': uploadDuration,
            'user.id': context.params?.user?.id || 'unknown',
            'upload.service': 'upload-asset'
          })

          // Log the upload event
          span.addEvent('upload_asset_completed', {
            'file.name': fileName,
            'file.size_bytes': sizeBytes,
            'upload.status': 'success'
          })

          return file
        })
      }
    }
  } catch (error) {
    console.error('Error tracking upload asset metrics:', error)
  }

  return context
}

/**
 * Capture upload start time for duration calculation
 */
const captureUploadStartTime = async (context: HookContext) => {
  context.params.uploadStartTime = Date.now()
  return context
}

// Don't remove this comment. It's needed to format import lines nicely.
const validateFiles = (context: HookContext) => {
  const args = context.arguments
  const files = args?.[1]?.files
  files.forEach((file) => {
    if (!isValidFileType(file.mimetype, file.originalname)) {
      throw new BadRequest('Unsupported file type')
    }
  })
}

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [captureUploadStartTime, setLoggedInUser('userId'), validateFiles],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      },
      trackUploadAsset
    ],
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
} as any
