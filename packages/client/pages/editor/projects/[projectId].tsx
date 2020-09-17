import React from "react";
import dynamic from "next/dynamic";

const EditorContainer = dynamic(() => import("./../../../components/editor/ui/EditorContainer"))

export default (props: any) => {
  <EditorContainer {...props} />
}