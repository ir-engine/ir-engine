import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useHookEffect } from '@xrengine/hyperflux'
import { loadConfigForProject } from '@xrengine/projects/loadConfigForProject'

import { Button, Grid, InputBase, MenuItem, Paper, TextField, Typography } from '@mui/material'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { ProjectSettingService, useProjectSettingState } from '../../services/Setting/ProjectSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

interface ProjectSetting {
  key: string
  value: any
}

const Project = (props: Props) => {
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()
  const projectState = useProjectState()
  const projects = projectState.projects

  const projectSettingState = useProjectSettingState()
  const projectSetting = projectSettingState.projectSetting

  const [settings, setSettings] = useState<Array<ProjectSetting> | []>([])
  const [selectedProject, setSelectedProject] = useState(projects.value.length > 0 ? projects.value[0].id : '')

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

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId)
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

  return (
    <div>
      <form>
        <Typography component="h1" className={styles.settingsHeading}>
          {t('admin:components.setting.project')}
        </Typography>
        <div className={styles.root}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <label>{t('admin:components.setting.selectProject')}</label>
              <TextField
                select
                value={selectedProject}
                className={styles.selectInput}
                SelectProps={{ MenuProps: { classes: { paper: styles.selectPaper } } }}
              >
                {projects.value &&
                  projects.value.map((proj, index) => (
                    <MenuItem key={index} value={proj.id} onClick={() => handleProjectChange(proj.id)}>
                      {proj.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item container xs={12}>
              {settings?.length > 0 ? (
                settings.map((setting, index) => (
                  <Grid item container key={index} spacing={1} xs={12}>
                    <Grid item xs={6}>
                      <label>Key Name</label>
                      <Paper component="div" className={styles.createInput}>
                        <InputBase name="key" disabled className={styles.input} value={setting.key} />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <label>Value</label>
                      <Paper component="div" className={styles.createInput}>
                        <InputBase
                          name="value"
                          className={styles.input}
                          value={setting.value}
                          onChange={(e) => handleValueChange(index, e)}
                        />
                      </Paper>
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
                {t('admin:components.setting.cancel')}
              </Button>
              &nbsp; &nbsp;
              <Button sx={{ maxWidth: '100%' }} variant="contained" className={styles.saveBtn} onClick={handleSubmit}>
                {t('admin:components.setting.save')}
              </Button>
            </Grid>
          )}
        </div>
      </form>
    </div>
  )
}

export default Project
