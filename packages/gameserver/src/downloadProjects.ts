import { useStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '@xrengine/server-core/src/media/storageprovider/storageProviderUtils'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import fs from 'fs'
import path from 'path'

const storageProvider = useStorageProvider()

function writeFileSyncRecursive(filename, content, charset = undefined) {
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

function deleteFolderRecursive(path) {
  var files: any[] = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      var curPath = path + '/' + file
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

export const download = async (packName) => {
  try {
    const files = await getFileKeysRecursive(`project/${packName}`)

    // const manifestResult = await storageProvider.getObject(`project/${packName}/manifest.json`)
    // const manifest = JSON.parse(manifestResult.Body.toString()) as ProjectInterface

    console.log('[ProjectLoader]: Installing project', packName, '...')

    const localProjectDirectory = path.resolve(__dirname, '../../projects/projects', packName)
    if (fs.existsSync(localProjectDirectory)) {
      console.log('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    for (const filePath of files) {
      console.log(`[ProjectLoader]: - downloading "${filePath}"`)
      const fileResult = await storageProvider.getObject(filePath)
      writeFileSyncRecursive(path.resolve(localProjectDirectory, filePath), fileResult.Body.toString()) //, 'utf8')
    }

    // console.log('[Project temp debug]: local dir', localProjectDirectory)

    // writeFileSyncRecursive(path.resolve(localProjectDirectory, 'manifest.json'), manifestResult.Body.toString()) //, 'utf8')

    // for (const filePath of manifest.files) {
    //   console.log(`[ProjectLoader]: - downloading "project/${packName}/${filePath}"`)
    //   const fileResult = await storageProvider.getObject(`project/${packName}/${filePath}`)
    //   writeFileSyncRecursive(path.resolve(localProjectDirectory, filePath), fileResult.Body.toString()) //, 'utf8')
    // }

    console.log('[ProjectLoader]: Successfully downloaded and mounted project', packName)
  } catch (e) {
    console.log(`[ProjectLoader]: Failed to download project with error ${e}`)
    return false
  }

  return true
}
