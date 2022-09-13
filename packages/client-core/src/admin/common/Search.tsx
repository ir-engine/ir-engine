import React from 'react'

import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import { SxProps, Theme } from '@mui/material/styles'

import styles from '../styles/search.module.scss'

interface Props {
  text: string
  sx?: SxProps<Theme>
  handleChange: (e) => void
}

const Search = ({ text, sx, handleChange }: Props) => {
  return (
    <Paper component="div" className={styles.searchRoot} sx={sx}>
      <InputBase
        className={styles.input}
        placeholder={`Search for ${text}`}
        inputProps={{ 'aria-label': 'search for location ' }}
        onChange={(e) => handleChange(e)}
      />
      <IconButton className={styles.iconButton} aria-label="search" size="large">
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default Search
