/* ═══════════════════════════════════════════
   THINK TWICE — Players Module
   Player creation, selection, age-tier mapping
   ═══════════════════════════════════════════ */

const Players = (() => {

  const ICONS = [
    // Geometric icons
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
    // Emojis
    { char: '🧠', color: 'pink', emoji: true },
    { char: '🎮', color: 'green', emoji: true },
    { char: '🚀', color: 'cyan', emoji: true },
    { char: '⚡', color: 'yellow', emoji: true },
    { char: '🔥', color: 'pink', emoji: true },
    { char: '👾', color: 'green', emoji: true },
    { char: '🤖', color: 'cyan', emoji: true },
    { char: '👽', color: 'green', emoji: true },
    { char: '🎯', color: 'pink', emoji: true },
    { char: '💡', color: 'yellow', emoji: true },
    { char: '🦊', color: 'yellow', emoji: true },
    { char: '🐉', color: 'green', emoji: true },
    { char: '🦄', color: 'pink', emoji: true },
    { char: '🐙', color: 'cyan', emoji: true },
    { char: '🎲', color: 'yellow', emoji: true },
    { char: '🏆', color: 'yellow', emoji: true },
    { char: '💎', color: 'cyan', emoji: true },
    { char: '🌈', color: 'pink', emoji: true },
    { char: '☠️', color: 'green', emoji: true },
    { char: '🎸', color: 'pink', emoji: true },
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
    const icons = player.icons || [{ char: player.icon || player.emoji || '?', color: player.iconColor || 'cyan' }];
    if (icons.length === 1) {
      return `<span class="neon-icon glow-${icons[0].color}">${icons[0].char}</span>`;
    }
    return `<span class="multi-icon">${icons.map(ic => `<span class="neon-icon glow-${ic.color}">${ic.char}</span>`).join('')}</span>`;
  }

  function iconChar(player) {
    const icons = player.icons || [{ char: player.icon || player.emoji || '?' }];
    return icons.map(ic => ic.char).join('');
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
      const lockIcon = player.pin ? ' 🔒' : '';
      const lb = Storage.getLeaderboard();
      const allTime = lb[player.id] ? lb[player.id].totalPoints : 0;
      const tierLabel = player.age ? `TIER ${getAgeTier(player.age)}` : '';
      slot.innerHTML = `
        ${iconHTML(player)}
        <div class="info">
          <div class="name">${sanitize(player.name)}${lockIcon}</div>
          <div class="tier-label">${tierLabel}</div>
          <div class="age">${allTime} PTS</div>
        </div>
        <span class="check">✓</span>
      `;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'player-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'player-edit';
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (player.pin) {
          showPinModal(`EDIT ${player.name.toUpperCase()}`, (entered) => {
            if (entered !== player.pin) return false;
            showEditPlayerModal(player, containerEl, onSelectionChange);
            return true;
          });
        } else {
          showEditPlayerModal(player, containerEl, onSelectionChange);
        }
      });
      actionsDiv.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'player-delete';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (player.pin) {
          showPinModal(`DELETE ${player.name.toUpperCase()}`, (entered) => {
            if (entered !== player.pin) return false; // wrong pin
            Storage.deletePlayer(player.id);
            CloudSync.deletePlayer(player.id);
            renderPlayerList(containerEl, onSelectionChange);
            if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
            return true;
          });
        } else {
          Storage.deletePlayer(player.id);
          CloudSync.deletePlayer(player.id);
          renderPlayerList(containerEl, onSelectionChange);
          if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
        }
      });
      actionsDiv.appendChild(delBtn);
      slot.appendChild(actionsDiv);

      slot.addEventListener('click', () => {
        // Deselecting never needs a PIN
        if (slot.classList.contains('selected')) {
          slot.classList.remove('selected');
          if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
          return;
        }
        if (player.pin) {
          showPinModal(`UNLOCK ${player.name.toUpperCase()}`, (entered) => {
            if (entered !== player.pin) return false;
            slot.classList.add('selected');
            if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
            return true;
          });
        } else {
          slot.classList.add('selected');
          if (onSelectionChange) onSelectionChange(getSelectedIds(containerEl));
        }
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
    return ids.map(id => all.find(p => p.id === id)).filter(Boolean).map(p => {
      if (p.birthMonth && p.birthYear) {
        p.age = computeAge(p.birthMonth, p.birthYear);
      }
      return p;
    });
  }

  function showAddPlayerModal() {
    const overlay = document.getElementById('add-player-modal');
    overlay.classList.add('active');

    document.getElementById('new-player-name').value = '';
    document.getElementById('age-display').textContent = '';
    const pinInput = document.getElementById('new-player-pin');
    if (pinInput) pinInput.value = '';

    // Render icon picker (multi-select up to 3)
    const iconContainer = document.getElementById('emoji-picker');
    iconContainer.innerHTML = '';
    ICONS.forEach((ic, idx) => {
      const btn = document.createElement('button');
      btn.className = ic.emoji ? 'icon-pick icon-emoji' : 'icon-pick';
      btn.dataset.index = idx;
      btn.innerHTML = ic.emoji
        ? ic.char
        : `<span class="glow-${ic.color}">${ic.char}</span>`;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
        } else {
          const selectedCount = iconContainer.querySelectorAll('.icon-pick.selected').length;
          if (selectedCount >= 3) return; // max 3
          btn.classList.add('selected');
        }
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
    for (let y = currentYear; y >= 1950; y--) {
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
    const iconEls = document.querySelectorAll('#emoji-picker .icon-pick.selected');
    const monthEl = document.getElementById('birth-month');
    const yearEl = document.getElementById('birth-year');
    const pinEl = document.getElementById('new-player-pin');

    if (!name || iconEls.length === 0) return null;
    if (!monthEl || !monthEl.value || !yearEl || !yearEl.value) return null;

    const icons = Array.from(iconEls).map(el => {
      const idx = parseInt(el.dataset.index);
      return { char: ICONS[idx].char, color: ICONS[idx].color };
    });
    const primaryIcon = icons[0];
    const birthMonth = parseInt(monthEl.value);
    const birthYear = parseInt(yearEl.value);
    const age = computeAge(birthMonth, birthYear);
    const pin = pinEl && pinEl.value.trim();

    const playerData = {
      name,
      icon: primaryIcon.char,
      iconColor: primaryIcon.color,
      emoji: primaryIcon.char,
      icons,
      birthMonth,
      birthYear,
      age
    };
    if (pin && /^\d{4}$/.test(pin)) {
      playerData.pin = pin;
    }

    return Storage.addPlayer(playerData);
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Edit Player Modal ───

  let editingPlayerId = null;
  let editContainerEl = null;
  let editOnSelectionChange = null;

  function showEditPlayerModal(player, containerEl, onSelectionChange) {
    // Re-read from storage to get fresh data (including birthMonth/birthYear)
    const freshPlayers = Storage.getPlayers();
    const fresh = freshPlayers.find(p => p.id === player.id);
    if (fresh) player = fresh;

    editingPlayerId = player.id;
    editContainerEl = containerEl;
    editOnSelectionChange = onSelectionChange;

    const overlay = document.getElementById('edit-player-modal');
    overlay.classList.add('active');

    document.getElementById('edit-player-name').value = player.name;
    const pinInput = document.getElementById('edit-player-pin');
    pinInput.value = player.pin || '';

    // Render icon picker (multi-select up to 3)
    const iconContainer = document.getElementById('edit-emoji-picker');
    iconContainer.innerHTML = '';
    const playerIcons = player.icons || [{ char: player.icon, color: player.iconColor }];
    ICONS.forEach((ic, idx) => {
      const btn = document.createElement('button');
      btn.className = ic.emoji ? 'icon-pick icon-emoji' : 'icon-pick';
      btn.dataset.index = idx;
      btn.innerHTML = ic.emoji
        ? ic.char
        : `<span class="glow-${ic.color}">${ic.char}</span>`;
      // Pre-select current icons
      if (playerIcons.some(pi => pi.char === ic.char)) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
        } else {
          const selectedCount = iconContainer.querySelectorAll('.icon-pick.selected').length;
          if (selectedCount >= 3) return;
          btn.classList.add('selected');
        }
      });
      iconContainer.appendChild(btn);
    });

    // Render birthday picker
    const bdayContainer = document.getElementById('edit-age-picker');
    bdayContainer.innerHTML = '';

    const monthSelect = document.createElement('select');
    monthSelect.id = 'edit-birth-month';
    monthSelect.className = 'retro-select';
    const monthDefault = document.createElement('option');
    monthDefault.value = '';
    monthDefault.textContent = 'MONTH';
    monthSelect.appendChild(monthDefault);
    MONTHS.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = m;
      if (player.birthMonth === i + 1) opt.selected = true;
      monthSelect.appendChild(opt);
    });

    const yearSelect = document.createElement('select');
    yearSelect.id = 'edit-birth-year';
    yearSelect.className = 'retro-select';
    const yearDefault = document.createElement('option');
    yearDefault.value = '';
    yearDefault.textContent = 'YEAR';
    yearSelect.appendChild(yearDefault);
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1950; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (player.birthYear === y) opt.selected = true;
      yearSelect.appendChild(opt);
    }

    bdayContainer.appendChild(monthSelect);
    bdayContainer.appendChild(yearSelect);

    const updateAge = () => {
      const m = parseInt(monthSelect.value);
      const y = parseInt(yearSelect.value);
      const display = document.getElementById('edit-age-display');
      if (m && y) {
        const age = computeAge(m, y);
        display.textContent = `AGE: ${age} · TIER ${getAgeTier(age)}`;
      } else {
        display.textContent = '';
      }
    };
    monthSelect.addEventListener('change', updateAge);
    yearSelect.addEventListener('change', updateAge);
    updateAge();
  }

  function hideEditPlayerModal() {
    document.getElementById('edit-player-modal').classList.remove('active');
    editingPlayerId = null;
  }

  function saveEditPlayerFromModal() {
    if (!editingPlayerId) return false;
    const name = document.getElementById('edit-player-name').value.trim();
    const iconEls = document.querySelectorAll('#edit-emoji-picker .icon-pick.selected');
    const monthEl = document.getElementById('edit-birth-month');
    const yearEl = document.getElementById('edit-birth-year');
    const pinEl = document.getElementById('edit-player-pin');

    if (!name || iconEls.length === 0) return false;
    if (!monthEl || !monthEl.value || !yearEl || !yearEl.value) return false;

    const icons = Array.from(iconEls).map(el => {
      const idx = parseInt(el.dataset.index);
      return { char: ICONS[idx].char, color: ICONS[idx].color };
    });
    const primaryIcon = icons[0];
    const birthMonth = parseInt(monthEl.value);
    const birthYear = parseInt(yearEl.value);
    const age = computeAge(birthMonth, birthYear);
    const pin = pinEl ? pinEl.value.trim() : '';

    const players = Storage.getPlayers();
    const player = players.find(p => p.id === editingPlayerId);
    if (!player) return false;

    player.name = name;
    player.icon = primaryIcon.char;
    player.iconColor = primaryIcon.color;
    player.emoji = primaryIcon.char;
    player.icons = icons;
    player.birthMonth = birthMonth;
    player.birthYear = birthYear;
    player.age = age;
    if (pin && /^\d{4}$/.test(pin)) {
      player.pin = pin;
    } else {
      delete player.pin;
    }

    Storage.savePlayers(players);

    // Update leaderboard entry
    const lb = Storage.getLeaderboard();
    if (lb[editingPlayerId]) {
      lb[editingPlayerId].name = name;
      lb[editingPlayerId].icon = primaryIcon.char;
      lb[editingPlayerId].iconColor = primaryIcon.color;
      Storage.saveLeaderboard(lb);
    }

    // Re-render
    if (editContainerEl) {
      renderPlayerList(editContainerEl, editOnSelectionChange);
    }
    return true;
  }

  // ─── PIN Entry Modal ───

  function showPinModal(title, onSubmit) {
    const overlay = document.getElementById('pin-modal');
    const titleEl = document.getElementById('pin-modal-title');
    const errorEl = document.getElementById('pin-modal-error');
    const digits = [
      document.getElementById('pin-entry-1'),
      document.getElementById('pin-entry-2'),
      document.getElementById('pin-entry-3'),
      document.getElementById('pin-entry-4')
    ];

    titleEl.textContent = title;
    errorEl.textContent = '';
    digits.forEach(d => { d.value = ''; });
    overlay.classList.add('active');
    setTimeout(() => digits[0].focus(), 100);

    // Auto-advance on digit entry
    digits.forEach((d, i) => {
      d.oninput = () => {
        d.value = d.value.replace(/[^0-9]/g, '');
        if (d.value && i < 3) digits[i + 1].focus();
      };
      d.onkeydown = (e) => {
        if (e.key === 'Backspace' && !d.value && i > 0) {
          digits[i - 1].focus();
        }
      };
    });

    const cleanup = () => {
      overlay.classList.remove('active');
      digits.forEach(d => { d.oninput = null; d.onkeydown = null; });
      document.getElementById('btn-pin-ok').onclick = null;
      document.getElementById('btn-pin-cancel').onclick = null;
    };

    document.getElementById('btn-pin-cancel').onclick = () => cleanup();

    document.getElementById('btn-pin-ok').onclick = () => {
      const entered = digits.map(d => d.value).join('');
      if (entered.length < 4) {
        errorEl.textContent = 'ENTER 4 DIGITS';
        return;
      }
      const success = onSubmit(entered);
      if (success) {
        cleanup();
      } else {
        errorEl.textContent = 'WRONG PIN';
        digits.forEach(d => { d.value = ''; });
        digits[0].focus();
      }
    };
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
    saveNewPlayerFromModal,
    showEditPlayerModal,
    hideEditPlayerModal,
    saveEditPlayerFromModal
  };
})();
