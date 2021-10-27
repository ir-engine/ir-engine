import React from 'react'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import { useUserStyles } from './style'
import { StyledPaper, StyledInputBase, StyledIconButton } from './style'

const SearchUser = () => {
  return (
    <StyledPaper>
      <StyledInputBase placeholder={`Search for party`} inputProps={{ 'aria-label': 'party ' }} />
      <StyledIconButton type="submit" aria-label="search">
        <SearchIcon />
      </StyledIconButton>
    </StyledPaper>
  )
}

export default SearchUser
