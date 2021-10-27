import { ProjectAction } from './ProjectActions'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

export const ProjectService = {
  fetchAdminProjects: async () => {
    const projects = await client.service('project').find({ paginate: false })
    store.dispatch(ProjectAction.projectsFetched(projects.data))
  },

  createProject: async (name: string) => {
    const dispatch = useDispatch()
    const result = await client.service('project').create({ name })
    console.log('Upload project result', result)
    dispatch(ProjectAction.createdProject())
    ProjectService.fetchAdminProjects()
  },

  uploadProject: async (url: string) => {
    const dispatch = useDispatch()
    const result = await client.service('project').update({ url })
    console.log('Upload project result', result)
    dispatch(ProjectAction.postProject())
    ProjectService.fetchAdminProjects()
  },

  removeProject: async (id: string) => {
    const result = await client.service('project').remove(id)
    console.log('Remove project result', result)
    ProjectService.fetchAdminProjects()
  },

  triggerReload: async () => {
    const result = await client.service('project-build').patch({ rebuild: true })
    console.log('Remove project result', result)
  }
}
// TODO
// client.service('project-build').on('patched', (params) => {
//   store.dispatch(ProjectAction.buildProgress(params.message))
// })
