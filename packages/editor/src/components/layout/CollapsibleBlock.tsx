import React, { useState } from 'react'
import styled from 'styled-components'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Collapse, Stack } from '@mui/material'

import ExpandMore from './ExpandMore'

const CollapsibleContainer = (styled as any).div`
    width: 80%;
    margin: 4px;
    color: var(--textColor);
`

export default function CollapsibleBlock({ label, children, ...rest }) {
  const [expand, setExpand] = useState<boolean>(false)
  function toggleExpand() {
    setExpand(!expand)
  }
  return (
    <CollapsibleContainer {...rest}>
      <Box sx={{ marginTop: '4px', marginBottom: '4px' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ExpandMore expand={expand} onClick={toggleExpand} aria-expanded={expand} aria-label={label}>
            <ExpandMoreIcon />
          </ExpandMore>
          <label>{label}</label>
        </Stack>
      </Box>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </CollapsibleContainer>
  )
}
