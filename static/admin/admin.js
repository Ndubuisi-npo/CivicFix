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