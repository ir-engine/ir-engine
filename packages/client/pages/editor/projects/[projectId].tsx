import React, { lazy, Suspense, useEffect, useState } from "react"

const EditorContainer = lazy(() => import("./../../../components/editor/ui/EditorContainer"))

const Project = (props) => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);
    return hasMounted && <Suspense fallback={React.Fragment}>
        <EditorContainer {...props} />
    </Suspense>
}

export default Project