// js/script.js mein update karo
const CONTRACT_ADDRESSES = {
  SplitFactory: "0xB267dd7640e1818914076da746495d30457338fC",
  Treasury: "0x70c0E3f9aFBD3C17Dd367625745A465E25F2259D"
};
// Tempo Blockchain Configuration
const TEMPO_CONFIG = {
    chainId: '42429',
    chainName: 'Tempo Testnet (Andantino)',
    nativeCurrency: {
        name: 'USD',
        symbol: 'USD',
        decimals: 6
    },
    rpcUrls: ['https://rpc.testnet.tempo.xyz'],
    blockExplorerUrls: ['https://explore.tempo.xyz']
};

// Contract ABIs (Simplified for demo)
const CONTRACT_ABIS = {
    SplitFactory: [
        "function createSplitter(string name, address token, address[] members, uint256[] shares, bool autoDistribute) returns (address)",
        "function getUserSplitters(address user) view returns (address[])",
        "event SplitterCreated(address indexed creator, address splitterAddress, string name, address token, address[] members, uint256[] shares)"
    ],
    Splitter: [
        "function receivePayment(uint256 amount)",
        "function distribute()",
        "function getMembers() view returns (address[], uint256[])",
        "function getPaymentHistory() view returns ((uint256 amount, address payer, uint256 timestamp, bool distributed)[])",
        "event PaymentReceived(address indexed payer, uint256 amount, uint256 timestamp)",
        "event DistributionCompleted(address indexed member, uint256 amount, uint256 timestamp)"
    ]
};

// Global State
let state = {
    connected: false,
    walletAddress: null,
    chainId: null,
    provider: null,
    signer: null,
    currentPage: 'home'
};

// DOM Elements
const elements = {
    connectWallet: document.getElementById('connectWallet'),
    walletModal: document.getElementById('walletModal'),
    closeModal: document.getElementById('closeModal'),
    metamaskBtn: document.getElementById('metamaskBtn'),
    walletConnectBtn: document.getElementById('walletConnectBtn'),
    coinbaseBtn: document.getElementById('coinbaseBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navMenu: document.getElementById('navMenu'),
    createSplitBtn: document.getElementById('createSplitBtn'),
    watchDemo: document.getElementById('watchDemo'),
    getStartedBtn: document.getElementById('getStartedBtn'),
    donutChart: document.getElementById('donutChart')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initAnimations();
    checkWalletConnection();
    updatePageState();
});

// Event Listeners
function initEventListeners() {
    // Wallet Connection
    elements.connectWallet.addEventListener('click', () => {
        elements.walletModal.style.display = 'flex';
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.walletModal.style.display = 'none';
    });
    
    elements.metamaskBtn.addEventListener('click', connectMetaMask);
    elements.walletConnectBtn.addEventListener('click', connectWalletConnect);
    elements.coinbaseBtn.addEventListener('click', connectCoinbase);
    
    // Mobile Menu
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
    });
    
    // Navigation
    elements.createSplitBtn.addEventListener('click', () => {
        window.location.href = 'create-split.html';
    });
    
    elements.watchDemo.addEventListener('click', () => {
        alert('Demo video would play here');
    });
    
    elements.getStartedBtn.addEventListener('click', () => {
        window.location.href = 'create-split.html';
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.walletModal) {
            elements.walletModal.style.display = 'none';
        }
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu.classList.remove('active');
        });
    });
}

// Animations
function initAnimations() {
    // Chart rotation
    if (elements.donutChart) {
        animateDonutChart();
    }
    
    // Floating cards
    animateFloatingCards();
    
    // Background particles
    createParticles();
}

function animateDonutChart() {
    let rotation = 0;
    setInterval(() => {
        rotation += 0.1;
        elements.donutChart.style.transform = `rotate(${rotation}deg)`;
    }, 50);
}

function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });
}

function createParticles() {
    const container = document.querySelector('.background-elements');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 20;
        
        // Random color
        const colors = ['#FFD700', '#00D4AA', '#8A2BE2', '#FF6B6B'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            top: ${y}%;
            left: ${x}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        
        container.appendChild(particle);
    }
}

// Wallet Connection Functions
async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Check if connected to Tempo
            await switchToTempoNetwork();
            
            // Update state
            state.walletAddress = accounts[0];
            state.connected = true;
            state.provider = new ethers.providers.Web3Provider(window.ethereum);
            state.signer = state.provider.getSigner();
            
            updateWalletUI();
            elements.walletModal.style.display = 'none';
            
            console.log('Connected with MetaMask:', accounts[0]);
        } catch (error) {
            console.error('MetaMask connection error:', error);
            alert('Failed to connect with MetaMask');
        }
    } else {
        alert('Please install MetaMask to connect');
    }
}

async function switchToTempoNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${Number(TEMPO_CONFIG.chainId).toString(16)}` }]
        });
    } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${Number(TEMPO_CONFIG.chainId).toString(16)}`,
                        chainName: TEMPO_CONFIG.chainName,
                        nativeCurrency: TEMPO_CONFIG.nativeCurrency,
                        rpcUrls: TEMPO_CONFIG.rpcUrls,
                        blockExplorerUrls: TEMPO_CONFIG.blockExplorerUrls
                    }]
                });
            } catch (addError) {
                console.error('Failed to add Tempo network:', addError);
                throw addError;
            }
        } else {
            throw switchError;
        }
    }
}

async function connectWalletConnect() {
    alert('WalletConnect integration would go here');
    // Implementation for WalletConnect
}

async function connectCoinbase() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
        await connectMetaMask(); // Coinbase Wallet uses same interface
    } else {
        alert('Please install Coinbase Wallet to connect');
    }
}

function updateWalletUI() {
    if (state.connected && state.walletAddress) {
        const address = state.walletAddress;
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        
        elements.connectWallet.innerHTML = `
            <i class="fas fa-wallet"></i>
            <span>${shortAddress}</span>
            <div class="wallet-glow"></div>
        `;
        
        // Update balance if on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            updateWalletBalance();
        }
    }
}

async function updateWalletBalance() {
    if (!state.provider || !state.walletAddress) return;
    
    try {
        const balance = await state.provider.getBalance(state.walletAddress);
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.textContent = `${ethers.utils.formatUnits(balance, 6)} USD`;
        }
    } catch (error) {
        console.error('Failed to fetch balance:', error);
    }
}

function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                state.walletAddress = accounts[0];
                updateWalletUI();
            } else {
                state.connected = false;
                state.walletAddress = null;
                resetWalletUI();
            }
        });
        
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
        
        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    state.walletAddress = accounts[0];
                    state.connected = true;
                    state.provider = new ethers.providers.Web3Provider(window.ethereum);
                    state.signer = state.provider.getSigner();
                    updateWalletUI();
                }
            });
    }
}

function resetWalletUI() {
    elements.connectWallet.innerHTML = `
        <i class="fas fa-wallet"></i>
        <span>Connect Wallet</span>
        <div class="wallet-glow"></div>
    `;
}

function updatePageState() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) state.currentPage = 'dashboard';
    else if (path.includes('create-split')) state.currentPage = 'create-split';
    else if (path.includes('transactions')) state.currentPage = 'transactions';
    else if (path.includes('team')) state.currentPage = 'team';
    else if (path.includes('plans')) state.currentPage = 'plans';
    else state.currentPage = 'home';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href')?.includes(state.currentPage)) {
            link.classList.add('active');
        }
    });
}

// Contract Interactions (Demo functions)
async function createSplitContract(name, members, shares, tokenAddress) {
    if (!state.connected || !state.signer) {
        alert('Please connect your wallet first');
        return;
    }
    
    try {
        // This would be the actual contract interaction
        alert(`Creating split contract for ${name} with ${members.length} members`);
        // In production: deploy contract using factory
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Failed to create split:', error);
        alert('Failed to create split contract');
    }
}

async function makePayment(splitterAddress, amount) {
    if (!state.connected || !state.signer) {
        alert('Please connect your wallet first');
        return;
    }
    
    try {
        alert(`Making payment of ${amount} USD to splitter`);
        // In production: call receivePayment on splitter contract
        
        // Show success message
        showNotification('Payment successful! Distribution in progress.');
    } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed');
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid ${type === 'success' ? 'var(--teal)' : 'var(--accent)'};
        color: var(--text-primary);
        padding: 1rem 2rem;
        border-radius: 10px;
        backdrop-filter: blur(20px);
        z-index: 3000;
        animation: slide-in 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slide-in 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }).format(amount);
}

// Export for other pages
window.SplitPay = {
    state,
    TEMPO_CONFIG,
    connectMetaMask,
    createSplitContract,
    makePayment,
    formatAddress,
    formatAmount
};
