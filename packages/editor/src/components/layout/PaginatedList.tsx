import React, { JSXElementConstructor } from 'react'

import { any } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { Grid, Stack } from '@mui/material'

import { Button } from '../inputs/Button'
import Well from './Well'

export default function PaginatedList({
  list,
  element,
  options
}: {
  ['list']: any[]
  ['element']: any
  ['options']?: {
    ['countPerPage']?: number
  }
}) {
  const countPerPage = options?.countPerPage ?? 7
  const currentPage = useHookstate(0)

  function getPageIndices() {
    const start = countPerPage * currentPage.value
    return [start, Math.min(start + countPerPage, list.length - 1)]
  }

  const pageView = useHookstate(getPageIndices())
  useHookEffect(() => {
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
            if (!(currentPage.value + idx < 0 || currentPage.value + idx >= list.length / countPerPage))
              return (
                <Grid item xs={2}>
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
                <Grid item xs={2}>
                  <div style={{ textAlign: 'center' }}>
                    <p>·</p>
                  </div>
                </Grid>
              )
          })}
          <Grid item xs={1}>
            <Button
              onClick={() => currentPage.set(Math.min(list.length - 1, Math.max(0, currentPage.value + 1)))}
              style={{ width: 'auto' }}
            >
              +
            </Button>
          </Grid>
        </Grid>
      </Well>
      {(pageView.value[0] === pageView.value[1] ? list : list.slice(...pageView.value)).map((index) => {
        return element(index)
      })}
    </>
  )
}
