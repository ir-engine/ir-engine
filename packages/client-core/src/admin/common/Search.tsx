import React from 'react'

import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import InputBase from '@etherealengine/ui/src/InputBase'
import Paper from '@etherealengine/ui/src/Paper'

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
      <IconButton className={styles.iconButton} title="search" size="large" icon={<Icon type="Search" />} />
    </Paper>
  )
}

export default Search
