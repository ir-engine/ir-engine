import React from 'react'
import styled from 'styled-components'

import { IconButton, IconButtonProps } from '@mui/material'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ExpandMoreContainer = (styled as any).div`
  background-color: var(--inputBackground);
  border-radius: 24px;
`

const _expandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  color: expand ? 'var(--textColor)' : 'var(--mainBackground)',
  marginLeft: 'auto',
  width: '0.75em',
  height: '0.75em',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

export default function ExpandMore(props: ExpandMoreProps) {
  return (
    <ExpandMoreContainer>
      <_expandMore {...props} />
    </ExpandMoreContainer>
  )
}
