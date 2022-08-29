import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import multiLogger from '@xrengine/common/src/logger'

import Cached from '@mui/icons-material/Cached'
import Cross from '@mui/icons-material/Cancel'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import Download from '@mui/icons-material/Download'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Group from '@mui/icons-material/Group'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Upload from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { PROJECT_PAGE_LIMIT, ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { projectsColumns } from '../../common/variables/projects'
import { useClientSettingState } from '../../services/Setting/ClientSettingService'
import styles from '../../styles/admin.module.scss'
import GithubRepoDrawer from './GithubRepoDrawer'
import ProjectFilesDrawer from './ProjectFilesDrawer'
import UserPermissionDrawer from './UserPermissionDrawer'

const logger = multiLogger.child({ component: 'client-core:ProjectTable' })

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
  const [project, _setProject] = useState<ProjectInterface | undefined>()
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
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []

  const projectRef = useRef(project)

  const setProject = (project: ProjectInterface | undefined) => {
    projectRef.current = project
    _setProject(project)
  }

  ProjectService.useAPIListeners()

  useEffect(() => {
    if (project) setProject(adminProjects.value.find((proj) => proj.name === project.name)!)
  }, [adminProjects])

  const handleRemoveProject = async () => {
    try {
      if (projectRef.current) {
        const projectToRemove = adminProjects.value.find((p) => p.name === projectRef.current?.name)!
        if (projectToRemove) {
          await ProjectService.removeProject(projectToRemove.id)
          handleCloseConfirmation()
        } else {
          throw new Error('Failed to find the project')
        }
      }
    } catch (err) {
      logger.error(err)
    }
  }

  const handleReuploadProjects = async (reset?: boolean) => {
    try {
      if (projectRef.current) {
        if (!projectRef.current.repositoryPath && projectRef.current.name !== 'default-project') return

        const existingProjects = adminProjects.value.find((p) => p.name === projectRef.current!.name)!
        setProcessing(true)
        await ProjectService.uploadProject(
          projectRef.current.name === 'default-project' ? 'default-project' : existingProjects.repositoryPath,
          projectRef.current.name,
          reset
        )
        setProcessing(false)

        handleCloseConfirmation()
      }
    } catch (err) {
      setProcessing(false)
      logger.error(err)
    }
  }

  const handlePushProjectToGithub = async () => {
    try {
      if (projectRef.current) {
        if (!projectRef.current.repositoryPath && projectRef.current.name !== 'default-project') return

        setProcessing(true)
        await ProjectService.pushProject(projectRef.current.id)
        setProcessing(false)

        handleCloseConfirmation()
      }
    } catch (err) {
      setProcessing(false)
      logger.error(err)
    }
  }

  const handleInvalidateCache = async () => {
    try {
      setProcessing(true)
      await ProjectService.invalidateProjectCache(projectRef.current!.name)
      setProcessing(false)

      handleCloseConfirmation()
    } catch (err) {
      setProcessing(false)
      logger.error(err)
    }
  }

  const openMainResetConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmProjectResetMain1')} '${row.name}' ${t(
        'admin:components.project.confirmProjectResetMain2'
      )} '${clientSetting.releaseName}-deployment', ${t('admin:components.project.confirmProjectResetMain3')}`,
      onSubmit: () => handleReuploadProjects(true)
    })
  }

  const openReuploadConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmProjectRebuild')} '${row.name}'?`,
      onSubmit: () => handleReuploadProjects(false)
    })
  }

  const openPushConfirmation = (row) => {
    setProject(row)

    setConfirm({
      open: true,
      processing: processing,
      description: `${t('admin:components.project.confirmPushProjectToGithub')}? ${row.name} - ${row.repositoryPath}`,
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

  const isAdmin = user.scopes?.value?.find((scope) => scope.type === 'admin:admin')

  const createData = (el: ProjectInterface, name: string) => {
    return {
      el,
      name: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span className={`${el.needsRebuild ? styles.orangeColor : ''}`}>{name}</span>
          {el.needsRebuild && (
            <Tooltip title={t('admin:components.project.outdatedBuild')} arrow>
              <ErrorOutlineIcon sx={{ marginLeft: 1 }} className={styles.orangeColor} />
            </Tooltip>
          )}
        </Box>
      ),
      update: (
        <>
          {isAdmin && (
            <IconButton
              className={styles.iconButton}
              name="update"
              disabled={el.repositoryPath === null && name !== 'default-project'}
              onClick={() => openReuploadConfirmation(el)}
            >
              <Download />
            </IconButton>
          )}
        </>
      ),
      push: (
        <>
          {isAdmin && (
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
          {isAdmin && (
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
          {isAdmin && (
            <IconButton className={styles.iconButton} name="invalidate" onClick={() => openInvalidateConfirmation(el)}>
              <CleaningServicesIcon />
            </IconButton>
          )}
        </>
      ),
      view: (
        <>
          {isAdmin && (
            <IconButton className={styles.iconButton} name="view" onClick={() => openViewProject(el)}>
              <VisibilityIcon />
            </IconButton>
          )}
        </>
      ),
      reset: (
        <>
          {isAdmin && (
            <IconButton
              className={styles.iconButton}
              name="resetToMain"
              disabled={el.repositoryPath === null && name !== 'default-project'}
              onClick={() => openMainResetConfirmation(el)}
            >
              <Cached />
            </IconButton>
          )}
        </>
      ),
      action: (
        <>
          {isAdmin && (
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
