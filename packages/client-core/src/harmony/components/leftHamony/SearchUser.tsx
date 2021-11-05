import React from 'react'
import SearchIcon from '@mui/icons-material/Search'
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
