import Grid from '@mui/material/Grid'
import React from 'react'
import Search from '../../common/Search'
import { useStyles } from '../../styles/ui'
import SceneTable from './SceneTable'

const Scenes = () => {
  const classes = useStyles()
  const [search, setSearch] = React.useState('')

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={12}>
          <Search text="scene" handleChange={handleChange} />
        </Grid>
      </Grid>
      <div>
        <SceneTable search={search} />
      </div>
    </div>
  )
}

export default Scenes
