// IP Checker Frontend Script - Compatible with PHP Backend
// Update this to match your actual domain when deployed to Hostinger
const API_BASE_URL = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ipForm');
    const ipInput = document.getElementById('ipInput');
    
    if (!form || !ipInput) {
        console.error('Required form elements not found. Make sure your HTML has elements with IDs: ipForm, ipInput');
        return;
    }
    
    form.addEventListener('submit', handleSubmit);
    
    // Remove or comment out this line in production
    // ipInput.value = '101.50.88.14';
    
    // Real-time validation feedback
    ipInput.addEventListener('input', function() {
        const isValid = isValidIP(this.value);
        if (this.value && !isValid) {
            this.style.borderColor = '#ef4444';
        } else if (this.value && isValid) {
            this.style.borderColor = '#22c55e';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
    
    // Load API health status on page load
    checkAPIHealth();
});

async function handleSubmit(event) {
    event.preventDefault();
    
    const ipAddress = document.getElementById('ipInput').value.trim();
    
    if (!ipAddress) {
        showError('Please enter an IP address');
        return;
    }
    
    if (!isValidIP(ipAddress)) {
        showError('Please enter a valid IP address (e.g., 192.168.1.1)');
        return;
    }
    
    await checkIP(ipAddress);
}

function isValidIP(ip) {
    // IPv4 validation regex
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Health:', data);
        }
    } catch (error) {
        console.warn('API health check failed:', error);
    }
}

async function checkIP(ipAddress) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    // Verify required elements exist
    if (!submitBtn || !btnText || !loading || !result) {
        console.error('Required UI elements not found');
        showError('UI elements missing. Please check your HTML structure.');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Checking IP...';
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/check-ip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ ip: ipAddress })
        });
        
        // Parse response
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }
        
        if (data.error) {
            throw new Error(data.message || 'Unknown error occurred');
        }
        
        if (data.duplicate) {
            showDuplicate(data);
        } else {
            showIPDetails(data);
        }
        
    } catch (error) {
        console.error('Error checking IP:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Cannot connect to server. Please check if the API is running and accessible.');
        } else if (error.message.includes('JSON')) {
            showError('Server returned invalid response. Please try again.');
        } else {
            showError(error.message || 'An unexpected error occurred. Please try again.');
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Check IP';
        loading.classList.add('hidden');
    }
}

function showDuplicate(data) {
    const result = document.getElementById('result');
    result.className = 'result duplicate';
    
    const firstChecked = data.first_checked ? 
        `<p style="margin-top: 12px; color: #991b1b; font-size: 0.9rem;">
            First checked: ${formatDate(data.first_checked)}
        </p>` : '';
    
    result.innerHTML = `
        <div class="duplicate-header">
            <span class="duplicate-icon">⚠️</span>
            <div class="duplicate-title">Duplicate IP Detected!</div>
        </div>
        <p style="margin-top: 12px; color: #991b1b; font-size: 0.95rem;">
            ${data.message || 'This IP address has already been checked previously.'}
        </p>
        ${firstChecked}
    `;
    result.classList.remove('hidden');
}

function showIPDetails(data) {
    const result = document.getElementById('result');
    result.className = 'result success';
    
    // Map the PHP response fields to display data
    const details = [
        { label: 'IP Address', value: data.ip, icon: '🌐' },
        { label: 'City', value: data.city, icon: '🏙️' },
        { label: 'Country', value: data.country, icon: '🏳️' },
        { label: 'Country Code', value: data.countryCode, icon: '🏷️' },
        { label: 'Region', value: data.regionName, icon: '📍' },
        { label: 'Region Code', value: data.region, icon: '🏷️' },
        { label: 'ZIP Code', value: data.zip, icon: '📮' },
        { label: 'Coordinates', value: data.lat && data.lon ? `${data.lat}, ${data.lon}` : 'Unknown', icon: '🗺️' },
        { label: 'Timezone', value: data.timezone, icon: '🕐' },
        { label: 'ISP', value: data.isp, icon: '🌍' },
        { label: 'Organization', value: data.org, icon: '🏢' },
        { label: 'AS Number', value: data.as, icon: '📊' }
    ].filter(detail => detail.value && detail.value !== 'Unknown' && detail.value !== 'N/A');
    
    const detailsHTML = details
        .map(detail => `
            <div class="detail-row">
                <span class="detail-label">
                    <span class="icon">${detail.icon}</span>
                    ${detail.label}
                </span>
                <span class="detail-value">${escapeHtml(detail.value)}</span>
            </div>
        `)
        .join('');
    
    result.innerHTML = `
        <div class="success-header">
            <div class="success-icon">✅</div>
            <div class="success-title">IP Details Retrieved Successfully</div>
        </div>
        <div class="details-grid">
            ${detailsHTML}
        </div>
        <div class="success-footer">
            <small style="color: #6b7280; font-size: 0.85rem;">
                Data retrieved from ip-api.com • ${new Date().toLocaleString()}
            </small>
        </div>
    `;
    result.classList.remove('hidden');
}

function showError(message) {
    const result = document.getElementById('result');
    result.className = 'result error';
    result.innerHTML = `
        <div class="error-header">
            <div class="error-icon">❌</div>
            <div class="error-title">Error</div>
        </div>
        <p class="error-message">${escapeHtml(message)}</p>
        <div class="error-footer">
            <small style="color: #dc2626; font-size: 0.85rem;">
                If the problem persists, please try again later.
            </small>
        </div>
    `;
    result.classList.remove('hidden');
}

// Utility functions
function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        return dateString;
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Optional: Add cleanup functionality
async function cleanupOldRecords() {
    try {
        const response = await fetch(`${API_BASE_URL}/cleanup`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Cleanup result:', data);
            return data;
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
        return null;
    }
}

// Expose cleanup function globally for manual use
window.cleanupOldRecords = cleanupOldRecords;
