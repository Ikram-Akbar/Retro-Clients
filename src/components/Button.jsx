import React from 'react'

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ghost: 'bg-transparent text-indigo-600 border border-white',
    neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  }

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
