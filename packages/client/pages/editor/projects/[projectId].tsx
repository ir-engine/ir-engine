import React from "react";
import dynamic from "next/dynamic";

const EditorContainer = dynamic(() => import("./../../../components/editor/ui/EditorContainer"))

const ProjectId = (props: any) => {
  return <EditorContainer {...props} />
}

export default ProjectId