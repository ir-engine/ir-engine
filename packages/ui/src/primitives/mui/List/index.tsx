import React, { ReactNode } from 'react'

import { ListProps, List as MuiList } from '@mui/material'

const List = ({ children, ...props }: ListProps) => <MuiList {...props}>{children}</MuiList>

List.displayName = 'List'

List.defaultProps = {
  children: null
}

export default List
