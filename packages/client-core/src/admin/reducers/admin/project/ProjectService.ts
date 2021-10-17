import { ProjectAction } from './ProjectActions'
import { client } from '../../../../feathers'
import { accessProjectState } from './ProjectState'
import Store from '../../../../store'

export async function fetchAdminProjects(incDec?: 'increment' | 'decrement') {
  const adminProjectState = accessProjectState().projects
  const limit = adminProjectState.limit.value
  const skip = adminProjectState.skip.value
  const projects = await client.service('reality-pack').find({
    query: {
      $limit: limit,
      $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip
    }
  })
  Store.store.dispatch(ProjectAction.projectsFetched(projects))
}
