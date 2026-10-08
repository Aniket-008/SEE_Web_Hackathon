/* ============================================================
   Rental Agreement Management System - Tenants Logic
   tenants.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initTenantsPage();
});

function initTenantsPage() {
    renderTenantsTable();

    // Form submit listener
    const form = document.getElementById('addTenantForm');
    if (form) {
        form.addEventListener('submit', handleAddTenant);
    }

    // Search input listener
    const searchInput = document.getElementById('tenantSearch');
    const resetSearchBtn = document.getElementById('resetTenantSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', renderTenantsTable);
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            renderTenantsTable();
        });
    }
}

// ----------------- Add Tenant Handler -----------------
function handleAddTenant(e) {
    e.preventDefault();

    const nameInput = document.getElementById('tenantName');
    const emailInput = document.getElementById('tenantEmail');
    const phoneInput = document.getElementById('tenantPhone');
    const idTypeInput = document.getElementById('tenantIdType');
    const idNumberInput = document.getElementById('tenantIdNumber');
    const occupationInput = document.getElementById('tenantOccupation');
    const emergencyInput = document.getElementById('tenantEmergency');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const idType = idTypeInput.value.trim();
    const idNumber = idNumberInput.value.trim();
    const occupation = occupationInput.value.trim();
    const emergencyContact = emergencyInput.value.trim();

    // Validations
    if (!name) {
        alert("Please enter the tenant's full name.");
        nameInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address (e.g., user@domain.com).");
        emailInput.focus();
        return;
    }

    if (!isValidPhone(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        phoneInput.focus();
        return;
    }

    if (!idType) {
        alert("Please select the Government ID type.");
        idTypeInput.focus();
        return;
    }

    if (!idNumber) {
        alert("Please enter the ID document number.");
        idNumberInput.focus();
        return;
    }

    if (!occupation) {
        alert("Please enter the tenant's occupation.");
        occupationInput.focus();
        return;
    }

    if (!isValidPhone(emergencyContact)) {
        alert("Please enter a valid 10-digit emergency contact phone number.");
        emergencyInput.focus();
        return;
    }

    // Generate unique Tenant ID
    const tenants = getTenants();
    let nextNum = 201;
    tenants.forEach(t => {
        const match = t.id && t.id.match(/^TEN-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= nextNum) {
                nextNum = num + 1;
            }
        }
    });
    const newId = `TEN-${nextNum}`;

    const newTenant = {
        id: newId,
        name: name,
        email: email,
        phone: phone,
        idType: idType,
        idNumber: idNumber,
        occupation: occupation,
        emergencyContact: emergencyContact
    };

    tenants.push(newTenant);
    saveTenants(tenants);

    showToast(`Tenant "${name}" (${newId}) registered successfully!`, "success");

    e.target.reset();
    renderTenantsTable();
}

// ----------------- Render Tenants Table -----------------
function renderTenantsTable() {
    const tableBody = document.getElementById('tenantsTableBody');
    const countInfo = document.getElementById('tenantCountInfo');
    if (!tableBody) return;

    const tenants = getTenants();
    const agreements = getAgreements();
    const searchQuery = (document.getElementById('tenantSearch')?.value || '').trim().toLowerCase();

    // Filter by search query
    const filtered = tenants.filter(t => {
        if (!searchQuery) return true;
        return (t.id && t.id.toLowerCase().includes(searchQuery)) ||
               (t.name && t.name.toLowerCase().includes(searchQuery)) ||
               (t.email && t.email.toLowerCase().includes(searchQuery)) ||
               (t.phone && t.phone.toLowerCase().includes(searchQuery)) ||
               (t.idNumber && t.idNumber.toLowerCase().includes(searchQuery)) ||
               (t.occupation && t.occupation.toLowerCase().includes(searchQuery));
    });

    if (countInfo) {
        countInfo.textContent = `Showing ${filtered.length} of ${tenants.length} tenants`;
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h4>No Tenants Found</h4>
                    <p>No tenant records match your search criteria. You can register a new tenant above.</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(tenant => {
        // Find active agreement for this tenant
        const activeAgr = agreements.find(a => {
            const st = calculateAgreementStatus(a.startDate, a.endDate, a.status);
            return a.tenantId === tenant.id && st === 'Active';
        });

        let agreementBadge = `<span class="badge badge-terminated">No Active Lease</span>`;
        if (activeAgr) {
            agreementBadge = `<span class="badge badge-active" title="Agreement: ${activeAgr.agreementId}">Active: ${activeAgr.propertyName}</span>`;
        }

        return `
            <tr>
                <td><strong>${tenant.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #1e3a8a;">${tenant.name}</div>
                </td>
                <td>
                    <div>✉️ ${tenant.email}</div>
                    <small style="color: #64748b;">📞 ${tenant.phone}</small>
                </td>
                <td>
                    <div style="font-weight: 500;">${tenant.idType}</div>
                    <small style="font-family: monospace; color: #475569;">${tenant.idNumber}</small>
                </td>
                <td>${tenant.occupation}</td>
                <td>📞 ${tenant.emergencyContact}</td>
                <td>${agreementBadge}</td>
                <td>
                    <div class="action-group">
                        <a href="agreements.html?tenantId=${encodeURIComponent(tenant.id)}" class="btn btn-primary btn-sm" title="Create a new agreement for this tenant">
                            Lease
                        </a>
                        <button type="button" class="btn btn-danger btn-sm" onclick="deleteTenant('${tenant.id}')" title="Delete tenant">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------- Delete Tenant -----------------
function deleteTenant(tenantId) {
    const tenants = getTenants();
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Check if tenant is attached to an active agreement
    const agreements = getAgreements();
    const activeAgreements = agreements.filter(agr => {
        const st = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
        return agr.tenantId === tenantId && st === 'Active';
    });

    if (activeAgreements.length > 0) {
        alert(`Cannot delete tenant "${tenant.name}" because they are currently assigned to an Active Agreement (${activeAgreements[0].agreementId} - ${activeAgreements[0].propertyName}). Please terminate or delete the agreement first.`);
        return;
    }

    if (confirm(`Are you sure you want to delete tenant "${tenant.name}" (${tenant.id})?`)) {
        const updated = tenants.filter(t => t.id !== tenantId);
        saveTenants(updated);
        showToast(`Tenant "${tenant.name}" deleted.`, "warning");
        renderTenantsTable();
    }
}
