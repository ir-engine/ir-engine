import React from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { IconButton } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { inviteStyles } from './styles'

const searchInvites = () => {
  const classes = inviteStyles()

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder="Search for invites"
        inputProps={{ 'aria-label': 'search for invites' }}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default searchInvites
