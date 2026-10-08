/* ============================================================
   Rental Agreement Management System - Agreements Logic
   agreements.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initAgreementsPage();
});

function initAgreementsPage() {
    populatePropertyDropdown();
    populateTenantDropdown();
    setDefaultDates();
    renderAgreementsTable();

    // Check URL query parameters for pre-selected property or tenant
    const urlParams = new URLSearchParams(window.location.search);
    const propIdParam = urlParams.get('propId');
    const tenantIdParam = urlParams.get('tenantId');

    if (propIdParam) {
        const propSelect = document.getElementById('selectProperty');
        if (propSelect) {
            propSelect.value = propIdParam;
            handlePropertySelectionChange();
        }
    }

    if (tenantIdParam) {
        const tenantSelect = document.getElementById('selectTenant');
        if (tenantSelect) {
            tenantSelect.value = tenantIdParam;
        }
    }

    // Property dropdown change listener
    const propSelect = document.getElementById('selectProperty');
    if (propSelect) {
        propSelect.addEventListener('change', handlePropertySelectionChange);
    }

    // Form submit listener
    const form = document.getElementById('createAgreementForm');
    if (form) {
        form.addEventListener('submit', handleCreateAgreement);
    }

    // Search & Filter listeners
    const searchInput = document.getElementById('agreementSearch');
    const statusFilter = document.getElementById('agreementStatusFilter');
    const resetFilterBtn = document.getElementById('resetAgreementFiltersBtn');

    if (searchInput) {
        searchInput.addEventListener('input', renderAgreementsTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderAgreementsTable);
    }
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'All';
            renderAgreementsTable();
        });
    }

    // Modal close listeners
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

// ----------------- Default Dates & Options -----------------
function setDefaultDates() {
    const startInput = document.getElementById('agrStartDate');
    const endInput = document.getElementById('agrEndDate');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Standard 11-month agreement
    const elevenMonthsLater = new Date(today);
    elevenMonthsLater.setMonth(today.getMonth() + 11);
    const endStr = elevenMonthsLater.toISOString().split('T')[0];

    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = endStr;
}

function populatePropertyDropdown() {
    const propSelect = document.getElementById('selectProperty');
    if (!propSelect) return;

    const properties = getProperties();
    const currentVal = propSelect.value;

    propSelect.innerHTML = '<option value="">-- Choose a Property --</option>';

    properties.forEach(prop => {
        const option = document.createElement('option');
        option.value = prop.id;
        const statusTag = prop.status === 'Available' ? '✅ Available' : '⚠️ Currently Rented';
        option.textContent = `${prop.id} - ${prop.name} (${statusTag}) [${formatCurrency(prop.rent)}/mo]`;
        propSelect.appendChild(option);
    });

    if (currentVal) {
        propSelect.value = currentVal;
    }
}

function populateTenantDropdown() {
    const tenantSelect = document.getElementById('selectTenant');
    if (!tenantSelect) return;

    const tenants = getTenants();
    const currentVal = tenantSelect.value;

    tenantSelect.innerHTML = '<option value="">-- Choose a Registered Tenant --</option>';

    tenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = `${tenant.id} - ${tenant.name} (${tenant.occupation} | ${tenant.phone})`;
        tenantSelect.appendChild(option);
    });

    if (currentVal) {
        tenantSelect.value = currentVal;
    }
}

function handlePropertySelectionChange() {
    const propSelect = document.getElementById('selectProperty');
    const rentInput = document.getElementById('agrRent');
    const depositInput = document.getElementById('agrDeposit');
    const hint = document.getElementById('propertyStatusHint');

    const propId = propSelect.value;
    if (!propId) {
        if (hint) hint.textContent = '';
        return;
    }

    const properties = getProperties();
    const selectedProp = properties.find(p => p.id === propId);

    if (selectedProp) {
        if (rentInput) rentInput.value = selectedProp.rent;
        if (depositInput) depositInput.value = selectedProp.deposit;

        if (hint) {
            if (selectedProp.status === 'Available') {
                hint.textContent = `Property is currently available for lease.`;
                hint.style.color = '#15803d';
            } else {
                hint.textContent = `Note: Property is currently marked as Rented. Proceeding will create an additional/renewed agreement.`;
                hint.style.color = '#b45309';
            }
        }
    }
}

// ----------------- Create Agreement Handler -----------------
function handleCreateAgreement(e) {
    e.preventDefault();

    const propSelect = document.getElementById('selectProperty');
    const tenantSelect = document.getElementById('selectTenant');
    const startInput = document.getElementById('agrStartDate');
    const endInput = document.getElementById('agrEndDate');
    const rentInput = document.getElementById('agrRent');
    const depositInput = document.getElementById('agrDeposit');
    const freqInput = document.getElementById('agrFrequency');
    const termsInput = document.getElementById('agrTerms');

    const propertyId = propSelect.value;
    const tenantId = tenantSelect.value;
    const startDate = startInput.value;
    const endDate = endInput.value;
    const monthlyRent = parseFloat(rentInput.value);
    const securityDeposit = parseFloat(depositInput.value);
    const paymentFrequency = freqInput.value;
    const terms = termsInput.value.trim();

    // Validations
    if (!propertyId) {
        alert("Please select a property from the dropdown.");
        propSelect.focus();
        return;
    }

    if (!tenantId) {
        alert("Please select a tenant from the dropdown.");
        tenantSelect.focus();
        return;
    }

    if (!startDate) {
        alert("Please choose an agreement start date.");
        startInput.focus();
        return;
    }

    if (!endDate) {
        alert("Please choose an agreement end date.");
        endInput.focus();
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert("Agreement End Date must be after the Start Date.");
        endInput.focus();
        return;
    }

    if (isNaN(monthlyRent) || monthlyRent <= 0) {
        alert("Please enter a valid monthly rent amount greater than 0.");
        rentInput.focus();
        return;
    }

    if (isNaN(securityDeposit) || securityDeposit < 0) {
        alert("Please enter a valid security deposit amount.");
        depositInput.focus();
        return;
    }

    if (!terms) {
        alert("Please specify the terms and clauses of the agreement.");
        termsInput.focus();
        return;
    }

    const properties = getProperties();
    const tenants = getTenants();
    const agreements = getAgreements();

    const prop = properties.find(p => p.id === propertyId);
    const tenant = tenants.find(t => t.id === tenantId);

    // Generate unique Agreement ID
    let nextNum = 3001;
    agreements.forEach(a => {
        const match = a.agreementId && a.agreementId.match(/^AGR-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= nextNum) {
                nextNum = num + 1;
            }
        }
    });
    const newAgreementId = `AGR-${nextNum}`;

    const calculatedStatus = calculateAgreementStatus(startDate, endDate, 'Active');

    const newAgreement = {
        agreementId: newAgreementId,
        propertyId: propertyId,
        propertyName: prop ? prop.name : propertyId,
        tenantId: tenantId,
        tenantName: tenant ? tenant.name : tenantId,
        startDate: startDate,
        endDate: endDate,
        monthlyRent: monthlyRent,
        securityDeposit: securityDeposit,
        paymentFrequency: paymentFrequency,
        status: calculatedStatus,
        terms: terms
    };

    agreements.push(newAgreement);
    saveAgreements(agreements);

    // Auto-update property status to "Rented"
    if (prop) {
        prop.status = 'Rented';
        saveProperties(properties);
    }

    showToast(`Rental Agreement ${newAgreementId} created successfully!`, "success");

    // Reset Form and reset defaults
    e.target.reset();
    setDefaultDates();
    populatePropertyDropdown();
    document.getElementById('propertyStatusHint').textContent = '';

    // Re-render table
    renderAgreementsTable();
}

// ----------------- Render Agreements Table -----------------
function renderAgreementsTable() {
    const tableBody = document.getElementById('agreementsTableBody');
    const countInfo = document.getElementById('agreementCountInfo');
    if (!tableBody) return;

    const agreements = getAgreements();
    const searchQuery = (document.getElementById('agreementSearch')?.value || '').trim().toLowerCase();
    const statusValue = document.getElementById('agreementStatusFilter')?.value || 'All';

    const filtered = agreements.filter(agr => {
        const currentStatus = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);

        // Search match
        const matchesSearch = !searchQuery ||
            (agr.agreementId && agr.agreementId.toLowerCase().includes(searchQuery)) ||
            (agr.propertyName && agr.propertyName.toLowerCase().includes(searchQuery)) ||
            (agr.tenantName && agr.tenantName.toLowerCase().includes(searchQuery)) ||
            (agr.propertyId && agr.propertyId.toLowerCase().includes(searchQuery)) ||
            (agr.tenantId && agr.tenantId.toLowerCase().includes(searchQuery));

        // Status match
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
                    <p>No rental agreements match your search or filter criteria. Create a new agreement using the form above.</p>
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

        const canTerminate = (liveStatus === 'Active' || liveStatus === 'Pending');

        return `
            <tr>
                <td><strong>${agr.agreementId}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #1e3a8a;">${agr.propertyName}</div>
                    <small style="color: #64748b;">${agr.propertyId}</small>
                </td>
                <td>
                    <div style="font-weight: 600;">${agr.tenantName}</div>
                    <small style="color: #64748b;">${agr.tenantId}</small>
                </td>
                <td>
                    <div>${formatDate(agr.startDate)}</div>
                    <div style="font-size: 12px; color: #64748b;">to ${formatDate(agr.endDate)}</div>
                </td>
                <td>
                    <strong>${formatCurrency(agr.monthlyRent)}</strong>
                    <div style="font-size: 12px; color: #64748b;">(${agr.paymentFrequency})</div>
                </td>
                <td>${formatCurrency(agr.securityDeposit)}</td>
                <td>
                    <span class="badge ${badgeClass}">${liveStatus}</span>
                </td>
                <td>
                    <div class="action-group">
                        <button type="button" class="btn btn-outline btn-sm" onclick="openAgreementModal('${agr.agreementId}')" title="View & Print Full Agreement Contract">
                            📄 View
                        </button>
                        ${canTerminate ? `
                            <button type="button" class="btn btn-secondary btn-sm" onclick="terminateAgreement('${agr.agreementId}')" title="Terminate lease and release property">
                                ⏹️ End
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-danger btn-sm" onclick="deleteAgreement('${agr.agreementId}')" title="Delete record">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------- Terminate Agreement -----------------
function terminateAgreement(agreementId) {
    const agreements = getAgreements();
    const index = agreements.findIndex(a => a.agreementId === agreementId);
    if (index === -1) return;

    const agr = agreements[index];
    if (confirm(`Are you sure you want to terminate Agreement ${agr.agreementId} between ${agr.propertyName} and ${agr.tenantName}? The property will be marked as Available.`)) {
        // Update agreement status
        agreements[index].status = 'Terminated';
        saveAgreements(agreements);

        // Release property back to Available
        const properties = getProperties();
        const propIndex = properties.findIndex(p => p.id === agr.propertyId);
        if (propIndex !== -1) {
            properties[propIndex].status = 'Available';
            saveProperties(properties);
        }

        showToast(`Agreement ${agreementId} terminated. Property released to Available.`, "info");
        populatePropertyDropdown();
        renderAgreementsTable();
    }
}

// ----------------- Delete Agreement -----------------
function deleteAgreement(agreementId) {
    if (confirm(`Are you sure you want to permanently delete agreement ${agreementId}? This action cannot be undone.`)) {
        const agreements = getAgreements();
        const target = agreements.find(a => a.agreementId === agreementId);
        const updated = agreements.filter(a => a.agreementId !== agreementId);
        saveAgreements(updated);

        // If target was active, ask if user wants to make property available
        if (target && target.status === 'Active') {
            const properties = getProperties();
            const propIndex = properties.findIndex(p => p.id === target.propertyId);
            if (propIndex !== -1) {
                properties[propIndex].status = 'Available';
                saveProperties(properties);
            }
        }

        showToast(`Agreement ${agreementId} deleted.`, "warning");
        populatePropertyDropdown();
        renderAgreementsTable();
    }
}

// ----------------- Printable Agreement Modal -----------------
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
                <p><strong>Monthly Rent:</strong> <strong>${formatCurrency(agr.monthlyRent)}</strong> (Payable ${agr.paymentFrequency})</p>
                <p><strong>Refundable Security Deposit:</strong> <strong>${formatCurrency(agr.securityDeposit)}</strong> (Held interest-free by Landlord)</p>
            </div>

            <div class="agreement-section agreement-clauses">
                <h4>COVENANTS & CONDITIONS</h4>
                <ol>
                    <li>${agr.terms}</li>
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
