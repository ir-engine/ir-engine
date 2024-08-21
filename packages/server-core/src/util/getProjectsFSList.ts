import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

export const getProjectsFSList = () => {
  return fs
    .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects/'), { withFileTypes: true })
    .filter((orgDir) => orgDir.isDirectory())
    .map((orgDir) => {
      return fs
        .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects', orgDir.name), { withFileTypes: true })
        .filter((projectDir) => projectDir.isDirectory())
        .map((projectDir) => `${orgDir.name}/${projectDir.name}`)
    })
    .flat()
}
