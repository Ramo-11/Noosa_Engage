document.addEventListener('DOMContentLoaded', function() {
    initializeSignupAuthPage();
});

function initializeSignupAuthPage() {
    const signupAuthForm = document.getElementById('signupAuthForm');
    if (signupAuthForm) {
        signupAuthForm.addEventListener('submit', handleCodeSubmit);
    }
    
    const codeInput = document.getElementById('verificationCode');
    if (codeInput) {
        codeInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
            if (this.value.length === 6) {
                this.classList.remove('error');
                const codeError = document.getElementById('verificationCodeError');
                if (codeError) codeError.style.display = 'none';
            }
        });
    }
}

async function handleCodeSubmit(e) {
    e.preventDefault();
    
    // Honeypot check
    const honeypot = document.getElementById('honeypot');
    if (honeypot && honeypot.value) {
        return; // bot detected, silently fail
    }

    const code = document.getElementById('verificationCode').value.trim();
    clearErrors();
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
        showFieldError('verificationCode', 'Please enter a valid 6-digit verification code');
        return;
    }
    
    const submitButton = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonText.style.display = 'none';
    buttonSpinner.style.display = 'block';
    
    try {
        const response = await fetch('/api/signup-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', 'Verification successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showAlert('error', result.message || "Verification failed.");
            resetButton();
        }
    } catch (error) {
        if (typeof generalLogger !== 'undefined' && generalLogger.error) {
            generalLogger.error('Signup verification error:', error);
        } else {
            console.error('Signup verification error:', error);
        }
        showAlert('error', 'An error occurred. Please try again.');
        resetButton();
    }
}

function resetButton() {
    const submitButton = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    if (submitButton && buttonText && buttonSpinner) {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        buttonText.style.display = 'inline';
        buttonSpinner.style.display = 'none';
    }
}

function showAlert(type, message) {
    const alert = document.getElementById('authAlert');
    const alertMessage = document.getElementById('alertMessage');
    const icon = alert?.querySelector('i');
    
    if (!alert || !alertMessage || !icon) return;
    
    alert.className = `auth-alert ${type}`;
    alertMessage.textContent = message;
    
    if (type === 'success') icon.className = 'fas fa-check-circle';
    else if (type === 'error') icon.className = 'fas fa-exclamation-circle';
    else icon.className = 'fas fa-info-circle';
    
    alert.style.display = 'flex';
    
    if (type !== 'success') {
        setTimeout(() => {
            if (alert.style.display !== 'none') alert.style.display = 'none';
        }, 8000);
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
    const field = document.getElementById('verificationCode');
    const errorDiv = document.getElementById('verificationCodeError');
    
    if (field && errorDiv) {
        field.classList.remove('error');
        errorDiv.style.display = 'none';
    }
    
    const alert = document.getElementById('authAlert');
    if (alert) alert.style.display = 'none';
}
