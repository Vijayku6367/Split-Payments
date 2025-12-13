// Create Split functionality
let splitData = {
    name: '',
-   token: 'USDC',
+   token: '',
    description: '',
    members: [],
    autoDistribute: true,
    totalShares: 0
};
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
    initCreateSplit();
    updateReview();
});

function initCreateSplit() {
    // Token selection
    document.querySelectorAll('.token-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.token-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            splitData.token = option.dataset.token;
            updateReview();
        });
    });
     // ✅ Custom token address input FIX
const customTokenInput = document.getElementById('customTokenAddress');
if (customTokenInput) {
    customTokenInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value.startsWith('0x') && value.length === 42) {
            splitData.token = value;
            updateReview();
        }
    });
}
    
    // Auto distribute toggle
    const autoDistribute = document.getElementById('autoDistribute');
    if (autoDistribute) {
        autoDistribute.checked = splitData.autoDistribute;
        autoDistribute.addEventListener('change', (e) => {
            splitData.autoDistribute = e.target.checked;
            updateReview();
        });
    }
    
    // Split name input
    const splitName = document.getElementById('splitName');
    if (splitName) {
        splitName.addEventListener('input', (e) => {
            splitData.name = e.target.value;
            updateReview();
        });
    }
    
    // Split description input
    const splitDescription = document.getElementById('splitDescription');
    if (splitDescription) {
        splitDescription.addEventListener('input', (e) => {
            splitData.description = e.target.value;
        });
    }
    
    // Member address input
    const memberAddress = document.getElementById('memberAddress');
    if (memberAddress) {
        memberAddress.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addMember();
            }
        });
    }
    
    // Member share input
    const memberShare = document.getElementById('memberShare');
    if (memberShare) {
        memberShare.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addMember();
            }
        });
    }
    
    // Create split button
    const createBtn = document.getElementById('createSplitBtn');
    if (createBtn) {
        createBtn.addEventListener('click', createSplitContract);
    }
    
    // Terms agreement
    const termsAgree = document.getElementById('termsAgree');
    if (termsAgree) {
        termsAgree.addEventListener('change', () => {
            createBtn.disabled = !termsAgree.checked;
        });
    }
    
    // Add initial demo member
    addDemoMember();
}

function addDemoMember() {
    // Add a demo member for illustration
    const demoMember = {
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        share: 40,
        id: Date.now()
    };
    
    splitData.members.push(demoMember);
    splitData.totalShares += demoMember.share;
    updateMembersList();
    updateSharesTotal();
    updateReview();
}

function addMember() {
    const addressInput = document.getElementById('memberAddress');
    const shareInput = document.getElementById('memberShare');
    
    const address = addressInput.value.trim();
    const share = parseFloat(shareInput.value);
    
    // Validation
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
        showNotification('Please enter a valid Ethereum address', 'error');
        return;
    }
    
    if (isNaN(share) || share <= 0 || share > 100) {
        showNotification('Please enter a valid share percentage (0-100)', 'error');
        return;
    }
    
    // Check for duplicate address
    if (splitData.members.some(m => m.address.toLowerCase() === address.toLowerCase())) {
        showNotification('This address is already added', 'error');
        return;
    }
    
    // Check total shares
    const newTotal = splitData.totalShares + share;
    if (newTotal > 100) {
        showNotification(`Total shares would exceed 100% (currently ${splitData.totalShares}%)`, 'error');
        return;
    }
    
    // Add member
    const member = {
        address: address,
        share: share,
        id: Date.now()
    };
    
    splitData.members.push(member);
    splitData.totalShares = newTotal;
    
    // Clear inputs
    addressInput.value = '';
    shareInput.value = '';
    
    // Update UI
    updateMembersList();
    updateSharesTotal();
    updateReview();
    
    showNotification('Member added successfully');
}

function removeMember(id) {
    const memberIndex = splitData.members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
        splitData.totalShares -= splitData.members[memberIndex].share;
        splitData.members.splice(memberIndex, 1);
        
        updateMembersList();
        updateSharesTotal();
        updateReview();
        
        showNotification('Member removed');
    }
}

function updateMemberShare(id, newShare) {
    const member = splitData.members.find(m => m.id === id);
    if (member) {
        const oldShare = member.share;
        const newTotal = splitData.totalShares - oldShare + newShare;
        
        if (newTotal > 100) {
            showNotification(`Total shares would exceed 100%`, 'error');
            return false;
        }
        
        member.share = newShare;
        splitData.totalShares = newTotal;
        
        updateSharesTotal();
        updateReview();
        return true;
    }
    return false;
}

