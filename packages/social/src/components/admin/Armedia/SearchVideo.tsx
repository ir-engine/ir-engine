import React from 'react'
import { InputBase, IconButton } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import SearchIcon from '@material-ui/icons/Search'
import { useStyles } from './styles'

interface Props {
  onSearchHandler?: any
}

const SearchVideo = (props: Props) => {
  const { onSearchHandler } = props
  const classes = useStyles()
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
      <IconButton type="submit" className={classes.iconButton} arial-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchVideo
