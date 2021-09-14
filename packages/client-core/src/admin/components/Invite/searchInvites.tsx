import React from 'react'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import { IconButton } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
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
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default searchInvites
