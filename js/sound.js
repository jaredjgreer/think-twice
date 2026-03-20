/* ═══════════════════════════════════════════
   THINK TWICE — Sound Module
   Web Audio API synthesized retro sounds
   ═══════════════════════════════════════════ */

const Sound = (() => {
  let ctx = null;
  let musicGain = null;
  let musicPlaying = false;
  let musicNodes = [];
  let muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function play(type) {
    if (muted) return;
    try {
      const c = getCtx();
      switch (type) {
        case 'flip': playFlip(c); break;
        case 'correct': playCorrect(c); break;
        case 'wrong': playWrong(c); break;
        case 'steal': playSteal(c); break;
        case 'gameover': playGameOver(c); break;
        case 'click': playClick(c); break;
        case 'goagain': playCorrect(c); break;
        case 'tick': playTick(c); break;
        case 'tickUrgent': playTickUrgent(c); break;
        case 'timeout': playTimeout(c); break;
        case 'streak': playStreak(c); break;
        case 'crown': playCrown(c); break;
        case 'dethrone': playDethrone(c); break;
        case 'wildcard': playWildCard(c); break;
        case 'sabotage': playSabotage(c); break;
        case 'doublepoints': playDoublePoints(c); break;
        case 'combo': playCombo(c); break;
        case 'crowdOoh': playCrowdOoh(c); break;
      }
    } catch (e) { /* audio not available */ }
  }

  function setMuted(val) {
    muted = !!val;
    if (muted) stopMusic();
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

  function playTick(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.04, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.05);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.05);
  }

  function playTickUrgent(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'square';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.08);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.08);
  }

  function playTimeout(c) {
    [400, 300, 200].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  function playStreak(c) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  function playCrown(c) {
    [392, 494, 587, 784, 784].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  function playDethrone(c) {
    [784, 587, 392, 294, 196].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  function playWildCard(c) {
    [330, 440, 554, 660, 554, 440].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  function playSabotage(c) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.4);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.4);
  }

  function playDoublePoints(c) {
    [523, 0, 523, 659, 784, 1047].forEach((freq, i) => {
      if (!freq) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  function playCombo(c) {
    const baseFreq = 440;
    for (let i = 0; i < 6; i++) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'square';
      osc.frequency.value = baseFreq + i * 100;
      const t = c.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  function playCrowdOoh(c) {
    // Synthesize a descending "ooh" reaction with multiple detuned oscillators
    for (let j = 0; j < 3; j++) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      const base = 400 + j * 30;
      osc.frequency.setValueAtTime(base, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(base * 0.7, c.currentTime + 0.35);
      gain.gain.setValueAtTime(0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.35);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.35);
    }
  }

  // ─── Background Music (original chiptune loop) ───

  function startMusic() {
    if (musicPlaying || muted) return;
    try {
      const c = getCtx();
      musicPlaying = true;

      // Master gain for music
      musicGain = c.createGain();
      musicGain.gain.value = 0.07;
      musicGain.connect(c.destination);

      // Original chiptune melody (notes in Hz, 0 = rest)
      const melody = [
        392, 0, 440, 0, 494, 0, 523, 0,
        587, 0, 523, 0, 494, 0, 440, 0,
        392, 0, 0, 0, 330, 0, 0, 0,
        294, 0, 330, 0, 392, 0, 330, 0,
        294, 0, 0, 0, 262, 0, 0, 0,
        294, 0, 330, 0, 392, 0, 440, 0,
        494, 0, 523, 0, 587, 0, 0, 0,
        523, 0, 494, 0, 440, 0, 392, 0
      ];

      // Bass pattern
      const bass = [
        196, 0, 196, 0, 196, 0, 196, 0,
        220, 0, 220, 0, 220, 0, 220, 0,
        196, 0, 196, 0, 165, 0, 165, 0,
        147, 0, 147, 0, 196, 0, 196, 0,
        147, 0, 147, 0, 131, 0, 131, 0,
        147, 0, 165, 0, 196, 0, 220, 0,
        247, 0, 262, 0, 294, 0, 294, 0,
        262, 0, 247, 0, 220, 0, 196, 0
      ];

      const bpm = 140;
      const noteLen = 60 / bpm / 2; // sixteenth notes
      const loopLen = melody.length * noteLen;

      function scheduleLoop(startTime) {
        melody.forEach((freq, i) => {
          if (!freq) return;
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(musicGain);
          osc.type = 'square';
          osc.frequency.value = freq;
          const t = startTime + i * noteLen;
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.01, t + noteLen * 0.9);
          osc.start(t);
          osc.stop(t + noteLen * 0.9);
          musicNodes.push(osc);
        });

        bass.forEach((freq, i) => {
          if (!freq) return;
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(musicGain);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const t = startTime + i * noteLen;
          g.gain.setValueAtTime(0.4, t);
          g.gain.exponentialRampToValueAtTime(0.01, t + noteLen * 0.8);
          osc.start(t);
          osc.stop(t + noteLen * 0.8);
          musicNodes.push(osc);
        });
      }

      // Schedule several loops ahead and keep scheduling
      let nextLoop = c.currentTime;
      for (let l = 0; l < 4; l++) {
        scheduleLoop(nextLoop);
        nextLoop += loopLen;
      }

      // Keep looping via interval
      musicNodes._interval = setInterval(() => {
        if (!musicPlaying) return;
        // Clean up old nodes
        musicNodes = musicNodes.filter(n => {
          try { return n.context && n.context.currentTime < (n._stopTime || Infinity); } catch(e) { return false; }
        });
        const c2 = getCtx();
        const ahead = nextLoop - c2.currentTime;
        if (ahead < loopLen * 2) {
          scheduleLoop(nextLoop);
          nextLoop += loopLen;
        }
      }, 1000);

    } catch (e) { /* audio not available */ }
  }

  function stopMusic() {
    musicPlaying = false;
    if (musicNodes._interval) {
      clearInterval(musicNodes._interval);
    }
    if (musicGain) {
      try {
        musicGain.gain.exponentialRampToValueAtTime(0.001, getCtx().currentTime + 0.5);
        setTimeout(() => {
          try { musicGain.disconnect(); } catch(e) {}
        }, 600);
      } catch(e) {}
    }
    musicNodes = [];
    musicGain = null;
  }

  return { play, startMusic, stopMusic, setMuted };
})();
