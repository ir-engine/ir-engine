import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useHookEffect } from '@xrengine/hyperflux'
import { loadConfigForProject } from '@xrengine/projects/loadConfigForProject'

import { Box, Button, Grid, Typography } from '@mui/material'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { ProjectSettingService, useProjectSettingState } from '../../services/Setting/ProjectSettingService'
import styles from '../../styles/settings.module.scss'

interface ProjectSetting {
  key: string
  value: any
}

const Project = () => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const user = authState.user
  const projectState = useProjectState()
  const projects = projectState.projects
  const projectSettingState = useProjectSettingState()
  const projectSetting = projectSettingState.projectSetting

  const [settings, setSettings] = useState<Array<ProjectSetting> | []>([])
  const [selectedProject, setSelectedProject] = useState(projects.value.length > 0 ? projects.value[0].id : '')

  ProjectService.useAPIListeners()

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      resetSettingsFromSchema()
    }
  }, [selectedProject])

  useHookEffect(() => {
    if (projectSetting.value && projectSetting.value?.length > 0) {
      let tempSettings = JSON.parse(JSON.stringify(settings))

      for (let [index, setting] of tempSettings.entries()) {
        const savedSetting = projectSetting.value.filter((item) => item.key === setting.key)
        if (savedSetting.length > 0) {
          tempSettings[index].value = savedSetting[0].value
        }
      }

      setSettings(tempSettings)
    }
  }, [projectSetting])

  const resetSettingsFromSchema = async () => {
    const projectName = projects.value.filter((proj) => proj.id === selectedProject)
    const projectConfig = projectName?.length > 0 && (await loadConfigForProject(projectName[0].name))

    if (projectConfig && projectConfig?.settings) {
      let tempSetting = [] as ProjectSetting[]

      for (let setting of projectConfig.settings) {
        tempSetting.push({ key: setting.key, value: '' })
      }

      setSettings(tempSetting)
      ProjectSettingService.fetchProjectSetting(selectedProject)
    } else {
      setSettings([])
    }
  }

  useEffect(() => {
    if (user?.id?.value != null && selectedProject) {
    }
  }, [authState?.user?.id?.value, selectedProject])

  const handleProjectChange = (e) => {
    const { value } = e.target
    setSelectedProject(value)
  }

  const handleValueChange = (index, e) => {
    const tempSetting = JSON.parse(JSON.stringify(settings))

    tempSetting[index].value = e.target.value
    setSettings(tempSetting)
  }

  const handleCancel = () => {
    resetSettingsFromSchema()
  }

  const handleSubmit = () => {
    ProjectSettingService.updateProjectSetting(selectedProject, settings)
  }

  const projectsMenu: InputMenuItem[] = projects.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.project')}
      </Typography>
      <div className={styles.root}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={6}>
            <InputSelect
              name="selectProject"
              label={t('admin:components.setting.project')}
              value={selectedProject}
              menu={projectsMenu}
              onChange={handleProjectChange}
            />
          </Grid>

          <Grid item container xs={12}>
            {settings?.length > 0 ? (
              settings.map((setting, index) => (
                <Grid item container key={index} spacing={1} xs={12}>
                  <Grid item xs={6}>
                    <InputText name="key" label="Key Name" value={setting.key || ''} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <InputText
                      name="value"
                      label="Value"
                      value={setting.value || ''}
                      onChange={(e) => handleValueChange(index, e)}
                    />
                  </Grid>
                </Grid>
              ))
            ) : (
              <Grid item marginBottom="20px">
                <Typography>No schema available in xrengine.config.ts</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        {settings?.length > 0 && (
          <Grid item container xs={12}>
            <Button sx={{ maxWidth: '100%' }} variant="outlined" onClick={handleCancel}>
              {t('admin:components.common.cancel')}
            </Button>
            <Button
              sx={{ maxWidth: '100%', ml: 1 }}
              variant="contained"
              className={styles.gradientButton}
              onClick={handleSubmit}
            >
              {t('admin:components.common.save')}
            </Button>
          </Grid>
        )}
      </div>
    </Box>
  )
}

export default Project
