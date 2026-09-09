import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Shirts'); // Default to Shirts
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'Customer';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch products whenever selectedCategory changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `http://localhost:9090/api/products?category=${encodeURIComponent(selectedCategory)}`
          : `http://localhost:9090/api/products`;

        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: getHeaders(),
        });

        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Initial cart count fetch
  useEffect(() => {
    fetch(`http://localhost:9090/api/cart/items/count?username=${username}`, {
      credentials: 'include',
      headers: getHeaders(),
    })
      .then((res) => (res.ok ? res.json() : 0))
      .then((count) => setCartCount(count))
      .catch(() => setCartCount(0));
  }, [username]);

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch('http://localhost:9090/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        setCartCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div className="customer-homepage">
      <Header cartCount={cartCount} username={username} />
      <CategoryNavigation
        activeCategory={selectedCategory}
        onCategoryClick={(category) => setSelectedCategory(category)}
      />
      <main className="main-content">
        {loading ? (
          <p className="loading-text">Loading {selectedCategory}...</p>
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} />
        )}
      </main>
      <Footer />
    </div>
  );
}