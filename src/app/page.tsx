'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Star, Search, X, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
  stock: number; // Added stock/quota property
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [viewingCart, setViewingCart] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        
        // Add stock/quota property to each product (random between 0-20)
        const productsWithStock = data.map((product: any) => ({
          ...product,
          stock: Math.floor(Math.random() * 21) // Random stock between 0-20
        }));
        
        setProducts(productsWithStock);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        showNotificationMessage('Error loading products. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('shopCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading saved cart', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopCart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  const showNotificationMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const addToCart = (product: Product) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    // Calculate available stock
    const currentInCart = existingItem ? existingItem.quantity : 0;
    
    // Check if adding one more would exceed stock
    if (currentInCart >= product.stock) {
      showNotificationMessage(`Cannot add more! Only ${product.stock} available in stock.`, 'error');
      return;
    }
    
    setCart(prevCart => {
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 700);
    
    showNotificationMessage(`${product.title} added to cart!`);
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    // Find the product to get its stock
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      showNotificationMessage('Product not found', 'error');
      return;
    }
    
    // Validate the new quantity
    if (newQuantity < 1) {
      newQuantity = 1;
      showNotificationMessage('Minimum quantity is 1', 'error');
    } else if (newQuantity > product.stock) {
      newQuantity = product.stock;
      showNotificationMessage(`Maximum available is ${product.stock}`, 'error');
    }
    
    // Update cart with new quantity
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    showNotificationMessage("Item removed from cart.");
  };

  const getAvailableStock = (productId: number) => {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!product) return 0;
    
    // Available stock is total stock minus what's already in cart
    return product.stock - (cartItem?.quantity || 0);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Check if a product is out of stock or already has max in cart
  const isOutOfStock = (product: Product) => {
    return product.stock <= 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-2xl font-medium">Loading Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 p-6">
      {/* Notification */}
      <div 
        className={`fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 transition-all duration-300 z-50 flex items-center ${
          showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        {notification.includes('Error') || notification.includes('Cannot') || notification.includes('Maximum') || notification.includes('Minimum') ? 
          <AlertCircle className="text-red-500 mr-2" size={20} /> : 
          <Star className="text-yellow-500 mr-2" size={20} />
        }
        <p className={notification.includes('Error') || notification.includes('Cannot') || notification.includes('Maximum') || notification.includes('Minimum') ? 'text-red-500' : 'text-gray-800'}>
          {notification}
        </p>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">ShopHub</h1>
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <button 
              onClick={() => {
                setViewingCart(true);
                setShowCart(true);
              }}
              className="bg-white p-3 rounded-full hover:bg-yellow-100 transition-all relative"
              aria-label="View cart"
            >
              <ShoppingCart size={20} className="text-indigo-800" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {!viewingCart && (
        <>
          {/* Search bar */}
          <div className="flex justify-center mb-10 relative">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search products..."
                className="p-4 pl-12 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col ${
                  addedProductId === product.id ? 'animate-bounce' : ''
                }`}
              >
                <div className="h-64 overflow-hidden relative group">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white p-4 text-sm truncate">{product.description}</p>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {product.category}
                    </div>
                    <h2 className="text-lg font-bold mb-1 truncate" title={product.title}>{product.title}</h2>
                    <div className="flex items-center space-x-1 mb-3">
                      <DollarSign size={16} className="text-green-600" />
                      <p className="text-gray-800 font-bold">{product.price.toFixed(2)}</p>
                    </div>
                    {/* Stock information */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={index < Math.round(product.rating?.rate ?? 0) ? 'text-yellow-400' : 'text-gray-300'}
                            fill={index < Math.round(product.rating?.rate ?? 0) ? 'currentColor' : 'none'}
                          />
                        ))}
                        <span className="text-xs text-gray-500">({product.rating?.count || 0})</span>
                      </div>
                      <span className={`text-xs font-medium ${isOutOfStock(product) ? 'text-red-500' : 'text-green-500'}`}>
                        {isOutOfStock(product) ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                    </div>
                  </div>

                  <button 
                    className={`mt-4 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 
                      ${isOutOfStock(product) 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'}`}
                    onClick={() => !isOutOfStock(product) && addToCart(product)}
                    disabled={isOutOfStock(product)}
                  >
                    <ShoppingCart size={16} />
                    <span>{isOutOfStock(product) ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-white py-10">
                <AlertCircle size={40} className="mx-auto mb-4" />
                <h3 className="text-2xl font-semibold">No products found</h3>
                <p className="mt-2">Try changing your search criteria</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cart Detail View */}
      {viewingCart && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mx-auto max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setViewingCart(false)}
              className="p-2 mr-4 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
          </div>

          {cart.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4">Product</th>
                      <th className="text-center py-4">Price</th>
                      <th className="text-center py-4">Quantity</th>
                      <th className="text-center py-4">Total</th>
                      <th className="text-right py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => {
                      const product = products.find(p => p.id === item.id);
                      const maxStock = product?.stock || 0;
                      
                      return (
                        <tr key={item.id} className="border-b">
                          <td className="py-4">
                            <div className="flex items-center">
                              <img src={item.image} alt={item.title} className="w-16 h-16 object-contain mr-4" />
                              <div>
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <div className="flex items-center justify-center">
                              <DollarSign size={14} className="text-green-600" />
                              <span>{item.price.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <div className="flex items-center justify-center">
                              <button 
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-l-md flex items-center justify-center"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <span>-</span>
                              </button>
                              <input 
                                type="number" 
                                min="1" 
                                max={maxStock}
                                value={item.quantity} 
                                onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border-t border-b outline-none"
                              />
                              <button 
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-r-md flex items-center justify-center"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= maxStock}
                              >
                                <span>+</span>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Max: {maxStock}
                            </div>
                          </td>
                          <td className="text-center py-4 font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="text-right py-4">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <button 
                    onClick={() => setViewingCart(false)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Continue Shopping
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <div className="flex items-center font-bold">
                      <DollarSign size={16} className="text-green-600" />
                      <span>{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Tax (10%):</span>
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-green-600" />
                      <span>{(cartTotal * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Total:</span>
                      <div className="flex items-center font-bold text-lg">
                        <DollarSign size={18} className="text-green-600" />
                        <span>{(cartTotal * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors mt-4">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <button 
                onClick={() => setViewingCart(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {!viewingCart && showCart && (
        <div 
          className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 z-40"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length > 0 ? cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return (
                  <div key={item.id} className="flex items-center py-4 border-b">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-contain mr-4" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm truncate" title={item.title}>{item.title}</h3>
                      <div className="flex items-center mt-1">
                        <DollarSign size={14} className="text-green-600" />
                        <span className="text-gray-800">{item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity} {product && <span>(Max: {product.stock})</span>}
                      </div>
                    </div>
                    <div className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart size={40} className="mb-4" />
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Subtotal:</span>
                  <div className="flex items-center">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-bold">{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors mb-3"
                  onClick={() => setViewingCart(true)}
                >
                  View Cart Details
                </button>
                <button className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl font-semibold transition-colors">
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay when cart is open */}
      {showCart && !viewingCart && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowCart(false)}
        ></div>
      )}
    </div>
  );
}