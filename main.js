const majorScalePattern = ["T", "T", "ST", "T", "T", "T", "ST"];
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function selectRandomOption(selectElement) {
    const options = selectElement.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    selectElement.selectedIndex = randomIndex;
    selectElement.dispatchEvent(new Event("change"));
}

let american;
let latin;
function tonalityToTonalFunctions(tonalityArray) {
    const tonalFunctionsRaw = ["T", "ST", "M", "SD", "D", "SPD", "S","T"];
    let tonalIndex = 0;
    const tonalFunctions = [];
    
    for (let i = 0; i < tonalityArray.length; i++) {
        if (tonalityArray[i][1]) {
            // Si hay una nota, la reemplazamos con la función tonal correspondiente
            tonalFunctions.push(tonalFunctionsRaw[tonalIndex]);
            tonalIndex++; // Avanzamos solo cuando encontramos una nota
        } else {
            // Si está vacío, lo dejamos vacío
            tonalFunctions.push("");
        }
    }
    return tonalFunctions;
}
function getNotesWithOctaves(notes) {
    let notesWithOctaves = [];
    for(let oct=-1;oct<=0;oct++){
        for(let i = 0; i < 12; i++) {
            let note = [`${notes[i][0]}${parseInt(octave.value) + oct}`, notes[i][1]];
            notesWithOctaves.push(note);
        }
    }
    return notesWithOctaves;
}
let notes;
let latinNotation;
function createNotesbuttons(){
    notes = getNotesWithOctaves(american);
    latinNotation = getNotesWithOctaves(latin);
    let ul = document.createElement("ul");
    ul.id = "notes";
    tonalFunctions = tonalityToTonalFunctions(
        getTonality(
            document.querySelector("select[name='tonality']").value,
            majorScalePattern,
            false)
    );
    tonalFunctions = [...tonalFunctions,...tonalFunctions];

    
    for(let i = 0; i < notes.length; i++) {
        let note = notes[i][0];
        let li = document.createElement("li");
        let btn = document.createElement("button");
        if(document.querySelector("input[name='see-notes']").checked && !document.querySelector("input[name='hide-tonality']").checked) {
            if(document.querySelector("select[name='notation']").value == "Latina") {
                if(!latinNotation[i][1]) {
                    if(document.querySelector("input[name='see-tinyCircles']").checked) btn.classList.add("tinyCircle");
                    else btn.display = "none";
                }
                btn.textContent = latinNotation[i][0];
            }
            else {
                if(!notes[i][1]) {
                    if(document.querySelector("input[name='see-tinyCircles']").checked) btn.classList.add("tinyCircle");
                    else btn.display = "none";
                }
                btn.textContent = notes[i][0];
            }
            if(document.querySelector("input[name='hide-octave']").checked) btn.textContent = btn.textContent.slice(0,-1);
        }
        else btn.textContent = tonalFunctions[i];
        btn.addEventListener("click", () => {
            if(pianoInstrument) {
                pianoInstrument.play(note);
            }
        })
        btn.id = notes[i][0];
        li.append(btn);
        li.id = note;
        ul.append(li);
    }
    document.querySelector("#notes").replaceWith(ul);
    const tonic = document.querySelector("select[name='tonality']").value;
    const tonicButtons = [...document.querySelectorAll(`button[id^="${tonic}"]`)]
        .filter(btn => tonic.includes("#") || !btn.id.includes("#"));
    tonicButtons.forEach(button => {
        button.classList.add("tonic");
    })
}
function getTonality(tonic, scale, latin = false) {
    const chromaticScale = !latin 
        ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        : ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
    
    // Reordenar escala cromática desde tonic
    const tonicIndex = chromaticScale.indexOf(tonic);
    
    const orderedNotes = [
        ...chromaticScale.slice(tonicIndex),
        ...chromaticScale.slice(0, tonicIndex)
    ];
    
    // Calcular las notas de la escala
    const scaleNotes = [orderedNotes[0]];
    let noteIndex = 0;
    
    for (let i = 0; i < scale.length; i++) {
        const step = scale[i] === "T" ? 2 : 1;
        noteIndex = (noteIndex + step) % 12;
        scaleNotes.push(orderedNotes[noteIndex]);
    }
    
    // Crear array de dos dimensiones con notas y booleanos
    const result = orderedNotes.map(note => {
        return [note, scaleNotes.includes(note)];
    });
    
    return result;
}
const playButtons = () => [
    document.querySelector("#progression"),
    document.querySelector("#repeat"),
    document.querySelector("#play-history"),
];

