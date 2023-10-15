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
import { avatarUploadData } from '@etherealengine/server-core/src/user/avatar/avatar-helper'
import dotenv from 'dotenv'
import knex from 'knex'
import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'

// Directing to variables but change as needed
dotenv.config({ path: process.cwd() + '/../../../.env.local' })
const avatarPath = process.cwd() + '/../projects/default-project/assets/avatars/'

// Set up sql
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

// Set up s3
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET!
  },
  region: process.env.STORAGE_S3_REGION
})

const BUCKET = process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET

// Upload to s3
const uploadToS3 = async (
  model: Buffer,
  thumbnail: Buffer,
  name: string,
  extension: string,
  dependencies?: string[]
) => {
  /* Add arg if wanna differentiate on upload
  isPublic: boolean add as arg 
  ACL: isPublic ? 'public-read' : 'private' 
  then substitute with this for conditional ACL*/

  // If truthy update avatars
  const forceS3Upload = process.argv.includes('--force-s3-upload')
  // When avatar not on db
  let notFound = true || false

  // Check for existing file in db
  try {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: name
    })
    const headResponse = await s3.send(headObjectCommand)
    if (headResponse) {
      console.log(`${name} is already uploaded =>`, headResponse)
    }
  } catch (err) {
    console.error('File not uploaded or check failed =>', err)
    if (err && err.code === 'NotFound') {
      // File not uploaded so we upload
      notFound = true
    }
  }
  // Upload avatar when not present or to overwrite
  if (forceS3Upload || notFound) {
    // Check buffer to see if theres any thumbnail to upload, it could be empty buffer
    if (thumbnail.length > 0) {
      try {
        const putObjectCommand = new PutObjectCommand({
          Body: thumbnail,
          Bucket: BUCKET,
          Key: `${name}/thumbnail`,
          ACL: 'public-read'
        })
        const thumbnailResponse = await s3.send(putObjectCommand)
        console.log(`${name}/thumbnail uploaded successfully`, thumbnailResponse)
      } catch (err) {
        console.error(`Error uploading ${name}/thumbnail:`, err)
      }
    }
    // Upload model, dependencies are uploaded in model's metadata, alternatively they
    // could be updated separately if dependencies bigger than <2KB>
    try {
      const putObjectCommand = new PutObjectCommand({
        Body: model,
        Bucket: BUCKET,
        Key: `${name}/model`,
        ACL: 'public-read',
        // Dependencies could also be null so we upload conditionally
        Metadata: dependencies
          ? {
              dependencies: JSON.stringify(dependencies)
            }
          : {}
      })
      const modelResponse = await s3.send(putObjectCommand)
      console.log(`${name}/model uploaded successfully`, modelResponse)
    } catch (err) {
      console.error(`Error uploading ${name}/model:`, err)
    }
    /* Upload dependencies separately
    // Check if they exist
    if (dependencies) {
      try {
        const putObjectCommand = new PutObjectCommand({
          Body: JSON.stringify(dependencies),
          Bucket: BUCKET,
          Key: `${name}/dependencies`,
          ACL: 'public-read'
        })
        const dependenciesResponse = await s3.send(putObjectCommand)
        console.log(`${name}/dependencies uploaded successfully`, dependenciesResponse)
      } catch (err) {
        console.error(`Failed to upload ${name}/dependencies`, err)
      }
    } */
  }
}

// Save references of links to models uploaded on s3 to sql db
const saveToDB = async (name: string, extension: string) => {
  const AVATAR_FOLDER = process.env.STORAGE_S3_AVATAR_DIRECTORY!
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

// Set references in sql and upload to s3
const processFiles = async (
  model: Buffer,
  thumbnail: Buffer,
  name: string,
  extension: string,
  dependencies?: string[]
) => {
  const onlyDBUpdate = process.argv.includes('--db-only')
  try {
    if (!onlyDBUpdate) {
      await uploadToS3(model, thumbnail, name, extension, dependencies)
      await saveToDB(name, extension)
    }
  } catch (err) {
    console.error(err)
  }
}

// Avatars retrieved with imported function from avatar-helper to ensure data uniformity
const avatarData = async () => {
  try {
    // Removal of old db entries where id is null (possibly unused)
    await knexClient
      .from(staticResourcePath)
      .where({
        userId: null
      })
      .del()
    // Get array
    const avatarsFiles = await avatarUploadData(avatarPath)
    await Promise.all(
      avatarsFiles.map(async (avatarFile) => {
        try {
          const model = avatarFile.avatar
          const thumbnail = avatarFile.thumbnail
          const name = avatarFile.avatarName
          const extension = avatarFile.avatarFileType
          const dependencies = avatarFile.dependencies
          // Upload each avatarFile
          await processFiles(model, thumbnail, name, extension, dependencies)
        } catch (err) {
          console.error(`Failed to process ${avatarFile.avatarName} =>`, err)
        }
      })
    )
  } catch (err) {
    console.error(err)
  }
}
