// Home Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

function initializeHomePage() {
    // Set initial filters
    filterInvoices('unpaid');
    filterAppointments('Scheduled');
    
    // Add loading states to action buttons
    addLoadingStates();
}

function filterInvoices(status) {
    // Update active tab
    const filterTabs = document.querySelectorAll('.dashboard-section:first-child .filter-tab');
    filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === status);
    });
    
    // Filter invoice cards
    const invoiceCards = document.querySelectorAll('#invoicesGrid .item-card');
    invoiceCards.forEach(card => {
        const cardStatus = card.dataset.status;
        const shouldShow = status === 'all' || cardStatus === status;
        card.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Show empty state if no visible cards
    const visibleCards = Array.from(invoiceCards).filter(card => card.style.display !== 'none');
    const emptyState = document.querySelector('#invoicesGrid + .empty-state');
    if (emptyState) {
        emptyState.style.display = visibleCards.length === 0 ? 'block' : 'none';
    }
}

function filterAppointments(status) {
    // Update active tab
    const filterTabs = document.querySelectorAll('.dashboard-section:nth-child(2) .filter-tab');
    filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === status);
    });
    
    // Filter appointment cards
    const appointmentCards = document.querySelectorAll('#appointmentsGrid .item-card');
    appointmentCards.forEach(card => {
        const cardStatus = card.dataset.status;
        const shouldShow = status === 'all' || cardStatus === status;
        card.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Show empty state if no visible cards
    const visibleCards = Array.from(appointmentCards).filter(card => card.style.display !== 'none');
    const emptyState = document.querySelector('#appointmentsGrid + .empty-state');
    if (emptyState) {
        emptyState.style.display = visibleCards.length === 0 ? 'block' : 'none';
    }
}

async function cancelAppointment(appointmentId) {
    if (!appointmentId) {
        showAlert('error', 'Error', 'Unable to cancel appointment. Please try again.');
        return;
    }
    
    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment? This action cannot be undone.',
        'Cancel Appointment',
        'Keep Appointment'
    );
    
    if (!confirmed) return;
    
    // Find the button and add loading state
    const button = document.querySelector(`button[onclick="cancelAppointment('${appointmentId}')"]`);
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/cancel-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ appointmentId })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', 'Success', result.message);
            // Reload page after delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showAlert('error', 'Error', result.message);
            // Restore button state
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showAlert('error', 'Error', 'Failed to cancel appointment. Please try again.');
        // Restore button state
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

function showAlert(type, title, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert-message ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    alert.innerHTML = `
        <div class="alert-icon ${type}">
            <i class="fas ${icon}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-title ${type}">${title}</div>
            <p class="alert-message-text">${message}</p>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }
    }, 5000);
    
    // Make it dismissible on click
    alert.addEventListener('click', () => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            alert.remove();
        }, 300);
    });
}

function showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        `;
        
        modal.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b;"></i>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="cancelBtn" style="padding: 0.75rem 1.5rem; background: var(--background-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.5rem; cursor: pointer; font-weight: 500;">${cancelText}</button>
                    <button id="confirmBtn" style="padding: 0.75rem 1.5rem; background: var(--warning-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">${confirmText}</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

function addLoadingStates() {
    // Add loading states to all action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        if (button.tagName === 'A') {
            button.addEventListener('click', function() {
                const originalContent = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                this.style.pointerEvents = 'none';
                
                // Restore after a short delay if still on page
                setTimeout(() => {
                    if (this.parentNode) {
                        this.innerHTML = originalContent;
                        this.style.pointerEvents = '';
                    }
                }, 3000);
            });
        }
    });
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions for global use
window.HomePageUtils = {
    filterInvoices,
    filterAppointments,
    cancelAppointment,
    showAlert,
    showConfirmDialog
};