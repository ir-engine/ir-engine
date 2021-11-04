import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'
import { copyFolderRecursiveSync, deleteFolderRecursive } from '../../util/fsHelperFunctions'

export const projectSeedData = {
  randomize: false,
  delete: false,
  template: [
    () => {
      const seedPath = path.resolve(appRootPath.path, `packages/projects/projects`)
      deleteFolderRecursive(path.resolve(seedPath, `default-project`))
      copyFolderRecursiveSync(path.resolve(appRootPath.path, `packages/projects/default-project`), seedPath)
    }
  ]
}
