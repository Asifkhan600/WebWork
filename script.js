// Free API endpoints for university data
const API_ENDPOINTS = {
    primary: 'http://universities.hipolabs.com/search',
    backup: 'https://api.jsonbin.io/v3/b/65b3d7e51f5677401f1e0a9a'
};

// DOM Elements
const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const provinceFilter = document.getElementById('provinceFilter');
const typeFilter = document.getElementById('typeFilter');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const loading = document.getElementById('loading');
const resultsHeader = document.getElementById('resultsHeader');
const filtersSection = document.getElementById('filtersSection');
const resultsTitle = document.getElementById('resultsTitle');
const countryName = document.getElementById('countryName');
const collegeCount = document.getElementById('collegeCount');
const collegesContainer = document.getElementById('collegesContainer');
const welcomeState = document.getElementById('welcomeState');
const noResults = document.getElementById('noResults');

// Current state
let currentCountry = '';
let currentColleges = [];
let currentFilters = {
    province: '',
    type: ''
};

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
provinceFilter.addEventListener('change', handleFilterChange);
typeFilter.addEventListener('change', handleFilterChange);
resetBtn.addEventListener('click', resetFilters);
exportBtn.addEventListener('click', exportResults);

// Quick country buttons
document.querySelectorAll('.country-tag').forEach(button => {
    button.addEventListener('click', (e) => {
        const country = e.target.getAttribute('data-country');
        countryInput.value = country;
        handleSearch();
    });
});

