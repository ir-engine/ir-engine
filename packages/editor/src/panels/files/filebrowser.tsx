import { projectPath } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs'
import { useMutableState } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorState } from '../../services/EditorServices'
import { FilesQueryProvider, FilesState } from '../../services/FilesState'
import FilesToolbar from './toolbar'

const getValidProjectForFileBrowser = async (path: string) => {
  const [orgName, projectName] = path.split('/').slice(2, 4)
  const projects = await Engine.instance.api.service(projectPath).find({
    query: {
      $or: [
        {
          name: `${orgName}/${projectName}`
        },
        {
          name: orgName
        }
      ],
      action: 'studio',
      allowed: true
    }
  })
  return (
    projects.data.find((project) => project.name === orgName || project.name === `${orgName}/${projectName}`)?.name ??
    ''
  )
}

export default function FileBrowser() {
  const { t } = useTranslation()
  const filesState = useMutableState(FilesState)

  const originalPath = useMutableState(EditorState).projectName.value
  useEffect(() => {
    if (originalPath) filesState.selectedDirectory.set(originalPath)
  }, [originalPath])

  useEffect(() => {
    ;(async () => {
      const projectName = await getValidProjectForFileBrowser(filesState.selectedDirectory.value)
      const orgName = projectName.includes('/') ? projectName.split('/')[0] : ''
      filesState.merge({ projectName, orgName })
    })()
  }, [filesState.selectedDirectory])

  return (
    <FilesQueryProvider>
      <FilesToolbar />
    </FilesQueryProvider>
  )
}
