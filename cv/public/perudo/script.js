let diceCount = 5;

const diceButtons = document.querySelectorAll('#dice-buttons button');
const startButton = document.getElementById('start-button');
const diceContainer = document.getElementById('dice-container');
const timerDisplay = document.getElementById('timer');
const shakeSound = document.getElementById('shake-sound');

// Cambia numero di dadi selezionato
diceButtons.forEach(button => {
  button.addEventListener('click', () => {
    diceCount = parseInt(button.dataset.count);
    diceButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Crea singolo dado con faccia e puntini
function createDie(face) {
  const die = document.createElement('div');
  die.classList.add('die', `face-${face}`);
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    die.appendChild(dot);
  }
  return die;
}

// Ritorna numero casuale tra 1 e 6
function getRandomFace() {
  return Math.floor(Math.random() * 6) + 1;
}

// Calcola layout delle righe es. [2,2,1]
function calculateRows(count) {
  const rows = [];
  while (count > 2) {
    rows.push(2);
    count -= 2;
  }
  if (count > 0) rows.push(count);
  return rows;
}

// Lancia i dadi
function startRolling() {
  // Mostra orario attuale (timestamp)
  const now = new Date();
  const timestamp = now.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  timerDisplay.textContent = `Lancio effettuato alle ${timestamp}`;

  // Blocca pulsante per 30 secondi
  startButton.disabled = true;
  startButton.textContent = "Attendi 30s...";
  setTimeout(() => {
    startButton.disabled = false;
    startButton.textContent = "Start";
  }, 30000);

  // Riproduci suono e svuota container
  shakeSound.currentTime = 0;
  shakeSound.play();
  diceContainer.innerHTML = '';

  const diceElements = [];
  const rowDistribution = calculateRows(diceCount);

  // Crea righe e dadi con facce iniziali
  rowDistribution.forEach(diceInRow => {
    const row = document.createElement('div');
    row.classList.add('dice-row');
    for (let i = 0; i < diceInRow; i++) {
      const face = getRandomFace();
      const die = createDie(face);
      row.appendChild(die);
      diceElements.push(die);
    }
    diceContainer.appendChild(row);
  });

  // Anima facce random per 1 secondo
  const interval = setInterval(() => {
    diceElements.forEach(die => {
      const newFace = getRandomFace();
      die.className = 'die';
      die.classList.add(`face-${newFace}`);
    });
  }, 100);

  // Stop animazione e mostra facce finali
  setTimeout(() => {
    clearInterval(interval);
    diceElements.forEach(die => {
      const finalFace = getRandomFace();
      die.className = 'die';
      die.classList.add(`face-${finalFace}`);
    });
  }, 1000);
}

// Avvio lancio al click
startButton.addEventListener('click', startRolling);
