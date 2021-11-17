import { copyDefaultProject, getStorageProviderPath } from './project.class'

export const projectSeedData = {
  randomize: false,
  templates: [
    {
      copyDefaultProject
    },
    {
      name: 'default-project',
      storageProviderPath: getStorageProviderPath('default-project')
    }
  ]
}
