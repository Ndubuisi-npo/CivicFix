document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('photo-upload');
    const uploadLink = uploadArea.querySelector('.upload-link');
    const previewArea = document.getElementById('preview-area');

    // Show file names or count
    function showFileNames(files) {
        previewArea.innerHTML = '';
        if (files.length === 0) return;
        const list = document.createElement('ul');
        list.className = 'file-list';
        Array.from(files).forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            list.appendChild(li);
        });
        previewArea.appendChild(list);
    }

    // Click to open file dialog
    uploadLink.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    // Drag over styling
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    // Drop files
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
        showFileNames(e.dataTransfer.files);
    });

    // Clicking the area also opens file dialog
    uploadArea.addEventListener('click', function(e) {
        if (e.target === uploadArea) {
            fileInput.click();
        }
    });

    // Show previews when files are selected via dialog
    fileInput.addEventListener('change', function(e) {
        showFileNames(fileInput.files);
    });
});



document.addEventListener('DOMContentLoaded', function() {
 
    // Live map with current location using Leaflet
    if (document.getElementById('live-map')) {
        // Default coordinates (center of the world)
        var defaultCoords = [0, 0];
        var map = L.map('live-map').setView(defaultCoords, 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                map.setView([lat, lng], 15);
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('You are here!').openPopup();
            }, function() {
                // If denied or error, stay at default
            });
        }
    }
});

// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...

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
    
    // Line chart for monthly report trends
    if (window.monthlyReportMonths && window.monthlyReportCounts && document.getElementById('monthlyReportLineChart')) {
        const ctx = document.getElementById('monthlyReportLineChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: window.monthlyReportMonths,
                datasets: [{
                    label: 'Reports Submitted',
                    data: window.monthlyReportCounts,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#ef4444'
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
                            text: 'Reports'
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