// Search function
async function handleSearch() {
    const searchTerm = countryInput.value.trim();
    
    if (!searchTerm) {
        showNotification('Please enter a country name', 'error');
        return;
    }
    
    showLoading(true);
    hideWelcomeState();
    hideNoResults();
    
    try {
        const colleges = await fetchColleges(searchTerm);
        currentCountry = searchTerm;
        currentColleges = colleges;
        
        if (colleges.length > 0) {
            displayResults(colleges);
            populateFilters(colleges);
            showFiltersSection();
            showResultsHeader();
            showNotification(`Found ${colleges.length} institutions in ${searchTerm}`, 'success');
        } else {
            showNoResults();
            hideFiltersSection();
            hideResultsHeader();
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Failed to fetch data. Please try again.', 'error');
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Fetch colleges from API
async function fetchColleges(country) {
    try {
        // Try primary API first
        const response = await fetch(`${API_ENDPOINTS.primary}?country=${encodeURIComponent(country)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to our format
        return data.map(institution => ({
            name: institution.name,
            province: institution['state-province'] || 'Not specified',
            country: institution.country,
            website: institution.web_pages?.[0] || '#',
            type: 'University', // Default type
            domains: institution.domains || []
        }));
    } catch (error) {
        console.error('Primary API failed:', error);
        
        // Fallback to backup data for demo purposes
        return getBackupData(country);
    }
}

// Backup data for demo
function getBackupData(country) {
    const backupData = {
        'Pakistan': [
            {
                name: 'University of the Punjab',
                province: 'Punjab',
                country: 'Pakistan',
                website: 'https://pu.edu.pk',
                type: 'University',
                established: 1882
            },
            {
                name: 'University of Karachi',
                province: 'Sindh',
                country: 'Pakistan',
                website: 'https://uok.edu.pk',
                type: 'University',
                established: 1951
            },
            {
                name: 'Quaid-i-Azam University',
                province: 'Islamabad',
                country: 'Pakistan',
                website: 'https://qau.edu.pk',
                type: 'University',
                established: 1967
            },
            {
                name: 'Lahore University of Management Sciences',
                province: 'Punjab',
                country: 'Pakistan',
                website: 'https://lums.edu.pk',
                type: 'University',
                established: 1984
            },
            {
                name: 'National University of Sciences and Technology',
                province: 'Islamabad',
                country: 'Pakistan',
                website: 'https://nust.edu.pk',
                type: 'University',
                established: 1991
            },
            {
                name: 'University of Engineering and Technology',
                province: 'Punjab',
                country: 'Pakistan',
                website: 'https://uet.edu.pk',
                type: 'University',
                established: 1921
            },
            {
                name: 'Aga Khan University',
                province: 'Sindh',
                country: 'Pakistan',
                website: 'https://aku.edu',
                type: 'University',
                established: 1983
            }
        ],
        'United States': [
            {
                name: 'Harvard University',
                province: 'Massachusetts',
                country: 'United States',
                website: 'https://harvard.edu',
                type: 'University',
                established: 1636
            },
            {
                name: 'Stanford University',
                province: 'California',
                country: 'United States',
                website: 'https://stanford.edu',
                type: 'University',
                established: 1885
            }
        ]
    };
    
    return backupData[country] || [];
}

// Display results
function displayResults(colleges) {
    collegesContainer.innerHTML = '';
    
    const filteredColleges = applyFilters(colleges);
    
    if (filteredColleges.length === 0) {
        showNoResults();
        return;
    }
    
    filteredColleges.forEach(college => {
        const collegeCard = createCollegeCard(college);
        collegesContainer.appendChild(collegeCard);
    });
    
    collegeCount.textContent = filteredColleges.length.toString();
}

// Create college card element
function createCollegeCard(college) {
    const card = document.createElement('div');
    card.className = 'college-card';
    
    card.innerHTML = `
        <div class="college-header">
            <h3 class="college-name">${college.name}</h3>
            <span class="college-type">${college.type}</span>
        </div>
        <div class="college-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${college.province}, ${college.country}</span>
        </div>
        <div class="college-details">
            ${college.established ? `
                <div class="detail-item">
                    <span class="detail-label">Established:</span>
                    <span class="detail-value">${college.established}</span>
                </div>
            ` : ''}
            ${college.domains && college.domains.length > 0 ? `
                <div class="detail-item">
                    <span class="detail-label">Domains:</span>
                    <span class="detail-value">${college.domains.join(', ')}</span>
                </div>
            ` : ''}
        </div>
        <a href="${college.website}" target="_blank" class="college-website">
            <i class="fas fa-external-link-alt"></i>
            Visit Website
        </a>
    `;
    
    return card;
}

// Filter functions
function populateFilters(colleges) {
    populateProvinceFilter(colleges);
}

function populateProvinceFilter(colleges) {
    provinceFilter.innerHTML = '<option value="">All Regions/States</option>';
    
    const provinces = [...new Set(colleges.map(college => college.province))]
        .filter(province => province && province !== 'Not specified')
        .sort();
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceFilter.appendChild(option);
    });
}

function applyFilters(colleges) {
    return colleges.filter(college => {
        const provinceMatch = !currentFilters.province || 
                            college.province === currentFilters.province;
        const typeMatch = !currentFilters.type || 
                         college.type.toLowerCase().includes(currentFilters.type.toLowerCase());
        
        return provinceMatch && typeMatch;
    });
}

function handleFilterChange() {
    currentFilters = {
        province: provinceFilter.value,
        type: typeFilter.value
    };
    
    displayResults(currentColleges);
}

// Reset functionality
function resetFilters() {
    provinceFilter.value = '';
    typeFilter.value = '';
    currentFilters = { province: '', type: '' };
    displayResults(currentColleges);
    showNotification('Filters reset', 'info');
}

// Export functionality
function exportResults() {
    const filteredColleges = applyFilters(currentColleges);
    
    if (filteredColleges.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const csvContent = convertToCSV(filteredColleges);
    downloadCSV(csvContent, `colleges-${currentCountry}-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification(`Exported ${filteredColleges.length} institutions`, 'success');
}

function convertToCSV(colleges) {
    const headers = ['Name', 'Province/State', 'Country', 'Website', 'Type', 'Established'];
    const rows = colleges.map(college => [
        `"${college.name}"`,
        `"${college.province}"`,
        `"${college.country}"`,
        `"${college.website}"`,
        `"${college.type}"`,
        college.established || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// UI State Management
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function showResultsHeader() {
    resultsHeader.style.display = 'flex';
    countryName.textContent = currentCountry;
}

function hideResultsHeader() {
    resultsHeader.style.display = 'none';
}

function showFiltersSection() {
    filtersSection.style.display = 'block';
}

function hideFiltersSection() {
    filtersSection.style.display = 'none';
}

function hideWelcomeState() {
    welcomeState.style.display = 'none';
}

function showNoResults() {
    noResults.style.display = 'block';
    collegesContainer.innerHTML = '';
    collegeCount.textContent = '0';
}

function hideNoResults() {
    noResults.style.display = 'none';
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles for notification
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: var(--shadow-lg);
                animation: slideIn 0.3s ease;
            }
            .notification-info { background: var(--primary); }
            .notification-success { background: var(--success); }
            .notification-warning { background: var(--warning); }
            .notification-error { background: var(--error); }
            .notification button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    countryInput.placeholder = 'Enter country name (e.g., United States, Pakistan, Germany)';
    showNotification('Welcome to EduGlobal Finder! Search for universities worldwide.', 'info');
});