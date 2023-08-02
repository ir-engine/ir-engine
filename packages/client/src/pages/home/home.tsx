import React from 'react'

const Card = ({ title, description, image }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-900 to-indigo-700 text-white border border-solid border-purple-800 rounded-lg p-6 w-72 h-96"
      style={{ backgroundColor: '#5e2265' }}
    >
      <img src={image} alt={title} className="w-32 h-32 rounded-full mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

const Home = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-900 to-indigo-700">
      <div className="flex space-x-4">
        <Card title="Card 1" description="This is Card 1 description." image="https://via.placeholder.com/150" />
        <Card title="Card 2" description="This is Card 2 description." image="https://via.placeholder.com/150" />
        <Card title="Card 3" description="This is Card 3 description." image="https://via.placeholder.com/150" />
        <Card title="Card 4" description="This is Card 4 description." image="https://via.placeholder.com/150" />
      </div>
    </div>
  )
}

export default Home
