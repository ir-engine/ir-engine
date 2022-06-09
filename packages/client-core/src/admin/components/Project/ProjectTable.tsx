import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import Cached from '@mui/icons-material/Cached'
import Cross from '@mui/icons-material/Cancel'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import Group from '@mui/icons-material/Group'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Upload from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

import { PROJECT_PAGE_LIMIT, ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { projectsColumns } from '../../common/variables/projects'
import styles from '../../styles/admin.module.scss'
import EditProjectPermissionsModal from './EditProjectPermissionsModal'
import LinkGithubRepoModal from './LinkGithubRepoModal'
import UpdateLinkGithubRepoModal from './UpdateLinkGithubRepoModal'
import ViewProjectFiles from './ViewProjectFiles'

interface Props {
  className?: string
}

const ProjectTable = ({ className }: Props) => {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [popupReuploadConfirmOpen, setPopupReuploadConfirmOpen] = useState(false)
  const [popupInvalidateConfirmOpen, setPopupInvalidateConfirmOpen] = useState(false)
  const [popupRemoveConfirmOpen, setPopupRemoveConfirmOpen] = useState(false)
  const [popupPushToGithubOpen, setPopupPushToGithubOpen] = useState(false)
  const [project, setProject] = useState<ProjectInterface>(null!)
  const adminProjectState = useProjectState()
  const adminProjects = adminProjectState.projects
  const adminProjectCount = adminProjects.value.length
  const authState = useAuthState()
  const user = authState.user
  const [projectName, setProjectName] = useState('')
  const [showProjectFiles, setShowProjectFiles] = useState(false)
  const [linkGithubRepoModalOpen, setLinkGithubRepoModalOpen] = useState(false)
  const [updateLinkGithubRepoModalOpen, setUpdateLinkGithubRepoModalOpen] = useState(false)
  const [editProjectPermissionsModalOpen, setEditProjectPermissionsModelOpen] = useState(false)

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
          project.name === 'default-project' ? 'default-project' : existingProjects.repositoryPath,
          project.name
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

  const tryPushProjectToGithub = async () => {
    try {
      if (project) {
        if (!project.repositoryPath && project.name !== 'default-project') return
        const existingProjects = adminProjects.value.find((p) => p.name === project.name)!
        setProcessing(true)
        await ProjectService.pushProject(project.id)
        setProcessing(false)
        setProject(null!)
        setPopupPushToGithubOpen(false)
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
  }, [user?.id.value, adminProjectState.updateNeeded.value])

  const handleOpenReuploadConfirmation = (row) => {
    setProject(row)
    setPopupReuploadConfirmOpen(true)
  }

  const handleOpenPushConfirmation = (row) => {
    setProject(row)
    setPopupPushToGithubOpen(true)
  }

  const handleOpenInvalidateConfirmation = (row) => {
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

  const handleClosePushModal = () => {
    setProject(null!)
    setPopupPushToGithubOpen(false)
  }

  const handleViewProject = (name: string) => {
    setProjectName(name)
    setShowProjectFiles(true)
  }

  const handleLinkGithubModal = (row) => {
    setProject(row)
    setLinkGithubRepoModalOpen(true)
  }

  const handleCloseLinkGithubModal = () => {
    setProject(null!)
    setLinkGithubRepoModalOpen(false)
  }

  const handleUpdateLinkGithubModal = (row) => {
    setProject(row)
    setUpdateLinkGithubRepoModalOpen(true)
  }

  const handleCloseUpdateLinkGithubModal = () => {
    setProject(null!)
    setUpdateLinkGithubRepoModalOpen(false)
  }

  const handleOpenEditProjectPermissionsModal = (row) => {
    setProject(row)
    setEditProjectPermissionsModelOpen(true)
  }

  const handleCloseEditProjectPermissionsModal = () => {
    setProject(null!)
    setEditProjectPermissionsModelOpen(false)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const createData = (el: ProjectInterface, name: string) => {
    return {
      el,
      name,
      update: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton
              className={styles.iconButton}
              name="update"
              disabled={el.repositoryPath === null && name !== 'default-project'}
              onClick={() => handleOpenReuploadConfirmation(el)}
            >
              <Cached />
            </IconButton>
          )}
        </>
      ),
      push: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton
              className={styles.iconButton}
              name="update"
              disabled={!el.hasWriteAccess}
              onClick={() => handleOpenPushConfirmation(el)}
            >
              <Upload />
            </IconButton>
          )}
        </>
      ),
      link: (
        <>
          {el.repositoryPath && el.repositoryPath !== '' && (
            <IconButton className={styles.iconButton} name="update" onClick={() => handleUpdateLinkGithubModal(el)}>
              <LinkOffIcon />
            </IconButton>
          )}
          {(!el.repositoryPath || el.repositoryPath === '') && (
            <IconButton className={styles.iconButton} name="update" onClick={() => handleLinkGithubModal(el)}>
              <LinkIcon />
            </IconButton>
          )}
        </>
      ),
      projectPermissions: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton
              className={styles.iconButton}
              name="editProjectPermissions"
              onClick={() => handleOpenEditProjectPermissionsModal(el)}
            >
              <Group />
            </IconButton>
          )}
        </>
      ),
      invalidate: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton
              className={styles.iconButton}
              name="invalidate"
              onClick={() => handleOpenInvalidateConfirmation(el)}
            >
              <CleaningServicesIcon />
            </IconButton>
          )}
        </>
      ),
      view: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton className={styles.iconButton} name="view" onClick={() => handleViewProject(name)}>
              <VisibilityIcon />
            </IconButton>
          )}
        </>
      ),
      action: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton className={styles.iconButton} name="remove" onClick={() => handleOpenRemoveConfirmation(el)}>
              <Cross />
            </IconButton>
          )}
        </>
      )
    }
  }

  const rows = adminProjects.value?.map((el) => {
    return createData(el, el.name)
  })

  return (
    <Box className={className}>
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
        open={popupReuploadConfirmOpen}
        description={`${t('admin:components.project.confirmProjectRebuild')} '${project?.name}'?`}
        processing={processing}
        onClose={handleCloseReuploadModal}
        onSubmit={tryReuploadProjects}
      />
      <ConfirmModal
        open={popupPushToGithubOpen}
        description={`${t('admin:components.project.confirmPushProjectToGithub')}? ${project?.name} - ${
          project?.repositoryPath
        }`}
        processing={processing}
        onClose={handleClosePushModal}
        onSubmit={tryPushProjectToGithub}
      />
      <LinkGithubRepoModal open={linkGithubRepoModalOpen} project={project} onClose={handleCloseLinkGithubModal} />
      <UpdateLinkGithubRepoModal
        open={updateLinkGithubRepoModalOpen}
        project={project}
        onClose={handleCloseUpdateLinkGithubModal}
      />
      {project && (
        <EditProjectPermissionsModal
          open={editProjectPermissionsModalOpen}
          project={project}
          onClose={handleCloseEditProjectPermissionsModal}
        />
      )}
      <ConfirmModal
        open={popupInvalidateConfirmOpen}
        description={`${t('admin:components.project.confirmProjectInvalidate')} '${project?.name}'?`}
        processing={processing}
        onClose={handleCloseInvalidateModal}
        onSubmit={handleInvalidateCache}
      />
      <ConfirmModal
        open={popupRemoveConfirmOpen}
        description={`${t('admin:components.project.confirmProjectDelete')} '${project?.name}'?`}
        onClose={handleCloseRemoveModal}
        onSubmit={onRemoveProject}
      />

      {showProjectFiles && projectName && (
        <ViewProjectFiles name={projectName} open onClose={() => setShowProjectFiles(false)} />
      )}
    </Box>
  )
}

export default ProjectTable
