
import React from "react";
import Router from "next/router";

import AppFooter from "@xr3ngine/client-core/src/components/social/Footer";
import Creator from "@xr3ngine/client-core/src/components/social/Creator";

export default function CreatorPage() {
  const creatorId = Router?.router.query.creatorId.toString();
   return (<>
    <div>
      <Creator creatorId={creatorId} />
      <AppFooter />
    </div>
  </>
  );
}
