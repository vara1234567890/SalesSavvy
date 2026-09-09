import React, { useEffect, useState } from "react";
import "./CartPage.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate, Link } from "react-router-dom";

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [username, setUsername] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/cart/items", {
          credentials: "include",
        });

        if (response.status === 401) {
          alert("Please login to view your cart");
          navigate("/");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();

        setCartItems(
          data?.cart?.products?.map((item) => ({
            ...item,
            productId: item.productId || item.product_id || item.ProductId,
            total_price: parseFloat(item.total_price || item.Total_price || 0).toFixed(2),
            price_per_unit: parseFloat(item.price_per_unit || 0).toFixed(2),
            imageUrl: item.image_url || item.imageUrl || DEFAULT_FALLBACK_IMAGE,
          })) || []
        );
        setUsername(data?.username || "");
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [navigate]);

  // Recalculate subtotal
  useEffect(() => {
    const total = cartItems
      .reduce((total, item) => total + parseFloat(item.total_price), 0)
      .toFixed(2);
    setSubtotal(total);
  }, [cartItems]);

  // Clear cart after checkout
  const clearCartOnBackend = async () => {
    try {
      // Clear individual items or call clear endpoint
      for (const item of cartItems) {
        await fetch("http://localhost:9090/api/cart/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: item.productId }),
        });
      }
    } catch (err) {
      console.error("Failed to clear backend cart:", err);
    }
  };

  // Remove item
  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      if (response.status === 204 || response.ok) {
        setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
      }

      const response = await fetch("http://localhost:9090/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total_price: (item.price_per_unit * newQuantity).toFixed(2),
                }
              : item
          )
        );
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Razorpay Checkout
  const handleCheckout = async () => {
    try {
      const parsedSubtotal = parseFloat(subtotal);
      if (!parsedSubtotal || parsedSubtotal <= 0) {
        alert("Cart total must be greater than 0");
        return;
      }

      const requestBody = {
        totalAmount: parsedSubtotal,
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: parseFloat(item.price_per_unit || 0),
        })),
      };

      const response = await fetch("http://localhost:9090/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        alert("Failed to create order: " + responseText);
        return;
      }

      const razorpayOrderId = responseText.trim();

      if (!razorpayOrderId.startsWith("order_")) {
        alert("Invalid order received from server: " + razorpayOrderId);
        return;
      }

      const options = {
        key: "rzp_test_TTgAnEZaXxYfXZ",
        amount: Math.round(parsedSubtotal * 100),
        currency: "INR",
        name: "SalesSavvy",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch("http://localhost:9090/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              // 1. Clear cart on backend
              await clearCartOnBackend();

              // 2. Clear frontend cart state
              setCartItems([]);
              setSubtotal(0);

              alert("Payment verified successfully! Your order has been placed.");
              navigate("/customerhome");
            } else {
              const result = await verifyResponse.text();
              alert("Payment verification failed: " + result);
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: username || "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (failResponse) {
        alert("Payment failed: " + failResponse.error.description);
      });

      rzp.open();
    } catch (error) {
      alert("Payment initiation failed. Please try again.");
      console.error("Error during checkout:", error);
    }
  };

  const totalProducts = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = (5.0 * 74).toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div style={{ width: "100vw" }}>
        <Header cartCount={0} username={username} />
        <div className="cart-page empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some items to get started!</p>
          <Link to="/customerhome" className="back-button">
            ← Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ width: "100vw" }}>
      <Header cartCount={totalProducts()} username={username} />
      <div className="cart-container">
        <div className="cart-page">
          <Link to="/customerhome" className="back-button">
            ← Continue Shopping
          </Link>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>You have {cartItems.length} items in your cart</p>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_FALLBACK_IMAGE;
                  }}
                />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <span className="price">₹{item.total_price}</span>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.productId)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>
            <div className="summary-row">
              <span>Total Products</span>
              <span>{totalProducts()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{(parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)}</span>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;