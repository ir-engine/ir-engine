import { Ed25519KeyIdentity } from "@dfinity/identity";
import { BigNumber } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/keccak256";
import { hashMessage } from "ethers/lib/utils";

export function generateLoginMessage(
  account: string | undefined,
  secret: string
): string {
  return (
    "SIGN THIS MESSAGE TO LOGIN TO THE INTERNET COMPUTER.\n\n" +
    `APP NAME:\n${process.env.REACT_APP_IC_APP_NAME}\n\n` +
    `ADDRESS:\n${account}\n\n` +
    `HASH SECRET:\n${hashMessage(secret)}`
  );
}

export function generateEd25519KeyIdentity(signature: any): Ed25519KeyIdentity {
  const hash = keccak256(signature);
  if (hash === null) {
    throw new Error(
      "No account is provided. Please provide an account to this application."
    );
  }

  // The following line converts the hash in hex to an array of 32 integers.
  // @ts-ignore
  const array = hash
    .replace("0x", "")
    .match(/.{2}/g)
    .map((hexNoPrefix) => BigNumber.from("0x" + hexNoPrefix).toNumber());

  if (array.length !== 32) {
    throw new Error(
      "Hash of signature is not the correct size! Something went wrong!"
    );
  }
  const uint8Array = Uint8Array.from(array);
  const identity = Ed25519KeyIdentity.generate(uint8Array);

  return identity;
}

export function saveIdentity(account: string, identity: Ed25519KeyIdentity) {
  localStorage.setItem(`ic_key_${account}`, JSON.stringify(identity.toJSON()));
}

export function loadSavedIdentity(account: string): Ed25519KeyIdentity | null {
  localStorage.getItem(`ic_key_${account}`);
  let keyString = localStorage.getItem(`ic_key_${account}`);
  if (keyString) {
    try {
      let key = Ed25519KeyIdentity.fromJSON(keyString);
      return key;
    } catch (err) {
      return null;
    }
  }
  return null;
}
