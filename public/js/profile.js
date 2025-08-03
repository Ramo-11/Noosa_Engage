// Profile page JavaScript
const originalValues = {
    fullName: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phoneNumber: document.getElementById('phoneNumber')?.value || ''
};

// Form validation and submission
document.getElementById('profileForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('fullName', document.getElementById('fullName').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('phoneNumber', document.getElementById('phoneNumber').value.trim());
    
    const fileInput = document.getElementById('profilePicture');
    if (fileInput.files[0]) {
        formData.append('picture', fileInput.files[0]);
    }
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phoneNumber = formData.get('phoneNumber');
    
    if (!fullName || fullName.length < 2) {
        showFieldError('fullName', 'Please enter your full name (at least 2 characters)');
        hasErrors = true;
    }
    
    if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    // Only proceed to API call if validation passes
    if (hasErrors) {
        return;
    }
    
    // Submit form - button loading starts here
    await submitProfile(formData);
});

async function submitProfile(formData) {
    const submitButton = document.getElementById('submitButton');
    
    // Store original button content for proper reset
    const originalButtonHTML = submitButton.innerHTML;
    
    // Show loading state
    setButtonLoading(true);
    
    try {
        const response = await fetch('/api/update-user-info', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', result.message);
            // Update original values after successful update
            originalValues.fullName = document.getElementById('fullName').value.trim();
            originalValues.email = document.getElementById('email').value.trim();
            originalValues.phoneNumber = document.getElementById('phoneNumber').value.trim();
            
            // Reset file input and exit edit mode
            const fileInput = document.getElementById('profilePicture');
            fileInput.value = '';
            
            exitEditMode();
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('error', 'An error occurred. Please try again.');
    } finally {
        // Always reset button regardless of outcome
        setButtonLoading(false);
    }
}

function setButtonLoading(isLoading) {
    const submitButton = document.getElementById('submitButton');
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.innerHTML = `
            <span style="display: none;">
                <i class="fas fa-save"></i>
                Update Profile
            </span>
            <div class="spinner" style="display: block;"></div>
        `;
    } else {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.innerHTML = `
            <span id="buttonText">
                <i class="fas fa-save"></i>
                Update Profile
            </span>
            <div class="spinner" id="buttonSpinner" style="display: none;"></div>
        `;
    }
}

function toggleEditMode() {
    const editButton = document.getElementById('editButton');
    const formActions = document.getElementById('formActions');
    const fileInput = document.getElementById('profilePicture');
    const inputs = ['fullName', 'email', 'phoneNumber'];
    
    // Hide edit button, show form actions
    editButton.style.display = 'none';
    formActions.style.display = 'flex';
    
    // Enable file input
    fileInput.disabled = false;
    
    // Make inputs editable
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.removeAttribute('readonly');
            input.classList.add('editable');
        }
    });
    
    // Update subtitle
    const subtitle = document.querySelector('.card-subtitle');
    if (subtitle) {
        subtitle.textContent = 'Update your personal information and settings';
    }
}

function exitEditMode() {
    const editButton = document.getElementById('editButton');
    const formActions = document.getElementById('formActions');
    const fileInput = document.getElementById('profilePicture');
    const inputs = ['fullName', 'email', 'phoneNumber'];
    
    // Show edit button, hide form actions
    editButton.style.display = 'flex';
    formActions.style.display = 'none';
    
    // Disable file input
    fileInput.disabled = true;
    
    // Make inputs readonly
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.setAttribute('readonly', true);
            input.classList.remove('editable');
        }
    });
    
    // Update subtitle
    const subtitle = document.querySelector('.card-subtitle');
    if (subtitle) {
        subtitle.textContent = 'View and manage your personal information';
    }
    
    // Always reset button when exiting edit mode
    setButtonLoading(false);
}

function cancelEdit() {
    // Reset form to original values
    resetForm();
    
    // Clear any errors
    clearErrors();
    
    // Exit edit mode (this also resets the button)
    exitEditMode();
}

function resetForm() {
    // Reset form fields to original values
    document.getElementById('fullName').value = originalValues.fullName;
    document.getElementById('email').value = originalValues.email;
    document.getElementById('phoneNumber').value = originalValues.phoneNumber;
    document.getElementById('profilePicture').value = '';
    
    // Clear any errors
    clearErrors();
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(type, message) {
    const alert = document.getElementById('profileAlert');
    const alertMessage = document.getElementById('alertMessage');
    const icon = alert?.querySelector('i');
    
    if (!alert || !alertMessage || !icon) return;
    
    alert.className = `profile-alert ${type}`;
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
    
    // Auto-hide after 5 seconds for non-success messages
    if (type !== 'success') {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
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
    const fields = ['fullName', 'email', 'phoneNumber'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (field && errorDiv) {
            field.classList.remove('error');
            errorDiv.style.display = 'none';
        }
    });
    
    const alert = document.getElementById('profileAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

// Real-time validation
document.getElementById('fullName')?.addEventListener('input', function() {
    const name = this.value.trim();
    if (name && name.length >= 2) {
        this.classList.remove('error');
        const fullNameError = document.getElementById('fullNameError');
        if (fullNameError) fullNameError.style.display = 'none';
    }
});

document.getElementById('email')?.addEventListener('input', function() {
    const email = this.value.trim();
    if (email && validateEmail(email)) {
        this.classList.remove('error');
        const emailError = document.getElementById('emailError');
        if (emailError) emailError.style.display = 'none';
    }
});

document.getElementById('phoneNumber')?.addEventListener('input', function() {
    const phone = this.value.trim();
    if (phone) {
        this.classList.remove('error');
        const phoneError = document.getElementById('phoneNumberError');
        if (phoneError) phoneError.style.display = 'none';
    }
});

// File input preview
document.getElementById('profilePicture')?.addEventListener('change', function() {
    const fileName = this.files[0]?.name;
    const label = this.nextElementSibling?.querySelector('span');
    if (fileName && label) {
        label.textContent = fileName;
    } else if (label) {
        label.textContent = 'Choose a new profile picture';
    }
});