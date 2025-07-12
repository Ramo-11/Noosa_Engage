// Navigation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navbar = document.querySelector('.navbar');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Profile dropdown
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
        const profileTrigger = profileContainer.querySelector('.profile-trigger');
        if (profileTrigger) {
            profileTrigger.addEventListener('click', toggleProfileDropdown);
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', closeDropdowns);
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Handle active nav links
    setActiveNavLink();
}

function toggleMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        const isOpen = mobileToggle.classList.contains('open');
        
        if (isOpen) {
            mobileToggle.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            mobileToggle.classList.add('open');
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
}

function toggleProfileDropdown(event) {
    event.stopPropagation();
    const profileContainer = document.querySelector('.profile-container');
    
    if (profileContainer) {
        const isOpen = profileContainer.classList.contains('open');
        
        // Close all other dropdowns first
        document.querySelectorAll('.profile-container.open').forEach(container => {
            if (container !== profileContainer) {
                container.classList.remove('open');
            }
        });
        
        // Toggle current dropdown
        if (isOpen) {
            profileContainer.classList.remove('open');
        } else {
            profileContainer.classList.add('open');
        }
    }
}

function closeDropdowns(event) {
    // Close mobile menu if clicking outside
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && mobileToggle && 
        !mobileMenu.contains(event.target) && 
        !mobileToggle.contains(event.target)) {
        mobileToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    // Close profile dropdown if clicking outside
    const profileContainers = document.querySelectorAll('.profile-container');
    profileContainers.forEach(container => {
        if (!container.contains(event.target)) {
            container.classList.remove('open');
        }
    });
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Utility function for smooth scrolling
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export functions for use in other scripts
window.NavigationUtils = {
    toggleMobileMenu,
    toggleProfileDropdown,
    closeDropdowns,
    smoothScrollTo
};