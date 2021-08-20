import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import Paper from '@material-ui/core/Paper'
import SearchIcon from '@material-ui/icons/Search'
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
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchUser
