// Transactions Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    initTransactionsPage();
    loadTransactions();
});

function initTransactionsPage() {
    // Wallet connection check
    if (window.SplitPay?.state?.connected) {
        updateWalletUI();
    }
    
    // Filter functionality
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterTransactions);
    }
    
    // Date range picker
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    if (dateFrom && dateTo) {
        dateFrom.addEventListener('change', filterTransactions);
        dateTo.addEventListener('change', filterTransactions);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTransactions);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadTransactions);
    }
    
    // Initialize charts
    initTransactionCharts();
}

async function loadTransactions() {
    // Show loading state
    const tableBody = document.querySelector('.transactions-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        Loading transactions...
                    </div>
                </td>
            </tr>
        `;
    }
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sample transaction data
        const transactions = [
            {
                id: 'tx_001',
                type: 'incoming',
                amount: 1250.50,
                token: 'USDC',
                from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                to: 'Core Team Split',
                timestamp: '2024-12-05 14:30:22',
                status: 'completed',
                gas: 0.012
            },
            {
                id: 'tx_002',
                type: 'distribution',
                amount: 850.25,
                token: 'USDC',
                from: 'Creator Split',
                to: '3 recipients',
                timestamp: '2024-12-05 10:15:45',
                status: 'completed',
                gas: 0.018
            },
            {
                id: 'tx_003',
                type: 'incoming',
                amount: 3200.00,
                token: 'USDT',
                from: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
                to: 'DAO Treasury',
                timestamp: '2024-12-04 16:20:10',
                status: 'completed',
                gas: 0.015
            },
            {
                id: 'tx_004',
                type: 'outgoing',
                amount: 420.75,
                token: 'USDC',
                from: 'Freelance Split',
                to: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
                timestamp: '2024-12-04 09:45:33',
                status: 'pending',
                gas: 0.011
            },
            {
                id: 'tx_005',
                type: 'distribution',
                amount: 2150.00,
                token: 'USDC',
                from: 'E-commerce Split',
                to: '5 recipients',
                timestamp: '2024-12-03 18:10:05',
                status: 'completed',
                gas: 0.022
            },
            {
                id: 'tx_006',
                type: 'incoming',
                amount: 750.30,
                token: 'DAI',
                from: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
                to: 'Content Creators',
                timestamp: '2024-12-03 11:25:18',
                status: 'failed',
                gas: 0.009
            },
            {
                id: 'tx_007',
                type: 'withdrawal',
                amount: 125.50,
                token: 'USDC',
                from: 'My Wallet',
                to: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C',
                timestamp: '2024-12-02 15:40:27',
                status: 'completed',
                gas: 0.013
            }
        ];
        
        // Update transaction stats
        updateTransactionStats(transactions);
        
        // Render transactions table
        renderTransactionsTable(transactions);
        
        // Update charts
        updateTransactionCharts(transactions);
        
    } catch (error) {
        console.error('Failed to load transactions:', error);
        showNotification('Failed to load transactions', 'error');
    }
}

function renderTransactionsTable(transactions) {
    const tableBody = document.querySelector('.transactions-table tbody');
    if (!tableBody) return;
    
    if (transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>No transactions found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = transactions.map(tx => `
        <tr class="transaction-row" data-id="${tx.id}">
            <td>
                <div class="transaction-type ${tx.type}">
                    <i class="fas ${getTransactionIcon(tx.type)}"></i>
                    <span>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                </div>
            </td>
            <td>
                <div class="transaction-amount">
                    <span class="amount-value ${tx.type === 'outgoing' || tx.type === 'withdrawal' ? 'negative' : 'positive'}">
                        ${tx.type === 'outgoing' || tx.type === 'withdrawal' ? '-' : '+'}$${tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                    <span class="token-badge">${tx.token}</span>
                </div>
            </td>
            <td>
                <div class="address-cell">
                    <code>${formatAddress(tx.from)}</code>
                    <button class="btn-icon-xs" onclick="copyToClipboard('${tx.from}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="address-cell">
                    <code>${tx.to.includes('0x') ? formatAddress(tx.to) : tx.to}</code>
                    ${tx.to.includes('0x') ? `
                    <button class="btn-icon-xs" onclick="copyToClipboard('${tx.to}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="timestamp-cell">
                    <span class="date">${formatDate(tx.timestamp)}</span>
                    <span class="time">${formatTime(tx.timestamp)}</span>
                </div>
            </td>
            <td>
                <div class="status-badge ${tx.status}">
                    <i class="fas ${getStatusIcon(tx.status)}"></i>
                    <span>${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span>
                </div>
            </td>
            <td>
                <div class="gas-cell">
                    <span>$${tx.gas.toFixed(3)}</span>
                    <button class="btn-icon-xs" onclick="viewTransactionDetails('${tx.id}')">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.transaction-row').forEach(row => {
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-icon-xs')) {
                const txId = row.dataset.id;
                viewTransactionDetails(txId);
            }
        });
    });
}

function filterTransactions() {
    const filterSelect = document.getElementById('filterSelect');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    // This would filter actual data
    console.log('Filtering transactions:', {
        type: filterSelect?.value,
        dateFrom: dateFrom?.value,
        dateTo: dateTo?.value
    });
    
    // For now, just reload
    loadTransactions();
}

function updateTransactionStats(transactions) {
    const stats = calculateTransactionStats(transactions);
    
    // Update stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        const metric = card.dataset.metric;
        const valueElement = card.querySelector('.stat-value');
        
        if (valueElement && stats[metric]) {
            valueElement.textContent = stats[metric];
        }
    });
}

function calculateTransactionStats(transactions) {
    let totalVolume = 0;
    let totalTransactions = transactions.length;
    let successful = 0;
    let totalGas = 0;
    
    transactions.forEach(tx => {
        if (tx.status === 'completed') {
            totalVolume += tx.amount;
            successful++;
        }
        totalGas += tx.gas;
    });
    
    const successRate = totalTransactions > 0 ? (successful / totalTransactions * 100).toFixed(1) : 0;
    
    return {
        volume: `$${totalVolume.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        transactions: totalTransactions,
        successRate: `${successRate}%`,
        avgGas: `$${totalGas > 0 ? (totalGas / totalTransactions).toFixed(3) : '0.000'}`
    };
}

function initTransactionCharts() {
    // Initialize volume chart
    initVolumeChart();
    
    // Initialize type distribution chart
    initTypeDistributionChart();
}

function updateTransactionCharts(transactions) {
    updateVolumeChart(transactions);
    updateTypeDistributionChart(transactions);
}

function initVolumeChart() {
    const canvas = document.getElementById('volumeChart');
    if (!canvas) return;
    
    // Chart will be created when data is available
}

function updateVolumeChart(transactions) {
    // Group transactions by date
    const dailyVolume = {};
    
    transactions.forEach(tx => {
        if (tx.status === 'completed') {
            const date = tx.timestamp.split(' ')[0];
            if (!dailyVolume[date]) {
                dailyVolume[date] = 0;
            }
            dailyVolume[date] += tx.amount;
        }
    });
    
    // Sort dates
    const dates = Object.keys(dailyVolume).sort();
    const volumes = dates.map(date => dailyVolume[date]);
    
    // This would create/update the chart
    console.log('Volume chart data:', { dates, volumes });
    
    // For now, just show placeholder
    const chartContainer = document.getElementById('volumeChart');
    if (chartContainer && dates.length > 0) {
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <div class="placeholder-bars">
                    ${volumes.map((vol, i) => `
                        <div class="bar" style="height: ${(vol / Math.max(...volumes)) * 100}%"></div>
                    `).join('')}
                </div>
                <div class="placeholder-labels">
                    ${dates.map(date => `
                        <span>${date.split('-')[2]}/${date.split('-')[1]}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function initTypeDistributionChart() {
    const canvas = document.getElementById('typeChart');
    if (!canvas) return;
    
    // Chart will be created when data is available
}

function updateTypeDistributionChart(transactions) {
    // Count transaction types
    const typeCount = {
        incoming: 0,
        outgoing: 0,
        distribution: 0,
        withdrawal: 0
    };
    
    transactions.forEach(tx => {
        if (typeCount[tx.type] !== undefined) {
            typeCount[tx.type]++;
        }
    });
    
    // This would create/update the chart
    console.log('Type distribution data:', typeCount);
    
    // For now, just show placeholder
    const chartContainer = document.getElementById('typeChart');
    if (chartContainer) {
        const total = Object.values(typeCount).reduce((a, b) => a + b, 0);
        chartContainer.innerHTML = `
            <div class="chart-placeholder pie">
                <div class="pie-chart">
                    ${Object.entries(typeCount).map(([type, count], i) => {
                        if (count === 0) return '';
                        const percentage = (count / total) * 100;
                        const rotation = Object.values(typeCount).slice(0, i).reduce((a, b) => a + (b / total) * 360, 0);
                        return `
                            <div class="pie-segment ${type}" 
                                 style="--percentage: ${percentage}%; --rotation: ${rotation}deg">
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="chart-legend">
                    ${Object.entries(typeCount).map(([type, count]) => `
                        <div class="legend-item">
                            <div class="legend-color ${type}"></div>
                            <span>${type.charAt(0).toUpperCase() + type.slice(1)} (${count})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function exportTransactions() {
    const format = document.getElementById('exportFormat')?.value || 'csv';
    
    // In production, this would generate actual file
    showNotification(`Exporting transactions as ${format.toUpperCase()}...`);
    
    // Simulate export
    setTimeout(() => {
        const blob = new Blob(['Sample transaction data'], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Transactions exported successfully');
    }, 1000);
}

function viewTransactionDetails(txId) {
    // Show transaction details modal
    const modal = document.createElement('div');
    modal.className = 'modal transaction-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Transaction Details</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tx-details">
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${txId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value badge success">Completed</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">$1,250.50 USDC</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">From:</span>
                        <span class="detail-value address">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">To:</span>
                        <span class="detail-value address">Core Team Split Contract</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">2024-12-05 14:30:22 UTC</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gas Fee:</span>
                        <span class="detail-value">$0.012 USD</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Block:</span>
                        <span class="detail-value">#1245678</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="viewOnExplorer('${txId}')">
                        <i class="fas fa-external-link-alt"></i>
                        View on Explorer
                    </button>
                    <button class="btn-primary" onclick="shareTransaction('${txId}')">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function viewOnExplorer(txId) {
    // This would open transaction in blockchain explorer
    const explorerUrl = `https://explore.tempo.xyz/tx/${txId}`;
    window.open(explorerUrl, '_blank');
}

function shareTransaction(txId) {
    if (navigator.share) {
        navigator.share({
            title: 'Transaction Details',
            text: `Check out this transaction on SplitPay: ${txId}`,
            url: window.location.href
        });
    } else {
        copyToClipboard(txId);
        showNotification('Transaction ID copied to clipboard');
    }
}

// Utility Functions
function getTransactionIcon(type) {
    const icons = {
        incoming: 'fa-arrow-down',
        outgoing: 'fa-arrow-up',
        distribution: 'fa-share-alt',
        withdrawal: 'fa-wallet'
    };
    return icons[type] || 'fa-exchange-alt';
}

function getStatusIcon(status) {
    const icons = {
        completed: 'fa-check-circle',
        pending: 'fa-clock',
        failed: 'fa-times-circle'
    };
    return icons[status] || 'fa-question-circle';
}

function formatAddress(address) {
    if (!address) return '';
    if (!address.startsWith('0x')) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatDate(timestamp) {
    return timestamp.split(' ')[0];
}

function formatTime(timestamp) {
    return timestamp.split(' ')[1];
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard'))
        .catch(err => console.error('Copy failed:', err));
}

function showNotification(message, type = 'success') {
    // Use existing notification function or create one
    if (window.SplitPay?.showNotification) {
        window.SplitPay.showNotification(message, type);
    } else {
        alert(message);
    }
}

function updateWalletUI() {
    if (window.SplitPay?.state?.connected) {
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            const address = window.SplitPay.state.walletAddress;
            const shortAddress = window.SplitPay.formatAddress(address);
            connectBtn.innerHTML = `
                <i class="fas fa-wallet"></i>
                <span>${shortAddress}</span>
                <div class="wallet-glow"></div>
            `;
        }
    }
}
