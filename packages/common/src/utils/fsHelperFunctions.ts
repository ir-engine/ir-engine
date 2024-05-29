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

import { ObjectEncodingOptions, promises as fsp } from 'fs'
import path from 'path'
import logger from '../logger'

/**
 * @function existsAsync
 * @author Jonathan Casarrubias <jcasarrubias@theinfinitereality.com>
 * @param path String
 * @description Async file/directory access wrapper that will return
 * true if the given path exists or false if doesn't exist, helpful
 * for conditional expressions.
 **/
export async function existsAsync(path: string): Promise<boolean> {
  try {
    await fsp.access(path)
    return true
  } catch (e) {
    return false
  }
}

/**
 * @author Jonathan Casarrubias <jcasarrubias@theinfinitereality.com>
 * @function writeFileAsync
 * @param filename String
 * @param data String
 * @param options Object {
 *   charset    (Default: undefined)
 *   recursive  (Default: Enabled)
 *   overwrite  (Default: Enabled)
 * }
 **/
export async function writeFileAsync(
  filename,
  data,
  options: {
    charset?: ObjectEncodingOptions
    recursive?: boolean
    overwrite?: boolean
  } = {
    charset: undefined,
    recursive: true,
    overwrite: true
  }
): Promise<void> {
  // Parse for file directory
  const { dir } = path.parse(filename)
  // Create directory if doesn't exist
  if (!(await existsAsync(dir))) await fsp.mkdir(dir, { recursive: options.recursive })
  // overwrite file if exists
  if ((await existsAsync(filename)) && options.overwrite) await fsp.rm(filename)
  // Write file
  await fsp.writeFile(filename, data, options.charset)
}

/**
 * @author Jonathan Casarrubias <jcasarrubias@theinfinitereality.com>
 * @function cpAsync
 * @param source String
 * @param destination String
 * @param options Object {
 *   recursive    (Default: Enabled)
 *   overwrite    (Default: Enabled)
 * }
 * @description Asyncronous function to handle the copy of directories and files.
 *
 * Recursive: Enabling the "recursive" option will perform from 1 to 2 recursive behaviours based on the "Overwrite" given value:
 *
 *     1.- If "overwrite" is enabled and the destination is a directory, it will recursively delete any child directory or file
 *         inside the destination directory.
 *
 *     2.- In any case, if "recursive" option is enabled, it will always recursively create any missing parent directory
 *         needed for the destination to be successfully copied.
 *
 *
 **/
export async function cpAsync(
  source,
  destination,
  options: {
    recursive?: boolean
    overwrite?: boolean
  } = {
    recursive: true,
    overwrite: true
  }
): Promise<void> {
  try {
    // Verify if source is either a file or a directory
    const isDirectory = (await fsp.stat(source)).isDirectory()
    const isDestinationExisting: boolean = await existsAsync(destination)
    const { recursive, overwrite } = options
    // If overwrite is enabled, we are making sure in advance that the destination is cleared before trying to copy
    // the resource
    if (isDestinationExisting) {
      if (overwrite) {
        await fsp.rm(destination, { recursive })
      } else {
        throw new Error(`[cpAsync]: Destination already exists (${destination}).
        You might want to enable the overwrite option that gracefully handles pre existing files and directories.`)
      }
    }

    if (isDirectory) {
      await fsp.cp(source, destination, { recursive })
    } else {
      const { dir } = path.parse(destination)
      if (!(await existsAsync(dir))) await fsp.mkdir(dir, { recursive })
      await fsp.copyFile(source, destination)
    }
  } catch (e) {
    logger.info(`[cpAsync]: handling promise rejections`)
    logger.info(e)
  }
}

export async function getFilesRecursive(path, includeDirs = false) {
  const files: string[] = []
  if (await existsAsync(path)) {
    const curFiles = await fsp.readdir(path)

    for (const file of curFiles) {
      const curPath = path + '/' + file
      if ((await fsp.lstat(curPath)).isDirectory()) {
        if (includeDirs) files.push(curPath)
        files.push(...(await getFilesRecursive(curPath, includeDirs)))
      } else {
        files.push(curPath)
      }
    }
  }
  return files
}
