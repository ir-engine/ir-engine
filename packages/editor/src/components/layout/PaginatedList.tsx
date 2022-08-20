import React, { JSXElementConstructor } from 'react'

import { any } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { useHookEffect, useHookstate } from '@xrengine/hyperflux'

import { Button } from '../inputs/Button'

export default function PaginatedList({
  list,
  element,
  onChange,
  options
}: {
  ['list']: any[]
  ['element']: any
  ['onChange']: Function
  ['options']?: {
    ['countPerPage']?: number
  }
}) {
  const countPerPage = options?.countPerPage ?? 5
  const currentPage = useHookstate(0)

  function getPageIndices() {
    const start = countPerPage * currentPage.value
    return [start, Math.min(start + countPerPage, list.length - 1)]
  }

  function getPageView() {
    return list.slice(...getPageIndices())
  }

  const pageData = getPageView()
  const pageView = useHookstate(getPageIndices())
  useHookEffect(() => {
    pageView.set(getPageIndices())
  }, [currentPage])
  return (
    <>
      <span>
        <Button onClick={() => currentPage.set(Math.min(list.length - 1, Math.max(0, currentPage.value - 1)))}>
          -
        </Button>
        <Button onClick={() => currentPage.set(Math.min(list.length - 1, Math.max(0, currentPage.value + 1)))}>
          +
        </Button>
      </span>
      {pageData.slice(...pageView.value).map((item, index) => {
        return element({ value: item, onChange: onChange(index) })
      })}
    </>
  )
}
