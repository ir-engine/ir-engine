/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CiCircleCheck, CiCircleRemove, CiWarning } from 'react-icons/ci'
import { HiMiniClipboardDocumentList } from 'react-icons/hi2'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@ir-engine/client-core/src/common/services/ProjectService'
import { DefaultUpdateSchedule } from '@ir-engine/common/src/interfaces/ProjectPackageJsonType'
import {
  identityProviderPath,
  ProjectBranchType,
  ProjectCommitType,
  ProjectType
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql, toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { RadioGroup } from '@ir-engine/ui'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Label from '@ir-engine/ui/src/primitives/tailwind/Label'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

import { useFind } from '@ir-engine/common'
import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'

const autoUpdateIntervalOptions = [
  {
    value: '*/5 * * * *',
    label: `5 ${t('admin:components.project.minutes')}`
  },
  {
    value: '*/30 * * * *',
    label: `30 ${t('admin:components.project.minutes')}`
  },
  {
    value: '0 * * * *',
    label: `1 ${t('admin:components.project.hour')}`
  },
  {
    value: '0 */3 * * *',
    label: `3 ${t('admin:components.project.hours')}`
  },
  {
    value: '0 */6 * * *',
    label: `6 ${t('admin:components.project.hours')}`
  },
  {
    value: '0 */12 * * *',
    label: `12 ${t('admin:components.project.hours')}`
  },
  {
    value: '0 0 * * *',
    label: `1 ${t('admin:components.project.day')}`
  }
]

const getTempProject = () => ({
  id: '',
  name: 'tempProject',
  thumbnail: '',
  repositoryPath: '',
  needsRebuild: false,
  updateType: 'none' as ProjectType['updateType'],
  commitSHA: '',
  sourceBranch: '',
  sourceRepo: '',
  commitDate: toDateTimeSql(new Date())
})

export default function AddEditProjectModal({
  update,
  inputProject,
  onSubmit
}: {
  update: boolean
  inputProject?: ProjectType
  onSubmit?: () => Promise<void>
}) {
  const { t } = useTranslation()
  const showAutoUpdateOptions = useHookstate(false)
  const modalProcessing = useHookstate(false)

  const project = update && inputProject ? inputProject : getTempProject()

  const projectUpdateStatus = useHookstate(getMutableState(ProjectUpdateState)[project.name])
  useEffect(() => {
    ProjectUpdateService.initializeProjectUpdate(project.name)
    if (inputProject) {
      ProjectUpdateService.setTriggerSetDestination(
        inputProject.name,
        inputProject.repositoryPath,
        inputProject.updateType,
        inputProject.updateSchedule
      )
    }
    return () => ProjectUpdateService.clearProjectUpdate(project.name)
  }, [project.name])

  const identityProvidersQuery = useFind(identityProviderPath)
  const hasGithubProvider = identityProvidersQuery.data.find((ip) => ip.type === 'github')

  const matchingCommit = projectUpdateStatus?.value?.commitData?.find(
    (commit: ProjectCommitType) => commit.commitSHA === projectUpdateStatus.value.selectedSHA
  )
  const matchesEngineVersion = matchingCommit ? (matchingCommit as ProjectCommitType).matchesEngineVersion : false

  const branchSelectOptions = projectUpdateStatus?.value?.branchData.map((projectBranch: ProjectBranchType) => ({
    value: projectBranch.name,
    label: `Branch: ${projectBranch.name} ${
      projectBranch.branchType === 'main'
        ? '(Main branch)'
        : projectBranch.branchType === 'deployment'
        ? '(Deployment branch)'
        : ''
    }`
  }))

  const commitSelectOptions = projectUpdateStatus?.value?.commitData.map((projectCommit: ProjectCommitType) => {
    let label = `Commit ${projectCommit.commitSHA?.slice(0, 8)}`
    if (projectCommit.projectVersion) label += ` -- Project Ver. ${projectCommit.projectVersion}`
    if (projectCommit.engineVersion) label += ` -- Engine Ver. ${projectCommit.engineVersion}`
    if (projectCommit.datetime) {
      const datetime = toDisplayDateTime(projectCommit.datetime)
      label += ` -- Pushed ${datetime}`
    }
    return {
      value: projectCommit.commitSHA,
      label
    }
  })

  const handleCommitChange = async (commitValue: string, commitData?: any) => {
    if (!commitData) {
      commitData = projectUpdateStatus.value.commitData
    }

    const selectedSHA = commitValue
    ProjectUpdateService.setSourceVsDestinationChecked(project.name, false)
    ProjectUpdateService.setSelectedSHA(project.name, selectedSHA)
    if (selectedSHA === '') {
      ProjectUpdateService.setSourceValid(project.name, false)
      ProjectUpdateService.setCommitError(project.name, '')
      ProjectUpdateService.setSourceProjectName(project.name, '')
      return
    }

    let matchingCommit = commitData.find((data) => data.commitSHA.startsWith(commitValue))
    if (!matchingCommit) {
      const commitResponse = (await ProjectService.checkUnfetchedCommit({
        url: projectUpdateStatus.value.sourceURL,
        selectedSHA
      })) as any
      if (commitResponse.error) {
        ProjectUpdateService.setCommitError(project.name, commitResponse.text)
        ProjectUpdateService.setSourceProjectName(project.name, '')
        return
      } else {
        ProjectUpdateService.mergeCommitData(project.name, commitResponse)
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 100)
        })
        matchingCommit = commitData.find((data) => data.commitSHA.startsWith(commitValue))
      }
    }
    ProjectUpdateService.setSourceProjectName(project.name, matchingCommit?.projectName || '')
    ProjectUpdateService.setCommitError(project.name, '')
    ProjectUpdateService.setSourceValid(project.name, true)
  }

  const handleChangeBranch = async (branchValue: string) => {
    try {
      ProjectUpdateService.resetSourceState(project.name, { resetSourceURL: false, resetBranch: false })
      ProjectUpdateService.setSelectedBranch(project.name, branchValue)
      ProjectUpdateService.setCommitsProcessing(project.name, true)
      const projectResponse = (await ProjectService.fetchProjectCommits(
        projectUpdateStatus.value.sourceURL,
        branchValue
      )) as any
      ProjectUpdateService.setCommitsProcessing(project.name, false)
      if (projectResponse.error) {
        ProjectUpdateService.setShowCommitSelector(project.name, false)
        ProjectUpdateService.setBranchError(project.name, projectResponse.text)
      } else {
        ProjectUpdateService.setShowCommitSelector(project.name, true)
        ProjectUpdateService.setCommitData(project.name, projectResponse)

        if (project.commitSHA) {
          const commitExists = projectResponse.find((item: ProjectCommitType) => item.commitSHA === project.commitSHA)

          if (commitExists) {
            handleCommitChange(project.commitSHA, projectResponse)
          }
        }
      }
    } catch (err) {
      ProjectUpdateService.setCommitsProcessing(project.name, false)
      ProjectUpdateService.setShowCommitSelector(project.name, false)
      ProjectUpdateService.setBranchError(project.name, err.message)
      console.log('projectResponse error', err)
    }
  }

  const handleChangeDestination = (e: { target: { value: string } }) => {
    const { value } = e.target
    ProjectUpdateService.setDestinationError(project.name, value ? '' : t('admin:components.project.urlRequired'))
    ProjectUpdateService.setDestinationURL(project.name, value)
  }

  const handleChangeDestinationRepo = async (e: { target: { value: string } }) => {
    if (e.target.value && e.target.value.length > 0) {
      try {
        ProjectUpdateService.resetDestinationState(project.name, { resetDestinationURL: false })
        ProjectUpdateService.setDestinationValid(project.name, false)
        ProjectUpdateService.setDestinationProcessing(project.name, true)
        const destinationResponse = await ProjectService.checkDestinationURLValid({
          url: e.target.value,
          inputProjectURL: inputProject?.repositoryPath
        })
        ProjectUpdateService.setDestinationProcessing(project.name, false)
        if (destinationResponse.error) {
          ProjectUpdateService.setDestinationValid(project.name, false)
          ProjectUpdateService.setDestinationError(project.name, destinationResponse.text!)
        } else {
          if (destinationResponse.destinationValid) {
            ProjectUpdateService.setSubmitDisabled(project.name, false)
            ProjectUpdateService.setDestinationValid(project.name, destinationResponse.destinationValid)
            if (destinationResponse.projectName)
              ProjectUpdateService.setDestinationProjectName(project.name, destinationResponse.projectName)
            if (project.sourceRepo) {
              handleChangeSource({ target: { value: project.sourceRepo } })
              handleChangeSourceRepo({ target: { value: project.sourceRepo } })
            }
            if (destinationResponse.repoEmpty) ProjectUpdateService.setDestinationRepoEmpty(project.name, true)
            if (projectUpdateStatus.value.selectedSHA.length > 0)
              handleCommitChange(projectUpdateStatus.value.selectedSHA)
          } else {
            ProjectUpdateService.setDestinationValid(project.name, false)
            ProjectUpdateService.setDestinationError(project.name, destinationResponse.text!)
          }
        }
      } catch (err) {
        ProjectUpdateService.setDestinationProcessing(project.name, false)
        ProjectUpdateService.setDestinationValid(project.name, false)
        ProjectUpdateService.setDestinationError(project.name, err.message)
        console.log('Destination error', err)
      }
    }
  }

  const handleChangeSource = (e: { target: { value: string } }) => {
    const { value } = e.target
    ProjectUpdateService.setSourceURLError(project.name, value ? '' : t('admin:components.project.urlRequired'))
    ProjectUpdateService.setSourceURL(project.name, value)
  }

  const handleChangeSourceRepo = async (e: { target: { value: string } }) => {
    try {
      ProjectUpdateService.resetSourceState(project.name, { resetSourceURL: false })
      ProjectUpdateService.setBranchProcessing(project.name, true)
      const branchResponse = (await ProjectService.fetchProjectBranches(e.target.value)) as any
      ProjectUpdateService.setBranchProcessing(project.name, false)
      if (branchResponse.error) {
        ProjectUpdateService.setShowBranchSelector(project.name, false)
        ProjectUpdateService.setSourceURLError(project.name, branchResponse.text)
      } else {
        ProjectUpdateService.setShowBranchSelector(project.name, true)
        ProjectUpdateService.setBranchData(project.name, branchResponse)
        if (project.sourceBranch) {
          const branchExists = branchResponse.find((item: ProjectBranchType) => item.name === project.sourceBranch)

          if (branchExists) {
            handleChangeBranch(project.sourceBranch)
          }
        }
      }
    } catch (err) {
      ProjectUpdateService.setBranchProcessing(project.name, false)
      ProjectUpdateService.setShowBranchSelector(project.name, false)
      ProjectUpdateService.setBranchError(project.name, err.message)
      console.log('Branch fetch error', err)
    }
  }

  useEffect(() => {
    if (
      projectUpdateStatus?.value?.destinationValid &&
      projectUpdateStatus?.value?.sourceValid &&
      !projectUpdateStatus?.value?.sourceVsDestinationChecked
    ) {
      ProjectUpdateService.setSourceVsDestinationProcessing(project.name, true)
      ProjectService.checkSourceMatchesDestination({
        sourceURL: projectUpdateStatus.value.sourceURL || '',
        selectedSHA: projectUpdateStatus.value.selectedSHA || '',
        destinationURL: projectUpdateStatus.value.destinationURL || '',
        existingProject: inputProject ? true : false
      }).then((res) => {
        ProjectUpdateService.setSourceVsDestinationChecked(project.name, true)
        ProjectUpdateService.setSourceVsDestinationProcessing(project.name, false)
        if (res.error || res.text) {
          ProjectUpdateService.setProjectName(project.name, '')
          ProjectUpdateService.setSubmitDisabled(project.name, true)
          ProjectUpdateService.setSourceProjectMatchesDestination(project.name, false)
          ProjectUpdateService.setSourceVsDestinationError(project.name, res.text!)
          ProjectUpdateService.setSourceValid(project.name, false)
        } else {
          ProjectUpdateService.setProjectName(project.name, res.projectName!)
          ProjectUpdateService.setSubmitDisabled(project.name, !res.sourceProjectMatchesDestination)
          ProjectUpdateService.setSourceProjectMatchesDestination(project.name, res.sourceProjectMatchesDestination!)
          ProjectUpdateService.setSourceVsDestinationError(project.name, '')
          ProjectUpdateService.setSourceValid(project.name, true)
        }
      })
    } else {
      if (!projectUpdateStatus?.value?.sourceVsDestinationChecked && !inputProject && update) {
        ProjectUpdateService.setSourceVsDestinationProcessing(project.name, false)
        ProjectUpdateService.setSourceVsDestinationChecked(project.name, false)
        ProjectUpdateService.setProjectName(project.name, '')
        ProjectUpdateService.setSubmitDisabled(project.name, true)
        ProjectUpdateService.setSourceProjectMatchesDestination(project.name, false)
      } else if (!projectUpdateStatus?.value?.destinationValid || !projectUpdateStatus?.value?.sourceValid)
        ProjectUpdateService.setSubmitDisabled(project.name, true)
    }
  }, [
    projectUpdateStatus?.value?.destinationValid,
    projectUpdateStatus?.value?.sourceValid,
    projectUpdateStatus?.value?.sourceVsDestinationChecked
  ])

  useEffect(() => {
    if (
      projectUpdateStatus?.value?.triggerSetDestination?.length > 0 &&
      projectUpdateStatus?.value?.destinationURL?.length === 0
    ) {
      ProjectUpdateService.setDestinationURL(project.name, projectUpdateStatus.value.triggerSetDestination)
      handleChangeDestinationRepo({
        target: {
          value: projectUpdateStatus.value.triggerSetDestination
        }
      })
    }
  }, [projectUpdateStatus?.value?.triggerSetDestination])

  const handleSubmit = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit?.()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      className="relative max-h-full w-[50vw] max-w-2xl p-4"
      title={update ? t('admin:components.project.updateProject') : t('admin:components.project.addProject')}
      onClose={() => {
        ProjectUpdateService.clearProjectUpdate(project.name)
        PopoverState.hidePopupover()
      }}
      onSubmit={handleSubmit}
      submitButtonDisabled={projectUpdateStatus.value?.submitDisabled}
      submitLoading={modalProcessing.value}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          {hasGithubProvider ? (
            <Input
              label={`${t('admin:components.project.destination')} (${t('admin:components.project.githubUrl')})`}
              placeholder="https://github.com/{user}/{repo}"
              value={projectUpdateStatus.value?.destinationURL}
              error={projectUpdateStatus.value?.destinationError}
              onChange={handleChangeDestination}
              onBlur={handleChangeDestinationRepo}
              description={
                !projectUpdateStatus.value?.destinationProcessing &&
                projectUpdateStatus.value?.destinationProjectName.length > 0
                  ? `${t('admin:components.project.destinationProjectName')}: ${projectUpdateStatus.value
                      ?.destinationProjectName}`
                  : undefined
              }
            />
          ) : (
            <Text>{t('admin:components.project.needsGithubProvider')}</Text>
          )}
          {!projectUpdateStatus.value?.destinationProcessing && projectUpdateStatus.value?.destinationRepoEmpty && (
            <Text fontSize="sm" theme="secondary">
              {t('admin:components.project.destinationRepoEmpty')}
            </Text>
          )}
          {projectUpdateStatus.value?.destinationProcessing && (
            <div className="flex items-center gap-3">
              <div>
                <LoadingView spinnerOnly className="h-6 w-6" />
              </div>
              <Text>{t('admin:components.project.destinationProcessing')}</Text>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          {hasGithubProvider ? (
            <Input
              label={`${t('admin:components.project.source')} (${t('admin:components.project.githubUrl')})`}
              placeholder="https://github.com/{user}/{repo}"
              value={projectUpdateStatus.value?.sourceURL}
              error={projectUpdateStatus.value?.sourceURLError}
              onChange={handleChangeSource}
              onBlur={handleChangeSourceRepo}
              description={
                !projectUpdateStatus.value?.destinationProcessing &&
                projectUpdateStatus.value?.destinationProjectName.length > 0
                  ? `${t('admin:components.project.sourceProjectName')}: ${projectUpdateStatus.value
                      ?.destinationProjectName}`
                  : undefined
              }
              endComponent={
                <Button
                  title={t('admin:components.project.copyDestination')}
                  variant="outline"
                  size="small"
                  className="p-3 [&>*]:m-0"
                  startIcon={<HiMiniClipboardDocumentList />}
                  onClick={() => {
                    handleChangeSource({ target: { value: projectUpdateStatus.value.destinationURL } })
                    handleChangeSourceRepo({ target: { value: projectUpdateStatus.value.destinationURL } })
                  }}
                />
              }
            />
          ) : (
            <Text>{t('admin:components.project.needsGithubProvider')}</Text>
          )}
        </div>

        {!projectUpdateStatus.value?.branchProcessing &&
          projectUpdateStatus.value?.branchData &&
          projectUpdateStatus.value?.branchData.length > 0 &&
          projectUpdateStatus.value?.showBranchSelector && (
            <Select
              label={t('admin:components.project.branchData')}
              currentValue={projectUpdateStatus.value?.selectedBranch}
              options={branchSelectOptions}
              error={projectUpdateStatus.value?.branchError}
              onChange={handleChangeBranch}
            />
          )}
        {projectUpdateStatus.value?.branchProcessing && (
          <div className="flex items-center gap-3">
            <div>
              <LoadingView spinnerOnly className="h-6 w-6" />
            </div>
            <Text>{t('admin:components.project.branchProcessing')}</Text>
          </div>
        )}

        {!projectUpdateStatus.value?.commitsProcessing &&
          projectUpdateStatus.value?.commitData &&
          projectUpdateStatus.value?.commitData.length > 0 &&
          projectUpdateStatus.value?.showCommitSelector && (
            <Select
              label={t('admin:components.project.commitData')}
              currentValue={projectUpdateStatus.value?.selectedSHA}
              onChange={handleCommitChange}
              options={commitSelectOptions}
              error={projectUpdateStatus.value?.commitError}
              description={
                !projectUpdateStatus.value?.commitsProcessing && projectUpdateStatus.value?.sourceProjectName.length > 0
                  ? `${t('admin:components.project.sourceProjectName')}: ${projectUpdateStatus.value
                      ?.sourceProjectName}`
                  : undefined
              }
            />
          )}
        {projectUpdateStatus.value?.commitsProcessing && (
          <div className="flex items-center gap-3">
            <div>
              <LoadingView spinnerOnly className="h-6 w-6" />
            </div>
            <Text>{t('admin:components.project.commitsProcessing')}</Text>
          </div>
        )}

        {projectUpdateStatus.value?.sourceVsDestinationProcessing && (
          <div className="flex items-center gap-3">
            <div>
              <LoadingView spinnerOnly className="h-6 w-6" />
            </div>
            <Text>{t('admin:components.project.sourceVsDestinationProcessing')}</Text>
          </div>
        )}

        {!projectUpdateStatus.value?.branchProcessing &&
          !projectUpdateStatus.value?.commitsProcessing &&
          projectUpdateStatus.value?.selectedSHA &&
          projectUpdateStatus.value?.selectedSHA.length > 0 &&
          projectUpdateStatus.value?.commitData.length > 0 &&
          !matchesEngineVersion && (
            <div className="flex items-center justify-center gap-3 rounded-lg bg-theme-bannerInformative p-4">
              <div>
                <CiWarning className="h-5 w-5 bg-transparent" />
              </div>
              <Text>{t('admin:components.project.mismatchedProjectWarning')}</Text>
            </div>
          )}

        {projectUpdateStatus.value?.sourceVsDestinationError.length > 0 && (
          <Text className="text-red-700">{projectUpdateStatus.value?.sourceVsDestinationError}</Text>
        )}

        {!update && (
          <Text
            className={
              'flex items-center gap-2 ' +
              (projectUpdateStatus.value?.destinationValid ? 'text-green-400' : 'text-red-700')
            }
          >
            {projectUpdateStatus.value?.destinationValid && <CiCircleCheck />}
            {!projectUpdateStatus.value?.destinationValid && <CiCircleRemove />}
            {t('admin:components.project.destinationURLValid')}
          </Text>
        )}

        {!update && (
          <Text
            className={
              'flex items-center gap-2 ' + (projectUpdateStatus.value?.sourceValid ? 'text-green-400' : 'text-red-700')
            }
          >
            {projectUpdateStatus.value?.sourceValid && <CiCircleCheck />}
            {!projectUpdateStatus.value?.sourceValid && <CiCircleRemove />}
            {t('admin:components.project.sourceURLValid')}
          </Text>
        )}

        {!update && (
          <Text
            className={
              'flex items-center gap-2 ' +
              (projectUpdateStatus.value?.sourceProjectMatchesDestination ? 'text-green-400' : 'text-red-700')
            }
          >
            {projectUpdateStatus.value?.sourceProjectMatchesDestination && <CiCircleCheck />}
            {!projectUpdateStatus.value?.sourceProjectMatchesDestination && <CiCircleRemove />}
            {t('admin:components.project.sourceMatchesDestination')}
          </Text>
        )}

        <Text>{t('admin:components.project.autoUpdate')}</Text>
        <Toggle
          value={showAutoUpdateOptions.value}
          onChange={(value) => {
            showAutoUpdateOptions.set(value)
          }}
          label={t('admin:components.project.enableAutoUpdate')}
        />
        {showAutoUpdateOptions.value && (
          <div className="flex w-full">
            <div className="w-1/2">
              <Label className="mb-4">{t('admin:components.project.autoUpdateMode')}</Label>
              <RadioGroup
                horizontal
                options={[
                  { label: t('admin:components.project.prod'), value: 'prod' },
                  { label: t('admin:components.project.dev'), value: 'dev' }
                ]}
                value={projectUpdateStatus.value?.updateType === 'tag' ? 'prod' : 'dev'}
                onChange={(value) =>
                  ProjectUpdateService.setUpdateType(project.name, value === 'prod' ? 'tag' : 'commit')
                }
              />
            </div>
            <div className="w-1/2">
              <Select
                label={t('admin:components.project.autoUpdateInterval')}
                options={autoUpdateIntervalOptions}
                currentValue={projectUpdateStatus.value?.updateSchedule || DefaultUpdateSchedule}
                onChange={(value) => ProjectUpdateService.setUpdateSchedule(project.name, value)}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
