import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { BuilderTag } from '@etherealengine/common/src/interfaces/BuilderTags'
import {
  DefaultUpdateSchedule,
  ProjectInterface,
  ProjectUpdateType
} from '@etherealengine/common/src/interfaces/ProjectInterface'
import Button from '@etherealengine/ui/src/Button'
import Checkbox from '@etherealengine/ui/src/Checkbox'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import FormControlLabel from '@etherealengine/ui/src/FormControlLabel'
import Icon from '@etherealengine/ui/src/Icon'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import DrawerView from '../../common/DrawerView'
import { ProjectUpdateService, useProjectUpdateState } from '../../services/ProjectUpdateService'
import styles from '../../styles/admin.module.scss'
import ProjectFields from './ProjectFields'

interface Props {
  open: boolean
  builderTags: BuilderTag[]
  onClose: () => void
}

const UpdateDrawer = ({ open, builderTags, onClose }: Props) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [updateProjects, setUpdateProjects] = useState(false)
  const [projectsToUpdate, setProjectsToUpdate] = useState(new Map())
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [processing, setProcessing] = useState(false)

  const adminProjectState = useProjectState()
  const adminProjects = adminProjectState.projects
  const engineCommit = adminProjectState.builderInfo.engineCommit

  const projectUpdateStatus = useProjectUpdateState()

  const handleClose = () => {
    setError('')
    setSelectedTag('')
    setUpdateProjects(false)
    adminProjects.value.forEach((adminProject) => {
      if (projectsToUpdate.get(adminProject.name)) ProjectUpdateService.clearProjectUpdate(adminProject)
    })
    setProjectsToUpdate(new Map())
    setProcessing(false)
    onClose()
  }

  const handleTagChange = async (e) => {
    setSelectedTag(e.target.value)
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
    setProcessing(true)
    await ProjectService.updateEngine(
      selectedTag,
      updateProjects,
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
    setProcessing(false)
    handleClose()
  }

  const toggleProjectToUpdate = async (e: React.ChangeEvent<HTMLInputElement>, project: ProjectInterface) => {
    const thisProjectName = project.name
    const newProjects = new Map(projectsToUpdate)
    if (newProjects.get(thisProjectName)) {
      newProjects.delete(thisProjectName)
      ProjectUpdateService.clearProjectUpdate(project)
    } else {
      newProjects.set(thisProjectName, true)
      ProjectUpdateService.initializeProjectUpdate(project)
      ProjectUpdateService.setTriggerSetDestination(project, project.repositoryPath)
    }
    setProjectsToUpdate(newProjects)
  }

  useEffect(() => {
    const invalidProjects =
      Object.keys(projectUpdateStatus.value)
        .map((projectName) => projectUpdateStatus[projectName]?.submitDisabled.value)
        .indexOf(true) > -1
    setSubmitDisabled(selectedTag?.length === 0 || invalidProjects)
  }, [selectedTag, projectUpdateStatus])

  useEffect(() => {
    const matchingTag = builderTags.find((tag) => tag.tag === engineCommit.value)
    if (open && engineCommit.value && matchingTag && selectedTag.length === 0) setSelectedTag(engineCommit.value)
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
            value={selectedTag}
            menu={tagMenu}
            error={error}
            onChange={handleTagChange}
          />
        }

        <FormControlLabel
          control={<Checkbox checked={updateProjects} onChange={() => setUpdateProjects(!updateProjects)} />}
          label={t('admin:components.project.updateSelector')}
        />

        {updateProjects && (
          <>
            <div className={styles.projectUpdateWarning}>
              <Icon type="WarningAmber" />
              {t('admin:components.project.projectWarning')}
            </div>
            <div className={styles.projectSelector}>
              {adminProjects.value
                ?.filter((project) => project.name !== 'default-project' && project.repositoryPath?.length > 0)
                .map((project) => (
                  <div className={styles.projectUpdateContainer}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectsToUpdate.get(project.name)}
                          onChange={(e) => toggleProjectToUpdate(e, project)}
                        />
                      }
                      label={project.name}
                    />

                    {projectsToUpdate.get(project.name) && projectUpdateStatus[project.name] && (
                      <ProjectFields
                        inputProject={project}
                        existingProject={true}
                        changeDestination={false}
                        processing={processing}
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
            {!processing && (
              <Button className={styles.gradientButton} disabled={submitDisabled} onClick={handleSubmit}>
                {t('admin:components.common.submit')}
              </Button>
            )}
            {processing && (
              <LoadingView title={t('admin:components.project.processing')} variant="body1" fullHeight={false} />
            )}
          </>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default UpdateDrawer
