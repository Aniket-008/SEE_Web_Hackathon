/* ============================================================
   Rental Agreement Management System - Shared Helpers
   app.js
   ============================================================ */

// Storage keys
const STORAGE_KEYS = {
    PROPERTIES: 'rental_properties',
    TENANTS: 'rental_tenants',
    AGREEMENTS: 'rental_agreements'
};

// ----------------- Default Seed Data -----------------
const SAMPLE_PROPERTIES = [
    {
        id: "PROP-101",
        name: "Greenfield Residency #402",
        type: "Apartment",
        address: "4th Floor, 80ft Road, Koramangala, Bengaluru",
        rent: 28000,
        deposit: 100000,
        ownerName: "Rajesh Sharma",
        ownerContact: "9876543210",
        status: "Rented"
    },
    {
        id: "PROP-102",
        name: "Sunrise Villa B-12",
        type: "Villa",
        address: "Palm Meadows, Phase 2, Whitefield, Bengaluru",
        rent: 55000,
        deposit: 250000,
        ownerName: "Anita Verma",
        ownerContact: "9812345678",
        status: "Available"
    },
    {
        id: "PROP-103",
        name: "Metro Arcade Shop 04",
        type: "Commercial Shop",
        address: "Ground Floor, Commercial Street, Shivaji Nagar, Bengaluru",
        rent: 32000,
        deposit: 150000,
        ownerName: "Suresh Gupta",
        ownerContact: "9845012345",
        status: "Rented"
    },
    {
        id: "PROP-104",
        name: "Maple Studio Suite 2A",
        type: "Studio",
        address: "Near Metro Station, Indiranagar, Bengaluru",
        rent: 18000,
        deposit: 60000,
        ownerName: "Anita Verma",
        ownerContact: "9812345678",
        status: "Available"
    }
];

const SAMPLE_TENANTS = [
    {
        id: "TEN-201",
        name: "Arjun Mehta",
        email: "arjun.mehta@example.com",
        phone: "9871122334",
        idType: "Aadhaar Card",
        idNumber: "5412-8976-1234",
        occupation: "Software Engineer",
        emergencyContact: "9871199887"
    },
    {
        id: "TEN-202",
        name: "Priya Nair",
        email: "priya.nair@example.com",
        phone: "9822334455",
        idType: "PAN Card",
        idNumber: "ABCPN1234F",
        occupation: "Product Manager",
        emergencyContact: "9822339900"
    },
    {
        id: "TEN-203",
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        phone: "9833445566",
        idType: "Passport",
        idNumber: "Z9876543",
        occupation: "Chartered Accountant",
        emergencyContact: "9833441122"
    }
];

const SAMPLE_AGREEMENTS = [
    {
        agreementId: "AGR-3001",
        propertyId: "PROP-101",
        propertyName: "Greenfield Residency #402",
        tenantId: "TEN-201",
        tenantName: "Arjun Mehta",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        monthlyRent: 28000,
        securityDeposit: 100000,
        paymentFrequency: "Monthly",
        status: "Active",
        terms: "11-month lock-in agreement. Maintenance fees included. Rent payable on or before 5th of each calendar month. 1 month notice period required before vacating."
    },
    {
        agreementId: "AGR-3002",
        propertyId: "PROP-103",
        propertyName: "Metro Arcade Shop 04",
        tenantId: "TEN-202",
        tenantName: "Priya Nair",
        startDate: "2026-02-15",
        endDate: "2027-02-14",
        monthlyRent: 32000,
        securityDeposit: 150000,
        paymentFrequency: "Monthly",
        status: "Active",
        terms: "Commercial tenancy agreement. Tenant responsible for electricity and water charges. No structural alterations allowed without written landlord approval."
    },
    {
        agreementId: "AGR-3000",
        propertyId: "PROP-102",
        propertyName: "Sunrise Villa B-12",
        tenantId: "TEN-203",
        tenantName: "Vikram Singh",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        monthlyRent: 50000,
        securityDeposit: 200000,
        paymentFrequency: "Monthly",
        status: "Expired",
        terms: "Prior 1-year tenancy agreement expired in 2025. Security deposit settled."
    }
];

