import { ProjectResult } from '@xrengine/common/src/interfaces/ProjectResult'

export const ProjectAction = {
  projectsFetched: (projectResult: ProjectResult) => {
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
}

export type ProjectActionType = ReturnType<typeof ProjectAction[keyof typeof ProjectAction]>
