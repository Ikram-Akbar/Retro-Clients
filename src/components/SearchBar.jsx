import React from 'react'

const SearchBar = ({ onSearch }) => {
  return (
    <section className="max-w-5xl mx-auto px-4 -mt-10">
      <form className="bg-white shadow-xl rounded-2xl p-5" onSubmit={(e) => { e.preventDefault(); onSearch && onSearch(); }}>
        <fieldset className="grid md:grid-cols-4 gap-4">
          <label className="sr-only" htmlFor="location">Location</label>
          <input id="location" name="location" type="text" placeholder="Location" className="border rounded-lg p-3" />

          <label className="sr-only" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="border rounded-lg p-3" />

          <label className="sr-only" htmlFor="category">Category</label>
          <select id="category" name="category" className="border rounded-lg p-3">
            <option>All Categories</option>
            <option>Car</option>
            <option>Bike</option>
            <option>Van</option>
          </select>

          <button type="submit" className="bg-indigo-600 text-white rounded-lg px-4">Search</button>
        </fieldset>
      </form>
    </section>
  )
}

export default SearchBar