// ----------------- Initialization & Storage Access -----------------
function initSystemStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
        if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
            localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(SAMPLE_PROPERTIES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
            localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(SAMPLE_TENANTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.AGREEMENTS)) {
            localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(SAMPLE_AGREEMENTS));
        }
    } catch (e) {
        console.error("Storage initialization error:", e);
    }
}

// Ensure storage is initialized as soon as app.js is loaded
initSystemStorage();

// Property storage helpers
function getProperties() {
    if (typeof localStorage === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPERTIES)) || [];
    } catch (e) {
        console.error("Error reading properties from storage", e);
        return [];
    }
}

function saveProperties(properties) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
}

// Tenant storage helpers
function getTenants() {
    if (typeof localStorage === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS)) || [];
    } catch (e) {
        console.error("Error reading tenants from storage", e);
        return [];
    }
}

function saveTenants(tenants) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
}

// Agreement storage helpers
function getAgreements() {
    if (typeof localStorage === 'undefined') return [];
    try {
        const agreements = JSON.parse(localStorage.getItem(STORAGE_KEYS.AGREEMENTS)) || [];
        // Auto-refresh dynamic status based on current date unless terminated
        return agreements.map(agr => {
            const currentStatus = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
            return { ...agr, status: currentStatus };
        });
    } catch (e) {
        console.error("Error reading agreements from storage", e);
        return [];
    }
}

function saveAgreements(agreements) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
}

// ----------------- Status Calculation -----------------
/**
 * Calculates current real-time status of an agreement
 * @param {string} startDateStr - YYYY-MM-DD
 * @param {string} endDateStr - YYYY-MM-DD
 * @param {string} manualStatus - Optional manual status flag like "Terminated"
 * @returns {string} "Active" | "Expired" | "Pending" | "Terminated"
 */
function calculateAgreementStatus(startDateStr, endDateStr, manualStatus) {
    if (manualStatus === 'Terminated') {
        return 'Terminated';
    }

    if (!startDateStr || !endDateStr) {
        return manualStatus || 'Pending';
    }

    // Get current date string formatted as YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    if (today < start) {
        return 'Pending';
    } else if (today > end) {
        return 'Expired';
    } else {
        return 'Active';
    }
}

// ----------------- Formatting Helpers -----------------
function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

// ----------------- Validation Helpers -----------------
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(String(email).trim());
}

function isValidPhone(phone) {
    const phonePattern = /^[0-9]{10}$/;
    return phonePattern.test(String(phone).trim().replace(/[\s-]/g, ''));
}

// ----------------- Notification / Toast UI -----------------
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ----------------- Reset & Data Management -----------------
function resetSampleData() {
    if (confirm("Are you sure you want to restore the default sample data? Any recent custom entries will be reset.")) {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(SAMPLE_PROPERTIES));
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(SAMPLE_TENANTS));
        localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(SAMPLE_AGREEMENTS));
        showToast("Sample data restored successfully!", "success");
        setTimeout(() => window.location.reload(), 600);
    }
}

function clearAllSystemData() {
    if (confirm("WARNING: This will clear all properties, tenants, and agreements from storage. Proceed?")) {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify([]));
        showToast("All data cleared successfully.", "warning");
        setTimeout(() => window.location.reload(), 600);
    }
}