function lockPlayButtons() {
    playButtons().forEach(btn => btn.disabled = true);
}

function unlockPlayButtons() {
    playButtons().forEach(btn => btn.disabled = false);
}
async function playProgression(notes) {
    lockPlayButtons();
    const speed = document.querySelector("input[name='speed']");
    const hideProgression = document.querySelector("input[name='hide-progression']");
    for (let i = 0; i < notes.length; i++) {
        const buttonId = notes[i];
        const buttonChosen = document.querySelector(`button[id="${buttonId}"]`);
        buttonChosen.dispatchEvent(new Event('click'));
        if (!hideProgression.checked) {
            buttonChosen.classList.add("active");
        }
        await delay(speed.value);
        buttonChosen.classList.remove("active");
    }
    unlockPlayButtons();
}
function dateIdentifier() {
    const now = new Date();
    const datetime = now.toLocaleString('en-CA').slice(0, 19);
    console.log(datetime)
    return datetime;
}
function saveProgression(progression) {
    const history = JSON.parse(localStorage.getItem("history")) || {};
    
    const alreadyExists = Object.values(history).some(
        saved => JSON.stringify(saved) === JSON.stringify(progression)
    );
    if (alreadyExists) return;

    const identifier = dateIdentifier();
    history[identifier] = progression;
    localStorage.setItem("history", JSON.stringify(history));
}
function getHistory(prefix) {
    const history = JSON.parse(localStorage.getItem("history")) || {};
    return Object.entries(history)
        .filter(([key, value]) => key.startsWith(prefix))
        .map(([key, value]) => {
            const newKey = key.slice(prefix.length+2);
            return [newKey, value];
        });
}
function makeOptions(options, select) {
    select.innerHTML = options.map(item => {
        return `<option value="${item[1]}">${Object.values(item)[0]}</option>`
    }).join('');
}
function hide(selector,checkbox) {
    const element = document.querySelector(selector);
    const parent = element.parentElement;
   if(checkbox.checked) parent.style.display = 'none';
   else parent.style.display = 'flex';
}
async function unlockAudio() {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  // Espera que el instrumento termine de cargar
  await loadingPromise;
  console.log('✅ Piano listo');
  return pianoInstrument;
}
let pianoInstrument = null;
const audioContext = new AudioContext();
const loadingPromise = Soundfont.instrument(audioContext, 'acoustic_grand_piano')
.then(instrument => {
    pianoInstrument = instrument;
});
document.body.addEventListener('click', async ()=> {await unlockAudio()}, { once: true })
Soundfont.instrument('piano', 'acoustic_grand_piano').then((instrument) => {
})



const octave = document.querySelector("select[name='octave']");
octave.addEventListener("change", () => {
    notation.dispatchEvent(new Event('change'));
});


const notation = document.querySelector("select[name='notation']");
let tonalFunctions;
notation.addEventListener("change", () => {
    const americanNotation = ["C","C#", "D","D#", "E", "F","F#", "G","G#", "A","A#","B"];
    const latin = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La","La#", "Si"];
    let notes;
    const tonality = document.querySelector("select[name='tonality']");
    tonality.innerHTML = "";
    if(notation.value == "Americana") notes = americanNotation;
    else notes = latin;
    for(let i = 0; i < 12; i++) {
        let option = document.createElement("option");
        option.textContent = notes[i];
        option.value = americanNotation[i];
        tonality.append(option);
    }
    document.querySelector("select[name='tonality']").dispatchEvent(new Event('change'))
});


