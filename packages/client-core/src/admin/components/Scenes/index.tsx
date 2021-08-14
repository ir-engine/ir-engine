import React from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import SearchScene from './SearchScene'
import CreateSceneModel from './createScene'
import SceneTable from './sceneTable'
import { useStyles } from './styles'

const Scenes = () => {
  const classes = useStyles()
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
        <Grid item xs={9}>
          <SearchScene />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create New Scene
          </Button>
        </Grid>
      </Grid>
      <div>
        <SceneTable />
      </div>
      <CreateSceneModel open={userModalOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Scenes
