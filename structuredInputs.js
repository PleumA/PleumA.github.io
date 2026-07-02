
// --- STRUCTURED INPUTS FOR F8 ---

function initStructuredInputs() {
    renderStructuredDoctorRoles();
    renderStructuredRoleSlots();
    renderStructuredRoleQuotas();
    renderStructuredSinglePoolQuotas();
    renderStructuredConflicts();
    renderStructuredChips('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
    renderStructuredChips('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
    
    // Setup listeners for chip inputs
    setupChipInputListener('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
    setupChipInputListener('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
}

// 1. Doctor Roles
function getUniqueRolesFromInput() {
    const val = document.getElementById('inputDoctorRoles').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const roles = new Set();
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2 && parts[1].trim()) roles.add(parts[1].trim());
    });
    return Array.from(roles);
}

function renderStructuredDoctorRoles() {
    const container = document.getElementById('structuredDoctorRolesContainer');
    if (!container) return;
    
    // Existing roles mapping
    const val = document.getElementById('inputDoctorRoles').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const roleMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
            roleMap[parts[0].trim()] = parts[1].trim();
        }
    });

    const availableRoles = getUniqueRolesFromInput();
    if (availableRoles.length === 0) { availableRoles.push('R1', 'R2'); } // Defaults

    const activeDocs = typeof doctors !== 'undefined' ? doctors : [];
    if (activeDocs.length === 0) {
        const msg = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang].noDocsWarning) ? translations[currentLang].noDocsWarning : "Please add doctors first";
        container.innerHTML = `<p class="text-xs text-slate-500 italic" data-i18n="noDocsWarning">${msg}</p>`;
        // Clear input if no docs
        document.getElementById('inputDoctorRoles').value = "";
        return;
    }

    let html = '';
    activeDocs.forEach((doc) => {
        const role = roleMap[doc] || availableRoles[0]; // match or default
        
        const newRoleText = typeof currentLang !== 'undefined' && currentLang === 'th' ? '＋ บทบาทใหม่' : '＋ New role';
        let roleOptions = availableRoles.map(r => `<option value="${r}" ${r === role ? 'selected' : ''}>${r}</option>`).join('');
        roleOptions += `<option value="__NEW__">${newRoleText}</option>`;
        
        html += `
        <div class="flex items-center gap-2 mb-2">
            <input type="text" class="doc-role-name flex-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300" value="${doc}" readonly>
            <select class="doc-role-select bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-slate-100" onchange="handleDocRoleSelectChange(this)">
                ${roleOptions}
            </select>
        </div>
        `;
    });
    container.innerHTML = html;
    
    syncStructuredDoctorRoles(true);
    
    if (window.lucide) lucide.createIcons();
}

function handleDocRoleSelectChange(selectElem) {
    if (selectElem.value === '__NEW__') {
        const newRole = prompt(typeof currentLang !== 'undefined' && currentLang === 'th' ? "ป้อนชื่อบทบาทใหม่ (เช่น R3)" : "Enter new role name (e.g., R3)");
        if (newRole && newRole.trim() !== '') {
            const rName = newRole.trim();
            const selects = document.querySelectorAll('.doc-role-select');
            selects.forEach(sel => {
                const opt = document.createElement('option');
                opt.value = rName;
                opt.textContent = rName;
                sel.insertBefore(opt, sel.lastElementChild);
            });
            selectElem.value = rName;
        } else {
            selectElem.selectedIndex = 0;
        }
    }
    syncStructuredDoctorRoles();
}

function syncStructuredDoctorRoles(skipSchedule = false) {
    const container = document.getElementById('structuredDoctorRolesContainer');
    if (!container) return;
    const rows = container.querySelectorAll('.flex');
    const newParts = [];
    rows.forEach(row => {
        const name = row.querySelector('.doc-role-name').value.trim();
        const role = row.querySelector('.doc-role-select').value;
        if (name) {
            newParts.push(`${name}:${role}`);
        }
    });
    document.getElementById('inputDoctorRoles').value = newParts.join(', ');
    renderStructuredRoleSlots();
    renderStructuredRoleQuotas();
    if (!skipSchedule && typeof generateSchedule === 'function') generateSchedule();
}

