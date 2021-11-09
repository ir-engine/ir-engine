import { EmptyLayout } from '@xrengine/client-core/src/common/components/Layout/EmptyLayout'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import { selectInstanceConnectionState } from '../reducers/instanceConnection/selector'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import InventoryContent from '@xrengine/client-core/src/user/components/UserMenu/menus/InventoryContent'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useParams } from 'react-router-dom'

interface Props {
  instanceConnectionState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state)
  }
}

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzUxNzIwMDcsImV4cCI6MTYzNzc2NDAwNywic3ViIjoiZjJmNmY2YTAtMjJlMS0xMWVjLThkOTktODdhMmJiNzJmNGJiIiwianRpIjoiY2MyMDc0MWEtMjVhYi00MTk3LWFlNzUtYzVmMjVmMTg3OTk0In0.fdExDdxlSPg5QHTf1JwsK_ndN8LnAmrnm8OMF7qEuM0'

export const InventoryPage = (props: Props): any => {
  const dispatch = useDispatch()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [state, setState] = useState<any>({ data: [], user: [], isLoading: true, isLoadingtransfer: false })
  const { data, user, isLoading, isLoadingtransfer } = state
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
    fetchInventoryList()
    fetchUserList()
  }, [])

  const handleTransfer = async (ids, itemid) => {
    setState((prevState) => ({
      ...prevState,
      isLoadingtransfer: true
    }))
    try {
      const headers = {
        // 'Authorization': `Bearer ${token}`,
        userId: ids
      }
      const response = await axios.patch(`https://localhost:3030/user-inventory?userInventoryId=${itemid}`, {
        ...headers
      })
      if (response.data) {
        fetchInventoryList()
        console.log('success')
      }
    } catch (err) {
      console.error(err, 'error')
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoadingtransfer: false
      }))
    }
  }

  const fetchInventoryList = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      }
      const response = await axios.get(`https://localhost:3030/user?id=${id}`, { headers })
      setState((prevState) => ({
        ...prevState,
        data: [...response.data.data[0].inventory_items],
        isLoading: false
      }))
    } catch (err) {
      console.error(err, 'error')
    }
  }

  const fetchUserList = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      }
      const response = await axios.get('https://localhost:3030/user', { headers })
      if (response.data.data && response.data.data.length !== 0) {
        const activeUser = response.data.data.filter((val: any) => val.inviteCode !== null)
        setState((prevState: any) => ({
          ...prevState,
          user: [...activeUser],
          isLoading: false
        }))
      }
    } catch (err) {
      console.error(err, 'error')
    }
  }

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return (
    <EmptyLayout pageTitle={t('Inventory.pageTitle')}>
      <style>
        {' '}
        {`
                [class*=menuPanel] {
                    top: 75px;
                    bottom: initial;
                }
            `}
      </style>
      {isLoading ? (
        'Loading...'
      ) : (
        <InventoryContent
          data={data}
          user={user}
          handleTransfer={handleTransfer}
          isLoadingtransfer={isLoadingtransfer}
        />
      )}
    </EmptyLayout>
  )
}

export default connect(mapStateToProps)(InventoryPage)
