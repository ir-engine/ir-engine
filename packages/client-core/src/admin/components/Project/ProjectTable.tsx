import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import Cached from '@mui/icons-material/Cached'
import Cross from '@mui/icons-material/Cancel'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'

import { PROJECT_PAGE_LIMIT, ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModel from '../../common/ConfirmModel'
import TableComponent from '../../common/Table'
import { projectsColumns } from '../../common/variables/projects'
import styles from './Projects.module.scss'
import ViewProjectFiles from './ViewProjectFiles'

export default function ProjectTable() {
  const { t } = useTranslation()
  const [popupReuploadConfirmOpen, setPopupReuploadConfirmOpen] = useState(false)
  const [popupInvalidateConfirmOpen, setPopupInvalidateConfirmOpen] = useState(false)
  const [popupRemoveConfirmOpen, setPopupRemoveConfirmOpen] = useState(false)
  const [project, setProject] = useState<ProjectInterface>(null!)
  const adminProjectState = useProjectState()
  const adminProjects = adminProjectState.projects
  const adminProjectCount = adminProjects.value.length
  const authState = useAuthState()
  const user = authState.user
  const [projectName, setProjectName] = useState('')
  const [showProjectFiles, setShowProjectFiles] = useState(false)

  const onRemoveProject = async () => {
    try {
      if (project) {
        const projectToRemove = adminProjects.value.find((p) => p.name === project?.name)!
        if (projectToRemove) {
          await ProjectService.removeProject(projectToRemove.id)
          handleCloseRemoveModel()
        } else {
          throw Error('Failed to find the project')
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const tryReuploadProjects = async () => {
    try {
      if (project) {
        if (!project.repositoryPath && project.name !== 'default-project') return
        const existingProjects = adminProjects.value.find((p) => p.name === project.name)!
        await ProjectService.uploadProject(
          project.name === 'default-project' ? 'default-project' : existingProjects.repositoryPath
        )
      }
    } catch (err) {
      console.log(err)
    }
  }
  const handleInvalidateCache = async () => {
    try {
      setPopupInvalidateConfirmOpen(false)
      await ProjectService.invalidateProjectCache(project.name)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (user?.id.value != null && adminProjectState.updateNeeded.value === true) {
      ProjectService.fetchProjects()
    }
  }, [adminProjectState.updateNeeded.value])

  const handleOpenReuploadConfirmation = (row) => {
    setProject(row)
    setPopupReuploadConfirmOpen(true)
  }

  const handleOpenInvaliateConfirmation = (row) => {
    setProject(row)
    setPopupInvalidateConfirmOpen(true)
  }

  const handleOpenRemoveConfirmation = (row) => {
    setProject(row)
    setPopupRemoveConfirmOpen(true)
  }
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PROJECT_PAGE_LIMIT)

  const handleCloseReuploadModel = () => {
    setProject(null!)
    setPopupReuploadConfirmOpen(false)
  }

  const handleCloseInvalidateModel = () => {
    setProject(null!)
    setPopupInvalidateConfirmOpen(false)
  }

  const handleCloseRemoveModel = () => {
    setProject(null!)
    setPopupRemoveConfirmOpen(false)
  }
  const handleViewProject = (name: string) => {
    setProjectName(name)
    setShowProjectFiles(true)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const createData = (el: any, name: string) => {
    return {
      el,
      name,
      update: (
        <>
          {user.userRole.value === 'admin' && (
            <Button
              className={styles.checkbox}
              disabled={el.repositoryPath === null && name !== 'default-project'}
              onClick={() => handleOpenReuploadConfirmation(el)}
              name="stereoscopic"
              color="primary"
            >
              <Cached />
            </Button>
          )}
        </>
      ),
      invalidate: (
        <>
          {user.userRole.value === 'admin' && (
            <Button
              className={styles.checkbox}
              onClick={() => handleOpenInvaliateConfirmation(el)}
              name="stereoscopic"
              color="primary"
            >
              <CleaningServicesIcon />
            </Button>
          )}
        </>
      ),
      view: (
        <>
          {user.userRole.value === 'admin' && (
            <Button
              className={styles.checkbox}
              onClick={() => handleViewProject(name)}
              name="stereoscopic"
              color="primary"
            >
              <VisibilityIcon />
            </Button>
          )}
        </>
      ),
      action: (
        <>
          {user.userRole.value === 'admin' && (
            <Button
              className={styles.checkbox}
              onClick={() => handleOpenRemoveConfirmation(el)}
              name="stereoscopic"
              color="primary"
            >
              <Cross />
            </Button>
          )}
        </>
      )
    }
  }

  const rows = adminProjects.value?.map((el) => {
    return createData(el, el.name)
  })

  return (
    <div>
      <TableComponent
        rows={rows}
        column={projectsColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminProjectCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={popupReuploadConfirmOpen}
        handleCloseModel={handleCloseReuploadModel}
        submit={tryReuploadProjects}
        name={project?.name}
        label={t('admin:components.project.project')}
        type="rebuild"
      />
      <ConfirmModel
        popConfirmOpen={popupInvalidateConfirmOpen}
        handleCloseModel={handleCloseInvalidateModel}
        submit={handleInvalidateCache}
        name={project?.name}
        label={t('admin:components.project.storageProvidersCacheOf')}
        type="invalidates"
      />
      <ConfirmModel
        popConfirmOpen={popupRemoveConfirmOpen}
        handleCloseModel={handleCloseRemoveModel}
        submit={onRemoveProject}
        name={project?.name}
        label={t('admin:components.project.project')}
      />

      {showProjectFiles && projectName && (
        <ViewProjectFiles name={projectName} open={showProjectFiles} setShowProjectFiles={setShowProjectFiles} />
      )}
    </div>
  )
}
