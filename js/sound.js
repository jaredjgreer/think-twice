/* ═══════════════════════════════════════════
   THINK TWICE — Sound Module
   Web Audio API synthesized retro sounds
   ═══════════════════════════════════════════ */

const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function play(type) {
    try {
      const c = getCtx();
      switch (type) {
        case 'flip': playFlip(c); break;
        case 'correct': playCorrect(c); break;
        case 'wrong': playWrong(c); break;
        case 'steal': playSteal(c); break;
        case 'gameover': playGameOver(c); break;
        case 'click': playClick(c); break;
      }
    } catch (e) { /* audio not available */ }
  }

  function playFlip(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.15);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.15);
  }

  function playCorrect(c) {
    [523, 659, 784].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  function playWrong(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.3);
  }

  function playSteal(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.3);
  }

  function playGameOver(c) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.18;
      const dur = i === 3 ? 0.4 : 0.15;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  function playClick(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'square';
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.05);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.05);
  }

  return { play };
})();
