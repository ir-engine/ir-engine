import React from 'react'

import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { useInstanceStyles } from './styles'

const SearchUser = () => {
  const classes = useInstanceStyles()

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for instance`}
        inputProps={{ 'aria-label': 'search for users ' }}
        //  onChange={handleChange}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchUser
