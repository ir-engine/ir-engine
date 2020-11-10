import dynamic from "next/dynamic";
import React, { lazy, Suspense, useEffect, useState } from "react";
import NoSSR from "react-no-ssr";

const EditorContainer = dynamic(() => import("./../../../components/editor/EditorContainer"), { ssr: false });

const Project = (props) => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);
    return hasMounted && <Suspense fallback={React.Fragment}>
        <NoSSR>
        <EditorContainer {...props} />
        </NoSSR>
    </Suspense>;
};

export default Project;