// 2. Slots Per Role (Stepper)
function renderStructuredRoleSlots() {
    const container = document.getElementById('structuredRoleSlotsContainer');
    if (!container) return;
    const val = document.getElementById('inputDefaultRoleSlots').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const slotsMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            slotsMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });

    const activeRoles = getUniqueRolesFromInput();
    let html = '';
    activeRoles.forEach(role => {
        const count = slotsMap[role] !== undefined ? slotsMap[role] : 1;
        html += `
        <div class="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${role}</span>
            <div class="flex items-center gap-3">
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateRoleSlot('${role}', -1)">
                    <i data-lucide="minus" class="w-4 h-4"></i>
                </button>
                <span class="w-6 text-center text-sm font-bold">${count}</span>
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateRoleSlot('${role}', 1)">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function updateRoleSlot(role, delta) {
    const val = document.getElementById('inputDefaultRoleSlots').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const slotsMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            slotsMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });
    if (slotsMap[role] === undefined) slotsMap[role] = 1;
    slotsMap[role] += delta;
    if (slotsMap[role] < 0) slotsMap[role] = 0;
    
    const activeRoles = getUniqueRolesFromInput();
    activeRoles.forEach(r => {
        if (slotsMap[r] === undefined) slotsMap[r] = 1;
    });

    const newParts = [];
    for (const [r, c] of Object.entries(slotsMap)) {
        if (activeRoles.includes(r)) {
            newParts.push(`${r}:${c}`);
        }
    }
    document.getElementById('inputDefaultRoleSlots').value = newParts.join(', ');
    renderStructuredRoleSlots();
    if (typeof generateSchedule === 'function') generateSchedule();
}

// 3. Exact Monthly Quota (Role-Based)
function renderStructuredRoleQuotas() {
    const container = document.getElementById('structuredRoleQuotasContainer');
    if (!container) return;
    const val = document.getElementById('inputRoleQuotas').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const quotasMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            quotasMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });

    const activeRoles = getUniqueRolesFromInput();
    let html = '';
    activeRoles.forEach(role => {
        const count = quotasMap[role] !== undefined ? quotasMap[role] : '';
        const displayCount = count === '' ? '-' : count;
        html += `
        <div class="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${role}</span>
            <div class="flex items-center gap-3">
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateRoleQuota('${role}', -1)">
                    <i data-lucide="minus" class="w-4 h-4"></i>
                </button>
                <span class="w-6 text-center text-sm font-bold">${displayCount}</span>
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateRoleQuota('${role}', 1)">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function updateRoleQuota(role, delta) {
    const val = document.getElementById('inputRoleQuotas').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const quotasMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            quotasMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });
    
    if (quotasMap[role] === undefined) {
        quotasMap[role] = delta > 0 ? 1 : 0;
    } else {
        quotasMap[role] += delta;
    }
    
    if (quotasMap[role] < 0) delete quotasMap[role];
    
    const activeRoles = getUniqueRolesFromInput();
    const newParts = [];
    for (const [r, c] of Object.entries(quotasMap)) {
        if (activeRoles.includes(r)) {
            newParts.push(`${r}:${c}`);
        }
    }
    document.getElementById('inputRoleQuotas').value = newParts.join(', ');
    renderStructuredRoleQuotas();
    if (typeof generateSchedule === 'function') generateSchedule();
}

