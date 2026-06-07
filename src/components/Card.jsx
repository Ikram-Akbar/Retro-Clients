import React from 'react'
import Button from './Button'

const Card = ({ image, title, price, alt = '', onView }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md">
      <img src={image} alt={alt || title} className="h-56 w-full object-cover" />

      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>

        <p className="text-indigo-600 font-bold text-2xl">৳{price}/day</p>

        <div className="mt-4">
          <Button className="w-full py-2" onClick={onView}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Card
