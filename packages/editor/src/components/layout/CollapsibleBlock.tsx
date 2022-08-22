import React, { useState } from 'react'
import styled from 'styled-components'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Collapse, Container, ContainerProps, Divider, Stack } from '@mui/material'

import ExpandMore from './ExpandMore'
import styles from './styles.module.scss'

export default function CollapsibleBlock({ label, children, ...rest }) {
  const [expand, setExpand] = useState<boolean>(false)
  function toggleExpand() {
    setExpand(!expand)
  }
  return (
    <div className={styles.contentContainer} {...rest}>
      <Box className="Box">
        <Stack className="Stack" spacing={1} direction="row">
          <ExpandMore expand={expand} onClick={toggleExpand} aria-expanded={expand} aria-label={label}>
            <ExpandMoreIcon />
          </ExpandMore>
          <label>{label}</label>
        </Stack>
      </Box>
      <br />
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <Divider className={styles.divider} />
        {children}
      </Collapse>
    </div>
  )
}
