/* global BigInt */
import { Principal } from "@dfinity/principal";  
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { getCrc32 } from '@dfinity/principal/lib/esm/utils/getCrc';
import { sha224 } from '@dfinity/principal/lib/esm/utils/sha224';
import RosettaApi from './RosettaApi';
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
const NNS_CANISTER_ID = "qoctq-giaaa-aaaaa-aaaea-cai";
const CYCLES_MINTING_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai";
const rosettaApi = new RosettaApi();
import sjcl from 'sjcl'
import bip39 from 'bip39'
import pbkdf2 from "pbkdf2"

const getCyclesTopupAddress = (canisterId) => {
  return principalToAccountIdentifier(CYCLES_MINTING_CANISTER_ID, getCyclesTopupSubAccount(canisterId));
}
const getCyclesTopupSubAccount = (canisterId) => {
  var pb = Array.from(Principal.fromText(canisterId).toUint8Array());
  return [pb.length, ...pb];
}
const amountToBigInt = (amount, decimals) => {
  //decimals = decimals ?? 8;
  if (amount < 1) {
    amount = BigInt(amount*(10**decimals));
  } else {
    amount = BigInt(amount)*BigInt(10**decimals)
  }
  return amount;
}
const principalToAccountIdentifier = (p, s) => {
  const padding = Buffer.from("\x0Aaccount-id");
  const array = new Uint8Array([
      ...padding,
      ...Principal.fromText(p).toUint8Array(),
      ...getSubAccountArray(s)
  ]);
  const hash = sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([
      ...checksum,
      ...hash
  ]);
  return toHexString(array2);
};
const getSubAccountArray = (s) => {
  if (Array.isArray(s)){
    return s.concat(Array(32-s.length).fill(0));
  } else {
    //32 bit number only
    return Array(28).fill(0).concat(to32bits(s ? s : 0))
  }
};
const from32bits = ba => {
  var value;
  for (var i = 0; i < 4; i++) {
    value = (value << 8) | ba[i];
  }
  return value;
}
const to32bits = num => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
}
const toHexString = (byteArray)  =>{
  return Array.from(byteArray, function(byte: any) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}
const fromHexString = (hex) => {
  if (hex.substr(0,2) === "0x") hex = hex.substr(2);
  for (var bytes = [], c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}
const mnemonicToId = (mnemonic) => {
  var seed = bip39.mnemonicToSeedSync(mnemonic) as any;
  seed = Array.from(seed);
  seed = seed.splice(0, 32);
  seed = new Uint8Array(seed);
  return Ed25519KeyIdentity.generate(seed);
}
const encrypt = (mnemonic, principal, password) => {
  return new Promise((resolve, reject) => {
    pbkdf2.pbkdf2(password, principal, 30000, 512, 'sha512', (e, d) => {
      if (e) return reject(e);
      resolve(sjcl.encrypt(d.toString(), btoa(mnemonic)));
    });
  });
}
const decrypt = (data, principal, password) => {
  return new Promise((resolve, reject) => {
    pbkdf2.pbkdf2(password, principal, 30000, 512, 'sha512', (e, d) => {
      if (e) return reject(e);
      try{
        resolve(atob(sjcl.decrypt(d.toString(), data)));
      } catch (e) {
        reject(e);
      }
    });
  });
}
const isHex = (h) => {
  var regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(h);
};
const validateAddress = (a) => {
  return (isHex(a) && a.length === 64)
}
const validatePrincipal = (p) => {
  try {
    return (p === Principal.fromText(p).toText());
  } catch (e) {
    return false;
  }
}
export { 
  LEDGER_CANISTER_ID, 
  GOVERNANCE_CANISTER_ID, 
  NNS_CANISTER_ID, 
  CYCLES_MINTING_CANISTER_ID, 
  getCyclesTopupAddress, 
  getCyclesTopupSubAccount, 
  amountToBigInt, 
  rosettaApi, 
  Principal, 
  principalToAccountIdentifier, 
  getSubAccountArray, 
  from32bits, 
  to32bits, 
  toHexString, 
  fromHexString, 
  mnemonicToId, 
  encrypt, 
  decrypt, 
  isHex,
  bip39,
  validateAddress,
  validatePrincipal  };