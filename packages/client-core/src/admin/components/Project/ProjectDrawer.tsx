import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import {
  DefaultUpdateSchedule,
  ProjectInterface,
  ProjectUpdateType
} from '@etherealengine/common/src/interfaces/ProjectInterface'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import DrawerView from '../../common/DrawerView'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import styles from '../../styles/admin.module.scss'
import ProjectFields from './ProjectFields'

interface Props {
  open: boolean
  inputProject?: ProjectInterface | null
  existingProject?: boolean
  onClose: () => void
  changeDestination?: boolean
}

const ProjectDrawer = ({ open, inputProject, existingProject = false, onClose, changeDestination = false }: Props) => {
  const { t } = useTranslation()
  const processing = useHookstate(false)

  const project =
    existingProject && inputProject
      ? inputProject
      : {
          id: '',
          name: 'tempProject',
          thumbnail: '',
          repositoryPath: '',
          needsRebuild: false,
          updateType: 'none' as ProjectUpdateType,
          updateSchedule: DefaultUpdateSchedule,
          commitSHA: '',
          commitDate: new Date()
        }

  const projectUpdateStatus = useHookstate(getMutableState(ProjectUpdateState)[project.name]).value

  const handleSubmit = async () => {
    try {
      if (existingProject && changeDestination) {
        if (inputProject) await ProjectService.setRepositoryPath(inputProject.id, projectUpdateStatus.destinationURL)
        handleClose()
      } else if (projectUpdateStatus.sourceURL) {
        processing.set(true)
        await ProjectService.uploadProject(
          projectUpdateStatus.sourceURL,
          projectUpdateStatus.destinationURL,
          projectUpdateStatus.projectName,
          true,
          projectUpdateStatus.selectedSHA,
          projectUpdateStatus.selectedBranch,
          projectUpdateStatus.updateType,
          projectUpdateStatus.updateSchedule
        )
        processing.set(false)
        handleClose()
      }
    } catch (err) {
      processing.set(false)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleClose = () => {
    ProjectUpdateService.clearProjectUpdate(project)
    onClose()
  }

  useEffect(() => {
    if (open && inputProject) {
      ProjectUpdateService.setTriggerSetDestination(project, inputProject.repositoryPath)
    }
  }, [open])

  return (
    <DrawerView open={open} onClose={handleClose}>
      <ProjectFields
        inputProject={inputProject}
        existingProject={existingProject}
        changeDestination={changeDestination}
        processing={processing.value}
      />

      <Container maxWidth="sm" className={styles.mt10}>
        <DialogActions>
          <>
            <Button className={styles.outlinedButton} onClick={handleClose}>
              {t('admin:components.common.cancel')}
            </Button>
            {!processing.value && (
              <Button
                className={styles.gradientButton}
                disabled={projectUpdateStatus ? projectUpdateStatus.submitDisabled : true}
                onClick={handleSubmit}
              >
                {t('admin:components.common.submit')}
              </Button>
            )}

            {processing.value && (
              <LoadingView title={t('admin:components.project.processing')} variant="body1" fullHeight={false} />
            )}
          </>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default ProjectDrawer
