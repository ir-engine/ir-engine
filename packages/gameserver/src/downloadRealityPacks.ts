import StorageProvider from '@xrengine/server-core/src/media/storageprovider/storageprovider'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import fs from 'fs'
import path from 'path'

const storageProvider = new StorageProvider()

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
    const manifestResult = await storageProvider.getObject(`reality-pack/${packName}/manifest.json`)
    const manifest = JSON.parse(manifestResult.Body.toString()) as RealityPackInterface

    console.log('[RealityPackLoader]: Installing reality pack', packName, '...')

    const localRealityPackDirectory = path.resolve(__dirname, '../../projects/projects', packName)
    if (fs.existsSync(localRealityPackDirectory)) {
      console.log('[Reality pack temp debug]: fs exists, deleting')
      deleteFolderRecursive(localRealityPackDirectory)
    }

    console.log('[Reality pack temp debug]: local dir', localRealityPackDirectory)

    writeFileSyncRecursive(path.resolve(localRealityPackDirectory, 'manifest.json'), manifestResult.Body.toString()) //, 'utf8')

    for (const filePath of manifest.files) {
      console.log(`[RealityPackLoader]: - downloading "reality-pack/${packName}/${filePath}"`)
      const fileResult = await storageProvider.getObject(`reality-pack/${packName}/${filePath}`)
      writeFileSyncRecursive(path.resolve(localRealityPackDirectory, filePath), fileResult.Body.toString()) //, 'utf8')
    }

    console.log('[RealityPackLoader]: Successfully downloaded and mounted reality pack', packName)
  } catch (e) {
    console.log(`[RealityPackLoader]: Failed to download reality pack with error ${e}`)
    return false
  }

  return true
}
