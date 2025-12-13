// ================= CONFIG =================

const CONTRACT_ADDRESSES = {
  SplitFactory: "0xB267dd7640e1818914076da746495d30457338fC",
  Treasury: "0x70c0E3f9aFBD3C17Dd367625745A465E25F2259D"
};

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

// ================= GLOBAL STATE =================

let state = {
  connected: false,
  walletAddress: null,
  chainId: null,
  provider: null,
  signer: null,
  currentPage: 'home'
};

// ================= DOM ELEMENTS (SINGLE SOURCE) =================

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

// ================= INIT =================

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initAnimations();
  checkWalletConnection();
  updatePageState();
});

// ================= EVENT LISTENERS =================

function initEventListeners() {

  if (elements.connectWallet && elements.walletModal) {
    elements.connectWallet.onclick = () => {
      elements.walletModal.style.display = 'flex';
    };
  }

  if (elements.closeModal && elements.walletModal) {
    elements.closeModal.onclick = () => {
      elements.walletModal.style.display = 'none';
    };
  }

  if (elements.metamaskBtn) {
    elements.metamaskBtn.onclick = connectMetaMask;
  }

  if (elements.walletConnectBtn) {
    elements.walletConnectBtn.onclick = () => alert('WalletConnect coming soon');
  }

  if (elements.coinbaseBtn) {
    elements.coinbaseBtn.onclick = connectCoinbase;
  }

  if (elements.mobileMenuBtn && elements.navMenu) {
    elements.mobileMenuBtn.onclick = () => {
      elements.navMenu.classList.toggle('active');
    };
  }

  if (elements.createSplitBtn) {
    elements.createSplitBtn.onclick = () => {
      window.location.href = 'create-split.html';
    };
  }

  if (elements.getStartedBtn) {
    elements.getStartedBtn.onclick = () => {
      window.location.href = 'create-split.html';
    };
  }

  if (elements.watchDemo) {
    elements.watchDemo.onclick = () => {
      alert('Demo video would play here');
    };
  }

  if (elements.walletModal) {
    window.addEventListener('click', (e) => {
      if (e.target === elements.walletModal) {
        elements.walletModal.style.display = 'none';
      }
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = () => {
      if (elements.navMenu) {
        elements.navMenu.classList.remove('active');
      }
    };
  });
}

// ================= ANIMATIONS =================

function initAnimations() {
  if (elements.donutChart) animateDonutChart();
  animateFloatingCards();
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
  document.querySelectorAll('.floating-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.5}s`;
  });
}

function createParticles() {
  const container = document.querySelector('.background-elements');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      width:${Math.random()*3+1}px;
      height:${Math.random()*3+1}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*30+20}s;
    `;
    container.appendChild(p);
  }
}

// ================= WALLET =================

async function connectMetaMask() {
  if (!window.ethereum || typeof ethers === 'undefined') {
    alert('MetaMask or ethers not found');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await switchToTempoNetwork();

    state.provider = new ethers.providers.Web3Provider(window.ethereum);
    state.signer = state.provider.getSigner();
    state.walletAddress = accounts[0];
    state.connected = true;

    updateWalletUI();
    if (elements.walletModal) elements.walletModal.style.display = 'none';

  } catch (e) {
    console.error(e);
    alert('Wallet connection failed');
  }
}

async function switchToTempoNetwork() {
  const chainHex = `0x${Number(TEMPO_CONFIG.chainId).toString(16)}`;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainHex }]
    });
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainHex,
          chainName: TEMPO_CONFIG.chainName,
          nativeCurrency: TEMPO_CONFIG.nativeCurrency,
          rpcUrls: TEMPO_CONFIG.rpcUrls,
          blockExplorerUrls: TEMPO_CONFIG.blockExplorerUrls
        }]
      });
    } else {
      throw e;
    }
  }
}

function connectCoinbase() {
  if (window.ethereum && window.ethereum.isCoinbaseWallet) {
    connectMetaMask();
  } else {
    alert('Coinbase Wallet not found');
  }
}

function updateWalletUI() {
  if (!elements.connectWallet || !state.walletAddress) return;
  const a = state.walletAddress;
  elements.connectWallet.innerHTML = `
    <i class="fas fa-wallet"></i>
    <span>${a.slice(0,6)}...${a.slice(-4)}</span>
  `;
}

function checkWalletConnection() {
  if (!window.ethereum || typeof ethers === 'undefined') return;

  window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
    if (accounts.length) {
      state.provider = new ethers.providers.Web3Provider(window.ethereum);
      state.signer = state.provider.getSigner();
      state.walletAddress = accounts[0];
      state.connected = true;
      updateWalletUI();
    }
  });
}

// ================= PAGE STATE =================

function updatePageState() {
  const path = window.location.pathname;
  if (path.includes('dashboard')) state.currentPage = 'dashboard';
  else if (path.includes('create-split')) state.currentPage = 'create-split';
  else state.currentPage = 'home';
}

// ================= EXPORT =================

window.SplitPay = {
  state,
  connectMetaMask
};
