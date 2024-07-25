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

import React, { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowSmallDown, HiArrowSmallUp, HiArrowsUpDown } from 'react-icons/hi2'

import { ImmutableObject, NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { FeathersOrder, useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Table, {
  TableBody,
  TableCell,
  TableHeadRow,
  TableHeaderCell,
  TablePagination,
  TableRow
} from '@etherealengine/ui/src/primitives/tailwind/Table'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'

export interface ITableHeadCell {
  id: string | number
  label: string | JSX.Element
  sortable?: boolean
  className?: string
}

interface TableHeadProps {
  onRequestSort: (property: string | number, order: FeathersOrder) => void
  order: ImmutableObject<Record<string, FeathersOrder>>
  columns: ITableHeadCell[]
}

const TableHead = ({ order, onRequestSort, columns }: TableHeadProps) => {
  const SortArrow = ({ columnId }: { columnId: string | number }) => {
    const currentOrder: FeathersOrder = columnId in order && order[columnId] === 1 ? 1 : -1
    const newOrder: FeathersOrder = currentOrder === 1 ? -1 : 1
    const Icon = currentOrder === 1 ? HiArrowSmallDown : HiArrowSmallUp

    if (columnId in order && order[columnId] === 1) {
      return <Icon onClick={() => onRequestSort(columnId, newOrder)} />
    }
    return <HiArrowsUpDown onClick={() => onRequestSort(columnId, newOrder)} />
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

type RowType = Record<string | 'className' | 'id', string | ReactNode>

interface DataTableProps {
  query: ReturnType<typeof useFind>
  rows: RowType[]
  columns: ITableHeadCell[]
}

const DataTable = ({ query, columns, rows }: DataTableProps) => {
  const { t } = useTranslation()

  const storedRows = useHookstate<{ fetched: boolean; rows: RowType[] }>({ fetched: false, rows: [] })

  useEffect(() => {
    if (['success', 'error'].includes(query.status)) {
      storedRows.set({ fetched: true, rows })
    }
  }, [rows, query.status])

  return !storedRows.fetched.value ? (
    <div className="flex animate-pulse flex-col gap-2">
      {Array.from({ length: 20 }, (_, i) => i).map((idx) => (
        <div
          key={idx}
          className="h-12 w-full odd:bg-gray-300 even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700"
        />
      ))}
    </div>
  ) : (
    <div className="relative h-full">
      {query.status === 'pending' && (
        <div className="absolute left-1/2 top-1/2 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center">
          <LoadingView className="mx-1 h-8 w-8" />
          <Text className="mx-1">{t('common:table.refetching')}</Text>
        </div>
      )}
      <Table containerClassName={`${query.status === 'pending' && 'opacity-50'} h-[calc(100%_-_160px)]`}>
        <TableHead
          order={query.sort}
          onRequestSort={(property, order) => query.setSort({ [property]: order })}
          columns={columns}
        />
        <TableBody>
          {storedRows.rows.length === 0 && (
            <TableRow>
              <TableCell {...{ colSpan: columns.length }} className="text-center italic">
                {t('common:table.noData')}
              </TableCell>
            </TableRow>
          )}
          {storedRows.rows.get(NO_PROXY).map((row, rowIdx) => (
            <TableRow key={typeof row['id'] === 'string' ? row['id'] : rowIdx}>
              {columns.map((column, columnIdx) => (
                <TableCell key={columnIdx} className={column.className}>
                  {row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        totalPages={Math.ceil(query.total / query.limit)}
        currentPage={query.page}
        onPageChange={(newPage) => query.setPage(newPage)}
      />
    </div>
  )
}

export default DataTable
