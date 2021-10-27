import React from 'react'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useUserStyles } from './style'

const SearchUser = () => {
  const classes = useUserStyles()

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase className={classes.input} placeholder={`Search for party`} inputProps={{ 'aria-label': 'party ' }} />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchUser
