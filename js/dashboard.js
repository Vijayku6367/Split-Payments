// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    updateDashboardData();
});

function initDashboard() {
    // Update user address if connected
    if (window.SplitPay?.state?.walletAddress) {
        const userAddress = document.getElementById('userAddress');
        if (userAddress) {
            userAddress.textContent = window.SplitPay.formatAddress(window.SplitPay.state.walletAddress);
        }
        
        const userStatus = document.querySelector('.user-status');
        if (userStatus) {
            userStatus.textContent = 'Connected';
            userStatus.style.color = 'var(--teal)';
        }
    }
    
    // Create split chart
    createSplitChart();
    
    // Initialize progress rings
    initProgressRings();
    
    // New split button
    const newSplitBtn = document.getElementById('newSplitBtn');
    const createSplitBtn2 = document.getElementById('createSplitBtn2');
    
    if (newSplitBtn) {
        newSplitBtn.addEventListener('click', () => {
            window.location.href = 'create-split.html';
        });
    }
    
    if (createSplitBtn2) {
        createSplitBtn2.addEventListener('click', () => {
            window.location.href = 'create-split.html';
        });
    }
}

function createSplitChart() {
    const chart = document.querySelector('.split-chart');
    if (!chart) return;
    
    // Create chart segments with animation
    const segments = [
        { color: '#FFD700', percentage: 35, label: 'Development' },
        { color: '#00D4AA', percentage: 25, label: 'Marketing' },
        { color: '#8A2BE2', percentage: 20, label: 'Operations' },
        { color: '#FF6B6B', percentage: 15, label: 'Reserves' },
        { color: '#6BFFE0', percentage: 5, label: 'Bonus' }
    ];
    
    let cumulativePercentage = 0;
    
    segments.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        segmentElement.className = 'chart-segment';
        segmentElement.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                transparent 0% ${cumulativePercentage}%,
                ${segment.color} ${cumulativePercentage}% ${cumulativePercentage + segment.percentage}%,
                transparent ${cumulativePercentage + segment.percentage}% 100%
            );
            animation: rotate 20s infinite linear;
            animation-delay: ${index * -2}s;
        `;
        
        chart.appendChild(segmentElement);
        cumulativePercentage += segment.percentage;
    });
    
    // Add center circle
    const center = document.createElement('div');
    center.className = 'chart-center';
    center.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30%;
        height: 30%;
        background: var(--primary-bg);
        border-radius: 50%;
        z-index: 2;
    `;
    chart.appendChild(center);
}

function initProgressRings() {
    const rings = document.querySelectorAll('.progress-ring');
    rings.forEach(ring => {
        const value = parseInt(ring.getAttribute('data-value'));
        const circle = ring.querySelector('.progress-ring-fill');
        const radius = 25;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (value / 100) * circumference;
        
        // Update percentage text
        const span = ring.querySelector('span');
        if (span) {
            span.textContent = `${value}%`;
        }
    });
}

async function updateDashboardData() {
    // This would fetch real data from contracts
    // For now, we'll simulate data updates
    
    if (window.SplitPay?.state?.connected) {
        // Update wallet balance
        updateWalletBalance();
        
        // Fetch splits data
        fetchSplitsData();
        
        // Fetch transaction history
        fetchTransactionHistory();
    }
}

async function fetchSplitsData() {
    // This would interact with the SplitFactory contract
    // For demo, we'll simulate with mock data
    console.log('Fetching splits data...');
}

async function fetchTransactionHistory() {
    // This would interact with the Splitter contracts
    // For demo, we'll simulate with mock data
    console.log('Fetching transaction history...');
}

function updateWalletBalance() {
    // This would fetch actual balance from the blockchain
    // For demo, we'll show a mock balance
    const balanceElement = document.getElementById('walletBalance');
    if (balanceElement && window.SplitPay?.state?.connected) {
        // Mock balance for demo
        const mockBalance = 5420.75;
        balanceElement.textContent = `$${mockBalance.toFixed(2)} USD`;
    }
}

// Export dashboard functions
window.Dashboard = {
    initDashboard,
    updateDashboardData,
    fetchSplitsData,
    fetchTransactionHistory
};
