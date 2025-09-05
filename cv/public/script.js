// Toggle "About"
const toggleBtn = document.getElementById('toggle-about');
const about = document.getElementById('about');
toggleBtn.addEventListener('click', () => {
  about.classList.toggle('hidden');
});

// Dark mode toggle
const darkToggle = document.getElementById('dark-toggle');

// Se preferenza salvata → applica
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}

// Cambio stato → aggiorna tema e salva
darkToggle.addEventListener('change', () => {
  if (darkToggle.checked) {
document.documentElement.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});
