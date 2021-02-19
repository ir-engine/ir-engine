
import React from "react";
import Router from "next/router";

import AppFooter from "@xr3ngine/client-core/components/social/Footer";
import Creator from "@xr3ngine/client-core/components/social/Creator";

export default function CreatorPage() {
   return (<>
    <div>
      <Creator />
      <AppFooter user={{username:'username'}} />
    </div>
  </>
  );
}
