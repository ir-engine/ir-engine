import { API, useFind, useGet } from '@ir-engine/common'
import {
  InstanceID,
  InstanceType,
  instanceAttendancePath,
  instancePath,
  instanceSignalingPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { Engine } from '@ir-engine/ecs'
import { PeerID, defineState, getMutableState, none, useMutableState } from '@ir-engine/hyperflux'
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
    // console.log(instance)
  }, [instance.data])

  if (!instance.data) return null

  return <ConnectionReactor instance={instance.data} />
}

const ConnectionReactor = (props: { instance: InstanceType }) => {
  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: props.instance.id,
      ended: false,
      updatedAt: {
        // Only consider instances that have been updated in the last 10 seconds
        $gt: toDateTimeSql(new Date(new Date().getTime() - 10000))
      }
    }
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

    API.instance.service(instanceSignalingPath).on('patched', (data) => {
      // need to ignore messages from self
      if (data.fromPeerID === Engine.instance.store.peerID) return
      console.log('patched event:', data, Date.now())
      if (data.instanceID !== props.instance.id) return
      // switch (data.message.type) {
      //   case 'offer':
      //     API.instance.service(instanceSignalingPath).patch(null, {
      //       instanceID: props.instance.id,
      //       targetPeerID: data.peerId,
      //       message: {
      //         type: 'offer',
      //         data: { foo: 'bar' }
      //       }
      //     })
      //     break
      // }
    })

    /** heartbeat */
    setInterval(() => {
      API.instance.service(instanceSignalingPath).get({ instanceID: props.instance.id })
    }, 5000)
  }, [])

  useEffect(() => {
    for (const otherPeer of instanceAttendanceQuery.data) {
      if (seenPeers.includes(otherPeer.peerId)) continue
      if (otherPeer.peerId === Engine.instance.store.peerID) continue
      console.log('sending patched message to', otherPeer, Date.now())
      seenPeers.push(otherPeer.peerId)
      API.instance.service(instanceSignalingPath).patch(null, {
        instanceID: props.instance.id,
        targetPeerID: otherPeer.peerId,
        message: {
          type: 'offer',
          data: { foo: 'bar' }
        }
      })
    }
  }, [instanceAttendanceQuery.data])

  return null
}

//temp
const seenPeers = [] as PeerID[]
