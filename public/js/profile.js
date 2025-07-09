// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let isEditing = false;
    const originalValues = {};

    // Form submission handler
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitButtonFunction();
    });

    // File input change handler
    document.getElementById('profilePicture').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const fileLabel = document.getElementById('fileLabel');
        
        if (file) {
            fileLabel.textContent = file.name;
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            fileLabel.textContent = 'Choose profile picture';
        }
    });

    // Make functions global so onclick handlers can access them
    window.editButtonFunction = editButtonFunction;
    window.cancelButtonFunction = cancelButtonFunction;
    window.initiatePasswordReset = initiatePasswordReset;

    function editButtonFunction() {
        isEditing = true;
        const inputs = document.querySelectorAll('.form-input, .file-input');
        const editButton = document.getElementById('editButton');
        const formActions = document.getElementById('formActions');

        // Store original values
        inputs.forEach(input => {
            if (input.type !== 'file') {
                originalValues[input.id] = input.value;
            }
        });

        // Enable editing
        inputs.forEach(input => {
            input.readOnly = false;
            input.disabled = false;
        });

        // Update UI
        editButton.style.display = 'none';
        formActions.style.display = 'flex';

        // Clear any alerts
        hideAlert();
    }

    async function submitButtonFunction() {
        const submitButton = document.getElementById('submitButton');
        const buttonText = document.getElementById('buttonText');
        const buttonSpinner = document.getElementById('buttonSpinner');

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonSpinner.style.display = 'block';

        try {
            const formData = new FormData();
            
            // Add form data
            formData.append('fullName', document.getElementById('fullName').value.trim());
            formData.append('email', document.getElementById('email').value.trim());
            formData.append('phoneNumber', document.getElementById('phoneNumber').value.trim());
            
            // Add profile picture if selected
            const profilePicture = document.getElementById('profilePicture').files[0];
            if (profilePicture) {
                formData.append('picture', profilePicture);
            }

            const response = await fetch('/api/update-user-info', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', result.message);
                setTimeout(() => {
                    location.reload(true);
                }, 2000);
            } else {
                showAlert('error', result.message);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showAlert('error', 'An error occurred. Please try again.');
        } finally {
            resetButton();
        }
    }

    function cancelButtonFunction() {
        isEditing = false;
        const inputs = document.querySelectorAll('.form-input, .file-input');
        const editButton = document.getElementById('editButton');
        const formActions = document.getElementById('formActions');
        const fileLabel = document.getElementById('fileLabel');

        // Restore original values
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.value = originalValues[input.id] || '';
                input.readOnly = true;
            } else {
                input.disabled = true;
                input.value = '';
            }
        });

        // Reset file label
        fileLabel.textContent = 'Choose profile picture';

        // Update UI
        editButton.style.display = 'flex';
        formActions.style.display = 'none';

        // Clear errors and alerts
        clearErrors();
        hideAlert();
    }

    function validateForm() {
        clearErrors();
        let isValid = true;

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();

        // Validate full name
        if (!fullName || fullName.length < 2) {
            showFieldError('fullName', 'Please enter a valid full name');
            isValid = false;
        }

        // Validate email
        if (!validateEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone number (optional)
        if (phoneNumber && !validatePhone(phoneNumber)) {
            showFieldError('phoneNumber', 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function showAlert(type, message) {
        const alert = document.getElementById('profileAlert');
        const alertMessage = document.getElementById('alertMessage');
        const icon = alert.querySelector('i');
        
        alert.className = `profile-alert ${type}`;
        alertMessage.textContent = message;
        
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
        const alert = document.getElementById('profileAlert');
        alert.style.display = 'none';
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        const errorSpan = errorDiv.querySelector('span');
        
        field.classList.add('error');
        errorSpan.textContent = message;
        errorDiv.style.display = 'flex';
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        field.classList.remove('error');
        errorDiv.style.display = 'none';
    }

    function clearErrors() {
        const fields = ['fullName', 'email', 'phoneNumber'];
        fields.forEach(fieldId => {
            clearFieldError(fieldId);
        });
    }

    function resetButton() {
        const submitButton = document.getElementById('submitButton');
        const buttonText = document.getElementById('buttonText');
        const buttonSpinner = document.getElementById('buttonSpinner');
        
        submitButton.disabled = false;
        buttonText.style.display = 'flex';
        buttonSpinner.style.display = 'none';
    }

    // Password Reset Function
    async function initiatePasswordReset() {
        const button = document.querySelector('.btn-password-reset');
        const originalText = button.innerHTML;
        
        try {
            // Show loading state
            button.disabled = true;
            button.innerHTML = '<div class="spinner"></div> Sending...';
            
            const response = await fetch('/api/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: document.getElementById('email').value.trim()
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('success', 'Password reset email sent! Check your inbox for instructions.');
            } else {
                showAlert('error', result.message || 'Failed to send reset email. Please try again.');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showAlert('error', 'An error occurred. Please try again.');
        } finally {
            // Reset button
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    // Real-time validation
    document.getElementById('fullName').addEventListener('input', function() {
        if (this.value.trim() && this.value.trim().length >= 2) {
            clearFieldError('fullName');
        }
    });

    document.getElementById('email').addEventListener('input', function() {
        if (this.value.trim() && validateEmail(this.value.trim())) {
            clearFieldError('email');
        }
    });

    document.getElementById('phoneNumber').addEventListener('input', function() {
        if (!this.value.trim() || validatePhone(this.value.trim())) {
            clearFieldError('phoneNumber');
        }
    });
});