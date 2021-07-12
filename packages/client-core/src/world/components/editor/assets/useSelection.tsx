import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * useSelectionHandler function component used to set items selected.
 *
 * @author Robert Long
 * @param  {Array}  items
 * @param  {Array}  selectedItems
 * @param  {function}  setSelectedItems
 * @param  {Boolean} [multiselect=false]
 * @return {Array} containing callback handlers onSelect and clearSelection.
 */
export function useSelectionHandler(items, selectedItems, setSelectedItems, multiselect = false) {
  // initializing currentItems using items
  const currentItems = useRef(items)

  // callback function used on select of item.
  const onSelect = useCallback(
    (item, e) => {
      if (multiselect && e.shiftKey) {
        if (selectedItems.indexOf(item) === -1) {
          setSelectedItems([...selectedItems, item])
        } else {
          setSelectedItems(selectedItems.filter((i) => i !== item))
        }
      } else {
        setSelectedItems([item])
      }
    },
    [selectedItems, multiselect, setSelectedItems]
  )

  // callback function used to clear item selection
  const clearSelection = useCallback(() => setSelectedItems([]), [setSelectedItems])
  useEffect(() => {
    if (items !== currentItems.current) {
      clearSelection()
      currentItems.current = items
    }
  }, [items, currentItems, clearSelection])
  return [onSelect, clearSelection]
}

/**
 * useSelection
 *
 * @author Robert Long
 * @param  {Array}  items
 * @param  {Array}   [initialSelection=[]]
 * @param  {Boolean} [multiselect=false]
 * @return {object}      [returns object containing selectedItems array, setSelectedItems  onSelect clearSelection  function callbacks]
 */
export function useSelection(items, initialSelection = [], multiselect = false) {
  const [selectedItems, setSelectedItems] = useState(initialSelection)
  const [onSelect, clearSelection] = useSelectionHandler(items, selectedItems, setSelectedItems, multiselect)
  return { selectedItems, setSelectedItems, onSelect, clearSelection }
}
