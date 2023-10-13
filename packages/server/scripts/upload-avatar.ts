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
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import dotenv from 'dotenv'
import fs from 'fs'
import knex from 'knex'
import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: process.cwd() + '/../../.env.local' })

// match case of the name of the avatar and the name of corresponding file.
// also update seed file of static resource model to match changes.
const AVATAR_LIST = [
  // 'Allison',
  // 'Rose',
  // 'Andy',
  // 'Erik',
  // 'Geoff',
  // 'Jace',
  // 'Karthik'
  'Razer1',
  'Razer2',
  'Razer3',
  'Razer4',
  'Razer5',
  'Razer6'
]

const MODEL_PATH = process.cwd() + '/../client/public/models/avatars/'
const THUMBNAIL_PATH = process.cwd() + '/../client/public/static/'
const BUCKET = process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET
const AVATAR_FOLDER = process.env.STORAGE_S3_AVATAR_DIRECTORY

const knexClient = knex({
  client: 'mysql',
  connection: {
    user: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE ?? 'etherealengine',
    charset: 'utf8mb4'
  }
})

const saveToDB = async (name: string, extension: string) => {
  try {
    await knexClient.from(staticResourcePath).insert({
      id: uuidv4(),
      sid: nanoid(8),
      name,
      url: 'https://s3.amazonaws.com/' + BUCKET + '/' + AVATAR_FOLDER + '/' + name + extension,
      key: AVATAR_FOLDER + '/' + name + extension,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  } catch (err) {
    console.error(err)
  }
}

const avatarModelExtension = '.glb' as string
// Support for pngg and jpg modify as needed
const avatarThumbnailExtension = ('.png' as string) || ('.jpg' as string)
const onlyDBUpdate = process.argv.includes('--db-only')

const forceS3Upload = process.argv.includes('--force-s3-upload')

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET!
  },
  region: process.env.STORAGE_S3_REGION
})

const uploadToS3 = async (Key: string, fileType: string, file: Buffer) => {
  // Input could be the thumbnail or the model
  fileType = 'avatarModel' || 'avatarThumbnail'
  // Set forceUpload as boolean, its true on enabled and on error NotFound
  let force = forceS3Upload ? true : false
  // Check for existing file in db
  try {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: fileType === 'avatarModel' ? `${Key}/avatarModel` : `${Key}/avatarThumbnail`
    })
    const data = await s3.send(headObjectCommand)
    if (data) {
      return { message: `${Key} is already uploaded =>`, response: data }
    }
  } catch (err) {
    console.error('File not uploaded or check failed =>', err)
    // File not found in db or error in process but we set force to true
    err && err.code === 'NotFound' ? (force = true) : false
  }
  if (force) {
    // Upload file when present or to overwrite
    try {
      const putObjectCommand = new PutObjectCommand({
        Body: file,
        Bucket: BUCKET,
        Key: `${Key}/${fileType}`,
        ACL: 'public-read'
      })
      const s3UploadResponse = await s3.send(putObjectCommand)
      console.log(`${fileType} uploaded successfully`, s3UploadResponse)
    } catch (err) {
      console.error(`Error uploading ${fileType}:`, err)
    }
  }
}

const processFile = async (fileName: string, extension: string, dirPath: string) => {
  if (!onlyDBUpdate) {
    if (extension === avatarModelExtension) {
      const avatarModelLocation = dirPath + fileName + extension
      try {
        const avatarModel = await fs.promises.readFile(avatarModelLocation)
        // Implement into const for other uses
        await uploadToS3(AVATAR_FOLDER + '/' + fileName + extension, 'avatarModel', avatarModel)
      } catch (err) {
        console.error(err)
      }
    } else if (avatarThumbnailExtension) {
      const avatarThumbnailLocation = dirPath + fileName + extension
      try {
        const avatarThumbnail = await fs.promises.readFile(avatarThumbnailLocation)
        // Implement into const for other uses
        await uploadToS3(AVATAR_FOLDER + '/' + fileName + extension, 'avatarThumbnail', avatarThumbnail)
      } catch (err) {
        console.error(err)
      }
    }
  }
  await saveToDB(fileName, extension)
}

new Promise(async (resolve, reject) => {
  try {
    console.log('Removing old DB entries.')
    await knexClient
      .from(staticResourcePath)
      .where({
        userId: null
      })
      .del()
    for (const avatar of AVATAR_LIST) {
      console.log('Uploading Avatar Model =>', avatar)
      await processFile(avatar, avatarModelExtension, MODEL_PATH)
      console.log('Uploading Avatar Thumbnail =>', avatar)
      await processFile(avatar, avatarThumbnailExtension, THUMBNAIL_PATH)
    }
    resolve(true)
  } catch (err) {
    reject(err)
  }
})
  .then(() => {
    console.log('Uploading Completed.')
  })
  .catch((err) => {
    console.log('Error Occured => ', err)
  })
