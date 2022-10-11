import { filter } from 'lodash'

import { Engine } from '../../ecs/classes/Engine'

export function pathResolver() {
  //const hostPath = Engine.instance.publicPath.replace(/:\d{4}$/, '')
  //const cacheRe = new RegExp(`([^\\\/]+\/projects)\/([^\/]+)\/(.*$)`)
  const cacheRe = new RegExp(`(https://[^\\\/]+)\/projects\/([^\/]+)\/(.*$)`)
  //                          1: project path -- 2: project name -- 3: internal path
  return cacheRe
}

export function getFileName(path: string) {
  return /[^\\\/]+$/.exec(path)?.[0] ?? ''
}

export function getProjectName(path: string) {
  return pathResolver().exec(path)?.[2] ?? ''
}

export function modelResourcesPath(modelName: string) {
  return `model-resources/${modelName.split('.').at(-2)!}`
}
