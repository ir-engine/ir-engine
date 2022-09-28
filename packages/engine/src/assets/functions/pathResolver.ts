import { filter } from 'lodash'

import { Engine } from '../../ecs/classes/Engine'

export function pathResolver() {
  const hostPath = Engine.instance.publicPath.replace(/:\d{4}$/, '')
  const cacheRe = new RegExp(`${hostPath}:\\d{4}\/projects\/[^\/]+\/`)
  return cacheRe
}

export function getFileName(path: string) {
  return /[^\\\/]+$/.exec(path)?.[0] ?? ''
}

export function getProjectName(path: string) {
  return (
    pathResolver()
      .exec(path)?.[0]
      .split(/[\\\/]+/)
      .filter((x) => !!x)
      .at(-1)! ?? ''
  )
}

export function modelResourcesPath(modelName: string) {
  return `model-resources/${modelName.split('.').at(-2)!}`
}
