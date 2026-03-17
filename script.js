/* Version: #3 */

// === TILSTANDSSTYRING ===
const state = {
    totalOriginal: 0,
    divisor: 0,
    remainingInSource: 0,
    totalMovedToBoxes: 0, // Totalt flyttet siden start
    lastRecordedMoved: 0, // Hvor mange var flyttet ved forrige tavle-føring
    selectedElement: null,
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
    btnUpdateStep: document.getElementById('btn-update-step'),
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
    state.totalMovedToBoxes = 0;
    state.lastRecordedMoved = 0;
    state.selectedElement = null;
    state.isInitialized = true;

    Logger.clear();
    Logger.log(`Oppgave startet: ${state.totalOriginal} : ${state.divisor}`, "success");

    elements.sourceContainer.innerHTML = '';
    elements.targetContainers.innerHTML = '';
    elements.workSteps.innerHTML = '';
    elements.algoResult.textContent = '?';
    elements.algoA.textContent = state.totalOriginal;
    elements.algoB.textContent = state.divisor;

    // Opprett kuler
    for (let i = 0; i < state.totalOriginal; i++) {
        const obj = document.createElement('div');
        obj.className = 'math-object pop';
        obj.id = `obj-${i}`;
        obj.draggable = true;
        
        // Event listeners for både touch/klikk og drag
        obj.addEventListener('click', handleObjectClick);
        obj.addEventListener('dragstart', handleDragStart);
        
        elements.sourceContainer.appendChild(obj);
    }

    // Opprett bokser
    for (let i = 0; i < state.divisor; i++) {
        const box = document.createElement('div');
        box.className = 'target-box pop';
        box.id = `box-${i}`;
        
        box.addEventListener('click', handleBoxClick);
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('dragleave', handleDragLeave);
        box.addEventListener('drop', handleDrop);
        
        elements.targetContainers.appendChild(box);
    }

    elements.statusText.textContent = "Trykk på en kule og så på en boks for å flytte den.";
}

// === INTERAKSJONS-LOGIKK (KLIKK OG DRAG) ===

function handleObjectClick(e) {
    e.stopPropagation();
    if (state.selectedElement) {
        state.selectedElement.classList.remove('selected');
    }
    
    state.selectedElement = e.currentTarget;
    state.selectedElement.classList.add('selected');
    Logger.log("Kule valgt. Velg en boks å legge den i.");
}

function handleBoxClick(e) {
    if (state.selectedElement) {
        moveObject(state.selectedElement, e.currentTarget);
        state.selectedElement.classList.remove('selected');
        state.selectedElement = null;
    }
}

// Drag & Drop støtte (for de som foretrekker det)
function handleDragStart(e) {
    state.selectedElement = e.target;
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (state.selectedElement) {
        moveObject(state.selectedElement, e.currentTarget);
        state.selectedElement = null;
    }
}

// Felles flyttefunksjon
function moveObject(obj, targetBox) {
    targetBox.appendChild(obj);
    state.totalMovedToBoxes++;
    state.remainingInSource--;
    
    Logger.log(`Flyttet kule til ${targetBox.id}. Totalt flyttet: ${state.totalMovedToBoxes}`);
    
    if (state.remainingInSource === 0) {
        elements.statusText.textContent = "Alle kuler er fordelt! Husk å føre det siste på tavla.";
    }
}

// === ALGORITME-FØRING (TAVLA) ===

function recordStepOnBoard() {
    if (!state.isInitialized) return;

    const newlyMoved = state.totalMovedToBoxes - state.lastRecordedMoved;
    
    if (newlyMoved === 0) {
        Logger.log("Ingen nye kuler er flyttet siden forrige føring.", "info");
        return;
    }

    // Finn gjennomsnitt per boks for tavla (pedagogisk forenkling)
    const averagePerBox = Math.floor(state.totalMovedToBoxes / state.divisor);
    const currentRemainder = state.totalOriginal - state.totalMovedToBoxes;

    // Oppdater resultatet øverst
    elements.algoResult.textContent = averagePerBox;

    // Lag et visuelt steg
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-entry';
    stepDiv.style.marginBottom = "10px";
    
    stepDiv.innerHTML = `
        <div style="color: #64748b; font-size: 0.9rem;">Steg ${elements.workSteps.children.length + 1}:</div>
        <div>- ${newlyMoved} kuler fordelt</div>
        <div class="step-subtraction">      </div>
        <div class="step-result">= ${currentRemainder} igjen</div>
    `;
    
    elements.workSteps.appendChild(stepDiv);
    state.lastRecordedMoved = state.totalMovedToBoxes;

    Logger.log(`Førte opp på tavla: -${newlyMoved}. Rest nå: ${currentRemainder}`, "success");

    if (currentRemainder === 0) {
        finishTask(averagePerBox);
    }
}

function finishTask(finalResult) {
    elements.statusText.textContent = `Ferdig! Svaret er ${finalResult}.`;
    Logger.log("Oppgaven er fullført og ført på tavla.", "success");
}

function resetAll() {
    Logger.clear();
    setupTask();
}

// === EVENT LISTENERS ===
elements.btnSetup.addEventListener('click', setupTask);
elements.btnReset.addEventListener('click', resetAll);
elements.btnUpdateStep.addEventListener('click', recordStepOnBoard);

// Klikk utenfor for å fjerne valg
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('math-object') && state.selectedElement) {
        state.selectedElement.classList.remove('selected');
        state.selectedElement = null;
    }
});

/* Version: #3 */
