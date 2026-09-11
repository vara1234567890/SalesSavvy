import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Shirts');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Retrieve user & token reliably
  const username = localStorage.getItem('username') || localStorage.getItem('user') || 'Customer';
  const userId = localStorage.getItem('userId') || localStorage.getItem('id');

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch products whenever selectedCategory changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `https://salessavvy-d7qc.onrender.com/api/products?category=${encodeURIComponent(selectedCategory)}`
          : `https://salessavvy-d7qc.onrender.com/api/products`;

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
  }, [selectedCategory, getHeaders]);

  // Initial cart count fetch
  useEffect(() => {
    if (!username || username === 'Customer') return;

    fetch(`https://salessavvy-d7qc.onrender.com/api/cart/items/count?username=${encodeURIComponent(username)}`, {
      credentials: 'include',
      headers: getHeaders(),
    })
      .then((res) => (res.ok ? res.json() : 0))
      .then((count) => setCartCount(Number(count) || 0))
      .catch(() => setCartCount(0));
  }, [username, getHeaders]);

  const handleAddToCart = async (productId) => {
    try {
      // Include username / userId so the backend can map the cart item to the correct user
      const requestPayload = {
        productId: Number(productId),
        quantity: 1,
        username: username !== 'Customer' ? username : undefined,
        ...(userId ? { userId: Number(userId) } : {}),
      };

      const res = await fetch('https://salessavvy-d7qc.onrender.com/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(requestPayload),
      });

      if (res.ok) {
        setCartCount((prev) => prev + 1);
      } else {
        const errText = await res.text();
        console.error('Add to cart failed:', res.status, errText);

        if (res.status === 401 || res.status === 403) {
          alert('Session expired or unauthorized. Please sign in again.');
        } else {
          alert(`Could not add to cart: ${errText || 'Server error'}`);
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Network error while adding to cart. Please check backend connection.');
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
