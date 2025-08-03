document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('purchase-form');
  const ticketContainer = document.getElementById('ticket-container');
  const ticketName = document.getElementById('ticket-name');
  const ticketNumber = document.getElementById('ticket-number');
  const downloadLink = document.getElementById('download-link');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const number = document.getElementById('number').value;
      ticketName.textContent = name;
      ticketNumber.textContent = number;
      // Show ticket
      ticketContainer.style.display = 'block';
      // Download placeholder ticket (can be replaced with real PDF)
      downloadLink.setAttribute('href', '#');
      downloadLink.addEventListener('click', () => {
        alert('Este enlace puede enlazar a un PDF generado con tu boleto en una versión final.');
      });
    });
  }
});
