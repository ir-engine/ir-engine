import React from 'react'
import { InputBase, IconButton } from '@mui/material'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useFeedStyles } from './styles'

const SearchFeed = () => {
  const classes = useFeedStyles()

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={'Search for media'}
        inputProps={{ 'aria-label': 'search for media' }}
        // onChange={handleChange}
      />
      <IconButton type="submit" className={classes.iconButton} arial-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchFeed
