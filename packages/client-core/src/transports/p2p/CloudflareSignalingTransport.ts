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

import multiLogger from '@ir-engine/common/src/logger'
import { Engine } from '@ir-engine/ecs'
import { InstanceID, PeerID, UserID } from '@ir-engine/hyperflux'
import { MessageTypes } from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'

const logger = multiLogger.child({ component: 'CloudflareSignalingTransport' })

// Default polling intervals
const DEFAULT_FAST_POLLING_RATE_MS = 1500
const DEFAULT_SLOW_POLLING_RATE_MS = 5000
const DEFAULT_FAST_POLLING_DURATION_MS = 10000
const DEFAULT_STATE_EXPIRATION_INTERVAL_MS = 2 * 60 * 1000
const DEFAULT_STATE_HEARTBEAT_WINDOW_MS = 30000

export type CloudflareSignalingTransportOptions = {
  workerUrl: string
  fastPollingRateMs?: number
  slowPollingRateMs?: number
  fastPollingDurationMs?: number
  stateExpirationIntervalMs?: number
  stateHeartbeatWindowMs?: number
}

export class CloudflareSignalingTransport {
  private instanceID: InstanceID
  private clientID: string
  private roomID: string
  private sessionID: string
  private contextID: string
  private workerUrl: string
  private packages: any[] = []
  private dataTimestamp: number | null = null
  private lastPackages: string | null = null
  private lastProcessedReceivedDataTimestamps = new Map<string, number>()
  private packageReceivedFromPeers = new Set<string>()
  private startedAtTimestamp: number
  private isSending = false
  private finished = false
  private nextStepTime = -1
  private deleteKey: string | null = null
  private sentFirstPoll = false
  private stopFastPollingAt: number
  private stepInterval: any = null
  private reflexiveIps = new Set<string>()
  private isSymmetric = false
  private dtlsFingerprint: string | null = null

  // Options
  private fastPollingRateMs: number
  private slowPollingRateMs: number
  private fastPollingDurationMs: number
  private stateExpirationIntervalMs: number
  private stateHeartbeatWindowMs: number

  // Callbacks
  private onPeerConnected: (peerID: PeerID, userID: UserID, peerIndex: number) => void
  private onPeerDisconnected: (peerID: PeerID) => void
  private onMessage: (fromPeerID: PeerID, message: MessageTypes) => void

  constructor(
    instanceID: InstanceID,
    onPeerConnected: (peerID: PeerID, userID: UserID, peerIndex: number) => void,
    onPeerDisconnected: (peerID: PeerID) => void,
    onMessage: (fromPeerID: PeerID, message: MessageTypes) => void,
    options: CloudflareSignalingTransportOptions
  ) {
    this.instanceID = instanceID
    this.onPeerConnected = onPeerConnected
    this.onPeerDisconnected = onPeerDisconnected
    this.onMessage = onMessage

    // Generate unique IDs
    this.clientID = Engine.instance.userID
    this.roomID = instanceID
    this.sessionID = this.generateRandomString(20)
    this.contextID = this.generateRandomString(20)
    this.startedAtTimestamp = Date.now()

    // Set options
    this.workerUrl = options.workerUrl
    this.fastPollingRateMs = options.fastPollingRateMs || DEFAULT_FAST_POLLING_RATE_MS
    this.slowPollingRateMs = options.slowPollingRateMs || DEFAULT_SLOW_POLLING_RATE_MS
    this.fastPollingDurationMs = options.fastPollingDurationMs || DEFAULT_FAST_POLLING_DURATION_MS
    this.stateExpirationIntervalMs = options.stateExpirationIntervalMs || DEFAULT_STATE_EXPIRATION_INTERVAL_MS
    this.stateHeartbeatWindowMs = options.stateHeartbeatWindowMs || DEFAULT_STATE_HEARTBEAT_WINDOW_MS

    this.stopFastPollingAt = Date.now() + this.fastPollingDurationMs

    // Initialize network settings
    this.initNetworkSettings()
      .then(() => {
        // Start polling
        this.stepInterval = setInterval(this.step.bind(this), 500)
      })
      .catch((err) => {
        logger.error('Failed to initialize network settings', err)
      })
  }

