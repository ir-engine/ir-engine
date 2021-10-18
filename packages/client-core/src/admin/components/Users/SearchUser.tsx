import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import Paper from '@material-ui/core/Paper'
import SearchIcon from '@material-ui/icons/Search'
import React from 'react'
import { useDispatch } from '../../../store'
import { UserService } from '../../state/UserService'
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
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchUser
