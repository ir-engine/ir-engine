import { useRouter } from 'next/router';
import { useEffect } from "react";

export default function LandingPage () {
  const router = useRouter();

  useEffect(() => {
    router.push("/editor/projects");
  });
  
    return null;
}
