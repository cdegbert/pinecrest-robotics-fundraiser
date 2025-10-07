// Product data
const products = [
    {
        id: 1,
        name: "DM130 Tri blend Tee",
        description: "Comfortable tri-blend t-shirt featuring the Pinecrest Sloan Canyon Robotics logo. Perfect for showing team spirit!",
        price: 14.00,
        priceXXL: 16.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "dm130-tee.jpg"
    },
    {
        id: 2,
        name: "DT6104 Crewneck Fleece",
        description: "Warm and cozy crewneck fleece with the official Pinecrest Sloan Canyon Robotics team logo.",
        price: 21.00,
        priceXXL: 23.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "dt6104-crewneck.jpg"
    },
    {
        id: 3,
        name: "DM132 Long Sleeve Tee",
        description: "Long sleeve t-shirt with the Pinecrest Sloan Canyon Robotics team logo. Great for cooler weather!",
        price: 18.00,
        priceXXL: 20.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "dm132-longsleeve.jpg"
    }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('sloanCanyonCart')) || [];

// DOM elements
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const closeModal = document.querySelector('.close');

// Get product emoji based on product ID
function getProductEmoji(productId) {
    const emojis = {
        1: "👕", // DM130 Tri blend Tee
        2: "🧥", // DT6104 Crewneck Fleece  
        3: "👔"  // DM132 Long Sleeve Tee
    };
    return emojis[productId] || "🤖";
}

// Admin password (in a real app, this would be server-side)
const ADMIN_PASSWORD = "robotics2024";

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCartDisplay();
    setupEventListeners();
    setupAdminEventListeners();
    // Show products page by default
    showSection('products');
});

// Render products
function renderProducts() {
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <div class="product-image-placeholder">${getProductEmoji(product.id)}</div>
            </div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">
                <span class="price-xs-l">$${product.price.toFixed(2)} (XS-L)</span>
                <span class="price-xxl">$${product.priceXXL.toFixed(2)} (XXL)</span>
            </div>
            <div class="size-selector">
                <label>Size:</label>
                <div class="size-options">
                    ${product.sizes.map(size => 
                        `<div class="size-option" data-size="${size}">${size}</div>`
                    ).join('')}
                </div>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Product card interactions
    productGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('size-option')) {
            // Handle size selection
            const card = e.target.closest('.product-card');
            const sizeOptions = card.querySelectorAll('.size-option');
            sizeOptions.forEach(option => option.classList.remove('selected'));
            e.target.classList.add('selected');
        }
        
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.productId);
            const card = e.target.closest('.product-card');
            const selectedSize = card.querySelector('.size-option.selected');
            
            if (!selectedSize) {
                alert('Please select a size');
                return;
            }
            
            addToCart(productId, selectedSize.dataset.size);
        }
    });
    
    // Cart interactions
    cartItems.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.productId);
            const size = cartItem.dataset.size;
            const isIncrease = e.target.textContent === '+';
            
            updateQuantity(productId, size, isIncrease);
        }
        
        if (e.target.classList.contains('remove-item')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.productId);
            const size = cartItem.dataset.size;
            
            removeFromCart(productId, size);
        }
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
        });
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        checkoutModal.style.display = 'block';
    });
    
    // Modal close
    closeModal.addEventListener('click', function() {
        checkoutModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    // Form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
}

// Add to cart
function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    // Determine price based on size
    const price = size === 'XXL' ? product.priceXXL : product.price;
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: price,
            size: size,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    
    // Show success message
    showNotification(`${product.name} (${size}) added to cart!`);
}

// Update quantity
function updateQuantity(productId, size, isIncrease) {
    const item = cart.find(item => item.id === productId && item.size === size);
    
    if (item) {
        if (isIncrease) {
            item.quantity += 1;
        } else {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                removeFromCart(productId, size);
                return;
            }
        }
        
        saveCart();
        updateCartDisplay();
    }
}

// Remove from cart
function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.productId = item.id;
        cartItem.dataset.size = item.size;
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size} | $${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn">+</button>
                </div>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
                <button class="remove-item">Remove</button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('sloanCanyonCart', JSON.stringify(cart));
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Submit order
function submitOrder() {
    const formData = new FormData(checkoutForm);
    const orderData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode')
        },
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString()
    };
    
    // Save order for admin panel
    saveOrderForAdmin(orderData);
    
    // Send order via email using mailto
    sendOrderEmail(orderData);
    
    // Show success message
    alert('Order submitted successfully! A confirmation email has been sent to Mrs. Egbert.');
    
    // Clear cart and close modal
    cart = [];
    saveCart();
    updateCartDisplay();
    checkoutModal.style.display = 'none';
    checkoutForm.reset();
    
    // Show home section
    showSection('home');
}

// Send order via email
function sendOrderEmail(orderData) {
    const customer = orderData.customer;
    const items = orderData.items;
    const total = orderData.total;
    
    // Create order summary
    let orderSummary = `NEW ROBOTICS FUNDRAISER ORDER\n\n`;
    orderSummary += `Customer Information:\n`;
    orderSummary += `Name: ${customer.firstName} ${customer.lastName}\n`;
    orderSummary += `Email: ${customer.email}\n`;
    orderSummary += `Phone: ${customer.phone}\n`;
    orderSummary += `Address: ${customer.address}\n`;
    orderSummary += `City: ${customer.city}, ${customer.state} ${customer.zipCode}\n\n`;
    
    orderSummary += `Order Details:\n`;
    items.forEach(item => {
        orderSummary += `• ${item.name} (Size: ${item.size}) - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    orderSummary += `\nTotal: $${total.toFixed(2)}\n`;
    orderSummary += `Order Date: ${new Date().toLocaleDateString()}\n\n`;
    orderSummary += `Please contact the customer to arrange payment and pickup.`;
    
    // Create mailto link
    const subject = `Robotics Fundraiser Order - ${customer.firstName} ${customer.lastName}`;
    const mailtoLink = `mailto:anna.egbert@pinecrestnv.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderSummary)}`;
    
    // Open email client
    window.open(mailtoLink);
}

// Save order for admin panel
function saveOrderForAdmin(orderData) {
    const orders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('adminOrders', JSON.stringify(orders));
}

// Setup admin event listeners
function setupAdminEventListeners() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            
            if (password === ADMIN_PASSWORD) {
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                updateAdminStats();
            } else {
                alert('Invalid password. Please try again.');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            document.getElementById('adminLogin').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('adminPassword').value = '';
        });
    }
}

// Update admin statistics
function updateAdminStats() {
    const orders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    // Display recent orders
    const ordersList = document.getElementById('ordersList');
    if (orders.length === 0) {
        ordersList.innerHTML = '<h4>Recent Orders</h4><p>No orders yet. Orders will appear here when customers place them.</p>';
    } else {
        let ordersHTML = '<h4>Recent Orders</h4>';
        orders.slice(-5).reverse().forEach((order, index) => {
            ordersHTML += `
                <div class="order-item">
                    <h5>Order #${orders.length - index}</h5>
                    <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
            `;
        });
        ordersList.innerHTML = ordersHTML;
    }
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});
