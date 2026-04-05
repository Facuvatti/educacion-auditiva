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
