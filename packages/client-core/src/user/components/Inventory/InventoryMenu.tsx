import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { NavigateNext, NavigateBefore } from '@material-ui/icons'
import styles from './Inventory.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../common/components/LazyImage'
import { InventoryService } from '../../services/InventoryService'
import { useAuthState } from '../../../user/services/AuthService'
import { useInventoryState } from '../../../user/services/InventoryState'
const InventoryMenu = (props: any): any => {
  const MAX_ITEMS_PER_PAGE = 9
  const MIN_ITEMS_PER_PAGE = 6

  const getItemPerPage = () => (window.innerWidth > 768 ? MAX_ITEMS_PER_PAGE : MIN_ITEMS_PER_PAGE)
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [itemPerPage, setItemPerPage] = useState(getItemPerPage())
  const [selectedItemId, setSelectedItemId] = useState('')
  const [isItemLoaded, setItemLoaded] = useState(false)
  const selfUser = useAuthState().user
  const inventoryState = useInventoryState()
  const inventoryItemList = inventoryState.userInventoryItems?.value || []
  useEffect((() => {
    function handleResize() {
      setItemPerPage(getItemPerPage())
    }

    window.addEventListener('resize', handleResize)

    return (_) => {
      window.removeEventListener('resize', handleResize)
    }
  }) as any)

  useEffect(() => {}, [isItemLoaded])

  useEffect(() => {
    if (page * itemPerPage >= inventoryItemList.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [inventoryState.userInventoryItems?.value])

  useEffect(() => {
    if (inventoryState.updateNeeded.value) {
      InventoryService.getUserInventory(selfUser.id?.value || '')
    }
  }, [inventoryState.updateNeeded.value])

  const loadNextItems = (e) => {
    e.preventDefault()
    if ((page + 1) * itemPerPage >= inventoryItemList.length) {
      return
    }
    setPage(page + 1)

    if (inventoryState.total.value > inventoryItemList.length) {
      loadUserInventoryItems()
    }
  }

  const loadUserInventoryItems = () => {
    // if(!inventoryState.isLoading.value && inventoryState.total.value > inventoryItemList.length){
    InventoryService.getUserInventory(
      selfUser.id?.value || '',
      inventoryState.limit.value,
      inventoryState.skip.value + inventoryState.limit.value
    )
    // }
  }

  const loadPreviousItems = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const selectItem = (itemResources: any) => {
    setSelectedItemId(itemResources.id)
  }

  const renderInventoryItemList = () => {
    const itemList: any[] = []
    const startIndex = page * itemPerPage
    const endIndex = startIndex + itemPerPage
    for (let i = startIndex; i < endIndex; i++) {
      const inventoryItem = inventoryItemList.length > i ? inventoryItemList[i] : null

      itemList.push(
        <Card key={inventoryItem?.id || 'inventery-item-key-' + i} className={`${styles.itemPreviewWrapper}`}>
          {inventoryItem && (
            <CardContent onClick={() => inventoryItem && selectItem(inventoryItem)}>
              <LazyImage
                key={inventoryItem?.id}
                src={inventoryItem?.image}
                alt={inventoryItem?.name}
                draggable="true"
              />
              <div className={styles.itemName}>{inventoryItem.name}</div>
            </CardContent>
          )}
        </Card>
      )
    }
    return itemList
  }

  return (
    <div className={styles.inventoryPanel}>
      <section className={styles.inventoryContainer}>{renderInventoryItemList()}</section>
      <section className={styles.controlContainer}>
        <button
          type="button"
          className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
          onClick={loadPreviousItems}
        >
          <NavigateBefore />
        </button>
        <div className={styles.pageBlock}>
          {t('user:inventory.page')} {page + 1} / {Math.ceil(inventoryItemList.length / itemPerPage)}
        </div>
        <button
          type="button"
          className={`${styles.iconBlock} ${
            (page + 1) * itemPerPage >= inventoryItemList.length ? styles.disabled : ''
          }`}
          onClick={loadNextItems}
        >
          <NavigateNext />
        </button>
      </section>
    </div>
  )
}

export default InventoryMenu
