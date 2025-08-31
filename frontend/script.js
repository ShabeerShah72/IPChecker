const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ipForm');
    const ipInput = document.getElementById('ipInput');
    
    form.addEventListener('submit', handleSubmit);
    
    // Auto-fill current IP for demo (remove this line in production)
    ipInput.value = '101.50.88.14';
    
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
});

async function handleSubmit(event) {
    event.preventDefault();
    
    const ipAddress = document.getElementById('ipInput').value.trim();
    
    if (!isValidIP(ipAddress)) {
        showError('Please enter a valid IP address');
        return;
    }
    
    await checkIP(ipAddress);
}

function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

async function checkIP(ipAddress) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Checking...';
    loading.classList.remove('hidden');
    result.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/check-ip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip: ipAddress })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.duplicate) {
            showDuplicate();
        } else {
            showIPDetails(data);
        }
        
    } catch (error) {
        console.error('Error checking IP:', error);
        showError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Check IP';
        loading.classList.add('hidden');
    }
}

function showDuplicate() {
    const result = document.getElementById('result');
    result.className = 'result duplicate';
    result.innerHTML = `
        <span class="duplicate-icon">⚠️</span>
        <div class="duplicate-text">Duplicate IP Detected!</div>
        <p style="margin-top: 12px; color: #991b1b; font-size: 0.95rem;">
            This IP address has already been checked previously.
        </p>
    `;
    result.classList.remove('hidden');
}

function showIPDetails(data) {
    const result = document.getElementById('result');
    result.className = 'result success';
    
    const details = [
        { label: '🌐 IP Address', value: data.query || 'N/A', icon: '🌐' },
        { label: '🏙️ City', value: data.city || 'N/A', icon: '🏙️' },
        { label: '🏳️ Country', value: data.country || 'N/A', icon: '🏳️' },
        { label: '📍 Region', value: data.regionName || 'N/A', icon: '📍' },
        { label: '📮 ZIP Code', value: data.zip || 'N/A', icon: '📮' },
        { label: '🌍 ISP', value: data.isp || 'N/A', icon: '🌍' },
        { label: '🏢 Organization', value: data.org || 'N/A', icon: '🏢' },
        { label: '🕐 Timezone', value: data.timezone || 'N/A', icon: '🕐' },
        { label: '📊 AS Number', value: data.as || 'N/A', icon: '📊' },
        { label: '📡 Proxy', value: data.proxy ? 'Yes' : 'No', icon: '📡' },
        { label: '📱 Mobile', value: data.mobile ? 'Yes' : 'No', icon: '📱' }
    ];
    
    const detailsHTML = details
        .filter(detail => detail.value !== 'N/A')
        .map(detail => `
            <div class="detail-row">
                <span class="detail-label">
                    <span class="icon">${detail.icon}</span>
                    ${detail.label.replace(/🌐|🏙️|🏳️|📍|📮|🌍|🏢|🕐|📊|📡|📱/g, '').trim()}
                </span>
                <span class="detail-value">${detail.value}</span>
            </div>
        `)
        .join('');
    
    result.innerHTML = `
        <div class="success-header">
            <div class="success-icon">✓</div>
            <div class="success-title">IP Details Retrieved</div>
        </div>
        <div class="details-grid">
            ${detailsHTML}
        </div>
    `;
    result.classList.remove('hidden');
}

function showError(message) {
    const result = document.getElementById('result');
    result.className = 'result error';
    result.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 16px;">❌</div>
        <div style="color: #dc2626; font-weight: 600; font-size: 1.1rem; margin-bottom: 8px;">
            Error
        </div>
        <p style="color: #991b1b;">${message}</p>
    `;
    result.classList.remove('hidden');
}