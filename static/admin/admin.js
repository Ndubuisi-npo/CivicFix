document.getElementById('dashboard-link').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboard-tab').style.display = '';
    document.getElementById('reports-tab').style.display = 'none';
    this.classList.add('active');
    document.getElementById('reports-link').classList.remove('active');
});
document.getElementById('reports-link').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('dashboard-tab').style.display = 'none';
    document.getElementById('reports-tab').style.display = '';
    this.classList.add('active');
    document.getElementById('dashboard-link').classList.remove('active');
});
// Apply classes to status and priority selects based on their values
document.addEventListener('DOMContentLoaded', function () {
    // Helper to update class based on value
    function updateClass(select, prefix) {
        const value = select.value;
        // Remove old prefixed classes
        select.className = prefix;
        select.classList.add(`${prefix}-${value}`);
    }

    // Handle status dropdowns
    document.querySelectorAll('select.status').forEach(select => {
        updateClass(select, 'status');
        select.addEventListener('change', () => updateClass(select, 'status'));
    });

    // Handle priority dropdowns
    document.querySelectorAll('select.priority').forEach(select => {
        updateClass(select, 'priority');
        select.addEventListener('change', () => updateClass(select, 'priority'));
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Pie chart for category percentages
    if (window.categoryPercentages && document.getElementById('categoryPieChart')) {
        const categoryData = window.categoryPercentages;
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        const backgroundColors = [
            '#4a90e2', // Road
            '#f5a623', // Electricity
            '#7ed957', // Sanitation
            '#d9534f', // Other
        ];

        const ctx = document.getElementById('categoryPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                    },
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 16
                        },
                        formatter: function(value, context) {
                            return value + '%';
                        }
                }
            }
            },
            plugins: [ChartDataLabels]
        });
    }

    // Line chart for resolution time trends
    if (window.resolutionMonths && window.resolutionAverages && document.getElementById('resolutionLineChart')) {
        const ctx = document.getElementById('resolutionLineChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: window.resolutionMonths,
                datasets: [{
                    label: 'Avg Resolution Time (days)',
                    data: window.resolutionAverages,
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#1976d2'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('reports-search');
    const table = document.getElementById('admin-reports-table');
    const categoryDropdown = document.querySelectorAll('.reports-dropdown')[0]; // First dropdown is category
    const statusDropdown = document.querySelectorAll('.reports-dropdown')[1]; // Second dropdown is status

    // Define keywords for each category
    const categoryKeywords = {
        road: ['road', 'pothole', 'potholes', 'road block', 'blockage', 'asphalt', 'highway', 'street', 'intersection'],
        electricity: ['electricity', 'light', 'power', 'power failure', 'outage', 'transformer', 'electrical', 'lamp', 'blackout'],
        sanitation: ['sanitation', 'garbage', 'waste', 'sewer', 'bad smell', 'bad smells', 'trash', 'refuse', 'drain', 'dirty', 'filth']
    };

    function filterTable() {
        const filter = searchInput.value.toLowerCase();
        const category = categoryDropdown.value;
        const status = statusDropdown.value;
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const statusCell = row.querySelector('select.status');
            const rowStatus = statusCell ? statusCell.value : '';
            let matchesCategory = true;
            if (category !== 'all') {
                matchesCategory = categoryKeywords[category].some(keyword => text.includes(keyword));
            }
            const matchesStatus = (status === 'all') || (rowStatus === status);
            const matchesText = text.includes(filter);
            row.style.display = (matchesCategory && matchesStatus && matchesText) ? '' : 'none';
        });
    }

    if (searchInput && table && categoryDropdown && statusDropdown) {
        searchInput.addEventListener('keyup', filterTable);
        categoryDropdown.addEventListener('change', filterTable);
        statusDropdown.addEventListener('change', filterTable);
    }
});