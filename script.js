const form = document.getElementById('birthday-form');
const nameInput = document.getElementById('person-name');
const welcomeScreen = document.getElementById('welcome-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const displayName = document.getElementById('display-name');
const backButton = document.getElementById('back-button');
const confettiButton = document.getElementById('confetti-button');
const musicButton = document.getElementById('music-button');
const copyButton = document.getElementById('copy-button');
const whatsappButton = document.getElementById('whatsapp-button');
const statusMessage = document.getElementById('status-message');

let audioContext = null;
let musicTimer = null;
let noteIndex = 0;
let musicPlaying = false;
const melody = [523.25, 659.25, 783.99, 659.25, 698.46, 783.99, 880, 783.99];

function cleanName(value) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 35);
}

function makeBirthdayLink(name) {
  const url = new URL(window.location.href);
  url.searchParams.set('name', name);
  return url.toString();
}

function showCelebration(name, updateAddress = true) {
  const safeName = cleanName(name) || 'You';
  displayName.textContent = safeName;
  welcomeScreen.classList.add('hidden');
  celebrationScreen.classList.remove('hidden');
  if (updateAddress) {
    const url = new URL(window.location.href);
    url.searchParams.set('name', safeName);
    history.replaceState({}, '', url);
  }
  launchConfetti();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showWelcome() {
  stopMusic();
  celebrationScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  nameInput.value = '';
  const url = new URL(window.location.href);
  url.searchParams.delete('name');
  history.replaceState({}, '', url);
  statusMessage.textContent = '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = cleanName(nameInput.value);
  if (!name) {
    nameInput.focus();
    nameInput.setCustomValidity('Please enter a name first.');
    nameInput.reportValidity();
    nameInput.addEventListener('input', () => nameInput.setCustomValidity(''), { once: true });
    return;
  }
  showCelebration(name);
});

backButton.addEventListener('click', showWelcome);
confettiButton.addEventListener('click', launchConfetti);

function launchConfetti() {
  const layer = document.getElementById('confetti-layer');
  const colors = ['#ff83c5', '#ffd98a', '#b99aff', '#8ee7d0', '#ffffff'];
  for (let i = 0; i < 95; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--drift', `${Math.random() * 220 - 110}px`);
    piece.style.animationDuration = `${2.5 + Math.random() * 3}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    layer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// A small original synthesized tune: no external music file or copyrighted track is used.
function playNote() {
  if (!audioContext || !musicPlaying) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = melody[noteIndex % melody.length];
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.075, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
  noteIndex++;
}

async function startMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    statusMessage.textContent = 'Audio is not supported in this browser.';
    return;
  }
  audioContext = audioContext || new AudioContextClass();
  await audioContext.resume();
  musicPlaying = true;
  musicButton.textContent = '♫ Pause celebration tune';
  musicButton.setAttribute('aria-pressed', 'true');
  playNote();
  musicTimer = window.setInterval(playNote, 330);
}

function stopMusic() {
  musicPlaying = false;
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
  musicButton.textContent = '♫ Play celebration tune';
  musicButton.setAttribute('aria-pressed', 'false');
}

musicButton.addEventListener('click', () => {
  if (musicPlaying) stopMusic();
  else startMusic();
});

copyButton.addEventListener('click', async () => {
  const name = displayName.textContent || 'You';
  const link = makeBirthdayLink(name);
  try {
    await navigator.clipboard.writeText(link);
    statusMessage.textContent = 'Personalized link copied! Share it with them.';
  } catch {
    statusMessage.textContent = 'Copy is unavailable here. Copy the address from your browser after publishing the site.';
  }
});

whatsappButton.addEventListener('click', () => {
  const name = displayName.textContent || 'You';
  const link = makeBirthdayLink(name);
  const message = `A little birthday surprise for you, ${name}! 🎂✨ Open this link: ${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

// If the link already contains ?name=Someone, open their personalized greeting directly.
const sharedName = new URLSearchParams(window.location.search).get('name');
if (sharedName && cleanName(sharedName)) {
  showCelebration(sharedName, false);
}
