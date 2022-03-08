import React, { useEffect, useState } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import { Button, Grid, IconButton, InputBase, MenuItem, Paper, TextField, Typography } from '@mui/material'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { useStyles } from './styles'

interface Props {}

interface ProjectSetting {
  keyName: string
  value: any
  scopes: any
}

const Project = (props: Props) => {
  const classes = useStyles()
  const authState = useAuthState()
  const user = authState.user
  const projectState = useProjectState()
  const projects = projectState.projects

  const [settings, setSettings] = useState<Array<ProjectSetting> | []>([])
  const [selectedProject, setSelectedProject] = useState(projects.value.length > 0 ? projects.value[0].id : null)

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  useEffect(() => {
    if (user?.id?.value != null && selectedProject) {
    }
  }, [authState?.user?.id?.value, selectedProject])

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId)
  }

  const handleAddNewSetting = () => {
    const tempSetting = JSON.parse(JSON.stringify(settings))

    tempSetting.push({
      keyName: '',
      value: '',
      scopes: []
    })

    setSettings(tempSetting)
  }

  const handleKeyNameChange = (index, e) => {
    const tempSetting = JSON.parse(JSON.stringify(settings))

    tempSetting[index].keyName = e.target.value
    setSettings(tempSetting)
  }

  const handleValueChange = (index, e) => {
    const tempSetting = JSON.parse(JSON.stringify(settings))

    tempSetting[index].value = e.target.value
    setSettings(tempSetting)
  }

  const handleDeleteSetting = (index) => {
    const tempSetting = JSON.parse(JSON.stringify(settings))

    tempSetting.splice(index, 1)
    setSettings(tempSetting)
  }

  const handleCancel = () => {
    const tempSetting = JSON.parse(JSON.stringify([]))

    setSettings(tempSetting)
  }

  const handleSubmit = () => {
    // TODO save/update setting against the selected project
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
            <Grid item container xs={12}>
              {settings &&
                settings.map((setting, index) => (
                  <Grid item container key={index} spacing={1} xs={12}>
                    <Grid item spacing={1} xs={3}>
                      <label>Key Name</label>
                      <Paper component="div" className={classes.createInput}>
                        <InputBase
                          name="port"
                          className={classes.input}
                          value={setting.keyName}
                          style={{ color: '#fff' }}
                          onChange={(e) => handleKeyNameChange(index, e)}
                        />
                      </Paper>
                    </Grid>
                    <Grid item spacing={1} xs={3}>
                      <label>Value</label>
                      <Paper component="div" className={classes.createInput}>
                        <InputBase
                          name="port"
                          className={classes.input}
                          value={setting.value}
                          style={{ color: '#fff' }}
                          onChange={(e) => handleValueChange(index, e)}
                        />
                      </Paper>
                    </Grid>
                    <Grid item spacing={1} xs={5}>
                      <label>Scopes</label>
                      <Paper component="div" className={classes.createInput}></Paper>
                    </Grid>
                    <Grid item spacing={1} xs={1}>
                      <IconButton onClick={() => handleDeleteSetting(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Button sx={{ maxWidth: '100%' }} variant="contained" onClick={handleAddNewSetting}>
                Add New Setting
              </Button>
            </Grid>
          </Grid>
          <Grid item container xs={12}>
            <Button sx={{ maxWidth: '100%' }} variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
              Cancel
            </Button>
            &nbsp; &nbsp;
            <Button sx={{ maxWidth: '100%' }} variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default Project
