import { ProjectAction } from './ProjectActions'
import { client } from '../../feathers'
import { accessProjectState } from './ProjectState'
import { store, useDispatch } from '../../store'

export async function fetchAdminProjects(incDec?: 'increment' | 'decrement') {
  // const adminProjectState = accessProjectState()
  // const limit = adminProjectState.limit.value
  // const skip = adminProjectState.skip.value
  const projects = await client.service('project').find({ paginate: false })
  // query: {
  //   $limit: limit,
  //   $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip
  // }
  // })
  console.log(projects.data)
  store.dispatch(ProjectAction.projectsFetched(projects.data))
}

export async function uploadProject(url: string) {
  const dispatch = useDispatch()
  const result = await client.service('project').create({ url })
  console.log('Upload project result', result)
  dispatch(ProjectAction.postProject())
  fetchAdminProjects()
}

export async function removeProject(id: string) {
  const result = await client.service('project').remove(id)
  console.log('Remove project result', result)
  fetchAdminProjects()
}
