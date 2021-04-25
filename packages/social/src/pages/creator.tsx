
import React from "react";
import AppFooter from "@xr3ngine/client-core/src/socialmedia/components/Footer";
import Creator from "@xr3ngine/client-core/src/socialmedia/components/Creator";

import { useLocation } from "react-router-dom";

export default function CreatorPage() {

  const creatorId = new URLSearchParams(useLocation().search).get('creatorId').toString();
   return (<>
    <div>
      <Creator creatorId={creatorId} />
      <AppFooter />
    </div>
  </>
  );
}
