import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { createState, useState } from '@hookstate/core'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

//State
export const PROJECT_PAGE_LIMIT = 100

export const state = createState({
  projects: [] as Array<ProjectInterface>,
  updateNeeded: true
})

store.receptors.push((action: ProjectActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'PROJECTS_RETRIEVED':
        result = action.projectResult
        return s.merge({
          projects: action.projectResult,
          updateNeeded: false
        })
    }
  }, action.type)
})

export const accessProjectState = () => state

export const useProjectState = () => useState(state) as any as typeof state

//Service
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

//Action
export const ProjectAction = {
  projectsFetched: (projectResult: ProjectInterface[]) => {
    return {
      type: 'PROJECTS_RETRIEVED' as const,
      projectResult: projectResult
    }
  },
  postProject: () => {
    return {
      type: 'PROJECT_POSTED' as const
    }
  },
  createdProject: () => {
    return {
      type: 'PROJECT_CREATED' as const
    }
  }
  // TODO
  // buildProgress: (message: string) => {
  //   return {
  //     type: 'PROJECT_BUILDER_UPDATE' as const,
  //     message
  //   }
  // }
}

export type ProjectActionType = ReturnType<typeof ProjectAction[keyof typeof ProjectAction]>
