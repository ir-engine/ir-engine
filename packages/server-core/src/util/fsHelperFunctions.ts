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

import fs from 'fs'
import path from 'path'

import logger from '../ServerLogger'

export function writeFileSyncRecursive(filename, content, charset = undefined) {
  // -- normalize path separator to '/' instead of path.sep,
  // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
  let filepath = filename.replace(/\\/g, '/')

  // -- preparation to allow absolute paths as well
  let root = ''
  if (filepath[0] === '/') {
    root = '/'
    filepath = filepath.slice(1)
  } else if (filepath[1] === ':') {
    root = filepath.slice(0, 3) // c:\
    filepath = filepath.slice(3)
  }

  // -- create folders all the way down
  const folders = filepath.split('/').slice(0, -1) // remove last item, file
  folders.reduce(
    (acc, folder) => {
      const folderPath = acc + folder + '/'
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      return folderPath
    },
    root // first 'acc', important
  )

  // -- write file
  fs.writeFileSync(root + filepath, content, charset)
}

export function deleteFolderRecursive(path) {
  let files: any[] = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

export function getFilesRecursive(path, includeDirs = false) {
  const files: string[] = []
  if (fs.existsSync(path)) {
    const curFiles = fs.readdirSync(path)
    curFiles.forEach(function (file, index) {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        if (includeDirs) files.push(curPath)
        files.push(...getFilesRecursive(curPath, includeDirs))
      } else {
        files.push(curPath)
      }
    })
  }
  return files
}

export function copyFileSync(source, target) {
  let targetFile = target

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source))
    }
  }

  const fileSize = fs.statSync(source)
  if (fileSize.size > 1000000000) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(source)
      const writeStream = fs.createWriteStream(targetFile)
      readStream.pipe(writeStream)
      writeStream.on('error', (err) => {
        logger.error('error copying file locally', err)
        reject(err)
      })
      writeStream.on('finish', () => {
        logger.info('finished copying large file from ', source, 'to', targetFile)
        resolve(true)
      })
    })
  } else fs.writeFileSync(targetFile, fs.readFileSync(source))
}

export function copyFolderRecursiveSync(source, target) {
  let files: any[] = []

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true })
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach(function (file) {
      const curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        copyFileSync(curSource, targetFolder)
      }
    })
  }
}
