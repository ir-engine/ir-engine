/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { DefaultUpdateSchedule } from '@etherealengine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectType } from '@etherealengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import styles from '../../old-styles/admin.module.scss'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import DrawerView from '../DrawerView'
import ProjectFields from './ProjectFields'

interface Props {
  open: boolean
  inputProject?: ProjectType | null
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
          updateType: 'none' as ProjectType['updateType'],
          updateSchedule: DefaultUpdateSchedule,
          commitSHA: '',
          commitDate: new Date()
        }

  const projectUpdateStatus = useHookstate(getMutableState(ProjectUpdateState)[project.name]).value

  const handleSubmit = () => {
    try {
      if (existingProject && changeDestination) {
        if (inputProject) ProjectService.setRepositoryPath(inputProject.id, projectUpdateStatus.destinationURL)
        handleClose()
      } else if (projectUpdateStatus.sourceURL) {
        processing.set(true)
        ProjectService.uploadProject({
          sourceURL: projectUpdateStatus.sourceURL,
          destinationURL: projectUpdateStatus.destinationURL,
          name: projectUpdateStatus.projectName,
          reset: true,
          commitSHA: projectUpdateStatus.selectedSHA,
          sourceBranch: projectUpdateStatus.selectedBranch,
          updateType: projectUpdateStatus.updateType,
          updateSchedule: projectUpdateStatus.updateSchedule
        })
        processing.set(false)
        handleClose()
      }
    } catch (err) {
      processing.set(false)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleClose = () => {
    ProjectUpdateService.clearProjectUpdate(project.name)
    onClose()
  }

  useEffect(() => {
    if (open && inputProject && projectUpdateStatus?.triggerSetDestination?.length === 0) {
      ProjectUpdateService.setTriggerSetDestination(
        project.name,
        inputProject.repositoryPath,
        inputProject.updateType,
        inputProject.updateSchedule
      )
    }
  }, [open, projectUpdateStatus?.triggerSetDestination])

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

            {processing.value && <LoadingView className="h-6 w-6" title={t('admin:components.project.processing')} />}
          </>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default ProjectDrawer
