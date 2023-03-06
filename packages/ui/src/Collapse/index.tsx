import React, { ReactNode } from 'react'

import { CollapseProps, Collapse as MuiCollapse } from '@mui/material'

import Card from '../Card'

const Collapse = (props: CollapseProps) => <MuiCollapse {...props} />

Collapse.displayName = 'Collapse'

Collapse.defaultProps = {
  in: false,
  collapsedSize: 100,
  children: <Card />
}

export default Collapse
