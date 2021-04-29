import React from "react";
import CreateProjectCore from "@xr3ngine/client-core/src/world/components/editor/projects/CreateProjectPage";

/**
 * Exporting component by dynamicaly loaded component.
 */

const createProject = () => <CreateProjectCore/>;

export default createProject;

//export default React.lazy(() => import("@xr3ngine/client-core/src/world/components/editor/projects/CreateProjectPage"));
