import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { NavigateNext, NavigateBefore } from '@material-ui/icons'
import styles from './Inventory.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../common/components/LazyImage'
import { useAuthState } from '../../../user/services/AuthService'
import { InventoryItem } from '@xrengine/common/src/interfaces/Inventoryitem'
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
  const [inventoryItemList, setInventoryItemList] = useState<InventoryItem[]>([])
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
    setInventoryItemList(selfUser.inventory_items.value)
  }, [selfUser.inventory_items.value])

  const loadNextItems = (e) => {
    e.preventDefault()
    if ((page + 1) * itemPerPage >= inventoryItemList.length) {
      return
    }
    setPage(page + 1)
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
        <Card
          key={inventoryItem?.inventoryItemId || 'inventery-item-key-' + i}
          className={`${styles.itemPreviewWrapper}`}
        >
          {inventoryItem && (
            <CardContent onClick={() => inventoryItem && selectItem(inventoryItem)}>
              <img
                key={inventoryItem?.inventoryItemId}
                src={inventoryItem?.url}
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
