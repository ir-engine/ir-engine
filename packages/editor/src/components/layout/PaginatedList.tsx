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

import React, { useEffect } from 'react'

import { State, useHookstate } from '@etherealengine/hyperflux'

import { Grid } from '@mui/material'

import { Button } from '../inputs/Button'
import Well from './Well'

export default function PaginatedList<T>({
  list,
  element,
  options
}: {
  ['list']: T[] | State<T[]>
  ['element']: (index: T | State<T>) => JSX.Element
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
              style={{ width: 'auto' }}
            >
              -
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
                    style={{ width: 'auto' }}
                  >
                    {currentPage.value + idx}
                  </Button>
                </Grid>
              )
            else
              return (
                <Grid item xs={2} key={btnKey}>
                  <div style={{ textAlign: 'center' }}>
                    <p>·</p>
                  </div>
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
              style={{ width: 'auto' }}
            >
              +
            </Button>
          </Grid>
        </Grid>
      </Well>
      {(pageView.value[0] === pageView.value[1] ? list : list.slice(...pageView.value)).map((index, _index) => {
        return <div key={`${_index}`}>{element(index)}</div>
      })}
    </>
  )
}
