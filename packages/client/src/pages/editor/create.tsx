import React from "react";

/**
 * Exporting component by dynamicaly loaded component.
 */
export default React.lazy(() => import("@xrengine/client-core/src/world/components/editor/projects/CreateProjectPage"));
