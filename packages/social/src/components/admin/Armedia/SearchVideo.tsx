import React from 'react'
import { InputBase, IconButton } from '@mui/material'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useARMediaStyles } from './styles'

interface Props {
  onSearchHandler?: any
}

const SearchVideo = (props: Props) => {
  const { onSearchHandler } = props
  const classes = useARMediaStyles()
  const [search, setSearch] = React.useState('')

  const handleChange = (e: any) => {
    onSearchHandler(search)
    setSearch(e.target.value)
  }

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

export default SearchVideo
