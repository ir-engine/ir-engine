import { useRef, useState, useCallback, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import EditorEvents from '../../constants/EditorEvents'

/**
 * useIsMounted function used to check that component get mounted or not.
 *
 * @author Robert Long
 */
function useIsMounted() {
  const ref = useRef(false)
  useEffect(() => {
    ref.current = true
    return () => {
      ref.current = false
    }
  }, [])
  return () => ref.current
}
/**
 * useLoadAsyncfunction used to load AssetPanelContent by calling API.
 *
 * @author Robert Long
 * @param  {Function} callback
 * @param  {Array}    [initialResults=[]]
 * @param  {Number}   [initialCursor=0]
 * @return {promise} Object
 */
export function useLoadAsync(callback, initialResults = [], initialCursor = 0) {
  //initializing currentPromise as mutable object
  const currentPromise = useRef()

  //initializing abortControllerRef as mutable object
  const abortControllerRef = useRef()

  //initializing getIsMounted used to check that component is mounted or not.
  const getIsMounted = useIsMounted()

  //initializing results using initial source results.
  const [results, setResults] = useState(initialResults)

  //initializing suggestions using empty array.
  const [suggestions, setSuggestions] = useState([])

  //initializing error by undefined
  const [error, setError] = useState(undefined)

  //initializing isLoading and setting it false.
  const [isLoading, setIsLoading] = useState(false)

  //initializing nextCursor using initialCursor.
  const [nextCursor, setNextCursor] = useState(initialCursor)

  //initializing hasMore setting it true.
  const [hasMore, setHasMore] = useState(true)

  //callback function used to getting results for MediaSourcePanel
  const loadAsyncInternal = useCallback(
    (params, cursor = 0) => {
      setIsLoading(true)
      setHasMore(false)
      setError(undefined)
      if (cursor === 0) {
        setResults([])
      }
      if (abortControllerRef.current) {
        ;(abortControllerRef as any).current.abort()
      }
      const abortController = new AbortController()
      ;(abortControllerRef as any).current = abortController
      const promise = callback(params, cursor, abortController.signal)
      currentPromise.current = promise
      promise
        .then((res) => {
          if (getIsMounted() && currentPromise.current === promise) {
            const nextResults = res.results || []
            if (cursor === 0) {
              setResults(nextResults)
            } else {
              setResults([...results, ...nextResults])
            }
            setSuggestions(res.suggestions || [])
            setNextCursor(res.nextCursor || 0)
            setHasMore(res.hasMore || false)
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (getIsMounted() && currentPromise.current === promise) {
            setResults([])
            setSuggestions([])
            setNextCursor(0)
            setHasMore(false)
            setError(err)
            setIsLoading(false)
            console.error(err)
          }
        })
        .finally(() => {
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = undefined
          }
        })
    },
    [
      abortControllerRef,
      setError,
      setIsLoading,
      callback,
      currentPromise,
      getIsMounted,
      results,
      setResults,
      setSuggestions,
      setNextCursor,
      setHasMore
    ]
  )

  //callback function used to load MediaSourcePanel data
  const loadAsync = useCallback((params) => loadAsyncInternal(params, 0), [loadAsyncInternal])

  //callback function used to call loadAsyncInternal if isLoading is false and hasMore is true.
  const loadMore = useCallback(
    (params) => {
      if (!isLoading && hasMore) {
        loadAsyncInternal(params, nextCursor)
      }
    },
    [isLoading, hasMore, loadAsyncInternal, nextCursor]
  )
  return {
    loadAsync,
    loadMore,
    hasMore,
    isLoading,
    results,
    suggestions,
    error
  }
}

/**
 * useAssetSearch used for providing search on MediaSourcePanel.
 *
 * @author Robert Long
 * @param {any} source
 * @param {Object} [initialParams={}]
 * @param {Array}  [initialResults=[]]
 * @param {Number} [initialCursor=0]
 */
export function useAssetSearch(source, initialParams = {}, initialResults = [], initialCursor = 0) {
  //initializing params using initialParams
  const [params, setParamsInternal] = useState(initialParams)

  // initializing loadAsync , rest by useLoadAsync response
  const { loadAsync, ...rest } = useLoadAsync(
    (searchParams, cursor, abortSignal) => {
      return source.search(searchParams, cursor, abortSignal)
    },
    initialResults,
    initialCursor
  )

  //block will exicute after rendering of component
  useEffect(() => {
    // function to handle the change in source results
    const onResultsChanged = () => {
      loadAsync(params)
    }

    //adding listener
    source.addListener(EditorEvents.RESULTS_CHANGED.toString(), onResultsChanged)

    //removing listeners
    return () => {
      source.removeListener(EditorEvents.RESULTS_CHANGED.toString(), onResultsChanged)
    }
  }, [source, loadAsync, params])

  /**
   * debouncedLoadAsync  initializing by debounced function
   * will only call the passed function when it hasn't been called for the wait period
   *
   * @author Robert Long
   * @param        {function} loadAsync [func The function to be called]
   * @param        {number} source.searchDebounceTimeout [Wait period after function hasn't been called for]
   * @returns      [A memoized function that is debounced]
   */
  const debouncedLoadAsync = useDebouncedCallback(loadAsync, source.searchDebounceTimeout)

  //callback function used to setting params by calling debouncedLoadAsync and setParamsInternal
  const setParams = useCallback(
    (nextParams) => {
      debouncedLoadAsync(nextParams)
      setParamsInternal(nextParams)
    },
    [debouncedLoadAsync, setParamsInternal]
  )
  return {
    params,
    setParams,
    ...rest
  }
}

/**
 * useAddRemoveItems function component provides callback function for adding and removing items.
 *
 * @author Robert Long
 * @param  {Array} items
 * @param  {Array}  [dependencies=[]]
 * @return {Array}  [returns array containing finalItems, addItem, removeItem]
 */
export function useAddRemoveItems(items, dependencies = []) {
  const [additionalItems, setAdditionalItems] = useState([])
  const [removedItems, setRemovedItems] = useState([])
  useEffect(() => {
    setAdditionalItems([])
    setRemovedItems([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  //callback function used to set additional items
  const addItem = useCallback(
    (item) => {
      setAdditionalItems([...additionalItems, item])
    },
    [setAdditionalItems, additionalItems]
  )

  //callback function used to set removedItems
  const removeItem = useCallback(
    (item) => {
      setRemovedItems([...removedItems, item])
    },
    [setRemovedItems, removedItems]
  )

  //initializing finalItems by filtering removedItems and by concating additionalItems
  const finalItems = items.filter((r) => removedItems.indexOf(r) === -1).concat(additionalItems)
  return [finalItems, addItem, removeItem]
}
