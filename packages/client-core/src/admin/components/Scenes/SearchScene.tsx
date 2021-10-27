import React from 'react'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useSceneStyle, useSceneStyles } from './styles'

const SearchScene = () => {
  const classes = useSceneStyles()
  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for Scenes`}
        inputProps={{ 'aria-label': 'search for scenes ' }}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchScene
