import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import fs from 'fs'
import path from 'path'
import {
  copyFileSync,
  copyFolderRecursiveSync,
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
      // make a local copy of the default files
      copyFolderRecursiveSync(
        path.resolve(appRootPath.path, `packages/projects/default-project`),
        path.resolve(appRootPath.path, `packages/projects/projects/default-project`)
      )
      // remove the scene files so they aren't overwritten
      const sceneFilesToNotOverwrite = getFilesRecursive(
        path.resolve(appRootPath.path, `packages/projects/projects/default-project`)
      ).filter((file) => sceneRegex.test(file))
      sceneFilesToNotOverwrite.forEach((file) => fs.rmSync(file))
      await uploadLocalProjectToProvider('default-project', false, [sceneRegex])
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
