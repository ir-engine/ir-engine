/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { ReactNode } from 'react'
import { HiArrowSmallDown, HiArrowSmallUp } from 'react-icons/hi2'

import { FeathersOrder, useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'
import Table, {
  TableBody,
  TableCell,
  TableHeadRow,
  TableHeaderCell,
  TablePagination,
  TableRow
} from '@etherealengine/ui/src/primitives/tailwind/Table'

export interface ITableHeadCell {
  id: string | number
  label: string
  sortable?: boolean
  className?: string
}

interface TableHeadProps {
  onRequestSort: (property: string | number, order: FeathersOrder) => void
  order: FeathersOrder
  orderBy: string | number
  columns: ITableHeadCell[]
}

const TableHead = ({ order, orderBy, onRequestSort, columns }: TableHeadProps) => {
  const SortArrow = ({ columnId }: { columnId: string | number }) => {
    if (columnId === orderBy) {
      if (order === 1) {
        return <HiArrowSmallUp onClick={() => onRequestSort(columnId, -1)} />
      }
      return <HiArrowSmallDown onClick={() => onRequestSort(columnId, 1)} />
    }
    return <HiArrowSmallUp className={'opacity-0 hover:opacity-50'} />
  }

  return (
    <TableHeadRow>
      {columns.map((column) => (
        <TableHeaderCell key={column.id} className={column.className}>
          {column.sortable ? (
            <span className="flex items-center gap-2">
              {column.label}
              {<SortArrow columnId={column.id} />}
            </span>
          ) : (
            column.label
          )}
        </TableHeaderCell>
      ))}
    </TableHeadRow>
  )
}

interface DataTableProps {
  query: ReturnType<typeof useFind>
  rows: Record<string | 'className' | 'id', string | ReactNode>[]
  columns: ITableHeadCell[]
}

const DataTable = ({ query, columns, rows }: DataTableProps) => {
  const [orderBy, order] = (Object.entries(query.sort)[0] as [string | number, FeathersOrder]) ?? ['', 0]

  return query.status !== 'success' ? (
    <div className="flex h-96 w-full items-center justify-center">
      <LoadingCircle className="flex w-1/4 items-center justify-center" />
    </div>
  ) : (
    <Table>
      <TableHead
        order={order}
        orderBy={orderBy}
        onRequestSort={(property, order) => query.setSort({ [property]: order })}
        columns={columns}
      />
      <TableBody>
        {rows.map((row, rowIdx) => (
          <TableRow key={typeof row['id'] === 'string' ? row['id'] : rowIdx}>
            {columns.map((column, columnIdx) => (
              <TableCell key={columnIdx}>{row[column.id]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TablePagination
        totalPages={Math.ceil(query.total / query.limit)}
        currentPage={query.page}
        onPageChange={(newPage) => query.setPage(newPage)}
      />
    </Table>
  )
}

export default DataTable
