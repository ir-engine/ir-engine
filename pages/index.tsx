import Link from 'next/link'
import Layout from '../components/Layout'
import Scene from '../components/xr/scene'

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <Scene />
    <Link href="/login">
        <a>Login</a>
      </Link>
  </Layout>
)

export default IndexPage
