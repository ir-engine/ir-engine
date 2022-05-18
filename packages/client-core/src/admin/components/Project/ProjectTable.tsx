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
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { projectsColumns } from '../../common/variables/projects'
import styles from '../../styles/admin.module.scss'
import ViewProjectFiles from './ViewProjectFiles'

export default function ProjectTable() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
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
          handleCloseRemoveModal()
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
        setProcessing(true)
        await ProjectService.uploadProject(
          project.name === 'default-project' ? 'default-project' : existingProjects.repositoryPath
        )
        setProcessing(false)
        setProject(null!)
        setPopupReuploadConfirmOpen(false)
      }
    } catch (err) {
      setProcessing(false)
      console.log(err)
    }
  }
  const handleInvalidateCache = async () => {
    try {
      setPopupInvalidateConfirmOpen(false)
      setProcessing(true)
      await ProjectService.invalidateProjectCache(project.name)
      setProcessing(false)
      setProject(null!)
      setPopupInvalidateConfirmOpen(false)
    } catch (err) {
      setProcessing(false)
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

  const handleCloseReuploadModal = () => {
    setProject(null!)
    setPopupReuploadConfirmOpen(false)
  }

  const handleCloseInvalidateModal = () => {
    setProject(null!)
    setPopupInvalidateConfirmOpen(false)
  }

  const handleCloseRemoveModal = () => {
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
              className={styles.checkboxButton}
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
              className={styles.checkboxButton}
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
              className={styles.checkboxButton}
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
              className={styles.checkboxButton}
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
        allowSort={true}
        rows={rows}
        column={projectsColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminProjectCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        popConfirmOpen={popupReuploadConfirmOpen}
        handleCloseModal={handleCloseReuploadModal}
        submit={tryReuploadProjects}
        name={project?.name}
        label={t('admin:components.project.project')}
        type="rebuild"
        processing={processing}
      />
      <ConfirmModal
        popConfirmOpen={popupInvalidateConfirmOpen}
        handleCloseModal={handleCloseInvalidateModal}
        submit={handleInvalidateCache}
        name={project?.name}
        label={t('admin:components.project.storageProvidersCacheOf')}
        type="invalidates"
        processing={processing}
      />
      <ConfirmModal
        popConfirmOpen={popupRemoveConfirmOpen}
        handleCloseModal={handleCloseRemoveModal}
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