// ----------------- Dashboard Controller -----------------
function initDashboard() {
    const properties = getProperties();
    const tenants = getTenants();
    const agreements = getAgreements();

    // 1. Calculate KPI Metrics
    const totalProps = properties.length;
    const rentedProps = properties.filter(p => p.status === 'Rented').length;
    const availableProps = properties.filter(p => p.status === 'Available').length;
    const totalTenants = tenants.length;

    let activeAgreementsCount = 0;
    let expiredAgreementsCount = 0;
    let pendingAgreementsCount = 0;
    let totalMonthlyRevenue = 0;

    agreements.forEach(agr => {
        const st = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
        if (st === 'Active') {
            activeAgreementsCount++;
            totalMonthlyRevenue += Number(agr.monthlyRent) || 0;
        } else if (st === 'Expired') {
            expiredAgreementsCount++;
        } else if (st === 'Pending') {
            pendingAgreementsCount++;
        }
    });

    // 2. Update Metric DOM elements if present
    const elTotalProps = document.getElementById('statTotalProps');
    if (elTotalProps) elTotalProps.textContent = totalProps;

    const elAvailableProps = document.getElementById('statAvailableProps');
    if (elAvailableProps) elAvailableProps.textContent = `${availableProps} Available / ${rentedProps} Rented`;

    const elTotalTenants = document.getElementById('statTotalTenants');
    if (elTotalTenants) elTotalTenants.textContent = totalTenants;

    const elActiveAgreements = document.getElementById('statActiveAgreements');
    if (elActiveAgreements) elActiveAgreements.textContent = activeAgreementsCount;

    // Expired card: short number in the big slot, detail in the small line
    const elExpiredAgreements = document.getElementById('statExpiredAgreements');
    if (elExpiredAgreements) elExpiredAgreements.textContent = expiredAgreementsCount;

    const elExpiredSub = document.getElementById('statExpiredSub');
    if (elExpiredSub) elExpiredSub.textContent = `Expired · ${pendingAgreementsCount} Pending`;

    const elMonthlyRevenue = document.getElementById('statMonthlyRevenue');
    if (elMonthlyRevenue) elMonthlyRevenue.textContent = formatCurrency(totalMonthlyRevenue);

    // 3. Render Recent Agreements Table
    const recentTableBody = document.getElementById('recentAgreementsBody');
    if (recentTableBody) {
        if (agreements.length === 0) {
            recentTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <h4>No Agreements Found</h4>
                        <p>No rental agreements recorded yet. Create one from the Agreements page.</p>
                        <a href="agreements.html" class="btn btn-primary btn-sm">Create Agreement</a>
                    </td>
                </tr>
            `;
        } else {
            // Sort recent agreements (latest first)
            const sortedAgreements = [...agreements].reverse().slice(0, 5);
            recentTableBody.innerHTML = sortedAgreements.map(agr => {
                const status = calculateAgreementStatus(agr.startDate, agr.endDate, agr.status);
                let badgeClass = 'badge-active';
                if (status === 'Expired') badgeClass = 'badge-expired';
                if (status === 'Pending') badgeClass = 'badge-pending';
                if (status === 'Terminated') badgeClass = 'badge-terminated';

                return `
                    <tr>
                        <td><strong>${agr.agreementId}</strong></td>
                        <td>${agr.propertyName}</td>
                        <td>${agr.tenantName}</td>
                        <td>${formatDate(agr.startDate)} - ${formatDate(agr.endDate)}</td>
                        <td><strong>${formatCurrency(agr.monthlyRent)}</strong>/mo</td>
                        <td><span class="badge ${badgeClass}">${status}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 4. Render Available Properties Quick List
    const availablePropsBody = document.getElementById('availablePropsBody');
    if (availablePropsBody) {
        const availableList = properties.filter(p => p.status === 'Available');
        if (availableList.length === 0) {
            availablePropsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-state-icon">🏡</div>
                        <h4>All Properties Occupied</h4>
                        <p>No vacant properties available right now.</p>
                        <a href="properties.html" class="btn btn-primary btn-sm">Add New Property</a>
                    </td>
                </tr>
            `;
        } else {
            availablePropsBody.innerHTML = availableList.slice(0, 4).map(prop => `
                <tr>
                    <td><strong>${prop.id}</strong></td>
                    <td>${prop.name} <span style="color:#5b7a72; font-size:13px;">(${prop.type})</span></td>
                    <td>${prop.address}</td>
                    <td>${formatCurrency(prop.rent)}</td>
                    <td>
                        <a href="agreements.html?propId=${encodeURIComponent(prop.id)}" class="btn btn-primary btn-sm">Create Lease</a>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Auto-initialize dashboard if on dashboard page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('statTotalProps')) {
        initDashboard();
    }
});
