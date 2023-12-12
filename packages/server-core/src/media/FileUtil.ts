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

import { isDev } from '@etherealengine/common/src/config'
import appRootPath from 'app-root-path'
import { StorageProviderInterface } from './storageprovider/storageprovider.interface'

export const copyRecursiveSync = function (src: string, dest: string): void {
  if (!fs.existsSync(src)) return

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const getIncrementalName = async function (
  name: string,
  directoryPath: string,
  store: StorageProviderInterface,
  isDirectory?: boolean
): Promise<string> {
  let filename = name

  if (!(await store.doesExist(filename, directoryPath))) return filename

  let count = 1

  if (isDirectory) {
    do {
      filename = `${name}(${count})`
      count++
    } while (await store.doesExist(filename, directoryPath))
  } else {
    const extension = path.extname(name)
    const baseName = path.basename(name, extension)

    do {
      filename = `${baseName}(${count})${extension}`
      count++
    } while (await store.doesExist(filename, directoryPath))
  }

  return filename
}

export const syncWithProjects = {
  _getPath: (filePath: string) => {
    return path.join(appRootPath.path, 'packages/projects', filePath)
  },
  addFile: (filePath: string, body: any) => {
    if (isDev) {
      const pathWithoutFile = path.dirname(syncWithProjects._getPath(filePath))
      if (!fs.existsSync(pathWithoutFile)) fs.mkdirSync(pathWithoutFile, { recursive: true })
      fs.writeFileSync(syncWithProjects._getPath(filePath), body)
    }
  },
  addDirectory: (dirPath: string) => {
    if (isDev) {
      fs.mkdirSync(syncWithProjects._getPath(dirPath))
    }
  },
  moveOrCopyFile: (oldPath: string, newPath: string, isCopy?: boolean) => {
    if (!isDev) return

    if (!oldPath.startsWith(appRootPath.path)) oldPath = syncWithProjects._getPath(oldPath)
    if (!newPath.startsWith(appRootPath.path)) newPath = syncWithProjects._getPath(newPath)

    if (isCopy) copyRecursiveSync(oldPath, newPath)
    else fs.renameSync(oldPath, newPath)
  },
  removeFile: (filePath: string) => {
    if (isDev) {
      fs.rmSync(syncWithProjects._getPath(filePath), { force: true, recursive: true })
    }
  }
}
