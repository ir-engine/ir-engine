import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import SearchScene from './SearchScene'
import SceneTable from './sceneTable'
import { useSceneStyles } from './styles'

const Scenes = () => {
  const classes = useSceneStyles()
  const [userModalOpen, setUserModalOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setUserModalOpen(open)
  }

  const closeViewModel = (open: boolean) => {
    setUserModalOpen(open)
  }

  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={12}>
          <SearchScene />
        </Grid>
      </Grid>
      <div>
        <SceneTable />
      </div>
    </div>
  )
}

export default Scenes
