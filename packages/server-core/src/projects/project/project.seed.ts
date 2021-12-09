import { copyDefaultProject, getStorageProviderPath } from './project.class'

export const projectSeedData = {
  path: 'project',
  randomize: false,
  templates: [
    {
      name: 'default-project',
      storageProviderPath: getStorageProviderPath('default-project')
    }
  ],
  callback: (result) => {
    return result.name === 'default-project' ? copyDefaultProject() : Promise.resolve()
  }
}
