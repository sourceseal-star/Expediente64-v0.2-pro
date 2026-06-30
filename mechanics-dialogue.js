// ============================================================
// MECHANICS: DIALOGUE
// Árbol de diálogo simple para interrogatorios. Lee la
// estructura `interrogation` de game-data.js (nodes con
// npcLine + options apuntando a otros nodos).
// ============================================================

const DialogueSystem = {
  active: false,
  config: null,
  currentNodeId: 'start',
  onComplete: null,

  start(config, onComplete) {
    this.active = true;
    this.config = config;
    this.currentNodeId = 'start';
    this.onComplete = onComplete;
    this.renderUI();
    document.getElementById('dialogue-overlay').style.display = 'flex';
  },

  renderUI() {
    const node = this.config.nodes[this.currentNodeId];
    document.getElementById('dialogue-npc-name').textContent = this.config.npcName;
    document.getElementById('dialogue-npc-line').textContent = node.npcLine;

    const optionsContainer = document.getElementById('dialogue-options');
    optionsContainer.innerHTML = '';

    if (node.isEnding || node.options.length === 0) {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'dialogue-option-btn dialogue-end-btn';
      continueBtn.textContent = '[ Finalizar interrogatorio ]';
      continueBtn.addEventListener('click', () => this.finish());
      optionsContainer.appendChild(continueBtn);
      return;
    }

    node.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        this.currentNodeId = opt.next;
        this.renderUI();
      });
      optionsContainer.appendChild(btn);
    });
  },

  finish() {
    this.active = false;
    document.getElementById('dialogue-overlay').style.display = 'none';
    if (this.onComplete) this.onComplete();
  },
};
