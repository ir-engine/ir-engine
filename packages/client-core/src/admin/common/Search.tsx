import React from 'react'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useStyles } from '../styles/ui'

interface Props {
  text: string
  handleChange: (e) => void
}

const Search = (props: Props) => {
  const { text, handleChange } = props
  const classes = useStyles()

  return (
    <Paper component="div" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for ${text}`}
        inputProps={{ 'aria-label': 'search for location ' }}
        onChange={(e) => handleChange(e)}
      />
      <IconButton className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default Search
