import classNames from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Autocomplete from '@xrengine/client-core/src/common/components/AutoCompleteSingle'
import InputSelect, { InputMenuItem } from '@xrengine/client-core/src/common/components/InputSelect'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import LoadingView from '@xrengine/client-core/src/common/components/LoadingView'
import { ProjectBranchInterface } from '@xrengine/common/src/interfaces/ProjectBranchInterface'
import { ProjectCommitInterface } from '@xrengine/common/src/interfaces/ProjectCommitInterface'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import { Difference } from '@mui/icons-material'
import Cancel from '@mui/icons-material/Cancel'
import CheckCircle from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import { ProjectService } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { ProjectUpdateService, useProjectUpdateState } from '../../services/ProjectUpdateService'
import styles from '../../styles/admin.module.scss'

interface Props {
  inputProject?: ProjectInterface | null | undefined
  existingProject?: boolean | undefined
  changeDestination?: boolean | undefined
  processing: boolean
}

const ProjectFields = ({ inputProject, existingProject = false, changeDestination = false, processing }: Props) => {
  const { t } = useTranslation()

  const project =
    existingProject && inputProject
      ? inputProject
      : {
          id: '',
          name: 'tempProject',
          thumbnail: '',
          repositoryPath: '',
          needsRebuild: false,
          commitSHA: '',
          commitDate: new Date()
        }

  useEffect(() => {
    ProjectUpdateService.initializeProjectUpdate(project)
  }, [])

  const projectUpdateStatus = useProjectUpdateState()[project.name]

  const selfUser = useAuthState().user

  const matchingCommit = projectUpdateStatus?.value?.commitData?.find(
    (commit: ProjectCommitInterface) => commit.commitSHA === projectUpdateStatus.value.selectedSHA
  )
  const matchesEngineVersion = matchingCommit ? (matchingCommit as ProjectCommitInterface).matchesEngineVersion : false

  const handleChangeSource = (e) => {
    const { value } = e.target
    ProjectUpdateService.setSourceURLError(project, value ? '' : t('admin:components.project.urlRequired'))
    ProjectUpdateService.setSourceURL(project, value)
  }

  const handleChangeDestination = (e) => {
    const { value } = e.target
    ProjectUpdateService.setDestinationError(project, value ? '' : t('admin:components.project.urlRequired'))
    ProjectUpdateService.setDestinationURL(project, value)
  }

  const handleChangeSourceRepo = async (e) => {
    try {
      ProjectUpdateService.resetSourceState(project, { resetSourceURL: false })
      ProjectUpdateService.setBranchProcessing(project, true)
      const branchResponse = (await ProjectService.fetchProjectBranches(e.target.value)) as any
      ProjectUpdateService.setBranchProcessing(project, false)
      if (branchResponse.error) {
        ProjectUpdateService.setShowBranchSelector(project, false)
        ProjectUpdateService.setSourceURLError(project, branchResponse.text)
      } else {
        ProjectUpdateService.setShowBranchSelector(project, true)
        ProjectUpdateService.setBranchData(project, branchResponse)
      }
    } catch (err) {
      ProjectUpdateService.setBranchProcessing(project, false)
      ProjectUpdateService.setShowBranchSelector(project, false)
      ProjectUpdateService.setBranchError(project, err.message)
      console.log('Branch fetch error', err)
    }
  }

  const copyDestination = async () => {
    handleChangeSource({ target: { value: projectUpdateStatus.destinationURL.value } })
    handleChangeSourceRepo({ target: { value: projectUpdateStatus.destinationURL.value } })
  }

  const handleChangeDestinationRepo = async (e) => {
    if (e.target.value && e.target.value.length > 0) {
      try {
        ProjectUpdateService.resetDestinationState(project, { resetDestinationURL: false })
        ProjectUpdateService.setDestinationValid(project, false)
        ProjectUpdateService.setDestinationProcessing(project, true)
        const destinationResponse = await ProjectService.checkDestinationURLValid({
          url: e.target.value,
          inputProjectURL: inputProject?.repositoryPath
        })
        ProjectUpdateService.setDestinationProcessing(project, false)
        if (destinationResponse.error) {
          ProjectUpdateService.setDestinationValid(project, false)
          ProjectUpdateService.setDestinationError(project, destinationResponse.text)
        } else {
          if (destinationResponse.destinationValid) {
            if (existingProject && changeDestination) ProjectUpdateService.setSubmitDisabled(project, false)
            ProjectUpdateService.setDestinationValid(project, destinationResponse.destinationValid)
            if (destinationResponse.projectName)
              ProjectUpdateService.setDestinationProjectName(project, destinationResponse.projectName)
            if (destinationResponse.repoEmpty) ProjectUpdateService.setDestinationRepoEmpty(project, true)
            if (projectUpdateStatus.value.selectedSHA.length > 0)
              handleCommitChange({ target: { value: projectUpdateStatus.value.selectedSHA } })
          } else {
            ProjectUpdateService.setDestinationValid(project, false)
            ProjectUpdateService.setDestinationError(project, destinationResponse.text)
          }
        }
      } catch (err) {
        ProjectUpdateService.setDestinationProcessing(project, false)
        ProjectUpdateService.setDestinationValid(project, false)
        ProjectUpdateService.setDestinationError(project, err.message)
        console.log('Destination error', err)
      }
    }
  }

  const handleChangeBranch = async (e) => {
    try {
      ProjectUpdateService.resetSourceState(project, { resetSourceURL: false, resetBranch: false })
      ProjectUpdateService.setSelectedBranch(project, e.target.value)
      ProjectUpdateService.setCommitsProcessing(project, true)
      const projectResponse = (await ProjectService.fetchProjectCommits(
        projectUpdateStatus.value.sourceURL,
        e.target.value
      )) as any
      ProjectUpdateService.setCommitsProcessing(project, false)
      if (projectResponse.error) {
        ProjectUpdateService.setShowCommitSelector(project, false)
        ProjectUpdateService.setBranchError(project, projectResponse.text)
      } else {
        ProjectUpdateService.setShowCommitSelector(project, true)
        ProjectUpdateService.setCommitData(project, projectResponse)
      }
    } catch (err) {
      ProjectUpdateService.setCommitsProcessing(project, false)
      ProjectUpdateService.setShowCommitSelector(project, false)
      ProjectUpdateService.setBranchError(project, err.message)
      console.log('projectResponse error', err)
    }
  }

  const hasGithubProvider = selfUser?.identityProviders?.value?.find((ip) => ip.type === 'github')

  const handleCommitChange = async (e) => {
    const selectedSHA = e.target.value
    ProjectUpdateService.setSourceVsDestinationChecked(project, false)
    ProjectUpdateService.setSelectedSHA(project, selectedSHA)
    if (selectedSHA === '') {
      ProjectUpdateService.setSourceValid(project, false)
      ProjectUpdateService.setCommitError(project, '')
      ProjectUpdateService.setSourceProjectName(project, '')
      return
    }
    const valueRegex = new RegExp(`^${e.target.value}`, 'g')
    let matchingCommit = (projectUpdateStatus.value.commitData as any).find((data) => valueRegex.test(data.commitSHA))
    if (!matchingCommit) {
      const commitResponse = (await ProjectService.checkUnfetchedCommit({
        url: projectUpdateStatus.value.sourceURL,
        selectedSHA
      })) as any
      if (commitResponse.error) {
        ProjectUpdateService.setCommitError(project, commitResponse.text)
        ProjectUpdateService.setSourceProjectName(project, '')
        return
      } else {
        ProjectUpdateService.mergeCommitData(project, commitResponse)
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 100)
        })
        matchingCommit = (projectUpdateStatus.value.commitData as any).find((data) => valueRegex.test(data.commitSHA))
      }
    }
    ProjectUpdateService.setSourceProjectName(project, matchingCommit?.projectName || '')
    ProjectUpdateService.setCommitError(project, '')
    ProjectUpdateService.setSourceValid(project, true)
  }

  const branchMenu: InputMenuItem[] = projectUpdateStatus?.value?.branchData.map((el: ProjectBranchInterface) => {
    return {
      value: el.name,
      label: `Branch: ${el.name} ${
        el.branchType === 'main' ? '(Main branch)' : el.branchType === 'deployment' ? '(Deployment branch)' : ''
      }`
    }
  })

  const commitMenu: InputMenuItem[] = projectUpdateStatus?.value?.commitData.map((el: ProjectCommitInterface) => {
    let label = `Commit ${el.commitSHA.slice(0, 8)}`
    if (el.projectVersion) label += ` -- Project Ver. ${el.projectVersion}`
    if (el.engineVersion) label += ` -- Engine Ver. ${el.engineVersion}`
    if (el.datetime) {
      const datetime = new Date(el.datetime).toLocaleString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
      label += ` -- Pushed ${datetime}`
    }
    return {
      value: el.commitSHA,
      label
    }
  })

  useEffect(() => {
    if (
      projectUpdateStatus?.value?.destinationValid &&
      projectUpdateStatus?.value?.sourceValid &&
      !projectUpdateStatus?.value?.sourceVsDestinationChecked
    ) {
      ProjectUpdateService.setSourceVsDestinationProcessing(project, true)
      ProjectService.checkSourceMatchesDestination({
        sourceURL: projectUpdateStatus.value.sourceURL || '',
        selectedSHA: projectUpdateStatus.value.selectedSHA || '',
        destinationURL: projectUpdateStatus.value.destinationURL || '',
        existingProject: existingProject || false
      }).then((res) => {
        ProjectUpdateService.setSourceVsDestinationChecked(project, true)
        ProjectUpdateService.setSourceVsDestinationProcessing(project, false)
        if (res.error || res.message) {
          ProjectUpdateService.setProjectName(project, '')
          ProjectUpdateService.setSubmitDisabled(project, true)
          ProjectUpdateService.setSourceProjectMatchesDestination(project, false)
          ProjectUpdateService.setSourceVsDestinationError(project, res.text)
          ProjectUpdateService.setSourceValid(project, false)
        } else {
          ProjectUpdateService.setProjectName(project, res.projectName)
          ProjectUpdateService.setSubmitDisabled(project, !res.sourceProjectMatchesDestination)
          ProjectUpdateService.setSourceProjectMatchesDestination(project, res.sourceProjectMatchesDestination)
          ProjectUpdateService.setSourceVsDestinationError(project, '')
          ProjectUpdateService.setSourceValid(project, true)
        }
      })
    } else {
      if (!projectUpdateStatus?.value?.sourceVsDestinationChecked && !(existingProject && changeDestination)) {
        ProjectUpdateService.setSourceVsDestinationProcessing(project, false)
        ProjectUpdateService.setSourceVsDestinationChecked(project, false)
        ProjectUpdateService.setProjectName(project, '')
        ProjectUpdateService.setSubmitDisabled(project, true)
        ProjectUpdateService.setSourceProjectMatchesDestination(project, false)
      }
    }
  }, [
    projectUpdateStatus?.value?.destinationValid,
    projectUpdateStatus?.value?.sourceValid,
    projectUpdateStatus?.value?.sourceVsDestinationChecked
  ])

  useEffect(() => {
    if (projectUpdateStatus?.value?.triggerSetDestination?.length > 0) {
      ProjectUpdateService.setDestinationURL(project, projectUpdateStatus.value.triggerSetDestination)
      handleChangeDestinationRepo({
        target: {
          value: projectUpdateStatus.value.triggerSetDestination
        }
      })
    }
  }, [projectUpdateStatus?.value?.triggerSetDestination])

  return (
    <>
      {projectUpdateStatus && (
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle
            className={classNames({
              [styles.textAlign]: true,
              [styles.drawerHeader]: true
            })}
          >
            {' '}
            {existingProject && !changeDestination
              ? t('admin:components.project.updateProject')
              : existingProject && changeDestination
              ? t('admin:components.project.changeDestination')
              : t('admin:components.project.addProject')}
          </DialogTitle>

          <DialogTitle
            className={classNames({
              [styles.textAlign]: true,
              [styles.drawerSubHeader]: true
            })}
          >
            {t('admin:components.project.destination')}
          </DialogTitle>

          {hasGithubProvider ? (
            <InputText
              name="urlSelect"
              label={t('admin:components.project.githubUrl')}
              value={projectUpdateStatus.value?.destinationURL}
              error={projectUpdateStatus.value?.destinationError}
              placeholder="https://github.com/{user}/{repo}"
              disabled={(existingProject || false) && !changeDestination}
              onChange={handleChangeDestination}
              onBlur={handleChangeDestinationRepo}
            />
          ) : (
            <div className={styles.textAlign}>{t('admin:components.project.needsGithubProvider')}</div>
          )}

          {!projectUpdateStatus.value?.destinationProcessing &&
            projectUpdateStatus.value?.destinationProjectName.length > 0 && (
              <div className={styles.projectVersion}>{`${t('admin:components.project.destinationProjectName')}: ${
                projectUpdateStatus.value.destinationProjectName
              }`}</div>
            )}
          {!projectUpdateStatus.value?.destinationProcessing && projectUpdateStatus.value?.destinationRepoEmpty && (
            <div className={styles.projectVersion}>{t('admin:components.project.destinationRepoEmpty')}</div>
          )}
          {projectUpdateStatus.value?.destinationProcessing && (
            <LoadingView
              title={t('admin:components.project.destinationProcessing')}
              variant="body1"
              flexDirection="row"
              fullHeight={false}
            />
          )}

          {!changeDestination && (
            <DialogTitle
              className={classNames({
                [styles.textAlign]: true,
                [styles.drawerSubHeader]: true
              })}
            >
              {t('admin:components.project.source')}
            </DialogTitle>
          )}

          {!changeDestination && (
            <div>
              {hasGithubProvider ? (
                <div className={styles.sourceContainer}>
                  <InputText
                    name="urlSelect"
                    label={t('admin:components.project.githubUrl')}
                    value={projectUpdateStatus.value?.sourceURL}
                    placeholder="https://github.com/{user}/{repo}"
                    error={projectUpdateStatus.value?.sourceURLError}
                    onChange={handleChangeSource}
                    onBlur={handleChangeSourceRepo}
                  />
                  <Tooltip title="Copy From Destination">
                    <IconButton className={styles.gradientButton} onClick={copyDestination}>
                      <Difference />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : (
                <div className={styles.textAlign}>{t('admin:components.project.needsGithubProvider')}</div>
              )}

              {!processing &&
                !projectUpdateStatus.value?.branchProcessing &&
                projectUpdateStatus.value?.branchData &&
                projectUpdateStatus.value?.branchData.length > 0 &&
                projectUpdateStatus.value?.showBranchSelector && (
                  <InputSelect
                    name="branchData"
                    label={t('admin:components.project.branchData')}
                    value={projectUpdateStatus.value?.selectedBranch}
                    menu={branchMenu}
                    error={projectUpdateStatus.value?.branchError}
                    onChange={handleChangeBranch}
                  />
                )}
              {!processing &&
                !projectUpdateStatus.value?.commitsProcessing &&
                projectUpdateStatus.value?.commitData &&
                projectUpdateStatus.value?.commitData.length > 0 &&
                projectUpdateStatus.value?.showCommitSelector && (
                  <Autocomplete
                    freeSolo={true}
                    data={commitMenu}
                    label={t('admin:components.project.commitData')}
                    value={projectUpdateStatus.value?.selectedSHA}
                    onChange={handleCommitChange}
                    error={projectUpdateStatus.value?.commitError}
                  />
                )}
            </div>
          )}

          {!processing &&
            !projectUpdateStatus.value?.commitsProcessing &&
            projectUpdateStatus.value?.sourceProjectName.length > 0 && (
              <div className={styles.projectVersion}>{`${t('admin:components.project.sourceProjectName')}: ${
                projectUpdateStatus.value?.sourceProjectName
              }`}</div>
            )}

          {projectUpdateStatus.value?.branchProcessing && (
            <LoadingView
              title={t('admin:components.project.branchProcessing')}
              flexDirection="row"
              variant="body1"
              fullHeight={false}
            />
          )}
          {projectUpdateStatus.value?.commitsProcessing && (
            <LoadingView
              title={t('admin:components.project.commitsProcessing')}
              flexDirection="row"
              variant="body1"
              fullHeight={false}
            />
          )}

          {projectUpdateStatus.value?.sourceVsDestinationProcessing && (
            <LoadingView
              title={t('admin:components.project.sourceVsDestinationProcessing')}
              variant="body1"
              flexDirection="row"
              fullHeight={false}
            />
          )}

          {!processing &&
            !projectUpdateStatus.value?.branchProcessing &&
            !projectUpdateStatus.value?.commitsProcessing &&
            projectUpdateStatus.value?.selectedSHA &&
            projectUpdateStatus.value?.selectedSHA.length > 0 &&
            projectUpdateStatus.value?.commitData.length > 0 &&
            !matchesEngineVersion && (
              <div className={styles.projectMismatchWarning}>
                <WarningAmberIcon />
                {t('admin:components.project.mismatchedProjectWarning')}
              </div>
            )}

          {projectUpdateStatus.value?.sourceVsDestinationError.length > 0 && (
            <div className={styles.errorText}>{projectUpdateStatus.value?.sourceVsDestinationError}</div>
          )}

          <div
            className={classNames({
              [styles.validContainer]: true,
              [styles.valid]: projectUpdateStatus.value?.destinationValid,
              [styles.invalid]: !projectUpdateStatus.value?.destinationValid
            })}
          >
            {projectUpdateStatus.value?.destinationValid && <CheckCircle />}
            {!projectUpdateStatus.value?.destinationValid && <Cancel />}
            {t('admin:components.project.destinationURLValid')}
          </div>

          {!(existingProject && changeDestination) && (
            <div
              className={classNames({
                [styles.validContainer]: true,
                [styles.valid]: projectUpdateStatus.value?.sourceValid,
                [styles.invalid]: !projectUpdateStatus.value?.sourceValid
              })}
            >
              {projectUpdateStatus.value?.sourceValid && <CheckCircle />}
              {!projectUpdateStatus.value?.sourceValid && <Cancel />}
              {t('admin:components.project.sourceURLValid')}
            </div>
          )}

          {!(existingProject && changeDestination) && (
            <div
              className={classNames({
                [styles.validContainer]: true,
                [styles.valid]: projectUpdateStatus.value?.sourceProjectMatchesDestination,
                [styles.invalid]: !projectUpdateStatus.value?.sourceProjectMatchesDestination
              })}
            >
              {projectUpdateStatus.value?.sourceProjectMatchesDestination && <CheckCircle />}
              {!projectUpdateStatus.value?.sourceProjectMatchesDestination && <Cancel />}
              {t('admin:components.project.sourceMatchesDestination')}
            </div>
          )}
        </Container>
      )}
    </>
  )
}

export default ProjectFields
