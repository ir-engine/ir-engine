/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { ReactNode } from 'react'
import { GoChevronLeft, GoChevronRight } from 'react-icons/go'
import { HiFastForward, HiRewind } from 'react-icons/hi'
import { twMerge } from 'tailwind-merge'

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string
  children?: ReactNode
}

const TableHeaderCell = ({ className, children, ...props }: TableCellProps) => {
  const twClassName = twMerge(
    'text-neutral-600 dark:text-white',
    'p-4',
    'border border-[0.5px] border-theme-primary',
    className
  )
  return (
    <th className={twClassName} {...props}>
      {children}
    </th>
  )
}

const TableHeadRow = ({
  theadClassName,
  className,
  children
}: {
  theadClassName?: string
  className?: string
  children: JSX.Element | JSX.Element[]
}) => {
  const twClassName = twMerge('text-left capitalize', className)
  const twClassNameThead = twMerge('sticky top-0 z-10 bg-theme-table-secondary', theadClassName)
  return (
    <thead className={twClassNameThead}>
      <tr className={twClassName}>{children}</tr>
    </thead>
  )
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
  const twClassName = twMerge(
    'p-4',
    'border border-[0.5px] border-theme-primary',
    'text-left text-neutral-600 dark:text-white',
    className
  )
  return (
    <td className={twClassName} {...props}>
      {children}
    </td>
  )
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string
  children?: ReactNode
}
const TableRow = ({ className, children, ...props }: TableRowProps) => {
  const twClassName = twMerge('bg-theme-surface-main even:bg-theme-table-secondary', className)
  return (
    <tr className={twClassName} {...props}>
      {children}
    </tr>
  )
}

interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string
  children?: ReactNode
}

const TableBody = ({ className, children, ...props }: TableSectionProps) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string
  className?: string
  children?: ReactNode
}

const Table = ({ containerClassName, className, children }: TableProps) => {
  const twClassname = twMerge('relative w-full border-collapse whitespace-nowrap text-sm', className)
  return (
    <div className={twMerge('overflow-x-auto rounded-md', containerClassName)}>
      <table className={twClassname}>{children}</table>
    </div>
  )
}

const TablePagination = ({
  className,
  neighbours = 1,
  totalPages,
  currentPage,
  onPageChange
}: {
  className?: string
  totalPages: number
  currentPage: number
  neighbours?: number
  onPageChange: (newPage: number) => void
}) => {
  const commonClasses = twMerge(
    'flex h-8 items-center justify-center border bg-theme-primary px-3 leading-tight',
    'border-gray-300 dark:border-gray-600',
    'text-gray-400 dark:text-gray-500',
    'enabled:text-gray-600 dark:enabled:dark:text-gray-300',
    'hover:enabled:bg-gray-200 dark:hover:enabled:bg-gray-700',
    'hover:enabled:text-gray-700 dark:hover:enabled:text-gray-200'
  )

  const prevPages = [] as number[]
  for (let i = currentPage - 1; i >= Math.max(0, currentPage - neighbours); i--) {
    prevPages.push(i)
  }
  prevPages.reverse()

  const nextPages = [] as number[]
  for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + neighbours + 1); i++) {
    nextPages.push(i)
  }

  return (
    <div className="flex-column mb-2 flex flex-wrap items-center justify-center pt-4 md:flex-row">
      <ul className="inline-flex h-8 -space-x-px text-sm rtl:space-x-reverse">
        <li>
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(0)}
            className={twMerge(commonClasses, 'rounded-s-lg')}
          >
            <HiRewind />
          </button>
        </li>
        <li>
          <button
            disabled={currentPage === 0}
            className={commonClasses}
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          >
            <GoChevronLeft />
          </button>
        </li>
        {prevPages.map((page) => (
          <li key={page}>
            <button onClick={() => onPageChange(page)} className={commonClasses}>
              {page + 1}
            </button>
          </li>
        ))}

        <li>
          <button
            onClick={() => onPageChange(currentPage)}
            className={twMerge(commonClasses, 'bg-gray-300 dark:bg-gray-600')}
          >
            {currentPage + 1}
          </button>
        </li>

        {nextPages.map((page) => (
          <li key={page}>
            <button onClick={() => onPageChange(page)} className={commonClasses}>
              {page + 1}
            </button>
          </li>
        ))}

        {totalPages > 0 && nextPages[nextPages.length - 1] < totalPages - 2 && (
          <li>
            <button disabled={true} className={commonClasses}>
              ...
            </button>
          </li>
        )}

        {totalPages > 0 && nextPages[nextPages.length - 1] < totalPages - 1 && (
          <>
            <li key={totalPages}>
              <button onClick={() => onPageChange(totalPages - 1)} className={commonClasses}>
                {totalPages}
              </button>
            </li>
          </>
        )}
        <li>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            className={commonClasses}
          >
            <GoChevronRight />
          </button>
        </li>
        <li>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            className={twMerge(commonClasses, 'rounded-e-lg')}
          >
            <HiFastForward />
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Table
export { Table, TableBody, TableCell, TableHeadRow, TableHeaderCell, TablePagination, TableRow }
