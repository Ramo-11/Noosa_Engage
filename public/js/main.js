// Main JavaScript Utilities

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize animations
    initializeScrollAnimations();
    
    // Initialize form enhancements
    initializeFormEnhancements();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Add loading states to all forms
    addFormLoadingStates();
    
    // Initialize intersection observer for animations
    initializeIntersectionObserver();
}

function initializeScrollAnimations() {
    // Add smooth scroll behavior to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initializeFormEnhancements() {
    // Add floating labels to form inputs
    const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    formInputs.forEach(input => {
        // Add focus/blur event listeners for better UX
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Add real-time validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationState);
        });
    });
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove existing validation classes
    input.classList.remove('valid', 'invalid');
    
    // Check if required field is empty
    if (input.hasAttribute('required') && !value) {
        input.classList.add('invalid');
        return false;
    }
    
    // Email validation
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.classList.add('invalid');
            return false;
        }
    }
    
    // Password validation
    if (input.type === 'password' && value) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(value)) {
            input.classList.add('invalid');
            return false;
        }
    }
    
    // Phone validation
    if (input.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            input.classList.add('invalid');
            return false;
        }
    }
    
    input.classList.add('valid');
    return true;
}

function clearValidationState(event) {
    const input = event.target;
    input.classList.remove('valid', 'invalid');
}

function initializeTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: var(--text-primary);
        color: white;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        font-size: 0.875rem;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        max-width: 200px;
    `;
    document.body.appendChild(tooltip);
    
    // Add tooltip functionality to elements with data-tooltip
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const text = this.getAttribute('data-tooltip');
            tooltip.textContent = text;
            tooltip.style.opacity = '1';
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
    });
}

function addFormLoadingStates() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"], .submitButton');
            if (submitButton) {
                const originalContent = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitButton.disabled = true;
                
                // Restore button if form submission fails
                setTimeout(() => {
                    if (submitButton.disabled) {
                        submitButton.innerHTML = originalContent;
                        submitButton.disabled = false;
                    }
                }, 30000); // 30 second timeout
            }
        });
    });
}

function initializeIntersectionObserver() {
    // Animate elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.course-card, .card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Utility Functions

function formatDate(dateString, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    return new Date(dateString).toLocaleDateString('en-US', formatOptions);
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatTime(timeString) {
    const time = new Date(`2000-01-01 ${timeString}`);
    return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function showNotification(message, type = 'info', duration = 5000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-lg);
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    const colors = {
        success: { border: 'var(--success-color)', bg: '#f0fdf4' },
        error: { border: 'var(--error-color)', bg: '#fef2f2' },
        warning: { border: 'var(--warning-color)', bg: '#fffbeb' },
        info: { border: 'var(--primary-color)', bg: '#eff6ff' }
    };
    
    if (colors[type]) {
        notification.style.borderColor = colors[type].border;
        notification.style.backgroundColor = colors[type].bg;
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas ${getNotificationIcon(type)}" style="color: ${colors[type]?.border || 'var(--text-secondary)'}; font-size: 1.25rem;"></i>
            <span style="flex: 1; color: var(--text-primary);">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-light); cursor: pointer; font-size: 1.25rem;">×</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Export utilities
window.AppUtils = {
    formatDate,
    formatCurrency,
    formatTime,
    debounce,
    throttle,
    showNotification,
    validateInput
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .course-card,
    .card,
    .stat-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .course-card.animate-in,
    .card.animate-in,
    .stat-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-input.valid {
        border-color: var(--success-color);
        box-shadow: 0 0 0 3px rgb(34 197 94 / 0.1);
    }
    
    .form-input.invalid {
        border-color: var(--error-color);
        box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
    
    @media (max-width: 768px) {
        #notification-container {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);