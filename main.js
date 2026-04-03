
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function selectRandomOption(selectElement) {
    const options = selectElement.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    selectElement.selectedIndex = randomIndex;
    selectElement.dispatchEvent(new Event("change"));
}
function selectTone(){
    notes_tonalidad = [];
    let latinNotation = [];
    let ul = document.createElement("ul");
    ul.id = "notas";

    
    for(let oct=-1;oct<=1;oct++){
        for(let i = 0; i < 12; i++) {
            let note = `${americano[i]}${parseInt(octava.value) + oct}`;
            notes_tonalidad.push(note);
            let note1 = `${latin[i]}${parseInt(octava.value) + oct}`;
            latinNotation.push(note1);
        }
        
    }
    for(let i = 0; i < notes_tonalidad.length; i++) {
        let nota = notes_tonalidad[i]
        let li = document.createElement("li");
        let btn = document.createElement("button");
        if(document.querySelector("input[name='see-notes']").checked && !document.querySelector("input[name='hide-tonalidad']").checked) {
            console.log(document.querySelector("select[name='notation']").value == "Latina");
            if(document.querySelector("select[name='notation']").value == "Latina") btn.textContent = latinNotation[i];
            else btn.textContent = notes_tonalidad[i];
            if(document.querySelector("input[name='hide-octava']").checked) btn.textContent = btn.textContent.slice(0,-1);
        }
        else btn.textContent = tags[i];
        btn.addEventListener("click", () => {
            if(pianoInstrument) {
                pianoInstrument.play(nota);
            }
        })
        btn.id = notes_tonalidad[i];
        li.append(btn);
        li.id = nota;
        ul.append(li);
    }
    document.querySelector("#notas").replaceWith(ul);
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



const octava = document.querySelector("select[name='octava']");
octava.addEventListener("change", () => {
    notation.dispatchEvent(new Event('change'));
});


const notation = document.querySelector("select[name='notation']");
let americano = ["C","C#", "D","D#", "E", "F","F#", "G","G#", "A","A#","B"];
let latin = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La","La#", "Si"];
let tags;
let notes_tonalidad = [];
notation.addEventListener("change", () => {
    let notas;
    const tonalidad = document.querySelector("select[name='tonalidad']");
    tonalidad.innerHTML = "";
    if(notation.value == "Americana") notas = americano;
    else notas = latin;
    for(let i = 0; i < 12; i++) {
        let option = document.createElement("option");
        option.textContent = notas[i];
        option.value = americano[i];
        tonalidad.append(option);
    }
    selectTone();
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'))
});


const tonalidad = document.querySelector("select[name='tonalidad']");
tonalidad.addEventListener("change", () => {
    tags = ["T","ST","M","SD","D","SPD","S"];
    let tonic = tonalidad.value;
    // 1. Find the index of the root note in the chromatic scale
    const rootIndex = americano.indexOf(tonic);
    if (rootIndex === -1) throw new Error(`Note "${tonic}" not found in chromatic scale`);
    // 2. Rotate the chromatic scale so it starts on the root note
    americano = [
    ...americano.slice(rootIndex),
    ...americano.slice(0, rootIndex)
    ];
    latin = [
    ...latin.slice(rootIndex),
    ...latin.slice(0, rootIndex)
    ];
    // 3. Build the formatted tags array:
    //    - "" for sharp positions, next tag for natural note positions
    let tagIndex = 0;
    const formattedTags = americano.map((note) => {
    if (note.includes("#")) {
        return "";               // Sharp position → empty slot
    } else {
        return tags[tagIndex++]; // Natural note → assign next tag
    }
    });

    // 4. Repeat for 3 octaves
    tags = [...formattedTags, ...formattedTags, ...formattedTags];
    selectTone();
    [...document.querySelectorAll(`button[id^="${tonic}"]`)]
    .filter(btn => tonic.includes("#") || !btn.id.includes("#"))
    .forEach(button => {
        Object.assign(button.style, {
            transform: "scale(1.3)",
            fontSize: "20px",
        });
        button.parentElement.style.height = "calc(var(--distance-between-circles) * 1.4) !important";
    });
});
const progression = document.querySelector("#progression");
progression.addEventListener("click", async () => {
    progression.disabled = true;
    progression.textContent = "Progresionando";
    const amount = document.querySelector("select[name='progression-notes']");
    const tonic = document.querySelector("select[name='tonalidad']").value;
    const tonicButtons = [...document.querySelectorAll(`button[id^="${tonic}"]`)]
        .filter(btn => tonic.includes("#") || !btn.id.includes("#"));
    await delay(1000);
    for(let i = 0; i < amount.value; i++) {
        if (i == amount.value - 1) {
            buttonChosen = tonicButtons[Math.floor(Math.random() * tonicButtons.length)];
        } else {
            const index = Math.floor(Math.random() * notes_tonalidad.length);
            buttonChosen = document.querySelector(`button[id="${notes_tonalidad[index]}"]`);
        }
        buttonChosen.dispatchEvent(new Event('click'));
        buttonChosen.classList.add("active");
        await delay(document.querySelector("select[name='dificulty']").value);
        buttonChosen.classList.remove("active");
    }
    progression.disabled = false;
    progression.textContent = "Progresión";
});


notation.dispatchEvent(new Event('change'));
tonalidad.dispatchEvent(new Event('change'));
octava.dispatchEvent(new Event('change'));

const seeNotes = document.querySelector("input[name='see-notes']");
seeNotes.addEventListener("change", () => {
    if(!document.querySelector("input[name='hide-tonalidad']").checked) {
        document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'));
    }
    else {
        seeNotes.checked = false;
        seeNotes.disabled = true;
    }
})
document.querySelector("select[name='notation']").addEventListener("change", () => {
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'));
})

document.querySelector("#tonalidad-random").addEventListener("click", ()=> selectRandomOption(document.querySelector("select[name='tonalidad']")));
document.querySelector("#octava-random").addEventListener("click", ()=> selectRandomOption(document.querySelector("select[name='octava']")));

const hideTonalidad = document.querySelector("input[name='hide-tonalidad']")
hideTonalidad.addEventListener("change", () => {
    hide("select[name='tonalidad']",hideTonalidad);
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'));
    seeNotes.checked = false;
    if(!hideTonalidad.checked) seeNotes.disabled = false;
});
const hideOctava = document.querySelector("input[name='hide-octava']")
hideOctava.addEventListener("change", () => {
    hide("select[name='octava']",hideOctava)
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'));
});