// Team Management Page
document.addEventListener('DOMContentLoaded', () => {
    initTeamPage();
    loadTeamMembers();
});

function initTeamPage() {
    // Initialize wallet connection
    if (window.SplitPay?.state?.connected) {
        updateWalletUI();
    }
    
    // Search functionality
    const searchInput = document.getElementById('teamSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchMembers, 300));
    }
    
    // Role filter
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', filterMembersByRole);
    }
    
    // Add member button
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', showAddMemberModal);
    }
    
    // Import team button
    const importBtn = document.getElementById('importTeamBtn');
    if (importBtn) {
        importBtn.addEventListener('click', importTeam);
    }
    
    // Export team button
    const exportBtn = document.getElementById('exportTeamBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTeam);
    }
    
    // Initialize team stats
    updateTeamStats();
}

async function loadTeamMembers() {
    // Show loading state
    const teamList = document.getElementById('teamList');
    if (teamList) {
        teamList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading team members...</p>
            </div>
        `;
    }
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample team data
        const teamMembers = [
            {
                id: 'member_001',
                name: 'Alex Johnson',
                role: 'Developer',
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                email: 'alex@example.com',
                share: 25,
                totalEarned: 12500.50,
                splits: ['Core Team', 'Project Alpha'],
                joinDate: '2024-01-15',
                status: 'active'
            },
            {
                id: 'member_002',
                name: 'Sarah Chen',
                role: 'Designer',
                address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
                email: 'sarah@example.com',
                share: 20,
                totalEarned: 9800.75,
                splits: ['Core Team', 'UI/UX'],
                joinDate: '2024-02-20',
                status: 'active'
            },
            {
                id: 'member_003',
                name: 'Mike Rodriguez',
                role: 'Marketing',
                address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
                email: 'mike@example.com',
                share: 15,
                totalEarned: 7500.25,
                splits: ['Marketing', 'Content'],
                joinDate: '2024-03-10',
                status: 'active'
            },
            {
                id: 'member_004',
                name: 'Emma Wilson',
                role: 'Developer',
                address: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
                email: 'emma@example.com',
                share: 18,
                totalEarned: 8900.00,
                splits: ['Core Team', 'Backend'],
                joinDate: '2024-04-05',
                status: 'active'
            },
            {
                id: 'member_005',
                name: 'David Kim',
                role: 'Operations',
                address: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2',
                email: 'david@example.com',
                share: 12,
                totalEarned: 6200.50,
                splits: ['Operations', 'Support'],
                joinDate: '2024-05-18',
                status: 'inactive'
            },
            {
                id: 'member_006',
                name: 'Lisa Wang',
                role: 'Content Creator',
                address: '0x17F6AD8Ef982297579C203069C1DbfFE4348c372',
                email: 'lisa@example.com',
                share: 10,
                totalEarned: 5200.75,
                splits: ['Content', 'Social Media'],
                joinDate: '2024-06-22',
                status: 'active'
            }
        ];
        
        // Store globally for filtering
        window.teamMembersData = teamMembers;
        
        // Render team members
        renderTeamMembers(teamMembers);
        
        // Update team stats
        updateTeamStats(teamMembers);
        
        // Initialize role distribution chart
        initRoleDistributionChart(teamMembers);
        
    } catch (error) {
        console.error('Failed to load team members:', error);
        showNotification('Failed to load team members', 'error');
    }
}

function renderTeamMembers(members) {
    const teamList = document.getElementById('teamList');
    if (!teamList) return;
    
    if (members.length === 0) {
        teamList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No team members found</p>
                <button class="btn-secondary" onclick="showAddMemberModal()">
                    <i class="fas fa-plus"></i>
                    Add First Member
                </button>
            </div>
        `;
        return;
    }
    
    teamList.innerHTML = members.map(member => `
        <div class="team-member-card" data-id="${member.id}">
            <div class="member-header">
                <div class="member-avatar">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}" alt="${member.name}">
                    <div class="status-indicator ${member.status}"></div>
                </div>
                <div class="member-info">
                    <h4 class="member-name">${member.name}</h4>
                    <div class="member-meta">
                        <span class="member-role">${member.role}</span>
                        <span class="member-share">${member.share}% share</span>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn-icon" onclick="sendMessage('${member.id}')">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <div class="dropdown">
                        <button class="btn-icon">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu">
                            <button onclick="editMember('${member.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="viewMemberDetails('${member.id}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button onclick="adjustShare('${member.id}')">
                                <i class="fas fa-percentage"></i> Adjust Share
                            </button>
                            <button class="danger" onclick="removeMember('${member.id}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="member-details">
                <div class="detail-row">
                    <span class="detail-label">Wallet Address:</span>
                    <span class="detail-value address">
                        ${formatAddress(member.address)}
                        <button class="btn-icon-xs" onclick="copyToClipboard('${member.address}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${member.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Earned:</span>
                    <span class="detail-value amount">$${member.totalEarned.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Active Splits:</span>
                    <div class="splits-list">
                        ${member.splits.map(split => `
                            <span class="split-tag">${split}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Joined:</span>
                    <span class="detail-value">${formatDate(member.joinDate)}</span>
                </div>
            </div>
            
            <div class="member-footer">
                <button class="btn-secondary btn-sm" onclick="viewPayoutHistory('${member.id}')">
                    <i class="fas fa-history"></i>
                    View Payouts
                </button>
                <button class="btn-primary btn-sm" onclick="sendPayment('${member.id}')">
                    <i class="fas fa-paper-plane"></i>
                    Send Payment
                </button>
            </div>
        </div>
    `).join('');
}

function searchMembers() {
    const searchInput = document.getElementById('teamSearch');
    const searchTerm = searchInput?.value.toLowerCase() || '';
    
    if (!window.teamMembersData) return;
    
    const filteredMembers = window.teamMembersData.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.role.toLowerCase().includes(searchTerm) ||
        member.address.toLowerCase().includes(searchTerm)
    );
    
    renderTeamMembers(filteredMembers);
}

function filterMembersByRole() {
    const roleFilter = document.getElementById('roleFilter');
    const selectedRole = roleFilter?.value;
    
    if (!window.teamMembersData) return;
    
    if (!selectedRole || selectedRole === 'all') {
        renderTeamMembers(window.teamMembersData);
        return;
    }
    
    const filteredMembers = window.teamMembersData.filter(member => 
        member.role.toLowerCase() === selectedRole.toLowerCase()
    );
    
    renderTeamMembers(filteredMembers);
}

function updateTeamStats(members = []) {
    const stats = calculateTeamStats(members);
    
    // Update stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        const metric = card.dataset.metric;
        const valueElement = card.querySelector('.stat-value');
        
        if (valueElement && stats[metric]) {
            valueElement.textContent = stats[metric];
        }
    });
}

function calculateTeamStats(members) {
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalShares = members.reduce((sum, m) => sum + m.share, 0);
    const totalEarned = members.reduce((sum, m) => sum + m.totalEarned, 0);
    const avgShare = members.length > 0 ? (totalShares / members.length).toFixed(1) : 0;
    
    // Count roles
    const roleCount = {};
    members.forEach(member => {
        roleCount[member.role] = (roleCount[member.role] || 0) + 1;
    });
    
    const topRole = Object.entries(roleCount).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];
    
    return {
        totalMembers: members.length.toString(),
        activeMembers: activeMembers.toString(),
        totalShares: `${totalShares}%`,
        totalEarned: `$${totalEarned.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
        avgShare: `${avgShare}%`,
        topRole: topRole || 'None'
    };
}

function initRoleDistributionChart(members) {
    const chartContainer = document.getElementById('roleChart');
    if (!chartContainer) return;
    
    // Count roles
    const roleCount = {};
    members.forEach(member => {
        roleCount[member.role] = (roleCount[member.role] || 0) + 1;
    });
    
    const total = members.length;
    
    chartContainer.innerHTML = `
        <div class="role-chart">
            <div class="chart-bars">
                ${Object.entries(roleCount).map(([role, count]) => {
                    const percentage = (count / total) * 100;
                    return `
                        <div class="bar-container">
                            <div class="bar-label">${role}</div>
                            <div class="bar-wrapper">
                                <div class="bar" style="width: ${percentage}%">
                                    <span class="bar-value">${count}</span>
                                </div>
                            </div>
                            <div class="bar-percentage">${percentage.toFixed(1)}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function showAddMemberModal() {
    const modal = document.createElement('div');
    modal.className = 'modal add-member-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Team Member</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addMemberForm" onsubmit="return addNewMember(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberName">Full Name *</label>
                            <input type="text" id="memberName" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="memberRole">Role *</label>
                            <select id="memberRole" required>
                                <option value="">Select Role</option>
                                <option value="Developer">Developer</option>
                                <option value="Designer">Designer</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                                <option value="Content Creator">Content Creator</option>
                                <option value="Manager">Manager</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberAddress">Wallet Address *</label>
                            <input type="text" id="memberAddress" required 
                                   placeholder="0x..." pattern="^0x[a-fA-F0-9]{40}$">
                            <div class="form-hint">Enter valid Ethereum address</div>
                        </div>
                        <div class="form-group">
                            <label for="memberEmail">Email Address</label>
                            <input type="email" id="memberEmail" placeholder="john@example.com">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberShare">Share Percentage *</label>
                            <div class="percentage-input">
                                <input type="number" id="memberShare" required 
                                       min="0.1" max="100" step="0.1" placeholder="25.5">
                                <span>%</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="memberSplits">Assign to Splits</label>
                            <select id="memberSplits" multiple>
                                <option value="core">Core Team</option>
                                <option value="marketing">Marketing</option>
                                <option value="content">Content</option>
                                <option value="development">Development</option>
                                <option value="operations">Operations</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-plus"></i>
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize select2 for multi-select
    const splitsSelect = document.getElementById('memberSplits');
    if (splitsSelect) {
        // This would initialize a better select UI in production
    }
}

function addNewMember(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const newMember = {
        id: 'member_' + Date.now(),
        name: document.getElementById('memberName').value,
        role: document.getElementById('memberRole').value,
        address: document.getElementById('memberAddress').value,
        email: document.getElementById('memberEmail').value || 'N/A',
        share: parseFloat(document.getElementById('memberShare').value),
        totalEarned: 0,
        splits: Array.from(document.getElementById('memberSplits').selectedOptions).map(opt => opt.text),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(newMember.address)) {
        showNotification('Please enter a valid Ethereum address', 'error');
        return false;
    }
    
    // Validate share
    if (newMember.share <= 0 || newMember.share > 100) {
        showNotification('Share must be between 0.1% and 100%', 'error');
        return false;
    }
    
    // Add to team
    if (!window.teamMembersData) window.teamMembersData = [];
    window.teamMembersData.push(newMember);
    
    // Update UI
    renderTeamMembers(window.teamMembersData);
    updateTeamStats(window.teamMembersData);
    
    // Close modal
    document.querySelector('.add-member-modal')?.remove();
    
    showNotification(`${newMember.name} added to team successfully`);
    
    return false;
}

function editMember(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    if (!member) return;
    
    // Show edit modal similar to add member modal
    console.log('Editing member:', member);
    showNotification('Edit functionality would open here');
}

function viewMemberDetails(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    if (!member) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal member-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Member Details</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="member-profile">
                    <div class="profile-header">
                        <div class="avatar-large">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}" alt="${member.name}">
                            <div class="status-badge ${member.status}">${member.status}</div>
                        </div>
                        <div class="profile-info">
                            <h2>${member.name}</h2>
                            <p class="role">${member.role}</p>
                            <p class="join-date">Joined ${formatDate(member.joinDate)}</p>
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-label">Share Percentage</span>
                            <span class="stat-value">${member.share}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Earned</span>
                            <span class="stat-value">$${member.totalEarned.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Active Splits</span>
                            <span class="stat-value">${member.splits.length}</span>
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <h4>Contact Information</h4>
                        <div class="detail-item">
                            <i class="fas fa-wallet"></i>
                            <div>
                                <span class="detail-label">Wallet Address</span>
                                <span class="detail-value address">${member.address}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${member.email}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-splits">
                        <h4>Active Splits</h4>
                        <div class="splits-grid">
                            ${member.splits.map(split => `
                                <div class="split-card">
                                    <h5>${split}</h5>
                                    <p>${member.share}% share</p>
                                    <button class="btn-icon-xs" onclick="viewSplit('${split}')">
                                        <i class="fas fa-external-link-alt"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function adjustShare(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    if (!member) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal adjust-share-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Adjust Share for ${member.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="current-share">
                    <span>Current Share:</span>
                    <span class="share-value">${member.share}%</span>
                </div>
                
                <div class="form-group">
                    <label for="newShare">New Share Percentage</label>
                    <div class="share-input-group">
                        <input type="range" id="shareRange" min="0.1" max="100" step="0.1" value="${member.share}">
                        <div class="share-input">
                            <input type="number" id="newShare" value="${member.share}" 
                                   min="0.1" max="100" step="0.1">
                            <span>%</span>
                        </div>
                    </div>
                </div>
                
                <div class="share-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Changing shares will affect future payments. Existing payments remain unchanged.</p>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn-primary" onclick="updateMemberShare('${memberId}')">
                        Update Share
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Sync range and number inputs
    const rangeInput = document.getElementById('shareRange');
    const numberInput = document.getElementById('newShare');
    
    rangeInput.addEventListener('input', () => {
        numberInput.value = rangeInput.value;
    });
    
    numberInput.addEventListener('input', () => {
        rangeInput.value = numberInput.value;
    });
}

function updateMemberShare(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    const newShare = parseFloat(document.getElementById('newShare').value);
    
    if (!member || isNaN(newShare)) return;
    
    // Validate
    if (newShare <= 0 || newShare > 100) {
        showNotification('Share must be between 0.1% and 100%', 'error');
        return;
    }
    
    // Update member
    member.share = newShare;
    
    // Update UI
    renderTeamMembers(window.teamMembersData);
    updateTeamStats(window.teamMembersData);
    
    // Close modal
    document.querySelector('.adjust-share-modal')?.remove();
    
    showNotification(`${member.name}'s share updated to ${newShare}%`);
}

function removeMember(memberId) {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    const memberIndex = window.teamMembersData?.findIndex(m => m.id === memberId);
    if (memberIndex === undefined || memberIndex === -1) return;
    
    const memberName = window.teamMembersData[memberIndex].name;
    window.teamMembersData.splice(memberIndex, 1);
    
    // Update UI
    renderTeamMembers(window.teamMembersData);
    updateTeamStats(window.teamMembersData);
    
    showNotification(`${memberName} removed from team`);
}

function sendPayment(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    if (!member) return;
    
    showNotification(`Payment interface would open for ${member.name}`);
}

function sendMessage(memberId) {
    const member = window.teamMembersData?.find(m => m.id === memberId);
    if (!member) return;
    
    const email = member.email;
    if (email && email !== 'N/A') {
        window.location.href = `mailto:${email}`;
    } else {
        showNotification('No email address available for this member', 'error');
    }
}

function viewPayoutHistory(memberId) {
    showNotification('Payout history would show here');
}

function viewSplit(splitName) {
    showNotification(`Viewing split: ${splitName}`);
}

function importTeam() {
    // This would handle CSV/JSON import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.txt';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                // Parse and validate imported data
                console.log('Imported content:', content);
                showNotification('Team data imported successfully');
            } catch (error) {
                showNotification('Failed to import team data', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function exportTeam() {
    if (!window.teamMembersData || window.teamMembersData.length === 0) {
        showNotification('No team data to export', 'error');
        return;
    }
    
    const format = 'csv'; // Could be selectable
    const data = window.teamMembersData.map(m => ({
        Name: m.name,
        Role: m.role,
        'Wallet Address': m.address,
        Email: m.email,
        'Share %': m.share,
        'Total Earned': m.totalEarned,
        'Join Date': m.joinDate,
        Status: m.status
    }));
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_members_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Team data exported successfully');
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatAddress(address) {
    if (!address || !address.startsWith('0x')) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard'))
        .catch(err => console.error('Copy failed:', err));
}

function showNotification(message, type = 'success') {
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
