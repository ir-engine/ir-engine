/* global BigInt */
import { Actor, HttpAgent } from "@dfinity/agent";  
import { Principal } from "@dfinity/principal";  
import { LEDGER_CANISTER_ID, GOVERNANCE_CANISTER_ID, NNS_CANISTER_ID, CYCLES_MINTING_CANISTER_ID, getCyclesTopupSubAccount, rosettaApi, principalToAccountIdentifier, toHexString, from32bits, to32bits, isHex, getSubAccountArray, fromHexString, validatePrincipal   } from "./utils";

import ledgerIDL from './candid/ledger.did';
import governanceIDL from './candid/governance.did';
import nnsIDL from './candid/nns.did';
import hzldIDL from './candid/hzld.did'; //hardcode to hzld...
import extIDL from './candid/ext.did';
import advancedIDL from './candid/advanced.did';
import wrapperIDL from './candid/wrapper.did';
import icpunksIDL from './candid/icpunks.did';
import logIDL from './candid/log.did';
import icdripIDL from './candid/icdrip.did';
//import cronicsIDL from './candid/cronics.did';

const constructUser = (u) => {
  if (isHex(u) && u.length === 64) {
    return { 'address' : u };
  } else {
    return { 'principal' : Principal.fromText(u) };
  };
};
const tokenIdentifier = (principal, index) => {
  const padding = Buffer.from("\x0Atid");
  const array = new Uint8Array([
      ...padding,
      ...Principal.fromText(principal).toUint8Array(),
      ...to32bits(index),
  ]);
  return Principal.fromUint8Array(array).toText();
};
const decodeTokenId = (tid) => {
  var p = [...Principal.fromText(tid).toUint8Array()];
  var padding = p.splice(0, 4);
  if (toHexString(padding) !== toHexString(Buffer.from("\x0Atid"))) {
    return {
      index : 0,
      canister : tid,
      token : tokenIdentifier(tid, 0)
    };
  } else {
    return {
      index : from32bits(p.splice(-4)), 
      canister : Principal.fromUint8Array(p as any).toText(),
      token : tid
    };
  }
};

//Preload IDLS against a common name
const _preloadedIdls = {
  'governance' : governanceIDL,
  'ledger' : ledgerIDL,
  'hzld' : hzldIDL,
  'nns' : nnsIDL,
  'ext' : extIDL,
  'default' : extIDL,
};

class ExtConnection {
  //map known canisters to preloaded IDLs
  _mapIdls = {
    [LEDGER_CANISTER_ID] : _preloadedIdls['ledger'],
    [GOVERNANCE_CANISTER_ID] : _preloadedIdls['governance'],
    [NNS_CANISTER_ID] : _preloadedIdls['nns'],
    "qz7gu-giaaa-aaaaf-qaaka-cai" : _preloadedIdls['hzld'],
    "kxh4l-cyaaa-aaaah-qadaq-cai" : advancedIDL,
    "bxdf4-baaaa-aaaah-qaruq-cai" : wrapperIDL,
    "qcg3w-tyaaa-aaaah-qakea-cai" : icpunksIDL,
    "qgsqp-byaaa-aaaah-qbi4q-cai" : logIDL,
    "d3ttm-qaaaa-aaaai-qam4a-cai" : icdripIDL,
    "3db6u-aiaaa-aaaah-qbjbq-cai" : wrapperIDL,
  };
  _metadata = {
    [LEDGER_CANISTER_ID] : {
      name : "ICP",
      symbol : "ICP",
      decimals : 8,
      type : 'fungible',
    },
    "qz7gu-giaaa-aaaaf-qaaka-cai" : {
      name : "HZLD",
      symbol : "HZLD",
      decimals : 0,
      type : 'fungible',
    },
  };
  _identity = false;//new AnonymousIdentity();
  _host = false;
  _agent: any = false;
  _canisters = {};
  
