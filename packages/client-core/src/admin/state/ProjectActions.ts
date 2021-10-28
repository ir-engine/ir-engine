import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

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
