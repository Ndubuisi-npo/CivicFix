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