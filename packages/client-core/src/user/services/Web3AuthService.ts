import { Paginated } from '@feathersjs/feathers'
import { Downgraded } from '@speigg/hookstate'
// TODO: Decouple this
// import { endVideoChat, leave } from '@xrengine/engine/src/networking/functions/SocketWebRTCClientFunctions';
import axios from 'axios'
import i18n from 'i18next'
import _ from 'lodash'
import querystring from 'querystring'
import { useEffect } from 'react'
import { v1 } from 'uuid'

import { validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import { AuthUser, AuthUserSeed, resolveAuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { AvatarInterface, AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { IdentityProvider, IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { resolveUser, resolveWalletUser, User, UserSeed, UserSetting } from '@xrengine/common/src/interfaces/User'
import { UserApiKey } from '@xrengine/common/src/interfaces/UserApiKey'
import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { entropyToMnemonic, mnemonicToSeedSync } from 'bip39';
import { fromSeed } from 'bip32';
import { toHex } from '@cosmjs/encoding'
import {
  DirectSecp256k1HdWallet,
} from '@cosmjs/proto-signing'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessLocationState } from '../../social/services/LocationService'
import { accessPartyState } from '../../social/services/PartyService'
import { serverHost } from '../../util/config'
import { accessStoredLocalState, StoredLocalAction } from '../../util/StoredLocalState'
import { uploadToFeathersService } from '../../util/upload'
import { userPatched } from '../functions/userPatched'

export const getJunoKeyPairFromOpenLoginKey = async (openloginKey) => {
  const mnemonic_phrase = entropyToMnemonic(openloginKey);
  console.log('mnemonic_phrase', mnemonic_phrase)
  const path = `m/44'/118'/0'/0/0`
  const password = ''

  const seed = mnemonicToSeedSync(mnemonic_phrase, password)
  console.log('seed', toHex(seed))
  const masterSeed = fromSeed(seed)
  const hd = masterSeed.derivePath(path)

  const privateKey = hd.privateKey
  if (!privateKey) {
    throw new Error('null hd key')
  }
  console.log('mnemonics => ', mnemonic_phrase)
  console.log('privatekey => ', toHex(privateKey))

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic_phrase, {
    prefix: 'juno',
  })
  const accs = await wallet.getAccounts()
  let publicKey = '';
  if (accs.length) {
    publicKey = accs[0].address;
  }
  accs.map((acc) => console.log('Juno addresses => ', acc.address))

  return {
    privateKey: toHex(privateKey),
    publicKey: publicKey
  };
}