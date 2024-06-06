import { projectsPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { useHookstate } from '@hookstate/core'
import { useEffect } from 'react'
import { ProjectSettingSchema } from './ProjectConfigInterface'
import { loadConfigForProject } from './loadConfigForProject'

export const useProjectSettingsSchemas = () => {
  const projects = useFind(projectsPath, { query: { $paginate: false } })
  const settingsSchemas = useHookstate<ProjectSettingSchema[]>([])

  useEffect(() => {
    if (!projects.data) return

    const projectSettings = projects.data.map((project) => {
      return loadConfigForProject(project).then((projectConfig) => projectConfig?.settings ?? [])
    })

    Promise.all(projectSettings).then((settings) => {
      settingsSchemas.set(settings.flat())
    })
  }, [projects.data])

  return settingsSchemas
}
