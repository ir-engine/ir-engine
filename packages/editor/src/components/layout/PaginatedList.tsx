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

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { Grid } from '@mui/material'
import React, { useEffect } from 'react'

import { State, useHookstate } from '@ir-engine/hyperflux'

import { Button } from '../inputs/Button'
import Well from './Well'

const buttonStyle = {
  width: '90%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '5%'
}

export default function PaginatedList<T>({
  list,
  element,
  options
}: {
  ['list']: T[] | State<T[]>
  ['element']: (val: T | State<T>, _index: number) => JSX.Element
  ['options']?: {
    ['countPerPage']?: number
  }
}) {
  const countPerPage = options?.countPerPage ?? 7
  const currentPage = useHookstate(0)

  function getPageIndices() {
    const start = countPerPage * currentPage.value
    return [start, Math.min(start + countPerPage, list.length /*- 1*/)]
  }

  const pageView = useHookstate(getPageIndices())
  useEffect(() => {
    pageView.set(getPageIndices())
  }, [currentPage])
  return (
    <>
      <Well>
        <Grid container>
          <Grid item xs={1}>
            <Button
              onClick={() => currentPage.set(Math.min(list.length / countPerPage, Math.max(0, currentPage.value - 1)))}
              style={buttonStyle}
            >
              <ArrowLeftIcon />
            </Button>
          </Grid>
          {[-2, -1, 0, 1, 2].map((idx) => {
            const btnKey = `paginatedButton-${idx}`
            if (!(currentPage.value + idx < 0 || currentPage.value + idx >= list.length / countPerPage))
              return (
                <Grid item xs={2} key={btnKey}>
                  <Button
                    disabled={idx === 0}
                    onClick={() => currentPage.set(currentPage.value + idx)}
                    style={buttonStyle}
                  >
                    {currentPage.value + idx}
                  </Button>
                </Grid>
              )
            else
              return (
                <Grid item xs={2} key={btnKey}>
                  <div style={buttonStyle}></div>
                </Grid>
              )
          })}
          <Grid item xs={1}>
            <Button
              onClick={() =>
                currentPage.set(
                  Math.min(Math.floor((list.length - 1) / countPerPage), Math.max(0, currentPage.value + 1))
                )
              }
              style={buttonStyle}
            >
              <ArrowRightIcon />
            </Button>
          </Grid>
        </Grid>
      </Well>
      {(pageView.value[0] === pageView.value[1] ? list : list.slice(...pageView.value)).map((val, index) => {
        return <div key={`${index}`}>{element(val, index)}</div>
      })}
    </>
  )
}
