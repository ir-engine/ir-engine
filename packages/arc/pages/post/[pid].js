import React from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";

export default function PostPage() {
  const router = useRouter();
  const { pid } = router.query;

  return (
    <Layout>
      <div>{pid}</div>
    </Layout>
  );
}
