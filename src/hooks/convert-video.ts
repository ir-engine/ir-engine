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

import fs from 'fs'
// @ts-ignore
import appRootPath from 'app-root-path'

const promiseExec = util.promisify(exec)

const sourceRegexes = [
  /youtu.be\/([a-zA-Z0-9_-]+)($|&)/,
  /youtube.com\/watch\?v=([a-zA-Z0-9_-]+)($|&)/,
  /vimeo.com\/([a-zA-Z0-9_-]+)($|&)/
]
const dashManifestName = 'manifest.mpd'

const s3 = new AWS.S3({
  accessKeyId: config.get('aws.keys.access_key_id') ?? '',
  secretAccessKey: config.get('aws.keys.secret_access_key') ?? ''
})

const s3BlobStore = new S3BlobStore({
  client: s3,
  bucket: config.get('aws.s3.public_video_bucket') || 'default',
  acl: 'public-read'
})

export default async (data: any): Promise<void> => {
  let results = data.result
  const app = data.app

  if (!Array.isArray(results)) {
    results = [results]
  }

  results.map(async (result: any) => {
    return await uploadVideo(result, app)
  })
}

async function uploadVideo (result: any, app: Application): Promise<any> {
  return await new Promise((resolve, reject) => {
    const link = result.link
    let fileId = ''

    for (const re of sourceRegexes) {
      const match = link.match(re)

      if (match != null) {
        fileId = match[1]
      }
    }

    if (fileId.length > 0) {
      s3BlobStore.exists({
        key: (fileId + '/' + dashManifestName)
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
              console.log('Starting to download ' + link)
              youtubedl.exec(link,
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
              await uploadFile(outputdir, fileId)
            } catch (err) {
              console.log('Error in totality of file upload')
              console.log(err)
              throw err
            }

            await app.service('public-video').patch(result.id, {
              link: 'https://' +
                                    config.get('aws.s3.public_video_bucket') +
                                    '.s3.amazonaws.com/' +
                                    fileId
            })

            console.log('Uploaded all files for ' + fileId + ', deleting local copies')

            await fs.promises.rmdir(localFilePath, { recursive: true })

            resolve()
          } catch (err) {
            console.log('Transcoding process error')
            console.log(err)

            reject(err)
          }
        } else {
          await app.service('public-video').patch(result.id, {
            link: 'https://' +
                            config.get('aws.s3.public_video_bucket') +
                            '.s3.amazonaws.com/' +
                            fileId
          })

          resolve()
        }
      })
    } else {
      console.log('Regex for ' + link + ' did not match anything known')

      resolve()
    }
  })
}

async function uploadFile (localFilePath: string, fileId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    const promises = []
    try {
      const files = await fs.promises.readdir(localFilePath)

      for (const file of files) {
        if (/.m/.test(file)) {
          const strippedFilePath = localFilePath.replace(appRootPath.path, '').replace('/temp_videos', '').replace('/output', '')
          const filePath = strippedFilePath + '/' + file
          const stream = s3BlobStore.createWriteStream({
            key: filePath.slice(1),
            params: {
              ACL: 'public-read'
            }
          })

          const readStream = fs.createReadStream(localFilePath + '/' + file)
          promises.push(new Promise((resolve, reject) => {
            readStream.pipe(stream)

            stream.on('finish', async (): Promise<void> => {
              resolve()
            })

            stream.on('error', async (err: any): Promise<void> => {
              console.log('s3BlobStore error')
              console.log(err)
              reject(err)
            })
          }))
        } else {
          promises.push(uploadFile(path.join(localFilePath, file), fileId))
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
