function Error({ statusCode }: { statusCode?: number }) {
  return (
    <>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
      <a href="/">Go home</a>
    </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
