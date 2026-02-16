// SALES TREND CHART
new Chart(document.getElementById('salesChart'), {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Sales (₱)',
            data: [12000, 19000, 30000, 25000, 40000],
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }]
    }
});

// USER GROWTH CHART
new Chart(document.getElementById('userChart'), {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'New Users',
            data: [50, 80, 120, 150, 200],
            borderWidth: 1
        }]
    }
});
