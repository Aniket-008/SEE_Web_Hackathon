/* ============================================================
   Rental Agreement Management System - Recent Agreements Page
   recent-agreements.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initRecentAgreementsPage();
});

function initRecentAgreementsPage() {
    updateRecentStats();
    renderRecentAgreementsTable();

    const searchInput = document.getElementById('recentSearchInput');
    const statusFilter = document.getElementById('recentStatusFilter');
    const resetFilterBtn = document.getElementById('recentResetFilterBtn');

    if (searchInput) {
        searchInput.addEventListener('input', renderRecentAgreementsTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderRecentAgreementsTable);
    }
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'All';
            renderRecentAgreementsTable();
        });
    }

    // Modal listeners
    const modal = document.getElementById('agreementModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const closeFooterBtn = document.getElementById('modalCloseFooterBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeAgreementModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeAgreementModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAgreementModal();
            }
        });
    }
}

function updateRecentStats() {
    const agreements = getAgreements();
    const totalCount = agreements.length;

    let activeCount = 0;
    let expiredCount = 0;
    let pendingCount = 0;
    let monthlyRevenue = 0;

    agreements.forEach(agr => {
        const st = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
        if (st === 'Active') {
            activeCount++;
            monthlyRevenue += Number(agr.monthlyRent) || 0;
        } else if (st === 'Expired') {
            expiredCount++;
        } else if (st === 'Pending') {
            pendingCount++;
        }
    });

    const elTotal = document.getElementById('recentTotalCount');
    if (elTotal) elTotal.textContent = totalCount;

    const elActive = document.getElementById('recentActiveCount');
    if (elActive) elActive.textContent = activeCount;

    const elExpiredPending = document.getElementById('recentExpiredPendingCount');
    if (elExpiredPending) elExpiredPending.textContent = expiredCount + pendingCount;

    const elExpiredSub = document.getElementById('recentExpiredSub');
    if (elExpiredSub) elExpiredSub.textContent = `${expiredCount} Expired · ${pendingCount} Pending`;

    const elRev = document.getElementById('recentMonthlyRevenue');
    if (elRev) elRev.textContent = formatCurrency(monthlyRevenue);
}

function renderRecentAgreementsTable() {
    const tableBody = document.getElementById('recentAgreementsFullBody');
    const countInfo = document.getElementById('recentCountInfo');
    if (!tableBody) return;

    const agreements = getAgreements();
    const searchQuery = (document.getElementById('recentSearchInput')?.value || '').trim().toLowerCase();
    const statusValue = document.getElementById('recentStatusFilter')?.value || 'All';

    // Reverse order to show latest/recent first
    const sorted = [...agreements].reverse();

    const filtered = sorted.filter(agr => {
        const currentStatus = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);

        const matchesSearch = !searchQuery ||
            (agr.agreementId && agr.agreementId.toLowerCase().includes(searchQuery)) ||
            (agr.propertyName && agr.propertyName.toLowerCase().includes(searchQuery)) ||
            (agr.tenantName && agr.tenantName.toLowerCase().includes(searchQuery)) ||
            (agr.propertyId && agr.propertyId.toLowerCase().includes(searchQuery)) ||
            (agr.tenantId && agr.tenantId.toLowerCase().includes(searchQuery));

        const matchesStatus = (statusValue === 'All') || (currentStatus === statusValue);

        return matchesSearch && matchesStatus;
    });

    if (countInfo) {
        countInfo.textContent = `Showing ${filtered.length} of ${agreements.length} agreements`;
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <h4>No Agreements Found</h4>
                    <p>No recent agreements match your search or filter criteria.</p>
                    <a href="agreements.html" class="btn btn-primary btn-sm">Create Agreement</a>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(agr => {
        const liveStatus = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);

        let badgeClass = 'badge-active';
        if (liveStatus === 'Expired') badgeClass = 'badge-expired';
        if (liveStatus === 'Pending') badgeClass = 'badge-pending';
        if (liveStatus === 'Terminated') badgeClass = 'badge-terminated';

        return `
            <tr>
                <td><strong>${agr.agreementId}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #1e3a8a;">${agr.propertyName}</div>
                    <small style="color: #64748b;">${agr.propertyId || ''}</small>
                </td>
                <td>
                    <div style="font-weight: 600;">${agr.tenantName}</div>
                    <small style="color: #64748b;">${agr.tenantId || ''}</small>
                </td>
                <td>
                    <div>${formatDate(agr.startDate)}</div>
                    <div style="font-size: 12px; color: #64748b;">to ${formatDate(agr.endDate)}</div>
                </td>
                <td>
                    <strong>${formatCurrency(agr.monthlyRent)}</strong>
                    <div style="font-size: 12px; color: #64748b;">(${agr.paymentFrequency || 'Monthly'})</div>
                </td>
                <td>${formatCurrency(agr.securityDeposit)}</td>
                <td><span class="badge ${badgeClass}">${liveStatus}</span></td>
                <td>
                    <div class="action-group">
                        <button type="button" class="btn btn-outline btn-sm" onclick="openAgreementModal('${agr.agreementId}')" title="View & Print Full Agreement Contract">
                            📄 View
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAgreementModal(agreementId) {
    const agreements = getAgreements();
    const agr = agreements.find(a => a.agreementId === agreementId);
    if (!agr) return;

    const properties = getProperties();
    const tenants = getTenants();

    const prop = properties.find(p => p.id === agr.propertyId) || {
        name: agr.propertyName,
        address: 'N/A',
        ownerName: 'Authorized Landlord',
        ownerContact: 'N/A',
        type: 'Residential Unit'
    };

    const tenant = tenants.find(t => t.id === agr.tenantId) || {
        name: agr.tenantName,
        email: 'N/A',
        phone: 'N/A',
        idType: 'Identity Document',
        idNumber: 'Verified',
        occupation: 'Resident',
        emergencyContact: 'N/A'
    };

    const status = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
    const modalArea = document.getElementById('modalPrintArea');
    const modal = document.getElementById('agreementModal');

    if (!modalArea || !modal) return;

    modalArea.innerHTML = `
        <div class="agreement-document">
            <div class="agreement-header">
                <h2>STANDARD RENTAL LEASE AGREEMENT</h2>
                <p>Contract Reference ID: <strong>${agr.agreementId}</strong> | Document Status: <strong>${status.toUpperCase()}</strong></p>
                <p>Executed on: ${formatDate(agr.startDate)}</p>
            </div>

            <div class="agreement-section">
                <p>This Rental Agreement is made and entered into this day between the Lessor (Owner) and Lessee (Tenant) outlined below:</p>
            </div>

            <div class="agreement-grid">
                <div>
                    <h4>FIRST PARTY (LANDLORD / LESSOR)</h4>
                    <p><strong>Name:</strong> ${prop.ownerName}</p>
                    <p><strong>Contact:</strong> ${prop.ownerContact}</p>
                    <p><strong>Capacity:</strong> Absolute Owner / Legal Lessor</p>
                </div>
                <div>
                    <h4>SECOND PARTY (TENANT / LESSEE)</h4>
                    <p><strong>Name:</strong> ${tenant.name}</p>
                    <p><strong>Identity Proof:</strong> ${tenant.idType} (${tenant.idNumber})</p>
                    <p><strong>Contact:</strong> ${tenant.phone} | ${tenant.email}</p>
                    <p><strong>Occupation:</strong> ${tenant.occupation}</p>
                </div>
            </div>

            <div class="agreement-section">
                <h4>DEMISED PREMISES (PROPERTY DETAILS)</h4>
                <p><strong>Property Name:</strong> ${prop.name} (${prop.type})</p>
                <p><strong>Full Address:</strong> ${prop.address}</p>
            </div>

            <div class="agreement-section">
                <h4>COMMERCIAL & FINANCIAL TERMS</h4>
                <p><strong>Tenancy Tenure:</strong> From <strong>${formatDate(agr.startDate)}</strong> to <strong>${formatDate(agr.endDate)}</strong></p>
                <p><strong>Monthly Rent:</strong> <strong>${formatCurrency(agr.monthlyRent)}</strong> (Payable ${agr.paymentFrequency || 'Monthly'})</p>
                <p><strong>Refundable Security Deposit:</strong> <strong>${formatCurrency(agr.securityDeposit)}</strong> (Held interest-free by Landlord)</p>
            </div>

            <div class="agreement-section agreement-clauses">
                <h4>COVENANTS & CONDITIONS</h4>
                <ol>
                    <li>${agr.terms || 'Standard 11-month rental term. Rent payable on or before the 5th day of every calendar month.'}</li>
                    <li>The Tenant covenants to pay rent on or before the due date agreed upon without unjustified deduction.</li>
                    <li>The premises shall be kept in clean, tenantable, and lawful condition by the Tenant without causing nuisance to neighbors.</li>
                    <li>The Landlord or their authorized agent shall have the right to inspect the premises during reasonable daylight hours with prior notice.</li>
                    <li>The security deposit shall be refunded upon peaceful handover of premises, subject to deductions for unpaid utilities or structural damages.</li>
                </ol>
            </div>

            <div class="signatures">
                <div class="signature-box">
                    Signature of Landlord<br>
                    <strong>(${prop.ownerName})</strong>
                </div>
                <div class="signature-box">
                    Signature of Tenant<br>
                    <strong>(${tenant.name})</strong>
                </div>
                <div class="signature-box">
                    Witness Signature<br>
                    <strong>(Authorized Broker / Agent)</strong>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('open');
}

function closeAgreementModal() {
    const modal = document.getElementById('agreementModal');
    if (modal) modal.classList.remove('open');
}
