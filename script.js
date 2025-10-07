// Product data
const products = [
    {
        id: 1,
        name: "DM130 Tri blend Tee",
        description: "Comfortable tri-blend t-shirt featuring the Pinecrest Sloan Canyon Robotics logo.",
        price: 14.00,
        priceXXL: 16.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "images/dm130-tee.jpg"
    },
    {
        id: 2,
        name: "DT6104 Crewneck Fleece",
        description: "Warm and cozy crewneck fleece with the official Pinecrest Sloan Canyon Robotics team logo.",
        price: 21.00,
        priceXXL: 23.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "images/dt6104-crewneck.jpg"
    },
    {
        id: 3,
        name: "DM132 Long Sleeve Tee",
        description: "Long sleeve t-shirt with the Pinecrest Sloan Canyon Robotics team logo.",
        price: 18.00,
        priceXXL: 20.00,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        image: "images/dm132-longsleeve.jpg"
    }
];

// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOz3MxqqR9aC0SOAjrhusUbhBGCbU2jqmwqvonHCNk8zZdd0rZYkWLrDEZU4YptovOEg/exec';

// Cart functionality
let cart = [];

// DOM elements
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const closeModal = document.querySelector('.close');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing app...');
    renderProducts();
    updateCartDisplay();
    setupEventListeners();
    showSection('products');
});

// Render products with images
function renderProducts() {
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Create image element
        const imgElement = document.createElement('img');
        imgElement.src = product.image;
        imgElement.alt = product.name;
        imgElement.className = 'product-image-img';
        imgElement.style.width = '100%';
        imgElement.style.height = '250px';
        imgElement.style.objectFit = 'contain';
        imgElement.style.backgroundColor = '#f5f5f5';
        imgElement.style.borderRadius = '8px';
        
        // Fallback to emoji if image fails
        imgElement.onerror = function() {
            console.log('Image failed to load:', product.image);
            this.style.display = 'none';
            const emojiDiv = document.createElement('div');
            emojiDiv.className = 'product-image-placeholder';
            emojiDiv.style.fontSize = '4rem';
            emojiDiv.style.height = '250px';
            emojiDiv.style.display = 'flex';
            emojiDiv.style.alignItems = 'center';
            emojiDiv.style.justifyContent = 'center';
            emojiDiv.style.backgroundColor = '#f5f5f5';
            emojiDiv.style.borderRadius = '8px';
            emojiDiv.textContent = ['👕', '🧥', '👔'][product.id - 1];
            this.parentNode.insertBefore(emojiDiv, this);
        };
        
        imgElement.onload = function() {
            console.log('Image loaded successfully:', product.image);
        };
        
        productCard.innerHTML = `
            <div class="product-image-container" style="margin-bottom: 1rem;"></div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">
                <span class="price-xs-l">$${product.price.toFixed(2)} (XS-XL)</span>
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
            <div class="quantity-selector" style="margin: 1rem 0;">
                <label>Quantity:</label>
                <input type="number" class="quantity-input" min="1" max="99" value="1" style="width: 60px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
        `;
        
        // Insert image into container
        productCard.querySelector('.product-image-container').appendChild(imgElement);
        productGrid.appendChild(productCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Product card interactions
    productGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('size-option')) {
            const card = e.target.closest('.product-card');
            const sizeOptions = card.querySelectorAll('.size-option');
            sizeOptions.forEach(option => option.classList.remove('selected'));
            e.target.classList.add('selected');
        }
        
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.productId);
            const card = e.target.closest('.product-card');
            const selectedSize = card.querySelector('.size-option.selected');
            const quantityInput = card.querySelector('.quantity-input');
            
            if (!selectedSize) {
                alert('Please select a size');
                return;
            }
            
            const quantity = parseInt(quantityInput.value) || 1;
            addToCart(productId, selectedSize.dataset.size, quantity);
            
            // Reset selections
            card.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
            quantityInput.value = 1;
        }
    });
    
    // Cart interactions
    cartItems.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
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
        hideOrderMessages();
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
            hideOrderMessages();
        }
    });
    
    // Form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
}

// Add to cart
function addToCart(productId, size, quantity) {
    const product = products.find(p => p.id === productId);
    const price = size === 'XXL' ? product.priceXXL : product.price;
    
    cart.push({
        id: productId,
        name: product.name,
        price: price,
        size: size,
        quantity: quantity
    });
    
    updateCartDisplay();
    showNotification(`${product.name} (${size}) x${quantity} added to cart!`);
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size} | Quantity: ${item.quantity} | $${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
                <button class="remove-item" data-index="${index}">Remove</button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Show notification
function showNotification(message) {
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
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hide order messages
function hideOrderMessages() {
    document.getElementById('orderLoadingMessage').style.display = 'none';
    document.getElementById('orderSuccessMessage').style.display = 'none';
    document.getElementById('orderErrorMessage').style.display = 'none';
}

// Submit order
async function submitOrder() {
    const formData = new FormData(checkoutForm);
    
    // Prepare order data
    const orderData = {
        timestamp: new Date().toISOString(),
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        studentName: formData.get('studentName'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    console.log('Submitting order:', orderData);
    
    // Show loading message
    hideOrderMessages();
    document.getElementById('orderLoadingMessage').style.display = 'block';
    document.querySelector('.submit-order-btn').disabled = true;
    
    try {
        // Send to Google Sheets
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Order sent to Google Sheets');
        
        // Show success message
        hideOrderMessages();
        document.getElementById('orderSuccessMessage').style.display = 'block';
        
        // Clear cart and reset form after 2 seconds
        setTimeout(() => {
            cart = [];
            updateCartDisplay();
            checkoutModal.style.display = 'none';
            checkoutForm.reset();
            hideOrderMessages();
            document.querySelector('.submit-order-btn').disabled = false;
            showSection('products');
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting order:', error);
        hideOrderMessages();
        document.getElementById('orderErrorMessage').style.display = 'block';
        document.querySelector('.submit-order-btn').disabled = false;
    }
}
