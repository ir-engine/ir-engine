import React, { useEffect, useState } from 'react'

import { Button, Grid, MenuItem, TextField, Typography } from '@mui/material'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { ProjectSettingService, useProjectSettingState } from '../../services/Setting/ProjectSettingService'
import { useStyles } from './styles'

interface Props {}

const Project = (props: Props) => {
  const classes = useStyles()
  const authState = useAuthState()
  const user = authState.user
  const projectState = useProjectState()
  const projectSettingState = useProjectSettingState()
  const projects = projectState.projects
  const [projectSetting] = projectSettingState?.projectSettings?.value || []

  const [settings, setSettings] = useState(projectSetting.settings || [])
  const [selectedProject, setSelectedProject] = useState(projects.value.length > 0 ? projects.value[0].id : null)

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  useEffect(() => {
    if (user?.id?.value != null && selectedProject) {
      ProjectSettingService.fetchProjectSetting(selectedProject)
    }
  }, [authState?.user?.id?.value, selectedProject])

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId)
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          PROJECT
        </Typography>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <label>Select Project</label>
              <TextField select value={selectedProject} className={classes.selectInput}>
                {projects.value &&
                  projects.value.map((proj, index) => (
                    <MenuItem key={index} value={proj.id} onClick={() => handleProjectChange(proj.id)}>
                      {proj.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item container>
              {settings.map((setting, index) => (
                <Grid item key={index}></Grid>
              ))}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Button sx={{ maxWidth: '100%' }} variant="contained" type="submit">
                Add New Setting
              </Button>
            </Grid>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default Project
