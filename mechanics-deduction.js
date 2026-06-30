// ============================================================
// MECHANICS: DEDUCTION BOARD
// Pizarra de detective: el jugador toca dos pistas para conectarlas.
// Si la conexión está en correctPairs, se marca como correcta.
// Cuando todas las correctPairs están hechas, se desbloquea.
// ============================================================

const DeductionSystem = {
  active: false,
  config: null,
  selectedClue: null,
  madeConnections: [], // array of [idA, idB] sorted
  onComplete: null,

  start(config, onComplete) {
    this.active = true;
    this.config = config;
    this.selectedClue = null;
    this.madeConnections = [];
    this.onComplete = onComplete;
    this.renderBoard();
    document.getElementById('deduction-overlay').style.display = 'flex';
  },

  renderBoard() {
    document.getElementById('deduction-title').textContent = this.config.title;
    const board = document.getElementById('deduction-clues');
    board.innerHTML = '';

    this.config.clues.forEach(clue => {
      const node = document.createElement('div');
      node.className = 'clue-node';
      node.dataset.id = clue.id;
      node.textContent = clue.label;
      if (this.selectedClue === clue.id) node.classList.add('selected');
      if (this.isClueConnected(clue.id)) node.classList.add('connected');
      node.addEventListener('click', () => this.handleClueClick(clue.id));
      board.appendChild(node);
    });

    this.renderConnectionLines();
    this.updateProgress();
  },

  isClueConnected(id) {
    return this.madeConnections.some(pair => pair.includes(id));
  },

  handleClueClick(id) {
    if (!this.selectedClue) {
      this.selectedClue = id;
      this.renderBoard();
      return;
    }
    if (this.selectedClue === id) {
      this.selectedClue = null;
      this.renderBoard();
      return;
    }

    // Try to connect selectedClue <-> id
    const pair = [this.selectedClue, id].sort();
    const alreadyMade = this.madeConnections.some(p => p[0] === pair[0] && p[1] === pair[1]);
    const isCorrect = this.config.correctPairs.some(cp => {
      const sorted = [...cp].sort();
      return sorted[0] === pair[0] && sorted[1] === pair[1];
    });

    if (!alreadyMade && isCorrect) {
      this.madeConnections.push(pair);
      this.showFeedback('Conexión correcta', true);
    } else if (!isCorrect) {
      this.showFeedback('Esa conexión no parece relevante', false);
    }

    this.selectedClue = null;
    this.renderBoard();
    this.checkCompletion();
  },

  showFeedback(text, success) {
    const fb = document.getElementById('deduction-feedback');
    fb.textContent = text;
    fb.className = success ? 'feedback-success' : 'feedback-fail';
    setTimeout(() => { fb.textContent = ''; fb.className = ''; }, 1400);
  },

  renderConnectionLines() {
    // Simple text-based connection list instead of SVG lines,
    // keeps this lightweight and reliable across devices.
    const list = document.getElementById('deduction-connections-list');
    list.innerHTML = '';
    this.madeConnections.forEach(pair => {
      const labelA = this.config.clues.find(c => c.id === pair[0])?.label || pair[0];
      const labelB = this.config.clues.find(c => c.id === pair[1])?.label || pair[1];
      const li = document.createElement('div');
      li.className = 'connection-line-item';
      li.textContent = `🔗 ${labelA}  ↔  ${labelB}`;
      list.appendChild(li);
    });
  },

  updateProgress() {
    const total = this.config.correctPairs.length;
    const made = this.madeConnections.length;
    document.getElementById('deduction-progress').textContent = `${made} / ${total} conexiones`;
  },

  checkCompletion() {
    if (this.madeConnections.length >= this.config.correctPairs.length) {
      setTimeout(() => {
        document.getElementById('deduction-conclusion').textContent = this.config.conclusion;
        document.getElementById('deduction-conclusion').style.display = 'block';
        document.getElementById('deduction-continue-btn').style.display = 'block';
      }, 500);
    }
  },

  finish() {
    this.active = false;
    document.getElementById('deduction-overlay').style.display = 'none';
    document.getElementById('deduction-conclusion').style.display = 'none';
    document.getElementById('deduction-continue-btn').style.display = 'none';
    if (this.onComplete) this.onComplete();
  },
};