  constructor(host, identity) {
    if (identity) this._identity = identity;
    if (host) this._host = host;
    this._makeAgent();
  }
  idl(canister, idl) {
    //Map a canister to a preloaded idl
    this._mapIdls[canister] = idl;
  };
  setIdentity(identity) {
    if (identity) this._identity = identity;
    else this._identity = false;
    this._makeAgent();
    return this;
  }
  setHost(host) {
    if (host) this._host = host;
    else this._host = false;
    this._makeAgent();
    return this;
  }
  canister(cid, idl?) {
    if (!idl){
      if (this._mapIdls.hasOwnProperty(cid)) {
        idl = this._mapIdls[cid];
      } else {
        idl = _preloadedIdls['default'];
      }
    } else if (typeof idl == 'string') {
      if (_preloadedIdls.hasOwnProperty(idl)) {
        idl = _preloadedIdls[idl];
      } else {
        throw new Error(idl + " is not a preloaded IDL");
      }
    }
    if (!this._canisters.hasOwnProperty(cid)){
      this._canisters[cid] = Actor.createActor(idl, {agent : this._agent as any, canisterId : cid});        
    }
    return this._canisters[cid];
  }
  token(tid?, idl?) {
    if (!tid) tid = LEDGER_CANISTER_ID;//defaults to ledger
    var tokenObj = decodeTokenId(tid);
    if (!idl) {
      if (this._mapIdls.hasOwnProperty(tokenObj.canister)) idl = this._mapIdls[tokenObj.canister];
      else idl = _preloadedIdls['ext']; //ext is our token default...
    }
    var api = this.canister(tokenObj.canister, idl);
    return {
      call : api,
      fee : () => {
        return new Promise((resolve, reject) => {
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              resolve(10000);
            break;
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              resolve(1);
            break;
            default:
              //TODO compute fees
              resolve(0);
            break;
          }
        });
      },
      getTokens : (aid, principal?) => {
        return new Promise((resolve, reject) => {
          switch(tokenObj.canister) {
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
              if (aid !== principalToAccountIdentifier(principal, 0)) {
                resolve([]);
              } else {
                api.user_tokens(Principal.fromText(principal)).then(r => {
                  resolve(r.map(x => {
                    return {
                      id : tokenIdentifier(tokenObj.canister, Number(x)),
                      canister : tokenObj.canister,
                      index : Number(x),
                      listing : false,
                      metadata : false,
                      wrapped : false,
                    }
                  }));
                });
              }
            break;
            default:
              if (typeof api.tokens_ext == 'undefined') reject("Not supported");
              else {
                try {
                  api.tokens_ext(aid).then(r => {
                    if (typeof r.ok != 'undefined') {
                      resolve(r.ok.map(d => {
                        return {
                          index : d[0],
                          id : tokenIdentifier(tokenObj.canister, d[0]),
                          canister : tokenObj.canister,
                          listing : d[1].length ? d[1][0] : false,
                          metadata : d[2].length ? d[2][0] : false,
                        }
                      }));
                    }else if (typeof r.err != 'undefined') {
                      if (r.err.hasOwnProperty("Other") && r.err.Other === "No tokens") {
                        resolve([]);
                      } else reject(r.err)
                    } else reject(r);
                  }).catch(reject);
                } catch(e) {
                  reject(e);
                };
              };
            break;
          }
        });
      },
      getMetadata : () => {
        return new Promise((resolve, reject) => {
          if (this._metadata.hasOwnProperty(tokenObj.canister)) {
            resolve(this._metadata[tokenObj.canister]);
          } else {
            switch(tokenObj.canister) {
              default:
                api.metadata(tokenObj.token).then(r => {
                  if (typeof r.ok != 'undefined') {
                    if (typeof r.ok.fungible != 'undefined') {
                      resolve({
                        name : r.ok.fungible.name,
                        symbol : r.ok.fungible.symbol,
                        decimals : r.ok.fungible.decimals,
                        metadata : r.ok.fungible.metadata,
                        type : 'fungible'
                      });
                    } else {
                      var md = r.ok.nonfungible.metadata[0];
                      if (md.length > 256) md = md.slice(0, 256);
                      resolve({
                        metadata : [md],
                        type : 'nonfungible'
                      });
                    }
                  } else if (typeof r.err != 'undefined') reject(r.err)
                  else reject(r);
                }).catch(reject);
              break;
            }
          }
        });
      },
      getBearer : () => {
        return new Promise((resolve, reject) => {
          api.bearer(tokenObj.token).then(r => {
            if (typeof r.ok != 'undefined') resolve(r.ok)
            else if (typeof r.err != 'undefined') reject(r.err)
            else reject(r);
          }).catch(reject);    
        });
      },
      getDetails : () => {
        return new Promise((resolve, reject) => {
          api.details(tokenObj.token).then(r => {
            if (typeof r.ok != 'undefined') resolve(r.ok)
            else if (typeof r.err != 'undefined') reject(r.err)
            else reject(r);
          }).catch(reject);    
        });
      },
      getBalance : (address, princpal?) => {
        return new Promise((resolve, reject) => {
          var args;
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              rosettaApi.getAccountBalance(address).then(b => {       
                resolve(b)
              });
            break;
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              args = {
                "user" : Principal.fromText(princpal)
              };
              api.getBalanceInsecure(args).then(b => {
                var bal = b.length === 0 ? 0 : b[0];
                resolve(bal);
              }).catch(reject);
            break;
            default:
              args = {
                "user" : constructUser(address),
                'token' : tokenObj.token
              };
              api.balance(args).then(r => {
                if (typeof r.ok != 'undefined') resolve(r.ok)
                else if (typeof r.err != 'undefined') reject(r.err)
                else reject(r);
              }).catch(reject);            
            break;
          }
        });
      },
      getTransactions : (address, princpal) => {
        return new Promise((resolve, reject) => {
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              rosettaApi.getTransactionsByAccount(address).then(ts => {    
                if (!Array.isArray(ts)) resolve([]);
                var _ts = [];
                ts.map(_t => {
                  if (_t.type !== "TRANSACTION") return false;
                  if (_t.status !== "COMPLETED") return false;
                  _ts.push({
                    from : _t.account1Address,
                    to :  _t.account2Address,
                    amount : Number(_t.amount as any /100000000),
                    fee : Number(_t.fee as any /100000000),
                    hash : _t.hash,
                    timestamp : _t.timestamp,
                    memo : Number(_t.memo),
                  });
                  return true;
                });
                _ts.reverse();
                resolve(_ts);
              }).catch(reject);
            break;
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
            default:
              resolve([]);         
            break;
          }
        });
      },
      /*
        from_principal = principal of account as text
        from_sa = subaccount (to produce hex address). null/0 default as number
        to_user = valid User (address or principal) as text
        amount = valid amount as BigInt
        fee = valid fee as BigInt
        memo = data to be sent as text/hex/number
        notify = if we need to notify TODO
      */
      list : (from_sa, price) => {
        return new Promise((resolve, reject) => {
          var args;
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              reject("Not supported");
            break;
            default:
              args = {
                'token' : tid,
                'from_subaccount' : [getSubAccountArray(from_sa ?? 0)],
                'price' : (price === 0 ? [] : [price])
              };
              api.list(args).then(b => {
                if (typeof b.ok != 'undefined') {
                  resolve(true);
                } else {
                  reject(JSON.stringify(b.err));
                }
              }).catch(reject);
            break;
          }
        });
      },
      transfer : (from_principal, from_sa, to_user, amount, fee, memo, notify) => {
        return new Promise((resolve, reject) => {
          var args;
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              args = {
                "from_subaccount" : [getSubAccountArray(from_sa ?? 0)], 
                "to" : to_user, //Should be an address
                "amount" : { "e8s" : amount },
                "fee" : { "e8s" : fee }, 
                "memo" : memo ? Number(BigInt(memo)) : 0, 
                "created_at_time" : []
              };
              api.send_dfx(args).then(bh => {
                resolve(true);
              }).catch(reject);
              //Notify here
            break;
            case "qcg3w-tyaaa-aaaah-qakea-cai":
            case "jzg5e-giaaa-aaaah-qaqda-cai":
            case "d3ttm-qaaaa-aaaai-qam4a-cai":
              if (!validatePrincipal(to_user)) reject("This does not support traditional addresses, you must use a Principal");
              api.transfer_to(Principal.fromText(to_user), tokenObj.index).then(b => {
                if (b) {          
                  resolve(true);
                } else {
                  reject("Something went wrong");
                }
              }).catch(reject);
            break;
            case "qz7gu-giaaa-aaaaf-qaaka-cai":
              args = {
                "to" : Principal.fromText(to_user), 
                "metadata" : [],
                "from" : Principal.fromText(from_principal),
                "amount" : amount
              };
              api.transfer(args).then(b => {
                if (typeof b.ok != 'undefined') {          
                  resolve(true);
                } else {
                  reject(JSON.stringify(b.err));
                }
              }).catch(reject);
            break;
            default:
              args = {
                'token' : tid,
                'from' : { 'address' : principalToAccountIdentifier(from_principal, from_sa ?? 0) },
                'subaccount' : [getSubAccountArray(from_sa ?? 0)],
                'to' : constructUser(to_user),
                'amount' : amount,
                'fee' : fee,
                'memo' : fromHexString(memo),
                'notify' : notify
              };
              api.transfer(args).then(b => {
                if (typeof b.ok != 'undefined') {
                  resolve(b.ok);
                } else {
                  reject(JSON.stringify(b.err));
                }
              }).catch(reject);
            break;
          }
        });
      },
      mintCycles : (from_principal, from_sa, canister, amount, fee) => {
        return new Promise((resolve, reject) => {
          switch(tokenObj.canister) {
            case LEDGER_CANISTER_ID:
              var _to_sub = getCyclesTopupSubAccount(canister);
              var _to = principalToAccountIdentifier(CYCLES_MINTING_CANISTER_ID, _to_sub);
              var args = {
                "from_subaccount" : [getSubAccountArray(from_sa ?? 0)], 
                "to" : _to, 
                "fee" : { "e8s" : fee }, 
                "memo" : Number(BigInt("0x50555054")), 
                "created_at_time" : [], 
                "amount" : { "e8s" : amount }
              };
              api.send_dfx(args).then(block => {
                var args = {
                  "block_height" : block,
                  "max_fee": {e8s: fee},
                  "from_subaccount": [getSubAccountArray(from_sa ?? 0)],
                  "to_subaccount": [getSubAccountArray(_to_sub)],
                  "to_canister": Principal.fromText(CYCLES_MINTING_CANISTER_ID)
                };
                api.notify_dfx(args).then(resolve).catch(reject);
              }).catch(reject);
            break;
            case "5ymop-yyaaa-aaaah-qaa4q-cai":
              reject("WIP");
            break;
            default:
              reject("Cycle topup is not supported by this token");
            break;
          }
        });
      }
    };
  }
 
  _makeAgent() {
    if (globalThis?.ic?.plug?.agent) {
      this._agent = globalThis.ic.plug.agent;
    } else {
      var args = {};
      if (this._identity) args['identity'] = this._identity;
      if (this._host) args['host'] = this._host;
      this._agent = new HttpAgent(args);
    }
  };
};

const extjs = {
  connect : (host, identity?) => new ExtConnection(host ?? "https://boundary.ic0.app/", identity ?? null),
  decodeTokenId : decodeTokenId,
  encodeTokenId : tokenIdentifier,
  toAddress : principalToAccountIdentifier,
  toSubaccount : getSubAccountArray,
};
export default extjs;
//window.extjs = extjs.connect;
//window.principalToAccountIdentifier = principalToAccountIdentifier;
//window.fromHexString = fromHexString;