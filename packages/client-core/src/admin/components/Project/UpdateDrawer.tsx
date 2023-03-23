import classNames from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { BuilderTag } from '@etherealengine/common/src/interfaces/BuilderTags'
import {
  DefaultUpdateSchedule,
  ProjectInterface,
  ProjectUpdateType
} from '@etherealengine/common/src/interfaces/ProjectInterface'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { ProjectService, ProjectState } from '../../../common/services/ProjectService'
import DrawerView from '../../common/DrawerView'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import styles from '../../styles/admin.module.scss'
import ProjectFields from './ProjectFields'

interface Props {
  open: boolean
  builderTags: BuilderTag[]
  onClose: () => void
}

const UpdateDrawer = ({ open, builderTags, onClose }: Props) => {
  const { t } = useTranslation()
  const error = useHookstate('')
  const selectedTag = useHookstate('')
  const updateProjects = useHookstate(false)
  const projectsToUpdate = useHookstate(new Map())
  const submitDisabled = useHookstate(true)
  const processing = useHookstate(false)

  const adminProjectState = useHookstate(getMutableState(ProjectState))
  const adminProjects = adminProjectState.projects
  const engineCommit = adminProjectState.builderInfo.engineCommit

  const projectUpdateStatus = useHookstate(getMutableState(ProjectUpdateState))

  const handleClose = () => {
    error.set('')
    selectedTag.set('')
    updateProjects.set(false)
    adminProjects.get({ noproxy: true }).forEach((adminProject) => {
      if (projectsToUpdate.get({ noproxy: true }).get(adminProject.name))
        ProjectUpdateService.clearProjectUpdate(adminProject)
    })
    projectsToUpdate.set(new Map())
    processing.set(false)
    onClose()
  }

  const handleTagChange = async (e) => {
    selectedTag.set(e.target.value)
  }

  const tagMenu: InputMenuItem[] = builderTags.map((el) => {
    const pushedDate = new Date(el.pushedAt).toLocaleString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
    return {
      value: el.tag,
      label: `Commit ${el.commitSHA.slice(0, 8)} -- ${el.tag === engineCommit.value ? '(Current) ' : ''}Version ${
        el.engineVersion
      } -- Pushed ${pushedDate}`
    }
  })

  const handleSubmit = async () => {
    processing.set(true)
    await ProjectService.updateEngine(
      selectedTag.value,
      updateProjects.value,
      Object.keys(projectUpdateStatus.value).map((name) => {
        return {
          name: projectUpdateStatus[name].projectName.value,
          sourceURL: projectUpdateStatus[name].sourceURL.value,
          destinationURL: projectUpdateStatus[name].destinationURL.value,
          reset: true,
          commitSHA: projectUpdateStatus[name].selectedSHA.value,
          sourceBranch: projectUpdateStatus[name].selectedBranch.value,
          updateType: projectUpdateStatus[name].updateType.value || ('none' as ProjectUpdateType),
          updateSchedule: projectUpdateStatus[name].updateSchedule.value || DefaultUpdateSchedule
        }
      })
    )
    processing.set(false)
    handleClose()
  }

  const toggleProjectToUpdate = async (e: React.ChangeEvent<HTMLInputElement>, project: ProjectInterface) => {
    const thisProjectName = project.name
    const newProjects = new Map(projectsToUpdate.get({ noproxy: true }))
    if (newProjects.get(thisProjectName)) {
      newProjects.delete(thisProjectName)
      ProjectUpdateService.clearProjectUpdate(project)
    } else {
      newProjects.set(thisProjectName, true)
      ProjectUpdateService.initializeProjectUpdate(project)
      ProjectUpdateService.setTriggerSetDestination(project, project.repositoryPath)
    }
    projectsToUpdate.set(newProjects)
  }

  useEffect(() => {
    const invalidProjects =
      Object.keys(projectUpdateStatus.value)
        .map((projectName) => projectUpdateStatus[projectName]?.submitDisabled.value)
        .indexOf(true) > -1
    submitDisabled.set(selectedTag?.value?.length === 0 || invalidProjects)
  }, [selectedTag?.value, projectUpdateStatus])

  useEffect(() => {
    const matchingTag = builderTags.find((tag) => tag.tag === engineCommit.value)
    if (open && engineCommit.value && matchingTag && selectedTag.value.length === 0) selectedTag.set(engineCommit.value)
  }, [open, engineCommit.value, builderTags])

  return (
    <DrawerView open={open} onClose={handleClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle
          className={classNames({
            [styles.textAlign]: true,
            [styles.drawerHeader]: true
          })}
        >
          {' '}
          {t('admin:components.project.updateEngine')}
        </DialogTitle>

        {
          <InputSelect
            name="commitData"
            label={t('admin:components.project.commitData')}
            value={selectedTag.value}
            menu={tagMenu}
            error={error.value}
            onChange={handleTagChange}
          />
        }

        <FormControlLabel
          control={
            <Checkbox checked={updateProjects.value} onChange={() => updateProjects.set(!updateProjects.value)} />
          }
          label={t('admin:components.project.updateSelector')}
        />

        {updateProjects.value && (
          <>
            <div className={styles.projectUpdateWarning}>
              <Icon type="WarningAmber" />
              {t('admin:components.project.projectWarning')}
            </div>
            <div className={styles.projectSelector}>
              {adminProjects
                .get({ noproxy: true })
                ?.filter((project) => project.name !== 'default-project' && project.repositoryPath?.length > 0)
                .map((project) => (
                  <div key={project.id} className={styles.projectUpdateContainer}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectsToUpdate.get({ noproxy: true }).get(project.name)}
                          onChange={(e) => toggleProjectToUpdate(e, project)}
                        />
                      }
                      label={project.name}
                    />

                    {projectsToUpdate.get({ noproxy: true }).get(project.name) && projectUpdateStatus[project.name] && (
                      <ProjectFields
                        inputProject={project}
                        existingProject={true}
                        changeDestination={false}
                        processing={processing.value}
                      />
                    )}
                  </div>
                ))}
            </div>
          </>
        )}

        <DialogActions>
          <>
            <Button className={styles.outlinedButton} onClick={handleClose}>
              {t('admin:components.common.cancel')}
            </Button>
            {!processing.value && (
              <Button className={styles.gradientButton} disabled={submitDisabled.value} onClick={handleSubmit}>
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

export default UpdateDrawer
