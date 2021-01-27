import { useRouter } from 'next/router';
import { useEffect } from "react";


/**
 * Function for routing the request to editor/projects.
 */

export default function LandingPage () {
	
	// Creating router object.
	  const router = useRouter();
	  useEffect(() => {
	    router.push("/editor/projects");
	  });
	  
	   return null;
}
