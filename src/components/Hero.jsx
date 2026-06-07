import React from 'react'
import { Link } from 'react-router'
import Button from './Button'

const Hero = ({ title, subtitle, primaryHref = '/', secondaryHref = '/how-it-works' }) => {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">{title}</h1>

        <p className="text-lg max-w-2xl mx-auto mb-8">{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={primaryHref}>
            <Button className="px-8 py-3 rounded-xl" variant="primary">
              Browse Rentals
            </Button>
          </Link>

          <Link to={secondaryHref}>
            <Button className="px-8 py-3 rounded-xl" variant="ghost">
              How It Works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
