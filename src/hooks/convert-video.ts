/* eslint-disable @typescript-eslint/restrict-plus-operands */
import util from 'util'
import { exec } from 'child_process'
import * as path from 'path'
// @ts-ignore
import config from 'config'
// @ts-ignore
import youtubedl from 'youtube-dl'
import AWS from 'aws-sdk'
// @ts-ignore
import S3BlobStore from 's3-blob-store'
import { Application } from '../declarations'
import StorageProvider from '../storage/storageprovider'
import createStaticResource from '../hooks/create-static-resource'

import fs from 'fs'
import _ from 'lodash'
// @ts-ignore
import appRootPath from 'app-root-path'

const promiseExec = util.promisify(exec)

const sourceRegexes = [
  /youtu.be\/([a-zA-Z0-9_-]+)($|&)/,
  /youtube.com\/watch\?v=([a-zA-Z0-9_-]+)($|&)/,
  /vimeo.com\/([a-zA-Z0-9_-]+)($|&)/
]
const extensionRegex = /.([a-z0-9]+)$/
const mimetypeDict = {
  mpd: 'application/dash+xml',
  m4s: 'video/iso.segment',
  m3u8: 'application/x-mpegURL'
}
const dashManifestName = 'manifest.mpd'
const createStaticResourceHook = createStaticResource()

const s3 = new AWS.S3({
  accessKeyId: config.get('aws.keys.access_key_id') ?? '',
  secretAccessKey: config.get('aws.keys.secret_access_key') ?? ''
})

const s3BlobStore = new S3BlobStore({
  client: s3,
  bucket: config.get('aws.s3.static_resource_bucket') || 'default',
  acl: 'public-read'
})

export default async (context: any): Promise<void> => {
  const { result, app } = context

  if (Array.isArray(result)) {
    return
  }

  const url = result.url
  let fileId = ''

  for (const re of sourceRegexes) {
    const match = url.match(re)

    if (match != null) {
      fileId = match[1]
      if (/youtube.com/.test(url) || /youtu.be/.test(url)) {
        context.params.videoSource = 'youtube'
        context.data.metadata['360_format'] = 'eac'
      } else if (/vimeo.com/.test(url)) {
        context.params.videoSource = 'vimeo'
        context.data.metadata['360_format'] = 'equirectangular'
      }
    }
  }

  if (fileId.length > 0) {
    const s3Key = path.join('public', context.params.videoSource, fileId, 'video', dashManifestName)
    s3BlobStore.exists({
      key: (s3Key)
    }, async (err: any, exists: any) => {
      if (err) {
        console.log('s3 error')
        console.log(err)
        throw err
      }

      if (exists !== true) {
        try {
          const localFilePath = path.join(appRootPath.path, 'temp_videos', fileId)
          const rawVideoPath = path.join(localFilePath, fileId) + '_raw.mp4'
          const outputdir = path.join(localFilePath, 'output')
          const dashManifestPath = path.join(outputdir, dashManifestName)
          await fs.promises.rmdir(localFilePath, { recursive: true })
          await fs.promises.mkdir(localFilePath, { recursive: true })
          await fs.promises.mkdir(path.join(localFilePath, 'output'), { recursive: true })

          await new Promise((resolve, reject) => {
            console.log('Starting to download ' + url)
            youtubedl.exec(url,
              ['--format=bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]', '--output=' + fileId + '_raw.mp4'],
              { cwd: localFilePath },
              (err: any, output: any) => {
                if (err) {
                  console.log(err)
                  reject(err)
                }
                resolve()
              })
          })

          console.log('Finished downloading video ' + fileId + ', running through ffmpeg')

          try {
            // -hls_playlist 1 generates HLS playlist files as well. The master playlist is generated with the filename master.m3u8
            await promiseExec('ffmpeg -i ' + rawVideoPath + ' -f dash -hls_playlist 1 -c:v libx264 -map 0:v:0 -map 0:a:0 -b:v:0 7000k -profile:v:0 main -use_timeline 1 -use_template 1 ' + dashManifestPath)
          } catch (err) {
            console.log('ffmpeg error')
            console.log(err)
            await fs.promises.rmdir(localFilePath, { recursive: true })
            throw err
          }

          console.log('Finished ffmpeg on ' + fileId + ', uploading!')

          try {
            await uploadFile(outputdir, fileId, context, app, result.id)
          } catch (err) {
            console.log('Error in totality of file upload')
            console.log(err)
            throw err
          }

          console.log('Uploaded all files for ' + fileId + ', deleting local copies')

          await fs.promises.rmdir(localFilePath, { recursive: true })

          return
        } catch (err) {
          console.log('Transcoding process error')
          console.log(err)

          throw err
        }
      } else {
        console.log('File already existed, just making DB entries and updating URL')
        const s3Path = path.join('public', context.params.videoSource, fileId, 'video')
        const bucketObjects = await new Promise((resolve, reject) => {
          s3.listObjects({
            Bucket: s3BlobStore.bucket,
            Prefix: s3Path,
            Marker: ''
          }, (err, data) => {
            if (err) {
              console.log('S3 error')
              console.log(err)
              reject(err)
            }

            resolve(data.Contents)
          })
        })

        const creationPromises = (bucketObjects as any).map(async (object: any) => {
          const key = object.Key
          const localContext = _.cloneDeep(context)

          // @ts-ignore
          const extension = (key.match(extensionRegex) != null ? key.match(extensionRegex)[1] : 'application') as string
          // @ts-ignore
          const mimetype = mimetypeDict[extension]

          localContext.data.url = s3.endpoint.href + path.join(s3BlobStore.bucket, key)
          localContext.data.mime_type = mimetype

          localContext.params.mime_type = mimetype
          localContext.params.uploadPath = s3Path

          if (extension === 'mpd') {
            localContext.params.skipResourceCreation = true
            localContext.params.patchId = result.id
            localContext.params.parentResourceId = null
            localContext.data.description = context.arguments[0].description
          } else {
            localContext.params.skipResourceCreation = false
            localContext.params.patchId = null
            localContext.params.parentResourceId = result.id
            localContext.data.description = 'DASH chunk for ' + context.params.videoSource + ' video ' + fileId
            localContext.data.name = key.replace(s3Path + '/', '')
          }

          return await createStaticResourceHook(localContext)
        })

        await Promise.all(creationPromises)

        console.log('All static-resources created')
      }
    })
  } else {
    console.log('Regex for ' + url + ' did not match anything known')
  }
}

