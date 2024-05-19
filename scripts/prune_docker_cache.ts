/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/* eslint-disable @typescript-eslint/no-var-requires */

import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import cli from 'cli'
import { buffer } from 'node:stream/consumers'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'

cli.enable('status')

const options = cli.parse({
  bucket: [true, 'Name of Bucket', 'string'],
  releaseName: [true, 'Name of release', 'string']
})

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    const s3 = storageProvider.provider
    const listCommand = new ListObjectsV2Command({
      Bucket: options.bucket,
      Prefix: 'blobs/',
      Delimiter: '/'
    })
    const result = await s3.send(listCommand)
    const manifestCommand = new GetObjectCommand({
      Bucket: options.bucket,
      Key: `manifests/latest_${options.releaseName}`
    })
    const manifestResult = await s3.send(manifestCommand)
    const bufferBody = await buffer(manifestResult.Body)
    const manifest = JSON.parse(bufferBody.toString())
    const layers = manifest.layers
    const matches = layers.map((layer) => layer.blob)
    const layersToRemove = result.Contents.filter((item) => matches.indexOf(item.Key.replace('blobs/', '')) < 0).map(
      (item) => {
        return { Key: item.Key }
      }
    )
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: options.bucket,
      Delete: {
        Objects: layersToRemove
      }
    })
    await s3.send(deleteCommand)
    console.log('Pruned Docker build cache', options)
    process.exit(0)
  } catch (err) {
    console.log('Error in pruning Docker build cache', options)
    console.log(err)
  }
})
