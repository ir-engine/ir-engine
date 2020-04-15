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

const s3 = new AWS.S3({
  accessKeyId: config.get('aws.keys.access_key_id') ?? '',
  secretAccessKey: config.get('aws.keys.secret_access_key') ?? ''
})

const s3BlobStore = new S3BlobStore({
  client: s3,
  bucket: config.get('aws.s3.public_video_bucket') || 'default',
  acl: 'public-read'
})

export default async function (data: any): Promise<void> {
  let results = data.result
  const app = data.app

  if (!Array.isArray(results)) {
    results = [results]
  }

  results.map(async function (result: any) {
    return await uploadVideo(result, app)
  })
}

async function uploadVideo (result: any, app: Application): Promise<any> {
  return await new Promise(function (resolve, reject) {
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
        key: (fileId)
      }, async function (err: any, exists: any) {
        if (err) {
          console.log('s3 error')
          console.log(err)
          throw err
        }

        if (exists !== true) {
          try {
            const video = youtubedl(link,
              ['--format=best[ext=mp4]', '--user-agent=""'],
              { cwd: __dirname })

            video.on('error', function (err: any) {
              console.log('youtube-dl error')
              console.log(err)
              throw err
            })

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            video.on('info', async function (): Promise<void> {
              const localFilePath = path.join(appRootPath.path, 'temp_videos', fileId)

              await fs.promises.rmdir(localFilePath, { recursive: true })

              await fs.promises.mkdir(localFilePath, { recursive: true })
              await fs.promises.mkdir(path.join(localFilePath, 'output'), { recursive: true })

              const rawVideoPath = path.join(localFilePath, fileId) + '_raw.mp4'
              const outputdir = path.join(localFilePath, 'output')
              const convertedVideoPath = path.join(outputdir, fileId) + '.mpd'
              const outStream = fs.createWriteStream(rawVideoPath)

              video.pipe(outStream)
              // audio.pipe(outAudioStream)

              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              video.on('end', async function () {
                console.log('Finished downloading video, running through ffmpeg')

                try {
                  await promiseExec('ffmpeg -i ' + rawVideoPath + ' -f dash -map 0:v:0 -map 0:a:0 -b:v:0 3000k -profile:v:0 baseline -use_timeline 1 -use_template 1 ' + convertedVideoPath)
                } catch (err) {
                  console.log('ffmpeg error')
                  console.log(err)

                  throw err
                }

                console.log('Finished ffmpeg, uploading!')

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
                                        fileId + '/' + fileId + '.mpd'
                })

                console.log('Uploaded all files, deleting local copies')

                await fs.promises.rmdir(localFilePath, { recursive: true })

                resolve()
              })
            })
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
                            fileId + '/' + fileId + '.mpd'
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
  return await new Promise(async function (resolve, reject) {
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
          promises.push(new Promise(function (resolve, reject) {
            readStream.pipe(stream)

            stream.on('finish', async function (): Promise<void> {
              resolve()
            })

            stream.on('error', async function (err: any): Promise<void> {
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
