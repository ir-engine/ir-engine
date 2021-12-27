import React from 'react'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useRouteStyles } from './styles'

interface Props {}

const SearchLocation = (props: Props) => {
  const classes = useRouteStyles()
  const [search, setSearch] = React.useState('')
  //    const handleChange = (e: any) => {
  //      setSearch(e.target.value);
  //    };

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for location`}
        inputProps={{ 'aria-label': 'search for location ' }}
        //onChange={handleChange}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchLocation
