function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
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
    let ul = document.createElement("ul");
    ul.id = "notas";
    let tonalidad = document.createElement("select");
    tonalidad.name = "tonalidad";
    if(notation.value == "Americana") {
        notas = ["C","C#", "D","D#", "E", "F","F#", "G","G#", "A","A#", "B"]
    } else {
        notas = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La","La#", "Si"]
    }
    for(let i = 0; i < 12; i++) {
        let nota =`${ids[i]}${octava.value}`
        let li = document.createElement("li");
        let btn = document.createElement("button");
        let option = document.createElement("option");

        btn.textContent = `${notas[i]}${octava.value}`;
        btn.addEventListener("click", () => {
            if(pianoInstrument) {
                pianoInstrument.play(nota);
            }
        })
        btn.id = ids[i];
        li.append(btn);
        li.id=nota;
        option.textContent = notas[i];
        option.value = ids[i];
        ul.append(li);
        tonalidad.append(option);
    }
    document.querySelector("#notas").replaceWith(ul);
    document.querySelector("select[name='tonalidad']").replaceWith(tonalidad);
    document.querySelector("select[name='tonalidad']").dispatchEvent(new Event('change'))
});
const tonalidad = document.querySelector("select[name='tonalidad']");
tonalidad.addEventListener("change", () => {
    
});
const progression = document.querySelector("#progression");
progression.addEventListener("click", async () => {
    const amount = document.querySelector("select[name='progression-notes']");
    for(let i = 0; i < amount.value; i++) {
        const index = Math.floor(Math.random() * ids.length);
        const noteChosen = ids[index];
        const buttonChosen = document.querySelector(`button[id="${noteChosen}"]`);
        console.log(index, noteChosen, buttonChosen);
        buttonChosen.dispatchEvent(new Event('click'));
        await delay(1000);
    }
});
notation.dispatchEvent(new Event('change'));
octava.dispatchEvent(new Event('change'));