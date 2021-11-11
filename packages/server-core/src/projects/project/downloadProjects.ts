import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import fs from 'fs'
import path from 'path'
import {
  copyFileSync,
  deleteFolderRecursive,
  getFilesRecursive,
  writeFileSyncRecursive
} from '../../util/fsHelperFunctions'
import appRootPath from 'app-root-path'
import { uploadLocalProjectToProvider } from './project.class'

const storageProvider = useStorageProvider()
const sceneRegex = /\.(scene.json)$/g

export const download = async (projectName) => {
  try {
    // for default project, overwrite default logic files but not scene files
    if (projectName === 'default-project') {
      const files = getFilesRecursive(path.resolve(appRootPath.path, `packages/projects/default-project`)).filter(
        (file) => !sceneRegex.test(file)
      )
      files.forEach((file) =>
        copyFileSync(file, path.resolve(file.split('/').slice(0, -1).join('/'), 'projects', file.split('/').pop()))
      )
      await uploadLocalProjectToProvider('default-project', [sceneRegex])
    }

    console.log('[ProjectLoader]: Installing project', projectName, '...')
    const files = await getFileKeysRecursive(`projects/${projectName}`)
    console.log('[ProjectLoader]: Found files', files)

    const localProjectDirectory = path.resolve(appRootPath.path, 'packages/projects/projects', projectName)
    if (fs.existsSync(localProjectDirectory)) {
      console.log('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    for (const filePath of files) {
      console.log(`[ProjectLoader]: - downloading "${filePath}"`)
      const fileResult = await storageProvider.getObject(filePath)
      if (fileResult.Body.length === 0) {
        console.log(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
      }
      console.log(path.resolve(appRootPath.path, 'packages/projects'))
      writeFileSyncRecursive(path.resolve(appRootPath.path, 'packages/projects', filePath), fileResult.Body.toString()) //, 'utf8')
    }

    console.log('[ProjectLoader]: Successfully downloaded and mounted project', projectName)
  } catch (e) {
    console.log(`[ProjectLoader]: Failed to download project with error ${e}`)
    return false
  }

  return true
}
