// Plans/Pricing Page
document.addEventListener('DOMContentLoaded', () => {
    initPlansPage();
    loadPlans();
});

function initPlansPage() {
    // Wallet connection
    if (window.SplitPay?.state?.connected) {
        updateWalletUI();
    }
    
    // Billing cycle toggle
    const billingToggle = document.getElementById('billingToggle');
    if (billingToggle) {
        billingToggle.addEventListener('change', toggleBillingCycle);
    }
    
    // Plan selection
    document.querySelectorAll('.plan-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.closest('.plan-card').dataset.plan;
            selectPlan(planId);
        });
    });
    
    // FAQ accordion
    initFAQAccordion();
    
    // Contact sales button
    const contactBtn = document.getElementById('contactSalesBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', contactSales);
    }
    
    // Custom plan button
    const customPlanBtn = document.getElementById('customPlanBtn');
    if (customPlanBtn) {
        customPlanBtn.addEventListener('click', showCustomPlanModal);
    }
}

function loadPlans() {
    // Monthly plans data
    const monthlyPlans = [
        {
            id: 'starter',
            name: 'Starter',
            price: 29,
            period: 'month',
            description: 'Perfect for small teams getting started',
            features: [
                { text: 'Up to 5 team members', included: true },
                { text: '3 active split contracts', included: true },
                { text: 'Basic analytics', included: true },
                { text: 'Email support', included: true },
                { text: 'Advanced automation', included: false },
                { text: 'Priority support', included: false },
                { text: 'Custom integrations', included: false },
                { text: 'API access', included: false }
            ],
            cta: 'Get Started',
            popular: false
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 99,
            period: 'month',
            description: 'For growing teams and businesses',
            features: [
                { text: 'Up to 20 team members', included: true },
                { text: '15 active split contracts', included: true },
                { text: 'Advanced analytics', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Advanced automation', included: true },
                { text: 'Priority support', included: true },
                { text: 'Custom integrations', included: false },
                { text: 'Full API access', included: false }
            ],
            cta: 'Get Professional',
            popular: true
        },
        {
            id: 'business',
            name: 'Business',
            price: 299,
            period: 'month',
            description: 'For large teams and enterprises',
            features: [
                { text: 'Unlimited team members', included: true },
                { text: 'Unlimited split contracts', included: true },
                { text: 'Enterprise analytics', included: true },
                { text: '24/7 phone & chat support', included: true },
                { text: 'Advanced automation', included: true },
                { text: 'Priority support', included: true },
                { text: 'Custom integrations', included: true },
                { text: 'Full API access', included: true }
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];
    
    // Yearly plans (20% discount)
    const yearlyPlans = monthlyPlans.map(plan => ({
        ...plan,
        price: Math.round(plan.price * 12 * 0.8), // 20% discount
        period: 'year',
        cta: plan.id === 'business' ? 'Contact Sales' : 'Get Yearly Plan'
    }));
    
    // Store plans data
    window.plansData = {
        monthly: monthlyPlans,
        yearly: yearlyPlans,
        currentCycle: 'monthly'
    };
    
    // Render plans
    renderPlans(monthlyPlans);
    
    // Update savings badge
    updateSavingsBadge();
}

function renderPlans(plans) {
    const plansContainer = document.getElementById('plansContainer');
    if (!plansContainer) return;
    
    plansContainer.innerHTML = plans.map(plan => `
        <div class="plan-card ${plan.popular ? 'popular' : ''}" data-plan="${plan.id}">
            ${plan.popular ? `
                <div class="popular-badge">
                    <i class="fas fa-crown"></i>
                    <span>Most Popular</span>
                </div>
            ` : ''}
            
            <div class="plan-header">
                <h3 class="plan-name">${plan.name}</h3>
                <div class="plan-price">
                    <span class="currency">$</span>
                    <span class="amount">${plan.price}</span>
                    <span class="period">/${plan.period}</span>
                </div>
                <p class="plan-description">${plan.description}</p>
            </div>
            
            <div class="plan-features">
                <ul>
                    ${plan.features.map(feature => `
                        <li class="${feature.included ? 'included' : 'not-included'}">
                            <i class="fas ${feature.included ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>${feature.text}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="plan-footer">
                <button class="plan-select-btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}">
                    ${plan.cta}
                </button>
                ${plan.period === 'year' ? `
                    <p class="plan-savings">
                        <i class="fas fa-piggy-bank"></i>
                        Save 20% with yearly billing
                    </p>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Re-attach event listeners
    document.querySelectorAll('.plan-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.closest('.plan-card').dataset.plan;
            selectPlan(planId);
        });
    });
}

function toggleBillingCycle() {
    const toggle = document.getElementById('billingToggle');
    const isYearly = toggle?.checked;
    
    if (!window.plansData) return;
    
    window.plansData.currentCycle = isYearly ? 'yearly' : 'monthly';
    const plans = isYearly ? window.plansData.yearly : window.plansData.monthly;
    
    renderPlans(plans);
    updateSavingsBadge();
    
    // Update toggle labels
    document.querySelectorAll('.billing-label').forEach((label, index) => {
        label.classList.toggle('active', index === (isYearly ? 1 : 0));
    });
}

function updateSavingsBadge() {
    const isYearly = window.plansData?.currentCycle === 'yearly';
    const savingsBadge = document.getElementById('savingsBadge');
    
    if (savingsBadge) {
        if (isYearly) {
            savingsBadge.style.display = 'flex';
            // Calculate total savings
            const monthlyTotal = window.plansData.monthly.reduce((sum, plan) => sum + plan.price, 0);
            const yearlyTotal = window.plansData.yearly.reduce((sum, plan) => sum + plan.price, 0);
            const savings = monthlyTotal * 12 - yearlyTotal;
            
            savingsBadge.innerHTML = `
                <i class="fas fa-trophy"></i>
                <span>Save $${savings}/year with yearly billing</span>
            `;
        } else {
            savingsBadge.style.display = 'none';
        }
    }
}

function selectPlan(planId) {
    const cycle = window.plansData?.currentCycle || 'monthly';
    const plans = cycle === 'yearly' ? window.plansData.yearly : window.plansData.monthly;
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) return;
    
    // If Business plan, show contact modal
    if (planId === 'business') {
        showContactModal();
        return;
    }
    
    // Check if wallet is connected for payment
    if (!window.SplitPay?.state?.connected) {
        showNotification('Please connect your wallet to subscribe', 'error');
        setTimeout(() => {
            document.getElementById('connectWallet')?.click();
        }, 500);
        return;
    }
    
    // Show payment modal
    showPaymentModal(plan);
}

function showPaymentModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'modal payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Subscribe to ${plan.name} Plan</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-summary">
                    <div class="summary-item">
                        <span>Plan:</span>
                        <span>${plan.name} (${plan.period}ly)</span>
                    </div>
                    <div class="summary-item">
                        <span>Price:</span>
                        <span class="price">$${plan.price}/${plan.period}</span>
                    </div>
                    <div class="summary-item">
                        <span>Billing Cycle:</span>
                        <span>${plan.period === 'year' ? 'Yearly' : 'Monthly'}</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-total">
                        <span>Total:</span>
                        <span class="total-price">$${plan.price} ${plan.period === 'year' ? '/year' : '/month'}</span>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h4>Payment Method</h4>
                    <div class="method-options">
                        <div class="method-option active" data-method="crypto">
                            <i class="fab fa-ethereum"></i>
                            <span>Crypto (USDC/USDT)</span>
                        </div>
                        <div class="method-option" data-method="card">
                            <i class="fas fa-credit-card"></i>
                            <span>Credit Card</span>
                        </div>
                    </div>
                    
                    <div class="payment-details crypto-payment" id="cryptoPayment">
                        <div class="crypto-info">
                            <p>Send ${plan.price} USDC or USDT to:</p>
                            <div class="crypto-address">
                                <code>0x742d35Cc6634C0532925a3b844Bc9e67BB6e8B3A</code>
                                <button class="btn-icon-xs" onclick="copyToClipboard('0x742d35Cc6634C0532925a3b844Bc9e67BB6e8B3A')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <p class="crypto-note">
                                <i class="fas fa-info-circle"></i>
                                Payment will be confirmed in 2-3 minutes
                            </p>
                        </div>
                    </div>
                    
                    <div class="payment-details card-payment" id="cardPayment" style="display: none;">
                        <div class="card-form">
                            <div class="form-group">
                                <label>Card Number</label>
                                <input type="text" placeholder="1234 5678 9012 3456" class="card-input">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder="MM/YY" class="card-input">
                                </div>
                                <div class="form-group">
                                    <label>CVC</label>
                                    <input type="text" placeholder="123" class="card-input">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn-primary" onclick="processPayment('${plan.id}')">
                        <i class="fas fa-lock"></i>
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Payment method toggle
    document.querySelectorAll('.method-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.method-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            const method = option.dataset.method;
            document.getElementById('cryptoPayment').style.display = method === 'crypto' ? 'block' : 'none';
            document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';
        });
    });
}

function processPayment(planId) {
    const cycle = window.plansData?.currentCycle || 'monthly';
    const plans = cycle === 'yearly' ? window.plansData.yearly : window.plansData.monthly;
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) return;
    
    // Get selected payment method
    const selectedMethod = document.querySelector('.method-option.active')?.dataset.method;
    
    if (selectedMethod === 'crypto') {
        // For crypto payment, show confirmation
        showCryptoConfirmation(plan);
    } else if (selectedMethod === 'card') {
        // For card payment, process through Stripe/other processor
        processCardPayment(plan);
    }
}

function showCryptoConfirmation(plan) {
    const modal = document.querySelector('.payment-modal');
    if (modal) modal.remove();
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal confirmation-modal';
    confirmModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Payment Instruction</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="confirmation-content">
                    <div class="confirmation-icon">
                        <i class="fas fa-qrcode"></i>
                    </div>
                    <h4>Send ${plan.price} USDC to:</h4>
                    <div class="crypto-address-large">
                        <code>0x742d35Cc6634C0532925a3b844Bc9e67BB6e8B3A</code>
                        <button class="btn-icon" onclick="copyToClipboard('0x742d35Cc6634C0532925a3b844Bc9e67BB6e8B3A')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="qr-code">
                        <!-- QR Code would be generated here -->
                        <div class="qr-placeholder">
                            <div class="qr-grid">
                                ${Array.from({length: 25}, (_, i) => `
                                    <div class="qr-cell ${Math.random() > 0.5 ? 'filled' : ''}"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <p class="confirmation-note">
                        <i class="fas fa-clock"></i>
                        Subscription will activate after 3 confirmations (2-3 minutes)
                    </p>
                    <div class="confirmation-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="button" class="btn-primary" onclick="checkPaymentStatus('${plan.id}')">
                            <i class="fas fa-sync-alt"></i>
                            I've Sent Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
}

function checkPaymentStatus(planId) {
    // In production, this would check blockchain for payment
    // For demo, simulate successful payment
    const modal = document.querySelector('.confirmation-modal');
    if (modal) modal.remove();
    
    // Show success modal
    const successModal = document.createElement('div');
    successModal.className = 'modal success-modal';
    successModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Payment Successful!</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Welcome to SplitPay Pro!</h4>
                    <p>Your subscription has been activated successfully.</p>
                    <div class="success-details">
                        <div class="detail">
                            <span>Plan:</span>
                            <span>${planId.charAt(0).toUpperCase() + planId.slice(1)}</span>
                        </div>
                        <div class="detail">
                            <span>Activated:</span>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                        <div class="detail">
                            <span>Next Billing:</span>
                            <span>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="success-actions">
                        <button type="button" class="btn-primary" onclick="window.location.href='dashboard.html'">
                            <i class="fas fa-tachometer-alt"></i>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(successModal);
    
    // Update user's plan in localStorage or backend
    localStorage.setItem('splitpay_subscription', JSON.stringify({
        plan: planId,
        activated: new Date().toISOString(),
        status: 'active'
    }));
    
    // Update UI to reflect premium features
    updatePremiumUI(planId);
}

function processCardPayment(plan) {
    // This would integrate with Stripe or other payment processor
    showNotification('Card payment processing would happen here');
}

function showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal contact-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Contact Sales</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="contact-content">
                    <div class="contact-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h4>Enterprise Solutions</h4>
                    <p>Get custom pricing, dedicated support, and enterprise-grade features for your organization.</p>
                    
                    <form id="contactForm" onsubmit="return submitContactForm(event)">
                        <div class="form-group">
                            <label for="contactName">Full Name *</label>
                            <input type="text" id="contactName" required placeholder="John Doe">
                        </div>
                        
                        <div class="form-group">
                            <label for="contactEmail">Work Email *</label>
                            <input type="email" id="contactEmail" required placeholder="john@company.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="contactCompany">Company</label>
                            <input type="text" id="contactCompany" placeholder="Company Name">
                        </div>
                        
                        <div class="form-group">
                            <label for="contactTeamSize">Team Size</label>
                            <select id="contactTeamSize">
                                <option value="">Select size</option>
                                <option value="1-10">1-10 people</option>
                                <option value="11-50">11-50 people</option>
                                <option value="51-200">51-200 people</option>
                                <option value="201-500">201-500 people</option>
                                <option value="500+">500+ people</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="contactMessage">What are you looking for? *</label>
                            <textarea id="contactMessage" rows="4" required placeholder="Tell us about your needs..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function submitContactForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        company: document.getElementById('contactCompany').value,
        teamSize: document.getElementById('contactTeamSize').value,
        message: document.getElementById('contactMessage').value
    };
    
    // In production, this would send to backend
    console.log('Contact form submitted:', formData);
    
    // Show success message
    document.querySelector('.contact-modal')?.remove();
    
    showNotification('Thank you! Our sales team will contact you within 24 hours.');
    
    return false;
}

function showCustomPlanModal() {
    showContactModal(); // Reuse contact modal for custom plans
}

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                
                // Animate answer height
                if (item.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0px';
                }
            });
        }
    });
}

function updatePremiumUI(planId) {
    // Update UI elements based on plan
    const planName = document.getElementById('currentPlanName');
    if (planName) {
        planName.textContent = planId.charAt(0).toUpperCase() + planId.slice(1);
    }
    
    // Enable premium features
    const premiumFeatures = document.querySelectorAll('[data-premium="true"]');
    premiumFeatures.forEach(feature => {
        feature.classList.remove('disabled');
        feature.removeAttribute('disabled');
    });
    
    // Update dashboard to show premium status
    showNotification('Premium features unlocked!');
}

function contactSales() {
    showContactModal();
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
