(function($) {
  // -- Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#292b2c';

  // -- Bar Chart (archiving frequency)
  $.get('api/stats/archiving-frequency', function(data) {
    var ctx = $('#myBarChart');
    var myLineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Archives uploaded',
          backgroundColor: 'rgba(2,117,216,1)',
          borderColor: 'rgba(2,117,216,1)',
          data: Object.values(data),
        }],
      },
      options: {
        scales: {
          xAxes: [{
            time: {
              unit: 'month',
            },
            gridLines: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 6,
            },
          }],
          yAxes: [{
            ticks: {
              min: 0,
              maxTicksLimit: 5,
            },
            gridLines: {
              display: true,
            },
          }],
        },
        legend: {
          display: false,
        },
      },
    });
  });

  // -- Pie Chart (disk usage)
  $.get('api/stats/disk-usage', function(data) {
    var ctx = document.getElementById('myPieChart');
    var myPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ASTR', 'Used', 'Available'],
        datasets: [{
          data: [data.astr_bytes, data.used_without_astr_bytes, data.free_bytes],
          backgroundColor: ['#AC92EC', '#dc3545', '#28a745'],
        }],
      },
      options: {
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
              switch (tooltipItem.index) {
                case 0:
                  return 'ASTR: ' + data.astr;
                  break;
                case 1:
                  return 'Used: ' + data.used_without_astr;
                  break;
                case 2:
                  return 'Available: ' + data.free;
                  break;
              }
            },
          },
        },
      },
    });
  });
})(jQuery);
