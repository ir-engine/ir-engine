import { API, useFind, useGet } from '@ir-engine/common'
import {
  InstanceID,
  InstanceType,
  instanceAttendancePath,
  instancePath,
  instanceSignalingPath
} from '@ir-engine/common/src/schema.type.module'
import { defineState, getMutableState, none, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'

export const PeerToPeerNetworkState = defineState({
  name: 'ir.client.transport.p2p.PeerToPeerNetworkState',
  initial: () => ({}) as { [id: InstanceID]: object },
  connectToP2PInstance: (id: InstanceID) => {
    getMutableState(PeerToPeerNetworkState)[id].set({})

    return () => {
      getMutableState(PeerToPeerNetworkState)[id].set(none)
    }
  },

  reactor: () => {
    const state = useMutableState(PeerToPeerNetworkState)

    return (
      <>
        {state.keys.map((id: InstanceID) => (
          <NetworkReactor key={id} id={id} />
        ))}
      </>
    )
  }
})

const NetworkReactor = (props: { id: InstanceID }) => {
  const instance = useGet(instancePath, props.id)

  useEffect(() => {
    console.log(instance)
  }, [instance.data])

  if (!instance.data) return null

  return <ConnectionReactor instance={instance.data} />
}

const ConnectionReactor = (props: { instance: InstanceType }) => {
  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: { instanceId: props.instance.id, ended: false }
  })

  useEffect(() => {

    /** Hack until networking works and NetworkInstanceProvisioning can handle this */
    const parsed = new URL(window.location.href)
    const query = parsed.searchParams

    query.set('instanceId', props.instance.id)

    parsed.search = query.toString()
    if (typeof history.pushState !== 'undefined') {
      window.history.replaceState({}, '', parsed.toString())
    }

    API.instance
      .service(instanceSignalingPath)
      .create({ instanceID: props.instance.id })
      .then((res) => {
        instanceAttendanceQuery.refetch()
      })
  }, [])

  useEffect(() => {
    console.log('[PeerToPeerNetworkState]: instanceAttendanceQuery', instanceAttendanceQuery)
  }, [instanceAttendanceQuery.data])

  return null
}
