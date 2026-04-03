const root = document.documentElement; // el <html>
const toggleLabel = document.querySelector("#theme-label");

// Al cargar: respeta lo guardado en localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    updateToggleLabel(savedTheme);
}

document.querySelector("#theme-toggle").addEventListener("click", () => {
    // Si ya tiene tema forzado, alternamos; si no, miramos el sistema
    const currentTheme = root.getAttribute("data-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = currentTheme === "dark" || (!currentTheme && systemDark);
    const newTheme = isDark ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);  // persiste entre sesiones
    updateToggleLabel(newTheme);
});

function updateToggleLabel(theme) {
    toggleLabel.textContent = theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let tags = ["T","","ST","","M","SD","","D","","SPD","","S"];
tags = [...tags,...tags,...tags];
let notes_tonalidad = [];
let pianoInstrument = null;
const audioContext = new AudioContext();
const loadingPromise = Soundfont.instrument(audioContext, 'acoustic_grand_piano')
.then(instrument => {
    pianoInstrument = instrument;
});
async function unlockAudio() {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  // Espera que el instrumento termine de cargar
  await loadingPromise;
  console.log('✅ Piano listo');
  return pianoInstrument;
}
document.body.addEventListener('click', async ()=> {await unlockAudio()}, { once: true })


const octava = document.querySelector("select[name='octava']");
octava.addEventListener("change", () => {
    notation.dispatchEvent(new Event('change'));
});
Soundfont.instrument('piano', 'acoustic_grand_piano').then((instrument) => {
    
})
const notation = document.querySelector("select[name='notation']");
const ids = ["C","C#", "D","D#", "E", "F","F#", "G","G#", "A","A#", "B"];
notation.addEventListener("change", () => {
    let notas;
    let tonalidad = document.createElement("select");
    tonalidad.name = "tonalidad";
    if(notation.value == "Americana") {
        notas = ids;
    } else {
        notas = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La","La#", "Si"];
    }
    for(let i = 0; i < 12; i++) {
        let option = document.createElement("option");
        option.textContent = notas[i];
        option.value = ids[i];
        tonalidad.append(option);
    }
    selectTone();
    document.querySelector("select[name='tonalidad']").replaceWith(tonalidad);
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'))
});
const tonalidad = document.querySelector("select[name='tonalidad']");
tonalidad.addEventListener("change", () => {
    
});
const progression = document.querySelector("#progression");
progression.addEventListener("click", async () => {
    progression.disabled = true;
    progression.textContent = "Progresionando";
    const amount = document.querySelector("select[name='progression-notes']");
    await delay(1000);
    for(let i = 0; i < amount.value; i++) {
        const index = Math.floor(Math.random() * notes_tonalidad.length);
        const noteChosen = notes_tonalidad[index];
        const buttonChosen = document.querySelector(`button[id="${noteChosen}"]`);
        console.log(index, noteChosen, buttonChosen);
        buttonChosen.dispatchEvent(new Event('click'));
        buttonChosen.classList.add("active");
        await delay(document.querySelector("select[name='dificulty']").value);
        buttonChosen.classList.remove("active");
    }
    progression.disabled = false;
    progression.textContent = "Progresión";
});
notation.dispatchEvent(new Event('change'));
octava.dispatchEvent(new Event('change'));
function selectTone(){
    notes_tonalidad = [];
    let latinNotation = [];
    let ul = document.createElement("ul");
    ul.id = "notas";

    
    for(let oct=-1;oct<=1;oct++){
        for(let i = 0; i < 12; i++) {
            let note = `${ids[i]}${parseInt(octava.value) + oct}`;
            notes_tonalidad.push(note);
            let note1 = `${ids[i]}${parseInt(octava.value) + oct}`;
            latinNotation.push(note1);
        }
        
    }
    for(let i = 0; i < notes_tonalidad.length; i++) {
        let nota = notes_tonalidad[i]
        let li = document.createElement("li");
        let btn = document.createElement("button");
        if(document.querySelector("input[name='see-notes']").checked){ 
            if(document.querySelector("select[name='notation']").value == "Latina") btn.textContent = latinNotation[i];
            else btn.textContent = notes_tonalidad[i];
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
document.querySelector("input[name='see-notes']").addEventListener("change", () => {
    selectTone();
})
document.querySelector("select[name='notation']").addEventListener("change", () => {
    selectTone();
})
