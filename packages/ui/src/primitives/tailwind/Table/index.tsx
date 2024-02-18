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
    'p-6',
    'border border-neutral-300 dark:border-[0.5px] dark:border-[#2B2C30]',
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
  const twClassName = twMerge('text-left uppercase', 'bg-neutral-100 dark:bg-[#212226]', className)
  return (
    <thead className={theadClassName}>
      <tr className={twClassName}>{children}</tr>
    </thead>
  )
}

const TableCell = ({ className, children, ...props }: TableCellProps) => {
  const twClassName = twMerge(
    'p-6',
    'border border-neutral-300 dark:border-[0.5px] dark:border-[#2B2C30]',
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
  const twClassName = twMerge('even:bg-theme-surfaceMain odd:bg-gray-100 odd:dark:bg-[#212226]', className)
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
  className?: string
  children?: ReactNode
}

const Table = ({ className, children }: TableProps) => {
  const twClassName = twMerge('min-w-full border-collapse overflow-x-auto rounded-md text-sm', className)
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className=" inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className={twClassName}>{children}</table>
          </div>
        </div>
      </div>
    </div>
  )
}

const TablePagination = ({
  className,
  steps = 3,
  totalPages,
  currentPage,
  onPageChange
}: {
  className?: string
  totalPages: number
  currentPage: number
  steps?: number
  onPageChange: (newPage: number) => void
}) => {
  return (
    <tfoot className="flex-column flex flex-wrap items-center justify-between pt-4 md:flex-row">
      <tr>
        <td>
          <ul className="inline-flex h-8 -space-x-px text-sm rtl:space-x-reverse">
            <li>
              <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(0)}
                className="bg-theme-surfaceMain flex h-8 items-center justify-center rounded-s-lg border border-gray-300 px-3 leading-tight text-gray-500 hover:enabled:bg-gray-100 hover:enabled:text-gray-700  dark:border-gray-700 dark:text-white dark:hover:enabled:text-white"
              >
                <HiRewind />
              </button>
            </li>
            <li>
              <button
                disabled={currentPage === 0}
                className="bg-theme-surfaceMain flex h-8 items-center justify-center border border-gray-300 px-3 leading-tight text-gray-500 hover:enabled:bg-gray-100 hover:enabled:text-gray-700  dark:border-gray-700 dark:text-white dark:hover:enabled:text-white"
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              >
                <GoChevronLeft />
              </button>
            </li>
            {[...Array(Math.min(totalPages, steps)).keys()].map((page) => (
              <li key={page}>
                <button
                  onClick={() => onPageChange(page)}
                  className={`bg-theme-surfaceMain flex h-8 items-center justify-center border border-gray-300 px-3 leading-tight text-gray-500 hover:enabled:bg-gray-100 hover:enabled:text-gray-700  dark:border-gray-700 dark:text-white dark:hover:enabled:text-white ${
                    currentPage === page ? 'bg-blue-50 dark:bg-gray-500' : ''
                  }`}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                className="bg-theme-surfaceMain flex h-8 items-center justify-center border border-gray-300 px-3 leading-tight text-gray-500 hover:enabled:bg-gray-100 hover:enabled:text-gray-700  dark:border-gray-700 dark:text-white dark:hover:enabled:text-white"
              >
                <GoChevronRight />
              </button>
            </li>
            <li>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(totalPages - 1)}
                className="bg-theme-surfaceMain flex h-8 items-center justify-center rounded-e-lg border border-gray-300 px-3 leading-tight text-gray-500 hover:enabled:bg-gray-100 hover:enabled:text-gray-700  dark:border-gray-700 dark:text-white dark:hover:enabled:text-white"
              >
                <HiFastForward />
              </button>
            </li>
          </ul>
        </td>
      </tr>
    </tfoot>
  )
}

export default Table
export { TableHeaderCell, TableCell, TableRow, TableHeadRow, TableBody, TablePagination, Table }
