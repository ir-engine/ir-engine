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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Params } from '@feathersjs/feathers'
import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'

import ffmpegStatic from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { Application } from '../../../declarations'

import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
ffmpeg.setFfmpegPath(ffmpegStatic)

async function convertGifToMp4(fileBuffer: Buffer): Promise<Buffer | null> {
  const isGif = fileBuffer.slice(0, 3).toString('ascii') === 'GIF'
  if (!isGif) return null

  const tmpInput = path.join(os.tmpdir(), `input-${Date.now()}.gif`)
  const tmpOutput = path.join(os.tmpdir(), `output-${Date.now()}.mp4`)

  await fs.writeFile(tmpInput, new Uint8Array(fileBuffer))

  return new Promise((resolve, reject) => {
    ffmpeg(tmpInput)
      .format('mp4')
      .videoCodec('libx264')
      .outputOptions([
        '-r 15',
        '-g 1',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-profile:v baseline',
        '-level 3.0',
        '-preset fast'
      ])
      .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .on('end', async () => {
        try {
          const result = await fs.readFile(tmpOutput)
          await fs.unlink(tmpInput)
          await fs.unlink(tmpOutput)
          resolve(result)
        } catch (err) {
          reject(new Error(`Failed to read output: ${err.message}`))
        }
      })
      .save(tmpOutput)
  })
}

export interface FfmpegParams extends Params {
  files: UploadFile[]
}

/**
 * A class for FFMPEG service convert gif to mp4
 * @param {Application} app - The application instance
 */
export class FfmpegService implements ServiceInterface<string[], any, FfmpegParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(rawData: { args: string }, params: FfmpegParams) {
    const data = typeof rawData.args === 'string' ? JSON.parse(rawData.args) : rawData.args

    const result = await Promise.all(
      params.files.map(async (file, i) => {
        const args = data[i]
        let fileBuffer = file.buffer as Buffer
        let contentType = args.contentType || file.mimetype
        let path = args.path
        // If the file is a GIF, try to convert it
        if (contentType === 'image/gif') {
          try {
            const convertedBuffer = await convertGifToMp4(fileBuffer)
            if (convertedBuffer) {
              fileBuffer = convertedBuffer
              contentType = 'video/mp4'
              path = path.replace('.gif', '.mp4')
              return this.app.service(fileBrowserPath).patch(null, {
                ...args,
                project: args.project,
                path: path,
                body: fileBuffer,
                contentType: contentType
              })
            }
          } catch (error) {
            console.error('GIF conversion failed:', error)
          }
        }
        return null
      })
    )

    const urls = result.map((result) => result?.url).filter((url): url is string => url !== undefined)

    // Clear params
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return urls
  }
}
