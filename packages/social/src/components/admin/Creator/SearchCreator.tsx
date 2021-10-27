import React from 'react'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useCreatorStyles } from './styles'

const SearchCreator = () => {
  const classes = useCreatorStyles()
  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for users`}
        inputProps={{ 'aria-label': 'search for users ' }}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchCreator
