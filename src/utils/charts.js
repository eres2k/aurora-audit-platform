import Chart from 'chart.js/auto';

export const generateChart = (audit) => {
  const canvas = document.createElement('canvas');
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: audit.responses.map((r) => r.questionId),
      datasets: [{
        label: 'Audit Responses',
        data: audit.responses.map((r) => r.answer),
        backgroundColor: '#1976d2',
      }],
    },
  });
  return canvas.toDataURL();
};
