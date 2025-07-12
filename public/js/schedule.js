// Schedule page JavaScript
document.getElementById('scheduleForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    const course = document.getElementById('course').value;
    const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked')).map(cb => cb.value);
    const preferredTime = document.getElementById('preferredTime').value;
    const notes = document.getElementById('notes').value.trim();
    
    if (!course) {
        showFieldError('course', 'Please select a subject');
        hasErrors = true;
    }
    
    if (preferredDays.length === 0) {
        showFieldError('preferredDays', 'Please select at least one preferred day');
        hasErrors = true;
    }
    
    if (!preferredTime) {
        showFieldError('preferredTime', 'Please select a preferred time');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Submit form
    await submitRequest(course, preferredDays, preferredTime, notes);
});

async function submitRequest(course, preferredDays, preferredTime, notes) {
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
        const response = await fetch('/api/schedule-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course,
                preferredDays,
                preferredTime,
                notes
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', result.message);
            // Reset form after successful submission
            document.getElementById('scheduleForm').reset();
            updateCharacterCount(); // Reset character count
            
            setTimeout(() => {
                window.location.href = '/';
            }, 4000);
        } else {
            showAlert('error', result.message);
            resetButton(originalButtonHTML);
        }
    } catch (error) {
        console.error('Request submission error:', error);
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

function showAlert(type, message) {
    const alert = document.getElementById('scheduleAlert');
    const alertMessage = document.getElementById('alertMessage');
    const icon = alert?.querySelector('i');
    
    if (!alert || !alertMessage || !icon) return;
    
    alert.className = `schedule-alert ${type}`;
    alertMessage.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
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
    const errorDiv = document.getElementById(fieldId + 'Error');
    const errorSpan = errorDiv?.querySelector('span');
    
    if (!errorDiv || !errorSpan) return;
    
    // For checkbox groups, add error class to container
    if (fieldId === 'preferredDays') {
        const checkboxGroup = document.querySelector('.checkbox-group');
        if (checkboxGroup) checkboxGroup.classList.add('error');
    } else {
        const field = document.getElementById(fieldId);
        if (field) field.classList.add('error');
    }
    
    errorSpan.textContent = message;
    errorDiv.style.display = 'flex';
}

function clearErrors() {
    const fields = ['course', 'preferredDays', 'preferredTime'];
    fields.forEach(fieldId => {
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (!errorDiv) return;
        
        // For checkbox groups, remove error class from container
        if (fieldId === 'preferredDays') {
            const checkboxGroup = document.querySelector('.checkbox-group');
            if (checkboxGroup) checkboxGroup.classList.remove('error');
        } else {
            const field = document.getElementById(fieldId);
            if (field) field.classList.remove('error');
        }
        
        errorDiv.style.display = 'none';
    });
    
    const alert = document.getElementById('scheduleAlert');
    if (alert) {
        alert.style.display = 'none';
    }
}

function updateCharacterCount() {
    const notes = document.getElementById('notes');
    const count = document.getElementById('notesCount');
    
    if (notes && count) {
        count.textContent = notes.value.length;
    }
}

// Real-time validation and interactions
document.getElementById('course')?.addEventListener('change', function() {
    if (this.value) {
        this.classList.remove('error');
        const courseError = document.getElementById('courseError');
        if (courseError) courseError.style.display = 'none';
    }
});

document.getElementById('preferredTime')?.addEventListener('change', function() {
    if (this.value) {
        this.classList.remove('error');
        const preferredTimeError = document.getElementById('preferredTimeError');
        if (preferredTimeError) preferredTimeError.style.display = 'none';
    }
});

// Character counter for notes
document.getElementById('notes')?.addEventListener('input', updateCharacterCount);

// Checkbox validation
document.querySelectorAll('input[name="preferredDays"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const checkedBoxes = document.querySelectorAll('input[name="preferredDays"]:checked');
        if (checkedBoxes.length > 0) {
            const checkboxGroup = document.querySelector('.checkbox-group');
            const preferredDaysError = document.getElementById('preferredDaysError');
            if (checkboxGroup) checkboxGroup.classList.remove('error');
            if (preferredDaysError) preferredDaysError.style.display = 'none';
        }
    });
});

// Initialize character count
document.addEventListener('DOMContentLoaded', function() {
    updateCharacterCount();
});