async function uploadFile (localFilePath: string, fileId: string, context: any, app: Application, resultId: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    const promises = []
    try {
      const files = await fs.promises.readdir(localFilePath)

      for (const file of files) {
        if (/.m/.test(file)) {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
          promises.push(new Promise(async function (resolve, reject) {
            const content = await fs.promises.readFile(localFilePath + '/' + file)
            const localContext = _.cloneDeep(context)
            // @ts-ignore
            const extension = (file.match(extensionRegex) != null ? file.match(extensionRegex)[1] : 'application')
            // @ts-ignore
            const mimetype = mimetypeDict[extension]

            localContext.params.file = {
              fieldname: 'file',
              originalname: file,
              encoding: '7bit',
              buffer: content,
              mimetype: mimetype,
              size: content.length
            }

            localContext.params.body = {
              name: file,
              metadata: localContext.data.metadata,
              mime_type: mimetype
            }

            localContext.params.mime_type = mimetype
            localContext.params.storageProvider = new StorageProvider()
            localContext.params.uploadPath = path.join('public', context.params.videoSource, fileId, 'video')

            if (/.mpd/.test(file)) {
              localContext.params.skipResourceCreation = true
              localContext.params.patchId = resultId
              localContext.params.parentResourceId = null
              localContext.params.body.description = context.arguments[0].description
            } else {
              localContext.params.skipResourceCreation = false
              localContext.params.patchId = null
              localContext.params.parentResourceId = resultId
              localContext.params.body.description = 'DASH chunk for video ' + fileId
            }

            await app.service('upload').create(localContext.data, localContext.params)

            resolve()
          }))
        } else {
          promises.push(uploadFile(path.join(localFilePath, file), fileId, context, app, resultId))
        }
      }

      await Promise.all(promises)

      resolve()
    } catch (err) {
      console.log('uploadFile error')
      console.log(err)
      reject(err)
    }
  })
}
