import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './assets/styles.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // Initialize directly from localStorage so header never defaults to Guest
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://salessavvy-d7qc.onrender.com/api/orders', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Session expired or unauthorized. Please sign in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Handle both { products: [...] } and flat array responses
      const orderList = Array.isArray(data)
        ? data
        : data.products || data.orders || [];

      setOrders(orderList);

      if (data.username) {
        setUsername(data.username);
        localStorage.setItem('username', data.username);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchCartCount = useCallback(async (user) => {
    if (!user || user === 'Guest') {
      setIsCartLoading(false);
      return;
    }

    setIsCartLoading(true);
    try {
      const response = await fetch(
        `https://salessavvy-d7qc.onrender.com/api/cart/items/count?username=${encodeURIComponent(user)}`,
        {
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const count = await response.json();
        setCartCount(Number(count) || 0);
        setCartError(false);
      } else {
        setCartError(true);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (username) {
      fetchCartCount(username);
    } else {
      setIsCartLoading(false);
    }
  }, [username, fetchCartCount]);

  return (
    <div className="maindiv">
      <div className="customer-homepage">
        <Header
          cartCount={isCartLoading ? '...' : cartError ? '0' : cartCount}
          username={username || 'Guest'}
        />

        <main className="main-content">
          <h1 className="form-title">Your Orders</h1>

          {loading && <p>Loading orders...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <p>No orders found. Start shopping now!</p>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order, index) => {
                const orderId = order.order_id || order.orderId || order.id || 'N/A';
                const pricePerUnit = Number(order.price_per_unit || order.price || 0);
                const totalPrice = Number(order.total_price || order.totalAmount || pricePerUnit * (order.quantity || 1));

                return (
                  <div key={orderId + '-' + index} className="order-card">
                    <div className="order-card-header">
                      <h3>Order Id : {orderId}</h3>
                    </div>
                    <div className="order-card-body">
                      {order.image_url && (
                        <img
                          src={order.image_url}
                          alt={order.name || 'Product'}
                          className="order-product-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://placehold.co/250x250/png?text=No+Image';
                          }}
                        />
                      )}
                      <div className="order-details">
                        <h3 className="product-name">Product Name : {order.name || 'Purchased Item'}</h3>
                        {order.description && <h3>Description : {order.description}</h3>}
                        <h3>Quantity : {order.quantity || 1}</h3>
                        <h3>Price per Unit : ₹{pricePerUnit.toFixed(2)}</h3>
                        <h3>Total Price : ₹{totalPrice.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
