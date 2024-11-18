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

import { API } from '@ir-engine/common'
import { StaticResourceQuery, StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { State, useHookstate, usePrevious } from '@ir-engine/hyperflux'
import React, { ReactNode, createContext, useContext, useEffect } from 'react'
import { ASSETS_PAGE_LIMIT, Category, calculateItemsToFetch, iterativelyListTags, mapCategoriesHelper } from './helpers'

const AssetsQueryContext = createContext({
  search: null! as State<{ local: string; query: string }>,
  resources: [] as StaticResourceType[],
  refetchResources: () => {},
  resourcesLoading: false,
  staticResourcesPagination: null! as State<{ total: number; skip: number }>,

  category: {
    currentCategoryPath: null! as State<Category[]>,
    categories: null! as State<Category[]>,
    expandedCategories: {} as State<{ [key: string]: boolean }>,
    sidebarWidth: null! as State<number>
  }
})

export const AssetsQueryProvider = ({ children }: { children: ReactNode }) => {
  const search = useHookstate({ local: '', query: '' })
  const staticResourcesPagination = useHookstate({ total: 0, skip: 0 })
  const resources = useHookstate<StaticResourceType[]>([])
  const resourcesLoading = useHookstate(false)

  const currentCategoryPath = useHookstate<Category[]>([])
  const categories = useHookstate<Category[]>([])
  const expandedCategories = useHookstate({} as { [key: string]: boolean })
  const categorySidbarWidth = useHookstate(300)
  const previousSearchQuery = usePrevious(search.query)

  const staticResourcesFindApi = () => {
    const abortController = new AbortController()
    const selectedCategory = currentCategoryPath.at(-1)?.value

    resourcesLoading.set(true)

    const performFetch = () => {
      const tags = selectedCategory ? [selectedCategory.name, ...iterativelyListTags(selectedCategory.object)] : []

      const query = {
        key: {
          $like: `%${search.query.value}%`
        },
        type: {
          $or: [{ type: 'asset' }]
        },
        tags: selectedCategory
          ? {
              $or: tags.flatMap((tag) => [
                { tags: { $like: `%${tag.toLowerCase()}%` } },
                { tags: { $like: `%${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}%` } },
                {
                  tags: {
                    $like: `%${tag
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}%`
                  }
                }
              ])
            }
          : undefined,
        $sort: { mimeType: 1 },
        $limit: ASSETS_PAGE_LIMIT + calculateItemsToFetch(),
        $skip: Math.min(staticResourcesPagination.skip.value, staticResourcesPagination.total.value)
      } as StaticResourceQuery

      API.instance
        .service(staticResourcePath)
        .find({ query })
        .then((fetchedResources) => {
          if (abortController.signal.aborted) return

          if (staticResourcesPagination.skip.value > 0 && previousSearchQuery === search.query.value) {
            resources.merge(fetchedResources.data)
          } else {
            resources.set(fetchedResources.data)
          }
          staticResourcesPagination.merge({ total: resources.length })
          resourcesLoading.set(false)
        })
    }

    performFetch()

    return () => {
      abortController.abort()
    }
  }

  useEffect(() => {
    const abortSignal = staticResourcesFindApi()
    return () => abortSignal()
  }, [])

  useEffect(() => {
    categories.set(mapCategoriesHelper(expandedCategories.value))
  }, [expandedCategories])

  return (
    <AssetsQueryContext.Provider
      value={{
        search,
        resources: resources.value as StaticResourceType[],
        refetchResources: staticResourcesFindApi,
        resourcesLoading: resourcesLoading.value,
        staticResourcesPagination,
        category: {
          categories,
          currentCategoryPath,
          expandedCategories,
          sidebarWidth: categorySidbarWidth
        }
      }}
    >
      {children}
    </AssetsQueryContext.Provider>
  )
}

export const useAssetsQuery = () => useContext(AssetsQueryContext)
export const useAssetsCategory = () => useContext(AssetsQueryContext).category