  /**
   * Initialize network settings by determining reflexive IPs and DTLS fingerprint
   */
  private async initNetworkSettings(): Promise<void> {
    try {
      // Create a temporary RTCPeerConnection to get reflexive IPs
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
      })

      // Get DTLS fingerprint
      const cert = await RTCPeerConnection.generateCertificate({
        name: 'ECDSA',
        namedCurve: 'P-256'
      })

      pc.addTransceiver('audio')

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            resolve()
          } else {
            setTimeout(checkState, 100)
          }
        }
        checkState()
      })

      // Extract DTLS fingerprint from SDP
      const sdpLines = pc.localDescription?.sdp.split('\r\n') || []
      for (const line of sdpLines) {
        if (line.indexOf('a=fingerprint:') === 0) {
          this.dtlsFingerprint = line.substring(14)
          break
        }
      }

      // Extract reflexive IPs from ICE candidates
      const candidates =
        pc.localDescription?.sdp.split('\r\n').filter((line) => line.indexOf('a=candidate:') === 0) || []

      let hasUdpCandidate = false
      let hasReflexiveCandidate = false

      for (const candidate of candidates) {
        const parts = candidate.split(' ')
        const type = parts[7]
        const protocol = parts[2].toLowerCase()
        const ip = parts[4]

        if (protocol === 'udp') {
          hasUdpCandidate = true
        }

        if (type === 'srflx') {
          hasReflexiveCandidate = true
          this.reflexiveIps.add(ip)
        }
      }

      // Determine if we're behind a symmetric NAT
      this.isSymmetric = hasUdpCandidate && !hasReflexiveCandidate

      pc.close()
    } catch (err) {
      logger.error('Error initializing network settings', err)
      throw err
    }
  }

  /**
   * Send a message to a peer
   */
  public sendMessage(targetPeerID: PeerID, message: MessageTypes): void {
    // Create a package for the message
    const pkg = [
      targetPeerID,
      this.sessionID,
      /* lfrag */ null,
      /* lpwd */ null,
      /* ldtls */ null,
      /* remote ufrag */ null,
      /* remote Pwd */ null,
      Date.now(),
      []
    ]

    // Add message to the package based on its type
    switch (message.type) {
      case 'poll':
        // No additional data needed
        break
      case 'description':
        pkg[4] = this.arrayBufferToBase64(this.hexToBytes(this.dtlsFingerprint?.replaceAll(':', '') || ''))
        break
      case 'candidate':
        if (message.candidate?.candidate) {
          pkg[8].push(message.candidate.candidate)
        }
        break
      default:
        // For other message types, add them directly
        pkg[8].push(message)
        break
    }

    // Add the package to the list of packages to be sent
    if (!this.packages.includes(pkg)) {
      this.packages.push(pkg)
    }

    // Force a fast poll to send the message quickly
    this.stopFastPollingAt = Date.now() + this.fastPollingDurationMs
    this.nextStepTime = Date.now()
  }

  /**
   * Main polling step function
   */
  private async step(finish = false): Promise<void> {
    const now = Date.now()

    if (finish) {
      if (this.finished) return
      if (!this.deleteKey) return
      this.finished = true
    } else {
      if (this.nextStepTime > now) return
      if (this.isSending) return
      if (this.reflexiveIps.size === 0) return
    }

    this.isSending = true

    try {
      const localDtlsFingerprintBase64 = this.arrayBufferToBase64(
        this.hexToBytes(this.dtlsFingerprint?.replaceAll(':', '') || '')
      )

      const localPeerInfo = [
        this.sessionID,
        this.clientID,
        this.isSymmetric,
        localDtlsFingerprintBase64,
        this.startedAtTimestamp,
        [...this.reflexiveIps]
      ]

      const payload: any = { r: this.roomID, k: this.contextID }

      if (finish) {
        payload.dk = this.deleteKey
      }

      const expired =
        this.dataTimestamp === null ||
        now - this.dataTimestamp >= this.stateExpirationIntervalMs - this.stateHeartbeatWindowMs

      const packagesChanged = this.lastPackages !== JSON.stringify(this.packages)

      let includePackages = false

      if (expired || packagesChanged || finish) {
        // This will force a write
        this.dataTimestamp = now

        // Compact packages, expire any of them sent more than a minute ago
        this.packages = this.packages.filter((pkg) => {
          const sentAt = pkg[pkg.length - 2]
          return now - sentAt <= 60 * 1000
        })

        includePackages = true
      }

      if (finish) {
        includePackages = false
      }

      // The first poll should just be a read, no writes
      if (this.sentFirstPoll) {
        payload.d = localPeerInfo
        payload.t = this.dataTimestamp
        payload.x = this.stateExpirationIntervalMs

        if (includePackages) {
          payload.p = this.packages
          this.lastPackages = JSON.stringify(this.packages)
        }
      }

      const body = JSON.stringify(payload)
      const headers = { 'Content-Type': 'application/json' }

      let keepalive = false

      if (finish) {
        headers['X-Worker-Method'] = 'DELETE'
        keepalive = true
      }

      const res = await fetch(this.workerUrl, {
        method: 'POST',
        headers,
        body,
        keepalive
      })

      const { ps: remotePeerDatas, pk: remotePackages, dk } = await res.json()

      if (dk) {
        this.deleteKey = dk
      }

      if (finish) return

      // Slight optimization: if the peers are empty on the first poll, immediately publish data
      if (remotePeerDatas.length === 0 && !this.sentFirstPoll) {
        payload.d = localPeerInfo
        payload.t = this.dataTimestamp
        payload.x = this.stateExpirationIntervalMs
        payload.p = this.packages
        this.lastPackages = JSON.stringify(this.packages)

        const res = await fetch(this.workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const { dk } = await res.json()

        if (dk) {
          this.deleteKey = dk
        }
      }

      this.sentFirstPoll = true

      // Handle the worker response
      this.handleWorkerResponse(localPeerInfo, remotePeerDatas, remotePackages)

      // Determine polling rate
      if (now < this.stopFastPollingAt) {
        this.nextStepTime = now + this.fastPollingRateMs
      } else {
        this.nextStepTime = now + this.slowPollingRateMs
      }
    } catch (e) {
      logger.error('Error in polling step', e)
      this.nextStepTime = now + this.slowPollingRateMs
    } finally {
      this.isSending = false
    }
  }

  /**
   * Handle the response from the worker
   */
  private handleWorkerResponse(localPeerData: any[], remotePeerDatas: any[][], remotePackages: any[]): void {
    const [localSessionId] = localPeerData

    // Process each remote peer
    for (const remotePeerData of remotePeerDatas) {
      const [remoteSessionId, remoteClientId, , , , , remoteDataTimestamp] = remotePeerData

      // Don't process the same messages twice
      if (this.lastProcessedReceivedDataTimestamps.get(remoteSessionId) === remoteDataTimestamp) {
        continue
      }

      // Update the timestamp
      this.lastProcessedReceivedDataTimestamps.set(remoteSessionId, remoteDataTimestamp)

      // Notify about the new peer
      this.onPeerConnected(remoteSessionId, remoteClientId, 0)
    }

    // Process packages (messages)
    for (const pkg of remotePackages) {
      const [targetSessionId, fromSessionId] = pkg

      // Only process packages meant for us
      if (targetSessionId !== localSessionId) continue

      // Skip if we've already processed this package
      if (this.packageReceivedFromPeers.has(fromSessionId)) continue

      // Mark as processed
      this.packageReceivedFromPeers.add(fromSessionId)

      // Extract the message
      const message = pkg[pkg.length - 1]

      // Notify about the message
      this.onMessage(fromSessionId, message)
    }

    // Check for disconnected peers
    const remoteSessionIds = remotePeerDatas.map((p) => p[0])

    // Notify about disconnected peers
    for (const peerId of this.packageReceivedFromPeers) {
      if (!remoteSessionIds.includes(peerId)) {
        this.packageReceivedFromPeers.delete(peerId)
        this.onPeerDisconnected(peerId)
      }
    }
  }

  /**
   * Destroy the transport
   */
  public destroy(): void {
    if (this.stepInterval) {
      clearInterval(this.stepInterval)
      this.stepInterval = null
    }

    // Send a final message to clean up
    this.step(true)
  }

  /**
   * Generate a random string of specified length
   */
  private generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)

    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomValues[i] % characters.length)
    }

    return result
  }

  /**
   * Convert hex string to byte array
   */
  private hexToBytes(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)

    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }

    return bytes.buffer
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return btoa(binary)
  }
}
