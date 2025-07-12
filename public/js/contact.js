// Contact page JavaScript
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!fullName || fullName.length < 2) {
        showFieldError('fullName', 'Please enter your full name');
        hasErrors = true;
    }
    
    if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (!subject || subject.length < 5) {
        showFieldError('subject', 'Please enter a subject (at least 5 characters)');
        hasErrors = true;
    }
    
    if (!description) {
        showFieldError('description', 'Please enter a message');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Submit form
    await submitContact(fullName, email, subject, description);
});

async function submitContact(fullName, email, subject, description) {
    const submitButton = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    // Store original button content for proper reset
    const originalButtonHTML = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonText.style.display = 'none';
    buttonSpinner.style.display = 'block';
    
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, subject, description })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', result.message);
            document.getElementById('contactForm').reset();
            
            setTimeout(() => {
                window.location.href = '/contact';
            }, 4000);
        } else {
            showAlert('error', result.message);
            resetButton(originalButtonHTML);
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showAlert('error', 'An error occurred. Please try again.');
        resetButton(originalButtonHTML);
    }
}

function resetButton(originalButtonHTML) {
    const submitButton = document.getElementById('submitButton');
    
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.innerHTML = originalButtonHTML;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(type, message) {
    const alert = document.getElementById('contactAlert');
    const alertMessage = document.getElementById('alertMessage');
    const icon = alert?.querySelector('i');
    
    if (!alert || !alertMessage || !icon) return;
    
    alert.className = `contact-alert ${type}`;
    alertMessage.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    alert.style.display = 'flex';
}

function hideAlert() {
    const alert = document.getElementById('contactAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');
    const errorSpan = errorDiv?.querySelector('span');
    
    if (!field || !errorDiv || !errorSpan) return;
    
    field.classList.add('error');
    errorSpan.textContent = message;
    errorDiv.style.display = 'flex';
}

function clearErrors() {
    const fields = ['fullName', 'email', 'subject', 'description'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (field && errorDiv) {
            field.classList.remove('error');
            errorDiv.style.display = 'none';
        }
    });
    
    hideAlert();
}

function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = button.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-question.active').forEach(activeButton => {
        if (activeButton !== button) {
            activeButton.classList.remove('active');
            activeButton.parentElement.querySelector('.faq-answer').classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    if (isActive) {
        button.classList.remove('active');
        answer.classList.remove('active');
    } else {
        button.classList.add('active');
        answer.classList.add('active');
    }
}

// Real-time validation
document.getElementById('fullName')?.addEventListener('input', function() {
    if (this.value.trim() && this.value.trim().length >= 2) {
        this.classList.remove('error');
        const fullNameError = document.getElementById('fullNameError');
        if (fullNameError) fullNameError.style.display = 'none';
    }
});

document.getElementById('email')?.addEventListener('input', function() {
    if (this.value.trim() && validateEmail(this.value.trim())) {
        this.classList.remove('error');
        const emailError = document.getElementById('emailError');
        if (emailError) emailError.style.display = 'none';
    }
});

document.getElementById('subject')?.addEventListener('input', function() {
    if (this.value.trim() && this.value.trim().length >= 5) {
        this.classList.remove('error');
        const subjectError = document.getElementById('subjectError');
        if (subjectError) subjectError.style.display = 'none';
    }
});

document.getElementById('description')?.addEventListener('input', function() {
    if (this.value.trim() && this.value.trim().length >= 10) {
        this.classList.remove('error');
        const descriptionError = document.getElementById('descriptionError');
        if (descriptionError) descriptionError.style.display = 'none';
    }
});