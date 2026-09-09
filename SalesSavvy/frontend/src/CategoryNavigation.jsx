import React from 'react';
import './index.css';

export function CategoryNavigation({ activeCategory, onCategoryClick }) {
  const categories = ['Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories'];

  return (
    <nav className="category-navigation">
      <ul className="category-list">
        {categories.map((category, index) => (
          <li
            key={index}
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryClick(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
}