import { Application } from '../../../declarations'
import { Scene } from './scenenew.class'
import projectDocs from './scene.docs'
import createModel from './scene.model'
import hooks from './scene.hooks'
import createAssetModel from './asset.model'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

declare module '../../../declarations' {
  interface ServiceTypes {
    scene: Scene
  }
  interface Models {
    scene: ReturnType<typeof createModel>
  }
}

const getScenesForProject = (app: Application) => {
  return async function ({ projectName }, params) {
    const project = await app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}`)

    const files = fs
      .readdirSync(newSceneJsonPath, { withFileTypes: true })
      .filter((dirent) => !dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((name) => name.endsWith('.scene.json'))

    const sceneData = files.map((name) => JSON.parse(fs.readFileSync(path.resolve(newSceneJsonPath, name), 'utf8')))

    return {
      data: sceneData
    }
  }
}

export default (app: Application) => {
  createAssetModel(app)
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Scene(options, app)
  event.docs = projectDocs

  app.use('scene', event)

  app.use('scenes', {
    get: getScenesForProject(app)
  })

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('scene')

  service.hooks(hooks)
}
