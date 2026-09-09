import React from 'react';
import './index.css';

const DEFAULT_FALLBACK_IMAGE = 'https://placehold.co/250x250/png?text=No+Image';

// Fallback dictionary for all 5 categories
const PRODUCT_IMAGE_MAP = {
  // Shirts (1 - 15)
  1: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
  2: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
  3: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500',
  4: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500',
  5: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500',
  6: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
  7: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
  8: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500',
  9: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500',
  10: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500',
  11: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
  12: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
  13: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500',
  14: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500',
  15: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500',

  // Pants (16 - 19)
  16: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
  17: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  18: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
  19: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500',

  // Accessories (20 - 23)
  20: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
  21: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
  22: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
  23: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500',

  // Mobiles (24 - 26)
  24: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
  25: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  26: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500',

  // Mobile Accessories (27 - 30)
  27: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
  28: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
  29: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
  30: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500',
};

const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const httpsIndex = url.indexOf('http');
  if (httpsIndex !== -1) {
    return url.substring(httpsIndex).trim();
  }
  return url.trim();
};

export function ProductList({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return <p className="no-products">No products found in this category.</p>;
  }

  return (
    <div className="product-list">
      <div className="product-grid">
        {products.map((product, index) => {
          const productId = product.productId || product.product_id || product.id || index;

          let backendImage = null;
          const imgList = product.productImages || product.product_images || product.images;
          if (Array.isArray(imgList) && imgList.length > 0) {
            const first = imgList[0];
            backendImage = typeof first === 'string' ? first : first?.imageUrl || first?.image_url;
          } else if (product.imageUrl || product.image_url) {
            backendImage = product.imageUrl || product.image_url;
          }

          const cleanedBackend = cleanImageUrl(backendImage);

          const resolvedImage =
            cleanedBackend && !cleanedBackend.includes('kodnest-docs.b-cdn.net')
              ? cleanedBackend
              : PRODUCT_IMAGE_MAP[productId] || DEFAULT_FALLBACK_IMAGE;

          return (
            <div key={productId} className="product-card">
              <img
                src={resolvedImage}
                alt={product.name || 'Product'}
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_FALLBACK_IMAGE;
                }}
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{Number(product.price).toFixed(2)}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(productId)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}