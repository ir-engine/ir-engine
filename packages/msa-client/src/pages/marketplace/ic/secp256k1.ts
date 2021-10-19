import { blobFromHex, blobFromUint8Array, blobToHex, SignIdentity, blobFromBuffer, } from '@dfinity/agent';
import { Buffer } from 'buffer/';
import * as bigintConversion from 'bigint-conversion'
const ellipticcurve = require("starkbank-ecdsa");
const Ecdsa = ellipticcurve.Ecdsa;
const PrivateKey = ellipticcurve.PrivateKey;
const PublicKey = ellipticcurve.PublicKey;
function stringToBytes ( str ) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++ ) {
    ch = str.charCodeAt(i);  // get char 
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }  
    while ( ch );
    re = re.concat( st.reverse() );
  }
  return re;
}
export class Secp256k1PublicKey {
    rawKey: any;
    constructor(key) {
        this.rawKey = key;
    }
    static fromRaw(rawKey) {
        return new Secp256k1PublicKey(rawKey);
    }
    static fromDer(derKey) {
        return new Secp256k1PublicKey(PublicKey.fromDer(derKey));
    }
    toDer() {
        var s = this.rawKey.toDer();
        if (typeof s == 'string') s = new Uint8Array(stringToBytes(this.rawKey.toDer()));
        return blobFromUint8Array(s);
    }
    toRaw() {
        return this.rawKey;
    }
}
export class Secp256k1KeyIdentity extends SignIdentity {
    _privateKey: any;
    _publicKey: Secp256k1PublicKey;
    constructor(publicKey, _privateKey) {
        super();
        this._privateKey = _privateKey;
        this._publicKey = Secp256k1PublicKey.fromRaw(publicKey);
    }
    static fromPem(pem) {
        let publicKey, secretKey;
        if (pem) {
          secretKey = PrivateKey.fromPem(pem);
        } else {
          throw  new Error("Error");
        }
        publicKey = secretKey.publicKey();
        return new this(Secp256k1PublicKey.fromRaw(publicKey), secretKey);
    }
    static fromParsedJson(obj) {
        const [publicKeyDer, privateKeyDer] = obj;
        return new Secp256k1KeyIdentity(Secp256k1PublicKey.fromDer(blobFromHex(publicKeyDer)), PrivateKey.fromDer(blobFromHex(privateKeyDer)));
    }
    static fromJSON(json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string' && typeof parsed[1] === 'string') {
                return this.fromParsedJson([parsed[0], parsed[1]]);
            }
            else {
                throw new Error('Deserialization error: JSON must have at least 2 items.');
            }
        }
        else if (typeof parsed === 'object' && parsed !== null) {
            const { publicKey, _publicKey, secretKey, _privateKey } = parsed;
            const pk = publicKey
                ? Secp256k1PublicKey.fromRaw(blobFromUint8Array(new Uint8Array(publicKey.data)))
                : Secp256k1PublicKey.fromDer(blobFromUint8Array(new Uint8Array(_publicKey.data)));
            if (publicKey && secretKey && secretKey.data) {
                return new Secp256k1KeyIdentity(pk, blobFromUint8Array(new Uint8Array(secretKey.data)));
            }
            else if (_publicKey && _privateKey && _privateKey.data) {
                return new Secp256k1KeyIdentity(pk, blobFromUint8Array(new Uint8Array(_privateKey.data)));
            }
        }
        throw new Error(`Deserialization error: Invalid JSON type for string: ${JSON.stringify(json)}`);
    }
    static fromKeyPair(publicKey, privateKey) {
        return new Secp256k1KeyIdentity(Secp256k1PublicKey.fromDer(publicKey.toDer()), privateKey);
    }
    /**
     * Serialize this key to JSON.
     */
    toJSON() {
        return [blobToHex(this._publicKey.toDer()), blobToHex(stringToBytes(this._privateKey.toDer()))];
    }
    /**
     * Return a copy of the key pair.
     */
    getKeyPair() {
        return {
            secretKey: this._privateKey,
            publicKey: this._publicKey.toRaw(),
        };
    }
    /**
     * Return the public key.
     */
    getPublicKey() {
        return this._publicKey;
    }
    /**
     * Signs a blob of data, with this identity's private key.
     * @param challenge - challenge to sign with this identity's secretKey, producing a signature
     */
    async sign(challenge) {
        const blob = challenge instanceof Buffer
            ? blobFromBuffer(challenge)
            : blobFromUint8Array(new Uint8Array(challenge));
        const signature = Ecdsa.sign(blob, this._privateKey);
        var ra = bigintConversion.bigintToBuf(signature.r);
        var sa = bigintConversion.bigintToBuf(signature.s);
        return blobFromUint8Array(new Uint8Array([...Array.from(new Uint8Array(ra)), ...Array.from(new Uint8Array(sa))]));
    }
}
