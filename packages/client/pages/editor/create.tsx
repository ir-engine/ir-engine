import dynamic from "next/dynamic";

/**
 * Exporting component by dynamicaly loaded component.
 */
export default dynamic(() => import("../../components/editor/projects/CreateProjectPage"));