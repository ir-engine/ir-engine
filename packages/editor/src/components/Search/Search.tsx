import React from 'react'

import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import { useStyles } from './styles'

interface Props {
  elementsName: string
  handleInputChange?: any
}

const Search = (props: Props) => {
  const classes = useStyles()
  const { elementsName, handleInputChange } = props

  const handleChange = (e: any) => {
    handleInputChange(e.target.value)
  }

  return (
    <Paper component="form" className={elementsName === 'hierarchy' ? classes.searchRoot : classes.searchRootB}>
      <InputBase
        className={classes.input}
        onChange={handleChange}
        placeholder="search..."
        endAdornment={<SearchIcon className={classes.iconButton} />}
      />
    </Paper>
  )
}

export default Search