const tonality = document.querySelector("select[name='tonality']");
tonality.addEventListener("change", () => {
    

    let tonic = tonality.value;

    american = getTonality(tonic,majorScalePattern,false);
    latin = getTonality(tonic,majorScalePattern,true);
    createNotesbuttons();
    // [...document.querySelectorAll(`button[id^="${tonic}"]`)]
    // .filter(btn => tonic.includes("#") || !btn.id.includes("#"))
    // .forEach(button => {
    //     Object.assign(button.style, {
    //         transform: "scale(1.3)",
    //         fontSize: "20px",
    //     });
    //     button.parentElement.style.height = "calc(var(--distance-between-circles) * 1.4) !important";
    // });
});
let savedProgression = [];
const progression = document.querySelector("#progression");
progression.addEventListener("click", async () => {
    savedProgression = [];
    progression.disabled = true;
    progression.textContent = "...";
    const amount = document.querySelector("input[name='progression-notes']");
    const tonic = document.querySelector("select[name='tonality']").value;
    const tonicButtons = [...document.querySelectorAll(`button[id^="${tonic}"]`)]
        .filter(btn => tonic.includes("#") || !btn.id.includes("#"));
    await delay(1000);
    for(let i = 0; i < amount.value; i++) {
        if (i == amount.value - 1) {
            const randomTonic = tonicButtons[Math.floor(Math.random() * tonicButtons.length)];
            savedProgression.push(randomTonic.id);
        } else {
            const index = Math.floor(Math.random() * notes.length);
            const selectedNote = notes[index][0];
            savedProgression.push(selectedNote);
        }
    }
    playProgression(savedProgression);
    progression.disabled = false;
    progression.textContent = "▶";
    document.querySelector("#save-history").disabled = false;
    document.querySelector("#repeat").disabled = false;
});
document.querySelector("#save-history").addEventListener("click", () => {
    saveProgression(savedProgression)
    document.querySelector("#save-history").disabled = true;
    document.querySelector("input[name='history-date']").dispatchEvent(new Event('change'));
});

notation.dispatchEvent(new Event('change'));
tonality.dispatchEvent(new Event('change'));
octave.dispatchEvent(new Event('change'));

const seeNotes = document.querySelector("input[name='see-notes']");
seeNotes.addEventListener("change", () => {
    if(!document.querySelector("input[name='hide-tonality']").checked) {
        document.querySelector("select[name='tonality']").dispatchEvent(new Event('change'));
    }
    else {
        seeNotes.checked = false;
        seeNotes.disabled = true;
    }
})
document.querySelector("select[name='notation']").addEventListener("change", () => {
    document.querySelector("select[name='tonality']").dispatchEvent(new Event('change'));
})

document.querySelector("#tonality-random").addEventListener("click", ()=> selectRandomOption(document.querySelector("select[name='tonality']")));
document.querySelector("#octave-random").addEventListener("click", ()=> selectRandomOption(document.querySelector("select[name='octave']")));

const hideTonality = document.querySelector("input[name='hide-tonality']")
hideTonality.addEventListener("change", () => {
    hide("select[name='tonality']",hideTonality);
    document.querySelector("select[name='tonality']").dispatchEvent(new Event('change'));
    seeNotes.checked = false;
    if(!hideTonality.checked) seeNotes.disabled = false;
});
const hideoctave = document.querySelector("input[name='hide-octave']")
hideoctave.addEventListener("change", () => {
    hide("select[name='octave']",hideoctave)
    document.querySelector("select[name='tonality']").dispatchEvent(new Event('change'));
});
document.querySelector("input[name='see-tinyCircles']").addEventListener("change",()=>{
    if(this.value){ 
        document.querySelectorAll("#notes > li > button:empty").forEach(element =>{
            element.classList.add("tinyCircle");
        })
        document.querySelectorAll("#notes > li:has(button:empty)").forEach(element =>{
            element.classList.add("tinyCircleLi");
        })
    } else {
        
    }
})
document.querySelector("#clear-history").addEventListener("click", async() => {
    if(confirm("¿Seguro que querés borrar todo el historial?")){
        await delay(3000);
        localStorage.clear();
    }
});
const historyDate = document.querySelector("input[name='history-date']");
historyDate.value = new Date().toLocaleDateString('en-CA').split(', ')[0];

historyDate.addEventListener("change", () => {
    const listOfProgressions = getHistory(historyDate.value);
    makeOptions(listOfProgressions, document.querySelector("select[name='history']"));
});
historyDate.dispatchEvent(new Event('change'));
const historySelect = document.querySelector("select[name='history']");
const playHistory = document.querySelector("#play-history");
playHistory.addEventListener("click", () => {
    console.log(historySelect.value);
    playProgression(historySelect.value.split(','))
});

const repeat = document.getElementById("repeat");
repeat.addEventListener("click", () => playProgression(savedProgression));
