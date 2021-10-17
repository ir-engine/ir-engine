import { ProjectResult } from '@xrengine/common/src/interfaces/ProjectResult'

export const ProjectAction = {
  projectsFetched: (projectResult: ProjectResult) => {
    return {
      type: 'PROJECTS_RETRIEVED' as const,
      projectResult: projectResult
    }
  }
}

export type ProjectActionType = ReturnType<typeof ProjectAction[keyof typeof ProjectAction]>