function updateMembersList() {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    if (splitData.members.length === 0) {
        membersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No members added yet</p>
                <small>Add team members to get started</small>
            </div>
        `;
        return;
    }
    
    membersList.innerHTML = splitData.members.map(member => `
        <div class="member-item" data-id="${member.id}">
            <div class="member-info">
                <div class="member-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="member-details">
                    <div class="member-address">${formatAddress(member.address)}</div>
                    <div class="member-share">${member.share}% share</div>
                </div>
            </div>
            <div class="member-actions">
                <div class="share-slider">
                    <input type="range" min="0.1" max="100" step="0.1" value="${member.share}" 
                           onchange="updateMemberShareFromSlider(${member.id}, this.value)">
                    <span class="share-value">${member.share}%</span>
                </div>
                <button class="btn-icon-small btn-remove" onclick="removeMember(${member.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateMemberShareFromSlider(id, value) {
    const newShare = parseFloat(value);
    if (updateMemberShare(id, newShare)) {
        // Update the displayed value
        const memberElement = document.querySelector(`[data-id="${id}"] .share-value`);
        if (memberElement) {
            memberElement.textContent = `${newShare}%`;
        }
    }
}

function updateSharesTotal() {
    const totalSharesElement = document.getElementById('totalShares');
    if (totalSharesElement) {
        totalSharesElement.textContent = `${splitData.totalShares.toFixed(1)}%`;
        
        // Color coding
        if (splitData.totalShares === 100) {
            totalSharesElement.style.color = 'var(--teal)';
        } else if (splitData.totalShares > 100) {
            totalSharesElement.style.color = 'var(--accent)';
        } else {
            totalSharesElement.style.color = 'var(--gold)';
        }
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        // Validate current step
        if (!validateStep(currentStep)) {
            return;
        }
        
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Update step numbers
        updateStepNumbers();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateStepNumbers();
    }
}

function validateStep(step) {
    switch (step) {
        case 1:
            if (!splitData.name.trim()) {
                showNotification('Please enter a split name', 'error');
                return false;
            }
            if (!splitData.token) {
                showNotification('Please select a payment token', 'error');
                return false;
            }
            return true;
            
        case 2:
            if (splitData.members.length === 0) {
                showNotification('Please add at least one member', 'error');
                return false;
            }
            if (splitData.totalShares !== 100) {
                showNotification(`Total shares must be 100% (currently ${splitData.totalShares}%)`, 'error');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

function updateStepNumbers() {
    document.querySelectorAll('.step-number').forEach((number, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            number.className = 'step-number completed';
            number.innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNum === currentStep) {
            number.className = 'step-number active';
            number.textContent = stepNum;
        } else {
            number.className = 'step-number';
            number.textContent = stepNum;
        }
    });
}

function updateReview() {
    // Update split details
    document.getElementById('reviewName').textContent = splitData.name || '-';
    document.getElementById('reviewToken').textContent = splitData.token;
    document.getElementById('reviewAuto').textContent = splitData.autoDistribute ? 'Yes' : 'No';
    
    // Update members review
    const reviewMembers = document.getElementById('reviewMembers');
    if (reviewMembers) {
        if (splitData.members.length === 0) {
            reviewMembers.innerHTML = '<div class="empty-review">No members added</div>';
        } else {
            reviewMembers.innerHTML = splitData.members.map(member => `
                <div class="review-member-item">
                    <div class="member-review-address">${formatAddress(member.address)}</div>
                    <div class="member-review-share">${member.share}%</div>
                </div>
            `).join('');
        }
    }
}

async function createSplitContract() {
    if (!window.SplitPay?.state?.connected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    if (!validateStep(1) || !validateStep(2)) {
        return;
    }
    
    try {
        // Show loading state
        const createBtn = document.getElementById('createSplitBtn');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
        createBtn.disabled = true;
        
        // Prepare members data
        - const shares = splitData.members.map(m => Math.floor(m.share * 100));
+ const shares = splitData.members.map(m => Math.floor(m.share));
        // Call the create split function
        await window.SplitPay.createSplitContract(
            splitData.name,
            members,
            shares,
            splitData.token,
            splitData.autoDistribute
        );
        
        // Simulate contract deployment (in production, this would be real)
        setTimeout(() => {
            // Show success step
            document.getElementById('step3').classList.remove('active');
            document.getElementById('successStep').classList.add('active');
            
            // Generate mock contract address and transaction hash
            const mockAddress = `0x${Array.from({length: 40}, () => 
                Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const mockHash = `0x${Array.from({length: 64}, () => 
                Math.floor(Math.random() * 16).toString(16)).join('')}`;
            
            document.getElementById('contractAddress').textContent = mockAddress;
            document.getElementById('transactionHash').textContent = mockHash;
            
            showNotification('Split contract deployed successfully!');
        }, 2000);
        
    } catch (error) {
        console.error('Failed to create split:', error);
        showNotification('Failed to create split contract', 'error');
        
        // Reset button
        const createBtn = document.getElementById('createSplitBtn');
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    }
}

function loadTemplate(template) {
    // Clear existing members
    splitData.members = [];
    splitData.totalShares = 0;
    
    switch (template) {
        case 'team':
            splitData.name = 'Core Team Split';
            splitData.description = 'Monthly team salary distribution';
            splitData.members = [
                { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', share: 25, id: 1 },
                { address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', share: 25, id: 2 },
                { address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', share: 25, id: 3 },
                { address: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB', share: 25, id: 4 }
            ];
            break;
            
        case 'creator':
            splitData.name = 'Creator Revenue Split';
            splitData.description = 'YouTube-style revenue sharing';
            splitData.members = [
                { address: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2', share: 60, id: 1 },
                { address: '0x17F6AD8Ef982297579C203069C1DbfFE4348c372', share: 25, id: 2 },
                { address: '0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678', share: 15, id: 3 }
            ];
            break;
            
        case 'dao':
            splitData.name = 'DAO Treasury Distribution';
            splitData.description = 'Monthly DAO treasury allocation';
            splitData.members = [
                { address: '0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7', share: 40, id: 1 },
                { address: '0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C', share: 30, id: 2 },
                { address: '0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC', share: 20, id: 3 },
                { address: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c', share: 10, id: 4 }
            ];
            break;
            
        case 'freelance':
            splitData.name = 'Freelance Project Split';
            splitData.description = 'Client project payment distribution';
            splitData.members = [
                { address: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C', share: 40, id: 1 },
                { address: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB', share: 35, id: 2 },
                { address: '0x583031D1113aD414F02576BD6afaBfb302140225', share: 25, id: 3 }
            ];
            break;
    }
    
    // Calculate total shares
    splitData.totalShares = splitData.members.reduce((sum, member) => sum + member.share, 0);
    
    // Update UI
    document.getElementById('splitName').value = splitData.name;
    document.getElementById('splitDescription').value = splitData.description;
    updateMembersList();
    updateSharesTotal();
    updateReview();
    
    showNotification(`${template.charAt(0).toUpperCase() + template.slice(1)} template loaded`);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const text = element.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification('Copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }
}

function viewOnExplorer() {
    const address = document.getElementById('contractAddress').textContent;
    const explorerUrl = `https://explore.tempo.xyz/address/${address}`;
    window.open(explorerUrl, '_blank');
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function showNotification(message, type = 'success') {
    // Use the notification function from main script
    if (window.SplitPay?.showNotification) {
        window.SplitPay.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Add styles for create-split page
const createSplitStyles = `
.create-split-container {
    max-width: 1200px;
    margin: 120px auto 60px;
    padding: 0 2rem;
}

.create-split-header {
    text-align: center;
    margin-bottom: 4rem;
}

.create-split-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.create-split-header p {
    color: var(--text-secondary);
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto;
}

.split-creation-wizard {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: 30px;
    overflow: hidden;
    margin-bottom: 4rem;
}

.wizard-step {
    display: none;
    padding: 3rem;
}

.wizard-step.active {
    display: block;
    animation: slide-in 0.5s ease-out;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
}

.step-number {
    width: 50px;
    height: 50px;
    background: var(--glass-bg);
    border: 2px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--text-secondary);
    transition: var(--transition);
}

.step-number.active {
    background: linear-gradient(135deg, var(--gold), var(--teal));
    border-color: var(--gold);
    color: var(--primary-bg);
    box-shadow: var(--shadow-gold);
}

.step-number.completed {
    background: var(--teal);
    border-color: var(--teal);
    color: var(--primary-bg);
}

.step-info h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.step-info p {
    color: var(--text-secondary);
}

.step-content {
    padding: 0 1rem;
}

.form-group {
    margin-bottom: 2rem;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.form-group label i {
    color: var(--gold);
    width: 20px;
}

input[type="text"],
input[type="number"],
textarea {
    width: 100%;
    padding: 1rem 1.5rem;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    transition: var(--transition);
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
    outline: none;
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

textarea {
    resize: vertical;
    min-height: 100px;
}

.form-hint {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.token-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.token-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    cursor: pointer;
    transition: var(--transition);
}

.token-option:hover {
    background: rgba(255, 215, 0, 0.05);
    transform: translateY(-2px);
}

.token-option.active {
    background: linear-gradient(135deg, 
        rgba(255, 215, 0, 0.1) 0%, 
        rgba(0, 212, 170, 0.1) 100%);
    border-color: var(--gold);
    box-shadow: var(--shadow-gold);
}

.token-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--primary-bg);
    font-size: 0.9rem;
}

.token-option span {
    font-weight: 600;
    color: var(--text-primary);
}

.members-container {
    margin-bottom: 3rem;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    transition: var(--transition);
}

.member-item:hover {
    background: rgba(255, 215, 0, 0.05);
    border-color: var(--gold);
}

.member-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.member-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-bg);
    font-size: 1.2rem;
}

.member-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.member-address {
    font-weight: 600;
    color: var(--text-primary);
}

.member-share {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.member-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.share-slider {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 200px;
}

.share-slider input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    background: var(--glass-bg);
    border-radius: 3px;
    outline: none;
}

.share-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: var(--gold);
    border-radius: 50%;
    cursor: pointer;
}

.share-value {
    min-width: 50px;
    text-align: right;
    font-weight: 600;
    color: var(--gold);
}

.btn-remove {
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.3);
    color: var(--accent);
}

.btn-remove:hover {
    background: rgba(255, 107, 107, 0.2);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.percentage-input {
    position: relative;
}

.percentage-input span {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-weight: 600;
}

.btn-add-member {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    justify-content: center;
}

.total-shares {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    margin-top: 2rem;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
}

.shares-label {
    font-weight: 600;
    color: var(--text-primary);
}

.shares-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--teal);
}

.checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    cursor: pointer;
    padding: 1rem;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: var(--transition);
}

.checkbox-label:hover {
    background: rgba(255, 215, 0, 0.05);
    border-color: var(--gold);
}

.checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    position: relative;
    flex-shrink: 0;
    margin-top: 2px;
    transition: var(--transition);
}

.checkbox-label input:checked + .checkbox-custom {
    background: var(--gold);
    border-color: var(--gold);
}

.checkbox-label input:checked + .checkbox-custom::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--primary-bg);
    font-size: 0.9rem;
    font-weight: bold;
}

.checkbox-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.checkbox-text strong {
    color: var(--text-primary);
}

.checkbox-text small {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.checkbox-text a {
    color: var(--gold);
    text-decoration: none;
}

.checkbox-text a:hover {
    text-decoration: underline;
}

.wizard-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
}

.review-card {
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.review-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
}

.review-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.review-section h4 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.review-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.review-label {
    color: var(--text-secondary);
}

.review-value {
    font-weight: 600;
    color: var(--text-primary);
}

.review-members {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.review-member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
}

.member-review-address {
    font-family: monospace;
    color: var(--text-primary);
}

.member-review-share {
    font-weight: 700;
    color: var(--gold);
}

.gas-estimate {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.gas-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.gas-item:last-child {
    border-bottom: none;
}

.gas-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 2px solid var(--border-color);
}

.total-amount {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--gold);
}

.btn-create {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 2.5rem;
}

.success-step {
    text-align: center;
    padding: 4rem 2rem;
}

.success-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--teal), var(--gold));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: var(--primary-bg);
    margin: 0 auto 2rem;
    animation: pulse 2s infinite;
}

.success-step h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.success-step p {
    color: var(--text-secondary);
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto 3rem;
}

.success-details {
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 3rem;
    text-align: left;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-item span {
    font-weight: 600;
    color: var(--text-primary);
    min-width: 150px;
}

.detail-item code {
    flex: 1;
    font-family: monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: var(--teal);
    overflow: hidden;
    text-overflow: ellipsis;
}

.success-actions {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
}

.quick-templates {
    margin-top: 4rem;
}

.quick-templates h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    color: var(--text-primary);
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

.template-card {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
}

.template-card:hover {
    transform: translateY(-10px);
    border-color: var(--gold);
    box-shadow: var(--shadow-gold);
}

.template-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--gold), var(--teal));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: var(--primary-bg);
    margin: 0 auto 1.5rem;
}

.template-card h4 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.template-card p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-muted);
}

.empty-review {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
}

@media (max-width: 992px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .templates-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .token-selector {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .wizard-step {
        padding: 2rem 1rem;
    }
    
    .member-item {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
    }
    
    .member-actions {
        flex-direction: column;
        gap: 1rem;
    }
    
    .share-slider {
        min-width: 100%;
    }
    
    .success-actions {
        flex-direction: column;
    }
    
    .templates-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .create-split-header h1 {
        font-size: 2rem;
    }
    
    .step-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .wizard-actions {
        flex-direction: column;
        gap: 1rem;
    }
    
    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = createSplitStyles;
document.head.appendChild(styleSheet);
