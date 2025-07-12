// Forgot Password Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeForgotPasswordPage();
});

function initializeForgotPasswordPage() {
    // Add form event listener
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleInitialSubmit);
    }
    
    // Add real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            if (email && validateEmail(email)) {
                this.classList.remove('error');
                const emailError = document.getElementById('emailError');
                if (emailError) emailError.style.display = 'none';
            }
        });
    }
}

async function handleInitialSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    // Clear previous errors
    clearErrors();
    
    // Validate email
    if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        return;
    }
    
    // Submit form
    await submitForgotPassword(email);
}

async function submitForgotPassword(email) {
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
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', result.message);
            // Transform the form to show code input
            showCodeInputForm(email);
        } else {
            showAlert('error', result.message);
            resetButton(originalButtonHTML);
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showAlert('error', 'An error occurred. Please try again.');
        resetButton(originalButtonHTML);
    }
}

function showCodeInputForm(email) {
    // Update header
    document.querySelector('.auth-title').textContent = 'Enter Reset Code';
    document.querySelector('.auth-subtitle').textContent = `We've sent a 6-digit code to ${email}. Enter it below to reset your password.`;
    
    // Update form HTML
    const authForm = document.getElementById('forgotPasswordForm');
    authForm.innerHTML = `
        <!-- Hidden email field -->
        <input type="hidden" id="hiddenEmail" value="${email}">
        
        <!-- Code Field -->
        <div class="form-group">
            <label for="resetCode" class="form-label">6-Digit Reset Code</label>
            <div class="form-input-container">
                <input 
                    type="text" 
                    id="resetCode" 
                    name="resetCode" 
                    class="form-input" 
                    placeholder="Enter 6-digit code"
                    required
                    maxlength="6"
                    pattern="[0-9]{6}"
                    autocomplete="one-time-code"
                >
            </div>
            <div class="form-error" id="resetCodeError" style="display: none;">
                <i class="fas fa-exclamation-circle"></i>
                <span></span>
            </div>
        </div>

        <!-- New Password Field -->
        <div class="form-group">
            <label for="newPassword" class="form-label">New Password</label>
            <div class="form-input-container">
                <input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword" 
                    class="form-input" 
                    placeholder="Enter new password"
                    required
                    minlength="8"
                    autocomplete="new-password"
                >
            </div>
            <div class="form-error" id="newPasswordError" style="display: none;">
                <i class="fas fa-exclamation-circle"></i>
                <span></span>
            </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <div class="form-input-container">
                <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    class="form-input" 
                    placeholder="Confirm new password"
                    required
                    minlength="8"
                    autocomplete="new-password"
                >
            </div>
            <div class="form-error" id="confirmPasswordError" style="display: none;">
                <i class="fas fa-exclamation-circle"></i>
                <span></span>
            </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="auth-button" id="submitButton">
            <span id="buttonText">Reset Password</span>
            <div class="spinner" id="buttonSpinner" style="display: none;"></div>
        </button>
    `;
    
    // Update the back link
    document.querySelector('.auth-links').innerHTML = `
        <p>Didn't receive the code?</p>
        <a href="#" onclick="resendCode('${email}')" class="auth-link">Resend Code</a>
        <span style="margin: 0 0.5rem;">•</span>
        <a href="/login" class="auth-link">Back to Sign In</a>
    `;
    
    // Remove old event listener and add new one
    authForm.removeEventListener('submit', handleInitialSubmit);
    authForm.addEventListener('submit', handlePasswordReset);
    
    // Add real-time validation for new fields
    addPasswordResetValidation();

    resetFormState();
}

function resetFormState() {
    // Ensure button is enabled and not in loading state
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
    
    // Clear any residual error states
    clearAllErrors();
    
    // Focus on the first input field
    const firstInput = document.getElementById('resetCode');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function addPasswordResetValidation() {
    // Reset code validation
    const resetCodeInput = document.getElementById('resetCode');
    if (resetCodeInput) {
        resetCodeInput.addEventListener('input', function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value.length === 6) {
                this.classList.remove('error');
                const resetCodeError = document.getElementById('resetCodeError');
                if (resetCodeError) resetCodeError.style.display = 'none';
            }
        });
    }
    
    // New password validation
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            if (this.value.length >= 8) {
                this.classList.remove('error');
                const newPasswordError = document.getElementById('newPasswordError');
                if (newPasswordError) newPasswordError.style.display = 'none';
            }
        });
    }
    
    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const newPassword = document.getElementById('newPassword').value;
            if (this.value && this.value === newPassword) {
                this.classList.remove('error');
                const confirmPasswordError = document.getElementById('confirmPasswordError');
                if (confirmPasswordError) confirmPasswordError.style.display = 'none';
            }
        });
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('hiddenEmail').value;
    const resetCode = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    if (!resetCode || resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
        showFieldError('resetCode', 'Please enter a valid 6-digit code');
        hasErrors = true;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showFieldError('newPassword', 'Password must be at least 6 characters');
        hasErrors = true;
    }
    
    if (newPassword !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Submit reset request
    const submitButton = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    const originalButtonHTML = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    buttonText.style.display = 'none';
    buttonSpinner.style.display = 'block';
    
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, resetCode, newPassword })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', 'Password reset successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showAlert('error', result.message);
            resetButton(originalButtonHTML);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showAlert('error', 'An error occurred. Please try again.');
        resetButton(originalButtonHTML);
    }
}

async function resendCode(email) {
    showAlert('info', 'Sending new code...');
    
    // Disable resend link temporarily
    const resendLink = event.target;
    const originalText = resendLink.textContent;
    resendLink.textContent = 'Sending...';
    resendLink.style.pointerEvents = 'none';
    
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', 'New code sent to your email!');
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Resend code error:', error);
        showAlert('error', 'Failed to resend code. Please try again.');
    } finally {
        // Re-enable resend link
        setTimeout(() => {
            resendLink.textContent = originalText;
            resendLink.style.pointerEvents = '';
        }, 3000); // Wait 3 seconds before allowing another resend
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
    const alert = document.getElementById('authAlert');
    const alertMessage = document.getElementById('alertMessage');
    const icon = alert?.querySelector('i');
    
    if (!alert || !alertMessage || !icon) return;
    
    alert.className = `auth-alert ${type}`;
    alertMessage.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    alert.style.display = 'flex';
    
    // Auto-hide after 8 seconds for non-success messages
    if (type !== 'success') {
        setTimeout(() => {
            if (alert.style.display !== 'none') {
                alert.style.display = 'none';
            }
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
    const field = document.getElementById('email');
    const errorDiv = document.getElementById('emailError');
    
    if (field && errorDiv) {
        field.classList.remove('error');
        errorDiv.style.display = 'none';
    }
    
    const alert = document.getElementById('authAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

function clearAllErrors() {
    // Clear all possible form field errors
    const fieldIds = ['resetCode', 'newPassword', 'confirmPassword', 'email'];
    
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (field && errorDiv) {
            field.classList.remove('error');
            errorDiv.style.display = 'none';
        }
    });
    
    // Clear alert
    const alert = document.getElementById('authAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

// Utility function to format email for display
function formatEmailForDisplay(email) {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
        return email;
    }
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
}

// Export functions for global access if needed
window.ForgotPasswordUtils = {
    resendCode,
    validateEmail,
    showAlert,
    showFieldError,
    clearErrors,
    clearAllErrors
};