import { ProfileByPrincipal } from "../../store/profile";
import { Principal } from "@dfinity/principal";
import React from "react";
import { useRecoilValue } from "recoil";

interface Props {
  principal: Principal;
}

const UserInfoInner = ({ principal }: Props) => {
  const profile = useRecoilValue(ProfileByPrincipal({ principal }));
  if (profile?.name)
    return (
      <div className="pb-10 text-green-500">
        User
        <div className="mb-2 text-xl text-bold">{profile.name}</div>
        <div className="text-sm">ETH: {profile.address}</div>
        <div className="text-sm">IC: {principal.toString()}</div>
      </div>
    );

  return null;
};

export default function UserInfo({ principal }: Props) {
  return (
    <React.Suspense fallback={null}>
      <UserInfoInner principal={principal} />
    </React.Suspense>
  );
}
