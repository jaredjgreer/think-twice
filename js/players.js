/* ═══════════════════════════════════════════
   THINK TWICE — Players Module
   Player creation, selection, age-tier mapping
   ═══════════════════════════════════════════ */

const Players = (() => {

  const ICONS = [
    { char: '★', color: 'yellow' },
    { char: '◆', color: 'cyan' },
    { char: '▲', color: 'pink' },
    { char: '●', color: 'green' },
    { char: '⬡', color: 'cyan' },
    { char: '✦', color: 'pink' },
    { char: '■', color: 'yellow' },
    { char: '⊕', color: 'green' },
    { char: '◈', color: 'cyan' },
    { char: '▼', color: 'pink' },
    { char: '⬢', color: 'yellow' },
    { char: '☆', color: 'green' },
    { char: '◉', color: 'cyan' },
    { char: '△', color: 'pink' },
    { char: '⊗', color: 'yellow' },
    { char: '◇', color: 'green' },
    { char: '✧', color: 'cyan' },
    { char: '⊞', color: 'pink' },
    { char: '▣', color: 'yellow' },
    { char: '◎', color: 'green' },
  ];

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  function getAgeTier(age) {
    if (age <= 12) return 1;
    if (age <= 14) return 2;
    return 3;
  }

  function computeAge(birthMonth, birthYear) {
    const now = new Date();
    let age = now.getFullYear() - birthYear;
    if (now.getMonth() + 1 < birthMonth) age--;
    return Math.max(1, age);
  }

  function iconHTML(player) {
    const ch = player.icon || player.emoji || '?';
    const color = player.iconColor || 'cyan';
    return `<span class="neon-icon glow-${color}">${ch}</span>`;
  }

  function iconChar(player) {
    return player.icon || player.emoji || '?';
  }

  function renderPlayerList(containerEl, onSelectionChange) {
    const players = Storage.getPlayers();
    containerEl.innerHTML = '';

    players.forEach(player => {
      if (player.birthMonth && player.birthYear) {
        player.age = computeAge(player.birthMonth, player.birthYear);
      }

      const slot = document.createElement('div');
      slot.className = 'player-slot';
      slot.dataset.id = player.id;
      slot.innerHTML = `
        ${iconHTML(player)}
        <div class="info">
          <div class="name">${sanitize(player.name)}</div>
          <div class="age">Age ${player.age} · Tier ${getAgeTier(player.age)}</div>
        </div>
        <span class="check">✓</span>
      `;

      const delBtn = document.createElement('button');
      delBtn.className = 'player-delete';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Admin PIN protection
        let pin = Storage.getAdminPin();
        if (!pin) {
          const newPin = prompt('SET ADMIN PIN (4 digits):');
          if (!newPin || !/^\d{4}$/.test(newPin)) return;
          Storage.setAdminPin(newPin);
          pin = newPin;
        }
        const entered = prompt('ENTER ADMIN PIN TO DELETE:');
        if (entered !== pin) { alert('WRONG PIN'); return; }
        Storage.deletePlayer(player.id);
        renderPlayerList(containerEl, onSelectionChange);
        if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
      });
      slot.appendChild(delBtn);

      slot.addEventListener('click', () => {
        slot.classList.toggle('selected');
        if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
      });
      containerEl.appendChild(slot);
    });
  }

  function getSelectedIds(containerEl) {
    const selected = containerEl.querySelectorAll('.player-slot.selected');
    return Array.from(selected).map(el => el.dataset.id);
  }

  function getPlayersById(ids) {
    const all = Storage.getPlayers();
    return ids.map(id => all.find(p => p.id === id)).filter(Boolean);
  }

  function showAddPlayerModal() {
    const overlay = document.getElementById('add-player-modal');
    overlay.classList.add('active');

    document.getElementById('new-player-name').value = '';
    document.getElementById('age-display').textContent = '';

    // Render icon picker
    const iconContainer = document.getElementById('emoji-picker');
    iconContainer.innerHTML = '';
    ICONS.forEach((ic, idx) => {
      const btn = document.createElement('button');
      btn.className = 'icon-pick';
      btn.dataset.index = idx;
      btn.innerHTML = `<span class="glow-${ic.color}">${ic.char}</span>`;
      btn.addEventListener('click', () => {
        iconContainer.querySelectorAll('.icon-pick').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      iconContainer.appendChild(btn);
    });

    // Render birthday picker
    const bdayContainer = document.getElementById('age-picker');
    bdayContainer.innerHTML = '';

    const monthSelect = document.createElement('select');
    monthSelect.id = 'birth-month';
    monthSelect.className = 'retro-select';
    const monthDefault = document.createElement('option');
    monthDefault.value = '';
    monthDefault.textContent = 'MONTH';
    monthSelect.appendChild(monthDefault);
    MONTHS.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = m;
      monthSelect.appendChild(opt);
    });

    const yearSelect = document.createElement('select');
    yearSelect.id = 'birth-year';
    yearSelect.className = 'retro-select';
    const yearDefault = document.createElement('option');
    yearDefault.value = '';
    yearDefault.textContent = 'YEAR';
    yearSelect.appendChild(yearDefault);
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y >= 1950; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }

    bdayContainer.appendChild(monthSelect);
    bdayContainer.appendChild(yearSelect);

    const updateAge = () => {
      const m = parseInt(monthSelect.value);
      const y = parseInt(yearSelect.value);
      const display = document.getElementById('age-display');
      if (m && y) {
        const age = computeAge(m, y);
        display.textContent = `AGE: ${age} · TIER ${getAgeTier(age)}`;
      } else {
        display.textContent = '';
      }
    };
    monthSelect.addEventListener('change', updateAge);
    yearSelect.addEventListener('change', updateAge);
  }

  function hideAddPlayerModal() {
    document.getElementById('add-player-modal').classList.remove('active');
  }

  function saveNewPlayerFromModal() {
    const name = document.getElementById('new-player-name').value.trim();
    const iconEl = document.querySelector('#emoji-picker .icon-pick.selected');
    const monthEl = document.getElementById('birth-month');
    const yearEl = document.getElementById('birth-year');

    if (!name || !iconEl) return null;
    if (!monthEl || !monthEl.value || !yearEl || !yearEl.value) return null;

    const iconIdx = parseInt(iconEl.dataset.index);
    const ic = ICONS[iconIdx];
    const birthMonth = parseInt(monthEl.value);
    const birthYear = parseInt(yearEl.value);
    const age = computeAge(birthMonth, birthYear);

    return Storage.addPlayer({
      name,
      icon: ic.char,
      iconColor: ic.color,
      emoji: ic.char,
      birthMonth,
      birthYear,
      age
    });
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    ICONS,
    getAgeTier,
    computeAge,
    iconHTML,
    iconChar,
    renderPlayerList,
    getSelectedIds,
    getPlayersById,
    showAddPlayerModal,
    hideAddPlayerModal,
    saveNewPlayerFromModal
  };
})();
