/* ============================================================
   Rental Agreement Management System - Properties Logic
   properties.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPropertiesPage();
});

function initPropertiesPage() {
    renderPropertiesTable();

    // Event listener for adding property
    const form = document.getElementById('addPropertyForm');
    if (form) {
        form.addEventListener('submit', handleAddProperty);
    }

    // Event listeners for search & filters
    const searchInput = document.getElementById('propertySearch');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFilterBtn = document.getElementById('resetFilterBtn');

    if (searchInput) {
        searchInput.addEventListener('input', renderPropertiesTable);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', renderPropertiesTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderPropertiesTable);
    }
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = 'All';
            if (statusFilter) statusFilter.value = 'All';
            renderPropertiesTable();
        });
    }
}

// ----------------- Add Property Handler -----------------
function handleAddProperty(e) {
    e.preventDefault();

    const nameInput = document.getElementById('propName');
    const typeInput = document.getElementById('propType');
    const rentInput = document.getElementById('propRent');
    const depositInput = document.getElementById('propDeposit');
    const ownerNameInput = document.getElementById('ownerName');
    const ownerContactInput = document.getElementById('ownerContact');
    const statusInput = document.getElementById('propStatus');
    const addressInput = document.getElementById('propAddress');

    const name = nameInput.value.trim();
    const type = typeInput.value.trim();
    const rent = parseFloat(rentInput.value);
    const deposit = parseFloat(depositInput.value);
    const ownerName = ownerNameInput.value.trim();
    const ownerContact = ownerContactInput.value.trim();
    const status = statusInput.value.trim();
    const address = addressInput.value.trim();

    // Validations
    if (!name) {
        alert("Please enter the property name / unit.");
        nameInput.focus();
        return;
    }

    if (!type) {
        alert("Please select the property type.");
        typeInput.focus();
        return;
    }

    if (isNaN(rent) || rent <= 0) {
        alert("Please enter a valid monthly rent amount greater than 0.");
        rentInput.focus();
        return;
    }

    if (isNaN(deposit) || deposit < 0) {
        alert("Please enter a valid security deposit amount (0 or more).");
        depositInput.focus();
        return;
    }

    if (!ownerName) {
        alert("Please enter the property owner's name.");
        ownerNameInput.focus();
        return;
    }

    if (!isValidPhone(ownerContact)) {
        alert("Please enter a valid 10-digit mobile number for the owner.");
        ownerContactInput.focus();
        return;
    }

    if (!address) {
        alert("Please enter the complete property address.");
        addressInput.focus();
        return;
    }

    // Generate Unique Property ID
    const properties = getProperties();
    let nextNum = 101;
    properties.forEach(p => {
        const match = p.id && p.id.match(/^PROP-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= nextNum) {
                nextNum = num + 1;
            }
        }
    });
    const newId = `PROP-${nextNum}`;

    const newProperty = {
        id: newId,
        name: name,
        type: type,
        address: address,
        rent: rent,
        deposit: deposit,
        ownerName: ownerName,
        ownerContact: ownerContact,
        status: status
    };

    properties.push(newProperty);
    saveProperties(properties);

    showToast(`Property "${name}" (${newId}) added successfully!`, "success");

    // Reset Form
    e.target.reset();

    // Re-render table
    renderPropertiesTable();
}

// ----------------- Render Properties Table -----------------
function renderPropertiesTable() {
    const tableBody = document.getElementById('propertiesTableBody');
    const countInfo = document.getElementById('propertyCountInfo');
    if (!tableBody) return;

    const properties = getProperties();
    const searchQuery = (document.getElementById('propertySearch')?.value || '').trim().toLowerCase();
    const typeValue = document.getElementById('typeFilter')?.value || 'All';
    const statusValue = document.getElementById('statusFilter')?.value || 'All';

    // Filter properties
    const filtered = properties.filter(prop => {
        // Search filter
        const matchesSearch = !searchQuery ||
            (prop.id && prop.id.toLowerCase().includes(searchQuery)) ||
            (prop.name && prop.name.toLowerCase().includes(searchQuery)) ||
            (prop.address && prop.address.toLowerCase().includes(searchQuery)) ||
            (prop.ownerName && prop.ownerName.toLowerCase().includes(searchQuery)) ||
            (prop.ownerContact && prop.ownerContact.toLowerCase().includes(searchQuery));

        // Type filter
        const matchesType = (typeValue === 'All') || (prop.type === typeValue);

        // Status filter
        const matchesStatus = (statusValue === 'All') || (prop.status === statusValue);

        return matchesSearch && matchesType && matchesStatus;
    });

    if (countInfo) {
        countInfo.textContent = `Showing ${filtered.length} of ${properties.length} properties`;
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">🏠</div>
                    <h4>No Properties Found</h4>
                    <p>No properties match your current search or filter criteria. Try resetting filters or add a new property.</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(prop => {
        const isRented = prop.status === 'Rented';
        const badgeClass = isRented ? 'badge-rented' : 'badge-available';
        const toggleBtnText = isRented ? 'Mark Available' : 'Mark Rented';
        const toggleBtnClass = isRented ? 'btn-outline' : 'btn-secondary';

        return `
            <tr>
                <td><strong>${prop.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: #1e3a8a;">${prop.name}</div>
                    <span style="font-size: 12px; color: #64748b;">${prop.type}</span>
                </td>
                <td style="max-width: 250px; font-size: 13px;">${prop.address}</td>
                <td><strong>${formatCurrency(prop.rent)}</strong></td>
                <td>${formatCurrency(prop.deposit)}</td>
                <td>
                    <div>${prop.ownerName}</div>
                    <small style="color: #64748b;">📞 ${prop.ownerContact}</small>
                </td>
                <td>
                    <span class="badge ${badgeClass}">${prop.status}</span>
                </td>
                <td>
                    <div class="action-group">
                        <button type="button" class="btn ${toggleBtnClass} btn-sm" onclick="togglePropertyStatus('${prop.id}')" title="Change occupancy status">
                            ${toggleBtnText}
                        </button>
                        ${!isRented ? `
                            <a href="agreements.html?propId=${encodeURIComponent(prop.id)}" class="btn btn-primary btn-sm" title="Create a new rental agreement for this property">
                                Lease
                            </a>
                        ` : ''}
                        <button type="button" class="btn btn-danger btn-sm" onclick="deleteProperty('${prop.id}')" title="Delete property">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------- Toggle Status -----------------
function togglePropertyStatus(propertyId) {
    const properties = getProperties();
    const index = properties.findIndex(p => p.id === propertyId);
    if (index === -1) return;

    const currentStatus = properties[index].status;
    const newStatus = (currentStatus === 'Available') ? 'Rented' : 'Available';

    properties[index].status = newStatus;
    saveProperties(properties);

    showToast(`Property ${propertyId} marked as ${newStatus}!`, "info");
    renderPropertiesTable();
}

// ----------------- Delete Property -----------------
function deleteProperty(propertyId) {
    const properties = getProperties();
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    // Check if property is attached to an active agreement
    const agreements = getAgreements();
    const activeAgreements = agreements.filter(agr => {
        const st = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
        return agr.propertyId === propertyId && st === 'Active';
    });

    if (activeAgreements.length > 0) {
        alert(`Cannot delete "${property.name}" because it currently has an Active Rental Agreement (${activeAgreements[0].agreementId}). Please terminate or delete the agreement first.`);
        return;
    }

    if (confirm(`Are you sure you want to delete property "${property.name}" (${property.id})?`)) {
        const updated = properties.filter(p => p.id !== propertyId);
        saveProperties(updated);
        showToast(`Property "${property.name}" deleted.`, "warning");
        renderPropertiesTable();
    }
}
