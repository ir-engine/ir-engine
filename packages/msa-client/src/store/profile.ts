import { createAnonymousActors } from "../ic/actor";
import { Profile } from "../ic/canisters_generated/profile/profile.did";
import { Principal } from "@dfinity/principal";
import { atomFamily, selectorFamily } from "recoil";

export const ProfileByPrincipal = atomFamily({
  key: "ElementPosition",
  default: (params: any) => ProfileByPrincipalQuery(params),
});

export const ProfileByPrincipalQuery = selectorFamily({
  key: "ProfileByPricipal",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!params?.principal) return;

      const actors = createAnonymousActors();
      if (!actors) return;

      const response: Array<Profile> =
        (await actors.profile.getProfileByPrincipal(
          params.principal
        )) as Array<Profile>;

      return response[0];
    },
});

export const ProfileByEthQuery = selectorFamily({
  key: "ProfileByEthQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!params?.ethAddress) return;

      const actors = createAnonymousActors();
      if (!actors) return;

      const response: Array<Profile> = (await actors.profile.getProfileByEth(
        params.ethAddress
      )) as Array<Profile>;

      return response[0];
    },
});

export const PrincipalByEthQuery = selectorFamily({
  key: "PrincipalByEthQuery",
  get:
    (ethAddress) =>
    async ({ get }) => {
      if (!ethAddress) return;

      const actors = createAnonymousActors();
      if (!actors) return;

      const response: Array<Principal> =
        (await actors.profile.getPrincipalByEth(
          ethAddress
        )) as Array<Principal>;

      return response[0];
    },
});
