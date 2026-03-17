/* Version: #1 */

// === KONFIGURASJON OG TILSTAND ===
const state = {
    isRunning: false,
    cancelRequested: false,
    animationSpeed: 300 // ms mellom hvert steg
};

// === HJELPEFUNKSJONER (LOGGING) ===
const Logger = {
    log: function(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const fullMessage = `[${timestamp}] ${message}`;
        
        // Konsoll-logg
        console.log(`%c${fullMessage}`, type === 'success' ? 'color: #7ed321' : 'color: #4a90e2');
        
        // GUI-logg
        const logContainer = document.getElementById('gui-log');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = fullMessage;
            logContainer.prepend(entry); // Nyeste øverst
        }
    },
    clear: function() {
        const logContainer = document.getElementById('gui-log');
        if (logContainer) logContainer.innerHTML = '';
        console.clear();
        this.log("System nullstilt.", "info");
    }
};

// === DOM ELEMENTER ===
const elements = {
    inputA: document.getElementById('input-a'),
    inputB: document.getElementById('input-b'),
    opSelect: document.getElementById('operation'),
    btnStart: document.getElementById('btn-start'),
    btnReset: document.getElementById('btn-reset'),
    statusText: document.getElementById('instruction-text'),
    sourceContainer: document.getElementById('source-container'),
    targetContainers: document.getElementById('target-containers')
};

// === KJERNEFUNKSJONALITET ===

async function startVisualization() {
    if (state.isRunning) {
        Logger.log("En animasjon kjører allerede. Vennligst vent.", "info");
        return;
    }

    const valA = parseInt(elements.inputA.value);
    const valB = parseInt(elements.inputB.value);
    const mode = elements.opSelect.value;

    state.isRunning = true;
    state.cancelRequested = false;
    Logger.clear();
    Logger.log(`Starter ${mode}: A=${valA}, B=${valB}`, "info");

    // Nullstill arbeidsområdet
    elements.sourceContainer.innerHTML = '';
    elements.targetContainers.innerHTML = '';

    if (mode === 'multiply') {
        await handleMultiplication(valA, valB);
    } else {
        await handleDivision(valA, valB);
    }

    state.isRunning = false;
}

async function handleMultiplication(amountPerBox, boxCount) {
    elements.statusText.textContent = `Vi lager ${boxCount} esker og legger ${amountPerBox} i hver.`;
    
    // Opprett kasser
    for (let i = 0; i < boxCount; i++) {
        createTargetBox(i + 1);
    }

    let totalCounter = 0;
    for (let b = 0; b < boxCount; b++) {
        const currentBox = elements.targetContainers.children[b];
        Logger.log(`Fyller eske ${b + 1}...`);
        
        for (let a = 0; a < amountPerBox; a++) {
            if (state.cancelRequested) return;
            
            addObjectToContainer(currentBox);
            totalCounter++;
            currentBox.setAttribute('data-count', (a + 1));
            elements.statusText.textContent = `Teller: ${totalCounter}`;
            
            await sleep(state.animationSpeed);
        }
    }
    
    elements.statusText.textContent = `Ferdig! ${amountPerBox} x ${boxCount} = ${totalCounter}`;
    Logger.log(`Multiplikasjon ferdig. Totalt: ${totalCounter}`, "success");
}

async function handleDivision(totalAmount, divisor) {
    elements.statusText.textContent = `Vi starter med ${totalAmount} og deler på ${divisor} esker.`;
    
    // Lag kilden (eplene som skal deles ut)
    for (let i = 0; i < totalAmount; i++) {
        addObjectToContainer(elements.sourceContainer);
    }

    // Lag mottaker-kasser
    for (let i = 0; i < divisor; i++) {
        createTargetBox(i + 1);
    }

    await sleep(1000); // Pause for å se utgangspunktet

    let remaining = totalAmount;
    let round = 0;

    while (remaining >= divisor) {
        round++;
        Logger.log(`Runde ${round}: Deler ut ett element til hver kasse.`);
        
        for (let i = 0; i < divisor; i++) {
            if (state.cancelRequested) return;

            // Fjern fra kilde
            if (elements.sourceContainer.lastElementChild) {
                elements.sourceContainer.removeChild(elements.sourceContainer.lastElementChild);
                
                // Legg til i kasse
                const targetBox = elements.targetContainers.children[i];
                addObjectToContainer(targetBox);
                
                remaining--;
                const currentInBox = Math.floor((totalAmount - remaining) / divisor);
                targetBox.setAttribute('data-count', round);
                
                Logger.log(`Flyttet element til eske ${i+1}. Rest: ${remaining}`);
                await sleep(state.animationSpeed);
            }
        }
    }

    const restText = remaining > 0 ? ` med ${remaining} til overs.` : ".";
    elements.statusText.textContent = `Ferdig! Hver eske fikk ${round}${restText}`;
    Logger.log(`Divisjon ferdig. Svar: ${round}, Rest: ${remaining}`, "success");
}

// === HJELPERE FOR UI ===

function createTargetBox(id) {
    const box = document.createElement('div');
    box.className = 'target-box pop';
    box.setAttribute('data-count', '0');
    elements.targetContainers.appendChild(box);
}

function addObjectToContainer(container) {
    const obj = document.createElement('div');
    obj.className = 'math-object pop';
    container.appendChild(obj);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetAll() {
    state.cancelRequested = true;
    state.isRunning = false;
    elements.sourceContainer.innerHTML = '';
    elements.targetContainers.innerHTML = '';
    elements.statusText.textContent = "Velg tall og trykk start.";
    Logger.clear();
}

// === EVENT LISTENERS ===
elements.btnStart.addEventListener('click', startVisualization);
elements.btnReset.addEventListener('click', resetAll);

// Initial logg
Logger.log("System klart. Venter på bruker-input.", "info");

/* Version: #1 */
