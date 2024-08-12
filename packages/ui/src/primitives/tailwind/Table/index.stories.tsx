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
import React from 'react'
import { GrGithub, GrUpdate } from 'react-icons/gr'
import { HiLink } from 'react-icons/hi2'
import { IoFolderOutline, IoPeopleOutline, IoTerminalOutline } from 'react-icons/io5'
import { RiDeleteBinLine } from 'react-icons/ri'

import Button from '../Button'
import Table, { TableBody, TableCell, TableHeaderCell, TableHeadRow, TablePagination, TableRow } from './index'

const argTypes = {}

const data = [
  {
    name: 'Andy Levius',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'xking@yahoo.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'dhomas@outlook.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'iramirez@icloud.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'iharris@icloud.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'nmitchell@yahoo.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'qadams@aol.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  }
]
const headerLabels = ['Name', 'Version', 'Commit Hash', 'Date', 'Actions']
const dataKeys = ['name', 'version', 'commitHash', 'date']

export const TableStory = () => {
  return (
    <Table>
      <TableHeadRow>
        {headerLabels.map((label, index) => (
          <TableHeaderCell
            className="border border-neutral-300 bg-neutral-100 p-2 text-left font-bold uppercase text-neutral-600"
            key={index}
          >
            {label}
          </TableHeaderCell>
        ))}
      </TableHeadRow>
      <TableBody className="">
        {data.map((row, index) => (
          <TableRow className={`border-b ${index & 1 ? 'bg-gray-200' : 'bg-gray-100'}`} key={index}>
            {dataKeys.map((key, index) => (
              <TableCell className="border border-neutral-300 p-3 text-left text-neutral-600" key={index}>
                {row[key]}
              </TableCell>
            ))}
            <TableCell className="border border-neutral-300 p-3 text-left text-neutral-600">
              <div className="flex justify-evenly">
                <Button startIcon={<GrUpdate />} size="small" className="bg-[#61759f]">
                  Update
                </Button>
                <Button startIcon={<GrGithub />} size="small" className="bg-[#61759f]">
                  Push
                </Button>
                <Button startIcon={<HiLink />} size="small" className="bg-[#61759f]">
                  Repo
                </Button>
                <Button startIcon={<IoPeopleOutline />} size="small" className="bg-[#61759f]">
                  Access
                </Button>
                <Button startIcon={<IoTerminalOutline />} size="small" className="bg-[#61759f]">
                  Invalidate Cache
                </Button>
                <Button startIcon={<IoFolderOutline />} size="small" className="bg-[#61759f]">
                  View
                </Button>
                <Button startIcon={<RiDeleteBinLine />} size="small" className="bg-[#61759f]">
                  Remove
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default {
  title: 'Primitives/Tailwind/Table',
  // component: TableStoryWrapper,
  parameters: {
    componentSubtitle: 'Table',
    // jest: 'Button.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  render: TableStory
}

export const Pagination = {
  render: TablePagination,
  args: {
    currentPage: 3,
    totalPages: 5,
    onPageChange: () => {}
  }
}
