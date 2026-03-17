/* Version: #2 */

// === TILSTANDSSTYRING ===
const state = {
    totalOriginal: 0,
    divisor: 0,
    remainingInSource: 0,
    placedInCurrentRound: 0,
    totalRoundsCompleted: 0,
    isInitialized: false
};

// === LOGGING ===
const Logger = {
    log: function(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
        const logContainer = document.getElementById('gui-log');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `> ${message}`;
            logContainer.prepend(entry);
        }
    },
    clear: function() {
        const logContainer = document.getElementById('gui-log');
        if (logContainer) logContainer.innerHTML = '';
    }
};

// === DOM ELEMENTER ===
const elements = {
    inputA: document.getElementById('input-a'),
    inputB: document.getElementById('input-b'),
    btnSetup: document.getElementById('btn-setup'),
    btnReset: document.getElementById('btn-reset'),
    sourceContainer: document.getElementById('source-container'),
    targetContainers: document.getElementById('target-containers'),
    algoA: document.getElementById('display-a'),
    algoB: document.getElementById('display-b'),
    algoResult: document.getElementById('display-result'),
    workSteps: document.getElementById('work-steps'),
    statusText: document.getElementById('instruction-text')
};

// === OPPGAVE-OPPSETT ===

function setupTask() {
    state.totalOriginal = parseInt(elements.inputA.value);
    state.divisor = parseInt(elements.inputB.value);
    state.remainingInSource = state.totalOriginal;
    state.placedInCurrentRound = 0;
    state.totalRoundsCompleted = 0;
    state.isInitialized = true;

    Logger.clear();
    Logger.log(`Klargjør: ${state.totalOriginal} delt på ${state.divisor}`, "success");

    // Nullstill UI
    elements.sourceContainer.innerHTML = '';
    elements.targetContainers.innerHTML = '';
    elements.workSteps.innerHTML = '';
    elements.algoResult.textContent = '?';
    elements.algoA.textContent = state.totalOriginal;
    elements.algoB.textContent = state.divisor;

    // Lag objekter (epler) i kilden
    for (let i = 0; i < state.totalOriginal; i++) {
        const obj = document.createElement('div');
        obj.className = 'math-object pop';
        obj.id = `obj-${i}`;
        obj.draggable = true;
        obj.addEventListener('dragstart', handleDragStart);
        elements.sourceContainer.appendChild(obj);
    }

    // Lag mottaker-bokser
    for (let i = 0; i < state.divisor; i++) {
        const box = document.createElement('div');
        box.className = 'target-box pop';
        box.id = `box-${i}`;
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('dragleave', handleDragLeave);
        box.addEventListener('drop', handleDrop);
        elements.targetContainers.appendChild(box);
    }

    elements.statusText.textContent = "Dra ett objekt til hver boks for å begynne delingen.";
}

// === DRAG AND DROP HANDLERS ===

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    Logger.log("Plukket opp objekt.");
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const objId = e.dataTransfer.getData('text/plain');
    const obj = document.getElementById(objId);
    const targetBox = e.currentTarget;

    // Validering: Kan vi slippe her?
    // Sjekk om boksen allerede har fått i denne runden
    const currentInThisBox = targetBox.querySelectorAll('.math-object').length;
    if (currentInThisBox > state.totalRoundsCompleted) {
        Logger.log("Denne boksen har allerede fått i denne runden! Velg en annen.", "info");
        elements.statusText.textContent = "Prøv å dele likt! Gi til en boks som har færre objekter.";
        return;
    }

    // Utfør flytting
    targetBox.appendChild(obj);
    state.remainingInSource--;
    state.placedInCurrentRound++;
    
    Logger.log(`Objekt plassert i boks. ${state.remainingInSource} igjen i kilden.`);

    // Sjekk om en hel runde er fullført
    if (state.placedInCurrentRound === state.divisor) {
        completeRound();
    }
}

// === MATEMATISK LOGIKK OG ALGORITME ===

function completeRound() {
    state.totalRoundsCompleted++;
    state.placedInCurrentRound = 0;
    
    Logger.log(`Runde ${state.totalRoundsCompleted} ferdig! Oppdaterer algoritme.`, "success");
    
    updateAlgorithmDisplay();

    if (state.remainingInSource < state.divisor) {
        finishTask();
    }
}

function updateAlgorithmDisplay() {
    // Oppdater kvotienten (svaret)
    elements.algoResult.textContent = state.totalRoundsCompleted;

    // Legg til et steg i arbeidsfeltet
    const step = document.createElement('div');
    const subtrahend = state.divisor;
    const currentRemainder = state.totalOriginal - (state.totalRoundsCompleted * state.divisor);
    
    step.innerHTML = `
        <div>- ${subtrahend} (runde ${state.totalRoundsCompleted})</div>
        <div class="step-subtraction">      </div>
        <div class="step-result">= ${currentRemainder} igjen</div>
    `;
    elements.workSteps.appendChild(step);
    
    elements.statusText.textContent = `Bra! Alle boksene har fått ${state.totalRoundsCompleted}. Fortsett å dele ut.`;
}

function finishTask() {
    const remainder = state.remainingInSource;
    if (remainder > 0) {
        elements.statusText.textContent = `Ferdig! Svaret er ${state.totalRoundsCompleted} med ${remainder} i rest.`;
        Logger.log(`Oppgave ferdig. Rest: ${remainder}`);
    } else {
        elements.statusText.textContent = `Perfekt! Alt er delt likt. Svaret er ${state.totalRoundsCompleted}.`;
        Logger.log(`Oppgave ferdig uten rest.`);
    }
}

function resetTask() {
    state.isInitialized = false;
    setupTask();
}

// === EVENT LISTENERS ===
elements.btnSetup.addEventListener('click', setupTask);
elements.btnReset.addEventListener('click', resetTask);

// Initial hilsen
Logger.log("System klar. Sett opp en oppgave for å begynne.", "info");

/* Version: #2 */