// 3b. Exact Monthly Quota (Single Pool)
function renderStructuredSinglePoolQuotas() {
    const container = document.getElementById('structuredSinglePoolQuotasContainer');
    if (!container) return;
    const val = document.getElementById('inputSinglePoolQuota').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const quotasMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            quotasMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });

    // Assume `doctors` array is available from app.js state
    const activeDocs = typeof doctors !== 'undefined' ? doctors : [];
    let html = '';
    activeDocs.forEach(doc => {
        const count = quotasMap[doc] !== undefined ? quotasMap[doc] : '';
        const displayCount = count === '' ? '-' : count;
        html += `
        <div class="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${doc}</span>
            <div class="flex items-center gap-3">
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateSinglePoolQuota('${doc}', -1)">
                    <i data-lucide="minus" class="w-4 h-4"></i>
                </button>
                <span class="w-6 text-center text-sm font-bold">${displayCount}</span>
                <button type="button" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" onclick="updateSinglePoolQuota('${doc}', 1)">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function updateSinglePoolQuota(doc, delta) {
    const val = document.getElementById('inputSinglePoolQuota').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    const quotasMap = {};
    pairs.forEach(p => {
        const parts = p.split(':');
        if (parts.length === 2) {
            quotasMap[parts[0].trim()] = parseInt(parts[1].trim()) || 0;
        }
    });
    
    if (quotasMap[doc] === undefined) {
        quotasMap[doc] = delta > 0 ? 1 : 0;
    } else {
        quotasMap[doc] += delta;
    }
    
    if (quotasMap[doc] < 0) delete quotasMap[doc];
    
    const activeDocs = typeof doctors !== 'undefined' ? doctors : [];
    const newParts = [];
    for (const [d, c] of Object.entries(quotasMap)) {
        if (activeDocs.includes(d)) {
            newParts.push(`${d}:${c}`);
        }
    }
    document.getElementById('inputSinglePoolQuota').value = newParts.join(', ');
    renderStructuredSinglePoolQuotas();
    if (typeof generateSchedule === 'function') generateSchedule();
}

// 4. Conflicts
function renderStructuredConflicts() {
    const container = document.getElementById('structuredConflictsContainer');
    if (!container) return;
    const val = document.getElementById('inputConflicts').value;
    const pairs = val.split(',').map(s => s.trim()).filter(s => s);
    
    const activeDocs = typeof doctors !== 'undefined' ? doctors : [];
    const docOptions = activeDocs.map(d => `<option value="${d}">${d}</option>`).join('');

    let html = '';
    pairs.forEach((p, idx) => {
        let parts = p.includes(':') ? p.split(':') : (p.includes(' conflicts with ') ? p.split(' conflicts with ') : []);
        if (parts.length < 2) parts = [p, ''];
        const doc1 = parts[0].trim();
        const doc2 = parts[1].trim();
        
        let doc1Options = activeDocs.map(d => `<option value="${d}" ${d === doc1 ? 'selected' : ''}>${d}</option>`).join('');
        if (!activeDocs.includes(doc1) && doc1) doc1Options += `<option value="${doc1}" selected>${doc1}</option>`;
        
        let doc2Options = activeDocs.map(d => `<option value="${d}" ${d === doc2 ? 'selected' : ''}>${d}</option>`).join('');
        if (!activeDocs.includes(doc2) && doc2) doc2Options += `<option value="${doc2}" selected>${doc2}</option>`;
        
        html += `
        <div class="flex items-center gap-2 mb-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <select class="conflict-doc-1 flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none" onchange="syncStructuredConflicts()">
                <option value="">--</option>
                ${doc1Options}
            </select>
            <span class="text-xs text-slate-500"><i data-lucide="zap" class="w-3.5 h-3.5 text-rose-400"></i></span>
            <select class="conflict-doc-2 flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none" onchange="syncStructuredConflicts()">
                <option value="">--</option>
                ${doc2Options}
            </select>
            <button type="button" class="text-slate-400 hover:text-red-500" onclick="removeStructuredConflict(${idx})">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
        `;
    });
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function addStructuredConflictPair() {
    const val = document.getElementById('inputConflicts').value;
    const parts = val ? val.split(',').map(s => s.trim()).filter(s => s) : [];
    parts.push(`:`);
    document.getElementById('inputConflicts').value = parts.join(', ');
    renderStructuredConflicts();
    syncStructuredConflicts();
}

function removeStructuredConflict(idx) {
    const val = document.getElementById('inputConflicts').value;
    const parts = val ? val.split(',').map(s => s.trim()).filter(s => s) : [];
    parts.splice(idx, 1);
    document.getElementById('inputConflicts').value = parts.join(', ');
    renderStructuredConflicts();
    syncStructuredConflicts();
}

function syncStructuredConflicts() {
    const container = document.getElementById('structuredConflictsContainer');
    if (!container) return;
    const rows = container.querySelectorAll('.flex');
    const newParts = [];
    rows.forEach(row => {
        const d1 = row.querySelector('.conflict-doc-1').value;
        const d2 = row.querySelector('.conflict-doc-2').value;
        if (d1 && d2) {
            newParts.push(`${d1}:${d2}`);
        }
    });
    document.getElementById('inputConflicts').value = newParts.join(', ');
    if (typeof generateSchedule === 'function') generateSchedule();
}

// 5 & 6. Chips (Special Holidays & No-Duty Days)
function renderStructuredChips(hiddenInputId, containerId, uiInputId) {
    const container = document.getElementById(containerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const uiInput = document.getElementById(uiInputId);
    if (!container || !hiddenInput || !uiInput) return;

    // Remove existing chips
    const tags = container.querySelectorAll('.chip-tag');
    tags.forEach(tag => tag.remove());

    const val = hiddenInput.value;
    const items = val.split(',').map(s => s.trim()).filter(s => s);

    items.forEach((item, idx) => {
        const tag = document.createElement('span');
        tag.className = 'chip-tag bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-900/50 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 select-none animate-in fade-in scale-95 duration-200';
        tag.innerHTML = `
            <span>${item}</span>
            <button type="button" onclick="event.stopPropagation(); removeStructuredChip('${hiddenInputId}', ${idx})" class="text-teal-400 hover:text-teal-600 transition-colors">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
        `;
        container.insertBefore(tag, uiInput);
    });
    
    // Auto toggle input type based on mode if date picker is active
    if (typeof isCustomDateRange !== 'undefined') {
        uiInput.type = isCustomDateRange ? 'date' : 'text';
    }
    
    if (window.lucide) lucide.createIcons();
}

function removeStructuredChip(hiddenInputId, idx) {
    const hiddenInput = document.getElementById(hiddenInputId);
    const items = hiddenInput.value.split(',').map(s => s.trim()).filter(s => s);
    items.splice(idx, 1);
    hiddenInput.value = items.join(', ');
    
    // Determine which container to update
    if (hiddenInputId === 'inputSpecialHols') {
        renderStructuredChips('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
    } else if (hiddenInputId === 'inputNoDuty') {
        renderStructuredChips('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
    }
    if (typeof generateSchedule === 'function') generateSchedule();
}

function setupChipInputListener(hiddenInputId, containerId, uiInputId) {
    const uiInput = document.getElementById(uiInputId);
    const container = document.getElementById(containerId);
    
    if (container && uiInput) {
        container.addEventListener('click', () => uiInput.focus());
        
        uiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const v = uiInput.value.trim().replace(/,/g, '');
                if (v) {
                    const hiddenInput = document.getElementById(hiddenInputId);
                    const items = hiddenInput.value ? hiddenInput.value.split(',').map(s=>s.trim()).filter(s=>s) : [];
                    if (!items.includes(v)) {
                        items.push(v);
                        hiddenInput.value = items.join(', ');
                        if (hiddenInputId === 'inputSpecialHols') {
                            renderStructuredChips('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
                        } else if (hiddenInputId === 'inputNoDuty') {
                            renderStructuredChips('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
                        }
                        if (typeof generateSchedule === 'function') generateSchedule();
                    }
                    uiInput.value = '';
                }
            }
        });
        
        // Listen to change for date pickers
        uiInput.addEventListener('change', (e) => {
            if (uiInput.type === 'date') {
                const v = uiInput.value;
                if (v) {
                    // Convert YYYY-MM-DD to DD/MM/YYYY for compatibility if needed, but simple v is fine if user types it.
                    // Actually existing parser uses standard string.
                    const dateObj = new Date(v);
                    const formatted = ('0' + dateObj.getDate()).slice(-2) + '/' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
                    
                    const hiddenInput = document.getElementById(hiddenInputId);
                    const items = hiddenInput.value ? hiddenInput.value.split(',').map(s=>s.trim()).filter(s=>s) : [];
                    if (!items.includes(formatted)) {
                        items.push(formatted);
                        hiddenInput.value = items.join(', ');
                        if (hiddenInputId === 'inputSpecialHols') {
                            renderStructuredChips('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
                        } else if (hiddenInputId === 'inputNoDuty') {
                            renderStructuredChips('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
                        }
                        if (typeof generateSchedule === 'function') generateSchedule();
                    }
                    uiInput.value = '';
                }
            }
        });
    }
}
