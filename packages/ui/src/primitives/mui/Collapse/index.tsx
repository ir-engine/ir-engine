import React, { ReactNode } from 'react'

import Card from '@etherealengine/ui/src/primitives/mui/Card'

import { CollapseProps, Collapse as MuiCollapse } from '@mui/material'

const Collapse = (props: CollapseProps) => <MuiCollapse {...props} />

Collapse.displayName = 'Collapse'

Collapse.defaultProps = {
  in: false,
  collapsedSize: 100,
  children: <Card />
}

export default Collapse
