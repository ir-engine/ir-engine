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

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFetch } from 'use-http'

/**
 *
 * @param path
 * @param queryParams
 * @param options
 * @returns
 */
export default function usePaginatedSearch(
  path: string,
  queryParams: Record<string, any>,
  options = {} as { headers: { [key: string]: string } }
): { loading: boolean; error: unknown; entries: Array<unknown>; loadMore: () => void; hasMore: boolean } {
  const urlRef = useRef() as any

  if (!urlRef.current) {
    urlRef.current = new URL(path, (window as any).location)

    for (const name in queryParams) {
      if (typeof queryParams[name] !== 'undefined') {
        urlRef.current.searchParams.set(name, queryParams[name])
      }
    }
  }

  const [href, setHref] = useState(urlRef.current.href)

  useEffect(() => {
    urlRef.current = new URL(path, (window as any).location)

    for (const name in queryParams) {
      if (typeof queryParams[name] !== 'undefined') {
        urlRef.current.searchParams.set(name, queryParams[name])
      }
    }

    setHref(urlRef.current.href)
  }, [path, urlRef, queryParams])

  const cursor = urlRef.current.searchParams.get('cursor')

  const {
    loading,
    error,
    data: {
      entries,
      meta: { next_cursor }
    }
  } = useFetch(
    href,
    {
      headers: {
        'content-type': 'application/json',
        ...options.headers
      },
      onNewData: (data, newData) => {
        if (!cursor) {
          return { entries: newData, meta: { next_cursor: null } }
        } else {
          return {
            entries: [...data.entries, ...newData.entries],
            meta: newData.meta
          }
        }
      },
      data: { entries: [], meta: { next_cursor: null } }
    },
    [href]
  )

  const loadMore = useCallback(() => {
    if (next_cursor) {
      urlRef.current.searchParams.set('cursor', next_cursor)
      setHref(urlRef.current.href)
    }
  }, [urlRef, next_cursor])

  const hasMore = next_cursor && cursor !== next_cursor

  return { loading, error, entries: !cursor && loading ? [] : entries, loadMore, hasMore }
}
