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
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { projectsColumns } from '../../common/variables/projects'
import styles from '../../styles/admin.module.scss'
import GithubRepoDrawer from './GithubRepoDrawer'
import ProjectFilesDrawer from './ProjectFilesDrawer'
import UserPermissionDrawer from './UserPermissionDrawer'

interface Props {
  className?: string
}

interface ConfirmData {
  open: boolean
  processing: boolean
  description: string
  onSubmit: () => void
}

const defaultConfirm: ConfirmData = {
  open: false,
  processing: false,
  description: '',
  onSubmit: () => {}
}

const ProjectTable = ({ className }: Props) => {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [confirm, setConfirm] = useState({ ...defaultConfirm })
  const [project, setProject] = useState<ProjectInterface | undefined>()
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

  const handleRemoveProject = async () => {
    try {
      if (project) {
        const projectToRemove = adminProjects.value.find((p) => p.name === project?.name)!
        if (projectToRemove) {
          await ProjectService.removeProject(projectToRemove.id)
          handleCloseConfirmation()
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

        handleCloseConfirmation()
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

        handleCloseConfirmation()
      }
    } catch (err) {
      setProcessing(false)
      console.log(err)
    }
  }

  const handleInvalidateCache = async () => {
    try {
      handleCloseConfirmation()

      setProcessing(true)
      await ProjectService.invalidateProjectCache(project!.name)
      setProcessing(false)

      handleCloseConfirmation()
    } catch (err) {
      setProcessing(false)
      console.log(err)
    }
  }

  const openReuploadConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmProjectRebuild')} '${row.name}'?`,
      onSubmit: handleReuploadProjects
    })
  }

  const openPushConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmPushProjectToGithub')}? ${row.name} - ${
        project?.repositoryPath
      }`,
      onSubmit: handlePushProjectToGithub
    })
  }

  const openInvalidateConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmProjectInvalidate')} '${row.name}'?`,
      onSubmit: handleInvalidateCache
    })
  }

  const openRemoveConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: false,
      description: `${t('admin:components.project.confirmProjectDelete')} '${row.name}'?`,
      onSubmit: handleRemoveProject
    })
  }

  const openViewProject = (row) => {
    setProject(row)
    setShowProjectFiles(true)
  }

  const handleOpenGithubRepoDrawer = (row) => {
    setProject(row)
    setOpenGithubRepoDrawer(true)
  }

  const handleOpenUserPermissionDrawer = (row) => {
    setProject(row)
    setOpenUserPermissionDrawer(true)
  }

  const handleCloseGithubRepoDrawer = () => {
    setOpenGithubRepoDrawer(false)
    setProject(undefined)
  }

  const handleCloseUserPermissionDrawer = () => {
    setOpenUserPermissionDrawer(false)
    setProject(undefined)
  }

  const handleCloseConfirmation = () => {
    setConfirm({ ...confirm, open: false })
    setConfirm({ ...defaultConfirm })
    setProject(undefined)
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
              onClick={() => openReuploadConfirmation(el)}
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
              onClick={() => openPushConfirmation(el)}
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
            <IconButton className={styles.iconButton} name="invalidate" onClick={() => openInvalidateConfirmation(el)}>
              <CleaningServicesIcon />
            </IconButton>
          )}
        </>
      ),
      view: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton className={styles.iconButton} name="view" onClick={() => openViewProject(el)}>
              <VisibilityIcon />
            </IconButton>
          )}
        </>
      ),
      action: (
        <>
          {user.userRole.value === 'admin' && (
            <IconButton className={styles.iconButton} name="remove" onClick={() => openRemoveConfirmation(el)}>
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

      {openGithubRepoDrawer && project && (
        <GithubRepoDrawer open project={project} onClose={handleCloseGithubRepoDrawer} />
      )}

      {project && (
        <UserPermissionDrawer
          open={openUserPermissionDrawer}
          project={project}
          onClose={handleCloseUserPermissionDrawer}
        />
      )}

      {showProjectFiles && project && (
        <ProjectFilesDrawer open selectedProject={project} onClose={() => setShowProjectFiles(false)} />
      )}

      <ConfirmDialog
        open={confirm.open}
        description={confirm.description}
        onClose={handleCloseConfirmation}
        onSubmit={confirm.onSubmit}
      />
    </Box>
  )
}

export default ProjectTable
