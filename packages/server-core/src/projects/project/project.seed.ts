import path from 'path'
import appRootPath from 'app-root-path'
import { copyFolderRecursiveSync, deleteFolderRecursive } from '../../util/fsHelperFunctions'
import { getStorageProviderPath } from './project.class'

export const projectSeedData = {
  randomize: false,
  templates: [
    {
      copyDefaultProject: () => {
        const seedPath = path.resolve(appRootPath.path, `packages/projects/projects`)
        deleteFolderRecursive(path.resolve(seedPath, `default-project`))
        copyFolderRecursiveSync(path.resolve(appRootPath.path, `packages/projects/default-project`), seedPath)
      }
    },
    {
      name: 'default-project',
      storageProviderPath: getStorageProviderPath('default-project')
    }
  ]
}
