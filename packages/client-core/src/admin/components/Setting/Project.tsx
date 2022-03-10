import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadConfigForProject } from '@xrengine/projects/loadConfigForProject'

import { Button, Grid, InputBase, MenuItem, Paper, TextField, Typography } from '@mui/material'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { ProjectSettingService, useProjectSettingState } from '../../services/Setting/ProjectSettingService'
import { useStyles } from './styles'

interface Props {}

interface ProjectSetting {
  key: string
  value: any
}

const Project = (props: Props) => {
  const classes = useStyles()
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()
  const projectState = useProjectState()
  const projects = projectState.projects

  const projectSettingState = useProjectSettingState()
  const projectSettings = projectSettingState.projectSetting

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

  useEffect(() => {
    if (projectSettings.value && projectSettings.value?.length > 0) {
      let tempSettings = JSON.parse(JSON.stringify(settings))

      for (let setting of tempSettings) {
        for (let savedSetting of projectSettings.value) {
          if ((setting.key = savedSetting.key)) {
            setting.value = savedSetting.value
          }
        }
      }
    }
  }, [projectSettings.value])

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
    // TODO save/update setting against the selected project
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          {t('admin:components.setting.project')}
        </Typography>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <label>{t('admin:components.setting.selectProject')}</label>
              <TextField select value={selectedProject} className={classes.selectInput}>
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
                      <Paper component="div" className={classes.createInput}>
                        <InputBase
                          name="key"
                          disabled
                          className={classes.input}
                          value={setting.key}
                          style={{ color: '#fff' }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <label>Value</label>
                      <Paper component="div" className={classes.createInput}>
                        <InputBase
                          name="value"
                          className={classes.input}
                          value={setting.value}
                          style={{ color: '#fff' }}
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
              <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
                {t('admin:components.setting.cancel')}
              </Button>
              &nbsp; &nbsp;
              <Button sx={{ maxWidth: '100%' }} variant="contained" onClick={handleSubmit}>
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
