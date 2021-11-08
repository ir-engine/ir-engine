import { getStorageProviderPath } from './project.class'

export const projectSeedData = {
  randomize: false,
  templates: [
    {
      name: 'default-project',
      storageProviderPath: getStorageProviderPath('default-project')
    }
  ]
}
