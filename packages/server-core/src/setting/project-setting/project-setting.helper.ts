import { Application } from '../../../declarations'

export const addSettingsAgainstProject = async (app: Application, projectName: string, settings: Array<any>) => {
  try {
    const project = await app.service('project').find(projectName)
    await app.service('project-setting').create({ projectId: project.id, settings: JSON.stringify(settings) })
  } catch (err) {
    console.log(err)
  }
}

export const removeSettingsAgainstProject = async (app: Application, projectName: string, settings: Array<any>) => {
  try {
    const project = await app.service('project').find(projectName)
    await app.service('project-setting').remove({ projectId: project.id })
  } catch (err) {
    console.log(err)
  }
}
