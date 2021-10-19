import { Ed25519KeyIdentity } from "@dfinity/identity";
import type { Principal } from "@dfinity/principal";
import { useWeb3React } from "@web3-react/core";
import React, { createContext, useCallback, useContext, useState } from "react";
import { createActors, createAnonymousActors } from "./actor";
import { loadSavedIdentity } from "./identity";

export interface IC {
  identity: Ed25519KeyIdentity | undefined;
  actors: any | undefined;
  principal: Principal | undefined;
  loadIdentity: (account: string) => void;
  setIdentity: (Identity: Ed25519KeyIdentity) => void;
  clearActiveIdentity: () => void;
}

export const ICContextDefaults: IC = {
  identity: undefined,
  actors: undefined,
  principal: undefined,
  loadIdentity: () => null,
  setIdentity: () => null,
  clearActiveIdentity: () => null,
};

export const ICContext = createContext<IC>(ICContextDefaults);

export function useICContextValues(): IC {
  const { account } = useWeb3React();

  const [identity, _setIdentity] = useState<Ed25519KeyIdentity | undefined>(
    undefined
  );
  const [actors, _setActors] = useState<any | undefined>(undefined);
  const [principal, _setPrincipal] = useState<Principal | undefined>(undefined);

  React.useEffect(() => {
    if (!identity) return;
    _setActors(createActors(identity));
  }, [identity]);

  React.useEffect(() => {
    if (!actors) return;
    actors.profile.getOwnPrincipal().then((principal: Principal) => {
      if (!principal?.isAnonymous()) {
        _setPrincipal(principal);
      }
    });
  }, [actors]);

  React.useEffect(() => {
    _setActors(createAnonymousActors());
  }, []);

  const setIdentity = useCallback(
    (identity: Ed25519KeyIdentity) => {
      _setIdentity(identity);
    },
    [_setIdentity]
  );

  const clearActiveIdentity = useCallback(() => {
    _setIdentity(undefined);
    _setActors(createAnonymousActors());
    _setPrincipal(undefined);
  }, [_setIdentity, _setActors, _setPrincipal]);

  const loadIdentity = useCallback(
    (account: string) => {
      const identity = loadSavedIdentity(account);
      if (!identity) {
        clearActiveIdentity();
        return;
      }
      setIdentity(identity);
    },
    [setIdentity, clearActiveIdentity]
  );

  React.useEffect(() => {
    if (account) {
      loadIdentity(account);
    }
  }, [account, loadIdentity]);

  return {
    identity,
    actors,
    principal,
    loadIdentity,
    setIdentity,
    clearActiveIdentity,
  };
}

export function useInternetComputer() {
  return useContext(ICContext);
}
