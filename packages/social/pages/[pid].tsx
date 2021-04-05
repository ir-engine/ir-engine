import  AppHeader  from "@xr3ngine/client-core/src/socialmedia/components/Header";
import { useRouter } from "next/router";
import React from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { pid } = router.query;

  return (
    <div className="container">
    <AppHeader />
      <div>{pid}</div>
    </div>
  );
}
