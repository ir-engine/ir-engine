import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import React from 'react'
import { useDispatch } from '../../../store'
import { UserService } from '../../services/UserService'
import { useUserStyles } from './styles'

interface Props {}

const SearchUser = (props: Props) => {
  const classes = useUserStyles()
  const [search, setSearch] = React.useState('')
  const dispatch = useDispatch()

  const handleChange = (e: any) => {
    UserService.searchUserAction(search)
    setSearch(e.target.value)
  }

  return (
    <Paper component="form" className={classes.searchRoot}>
      <InputBase
        className={classes.input}
        placeholder={`Search for users`}
        inputProps={{ 'aria-label': 'search for users ' }}
        onChange={handleChange}
      />
      <IconButton type="submit" className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchUser
