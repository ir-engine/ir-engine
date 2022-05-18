import React from 'react'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useGroupStyles } from './styles'

const SearchCreator = () => {
  const classes = useGroupStyles()
  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for group`}
        inputProps={{ 'aria-label': 'search for group ' }}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchCreator
