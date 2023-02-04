import React, { ReactNode } from 'react'

import { TablePagination as MuiTablePagination, TablePaginationProps } from '@mui/material'

const TablePagination = (props: TablePaginationProps & { component?: string }) => <MuiTablePagination {...props} />

TablePagination.displayName = 'TablePagination'

TablePagination.defaultProps = {
  count: 1,
  onPageChange: () => {},
  page: 1,
  rowsPerPage: 1
}

export default TablePagination
