import React, { useEffect, useRef, useState } from 'react'
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
import GithubRepoDrawer from './GithubRepoDrawer'
import UserPermissionDrawer from './UserPermissionDrawer'
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
  const [projectId, setProjectId] = useState(null)
  const [project, setProject] = useState<ProjectInterface>(null!)
  const [projectName, setProjectName] = useState('')
  const [showProjectFiles, setShowProjectFiles] = useState(false)
  const [openGithubRepoDrawer, setOpenGithubRepoDrawer] = useState(false)
  const [openUserPermissionDrawer, setOpenUserPermissionDrawer] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PROJECT_PAGE_LIMIT)

  const adminProjectState = useProjectState()
  const adminProjects = adminProjectState.projects
  const adminProjectCount = adminProjects.value.length
  const authState = useAuthState()
  const user = authState.user

  ProjectService.useAPIListeners()

  useEffect(() => {
    if (user?.id.value != null && adminProjectState.updateNeeded.value === true) {
      ProjectService.fetchProjects()
    }
  }, [user?.id.value, adminProjectState.updateNeeded.value])

  useEffect(() => {
    if (projectId) setProject(adminProjects.value.find((proj) => proj.id === projectId)!)
  }, [adminProjects])

  const handleRemoveProject = async () => {
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

  const handleReuploadProjects = async () => {
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
        setProjectId(null!)
        setPopupReuploadConfirmOpen(false)
      }
    } catch (err) {
      setProcessing(false)
      console.log(err)
    }
  }

  const handlePushProjectToGithub = async () => {
    try {
      if (project) {
        if (!project.repositoryPath && project.name !== 'default-project') return
        setProcessing(true)
        await ProjectService.pushProject(project.id)
        setProcessing(false)
        setProject(null!)
        setProjectId(null!)
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
      setProjectId(null!)
      setPopupInvalidateConfirmOpen(false)
    } catch (err) {
      setProcessing(false)
      console.log(err)
    }
  }

  const handleOpenReuploadConfirmation = (row) => {
    setProject(row)
    setProjectId(row.id)
    setPopupReuploadConfirmOpen(true)
  }

  const handleOpenPushConfirmation = (row) => {
    setProject(row)
    setProjectId(row.id)
    setPopupPushToGithubOpen(true)
  }

  const handleOpenInvalidateConfirmation = (row) => {
    setProject(row)
    setProjectId(row.id)
    setPopupInvalidateConfirmOpen(true)
  }

  const handleOpenRemoveConfirmation = (row) => {
    setProject(row)
    setProjectId(row.id)
    setPopupRemoveConfirmOpen(true)
  }

  const handleCloseReuploadModal = () => {
    setProject(null!)
    setProjectId(null!)
    setPopupReuploadConfirmOpen(false)
  }

  const handleCloseInvalidateModal = () => {
    setProject(null!)
    setProjectId(null!)
    setPopupInvalidateConfirmOpen(false)
  }

  const handleCloseRemoveModal = () => {
    setProject(null!)
    setProjectId(null!)
    setPopupRemoveConfirmOpen(false)
  }

  const handleClosePushModal = () => {
    setProject(null!)
    setProjectId(null!)
    setPopupPushToGithubOpen(false)
  }

  const handleViewProject = (name: string) => {
    setProjectName(name)
    setShowProjectFiles(true)
  }

  const handleOpenGithubRepoDrawer = (row) => {
    setProject(row)
    setProjectId(row.id)
    setOpenGithubRepoDrawer(true)
  }

  const handleCloseGithubRepoDrawer = () => {
    setProject(null!)
    setProjectId(null!)
    setOpenGithubRepoDrawer(false)
  }

  const handleOpenUserPermissionDrawer = (row) => {
    setProject(row)
    setProjectId(row.id)
    setOpenUserPermissionDrawer(true)
  }

  const handleCloseUserPermissionDrawer = () => {
    setProject(null!)
    setProjectId(null!)
    setOpenUserPermissionDrawer(false)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
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
              disabled={!el.hasWriteAccess || !el.repositoryPath}
              onClick={() => handleOpenPushConfirmation(el)}
            >
              <Upload />
            </IconButton>
          )}
        </>
      ),
      link: (
        <>
          <IconButton className={styles.iconButton} name="update" onClick={() => handleOpenGithubRepoDrawer(el)}>
            {el.repositoryPath && <LinkOffIcon />}
            {!el.repositoryPath && <LinkIcon />}
          </IconButton>
        </>
      ),
      projectPermissions: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton
              className={styles.iconButton}
              name="editProjectPermissions"
              onClick={() => handleOpenUserPermissionDrawer(el)}
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
        onSubmit={handleReuploadProjects}
      />

      <ConfirmModal
        open={popupPushToGithubOpen}
        description={`${t('admin:components.project.confirmPushProjectToGithub')}? ${project?.name} - ${
          project?.repositoryPath
        }`}
        processing={processing}
        onClose={handleClosePushModal}
        onSubmit={handlePushProjectToGithub}
      />

      {openGithubRepoDrawer && <GithubRepoDrawer open project={project} onClose={handleCloseGithubRepoDrawer} />}

      {project && (
        <UserPermissionDrawer
          open={openUserPermissionDrawer}
          project={project}
          onClose={handleCloseUserPermissionDrawer}
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
        onSubmit={handleRemoveProject}
      />

      {showProjectFiles && projectName && (
        <ViewProjectFiles name={projectName} open onClose={() => setShowProjectFiles(false)} />
      )}
    </Box>
  )
}

export default ProjectTable
