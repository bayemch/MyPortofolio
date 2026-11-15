const mainMenu = document.getElementById("main-menu");
const panels = document.querySelectorAll(".panel");

// Warna merah biasa (terang) untuk huruf acak di menu utama
const lightBlues = ["#ffffff", "#e6fbff", "#9cf0ff", "#6fe9ff", "#c9f7ff"];
const darkReds = ["#e11d2e", "#ff2a2a", "#d92d2d", "#f03a3a", "#ff4040"];
const menuButtons = document.querySelectorAll(".menu-button");

// Pecah teks tiap menu jadi huruf-huruf, lalu beri sebagian huruf warna acak
function buildMenuLabels() {
    menuButtons.forEach((btn) => {
        const text = btn.dataset.label || btn.textContent.trim();
        btn.dataset.label = text;
        btn.setAttribute("aria-label", text);
        btn.textContent = "";

        const layer = document.createElement("span");
        layer.className = "layer";
        layer.setAttribute("aria-hidden", "true");
        btn.appendChild(layer);

        const label = document.createElement("span");
        label.className = "label";
        label.setAttribute("aria-hidden", "true");
        btn.appendChild(label);

        [...text].forEach((ch) => {
            if (ch === " ") {
                label.appendChild(document.createTextNode(" "));
                return;
            }
            const span = document.createElement("span");
            span.className = "ch";
            span.textContent = ch;
            label.appendChild(span);
        });
    });
}

// Acak ulang huruf mana yang berwarna merah gelap
function randomizeLetters() {
    const palette = document.documentElement.dataset.theme === "light" ? lightBlues : darkReds;
    document.querySelectorAll(".menu-button .ch").forEach((span) => {
        if (Math.random() < 0.4) {
            const color = palette[Math.floor(Math.random() * palette.length)];
            span.style.setProperty("--c", color);
        } else {
            span.style.removeProperty("--c");
        }
    });
}

// Bar skill: data-level (1-10) diubah jadi 10 segmen; segmen terakhir yang terisi ditandai "tip"
function buildSkillBars() {
    document.querySelectorAll(".skill-row").forEach((row) => {
        const level = Math.max(0, Math.min(10, parseInt(row.dataset.level, 10) || 0));
        const name = row.querySelector(".skill-name").textContent;
        const bar = document.createElement("span");
        bar.className = "skill-bar";
        bar.setAttribute("role", "meter");
        bar.setAttribute("aria-label", name);
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "10");
        bar.setAttribute("aria-valuenow", level);
        for (let s = 0; s < 10; s++) {
            const seg = document.createElement("span");
            seg.className = "seg" + (s < level ? " on" : "") + (s === level - 1 ? " tip" : "");
            seg.style.setProperty("--s", s);
            bar.appendChild(seg);
        }
        row.insertBefore(bar, row.querySelector(".skill-level"));
        if (level === 10) {
            row.classList.add("max");
            row.querySelector(".skill-level").textContent = "MAX";
        }
    });
}

buildMenuLabels();
buildSkillBars();
randomizeLetters();

// Nomor urut tiap menu, dipakai CSS agar menu masuk satu per satu
menuButtons.forEach((btn, m) => btn.style.setProperty("--m", m));

// Pecah nama jadi huruf-huruf agar bisa muncul satu per satu saat halaman dibuka
const nameEl = document.querySelector(".header h1");
const nameText = nameEl.textContent.trim();
nameEl.setAttribute("aria-label", nameText);
nameEl.textContent = "";
let letterIndex = 0;
nameText.split(" ").forEach((word, w) => {
    if (w > 0) nameEl.appendChild(document.createTextNode(" "));
    // Satu kata = satu pembungkus nowrap, jadi baris hanya boleh putus di antara kata
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    [...word].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--k", letterIndex++);
        span.textContent = ch;
        wordEl.appendChild(span);
    });
    nameEl.appendChild(wordEl);
    letterIndex++; // celah spasi tetap dihitung agar jeda animasi sama seperti sebelumnya
});

// Tiap huruf nama punya arah gerak dan kemiringan sendiri saat di-hover
const header = document.querySelector(".header");

function randomizeNameMotion() {
    nameEl.querySelectorAll(".letter").forEach((span) => {
        span.style.setProperty("--dx", (Math.random() * 12 - 6).toFixed(1) + "px");
        span.style.setProperty("--dy", (Math.random() * 16 - 8).toFixed(1) + "px");
        span.style.setProperty("--r", (Math.random() * 26 - 13).toFixed(1) + "deg");
    });
}
randomizeNameMotion();
// Acak ulang tiap kali kursor masuk, jadi geraknya selalu berbeda
nameEl.addEventListener("mouseenter", randomizeNameMotion);

// Setelah animasi pembuka selesai, lepas animasi agar hover dan header tidak mengulang animasi
function finishIntro() {
    header.classList.add("intro-done");
    nameEl.classList.add("ready");
}

// Penanda posisi: pilar kiri (mode terang) menampilkan nama menu yang sedang dibuka
function setSection(name) {
    document.body.dataset.section = name;
    document.body.style.setProperty("--len", name.length);
}

function showMenu() {
    setSection("Menu");
    panels.forEach((p) => (p.hidden = true));
    mainMenu.hidden = false;
    header.hidden = false;
    randomizeLetters();
    resetCards();
}

function showPanel(id) {
    mainMenu.hidden = true;
    header.hidden = true; // header disembunyikan agar fokus ke isi menu
    finishIntro();
    panels.forEach((p) => (p.hidden = p.id !== id));
    const current = [...menuButtons].find((b) => b.dataset.target === id);
    setSection(current ? current.dataset.label : id);
    document.querySelectorAll(".quick-link").forEach((link) => {
        if (link.dataset.target === id) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
    const panel = document.getElementById(id);
    // Nomor urut dipakai CSS agar tiap entri meluncur masuk bergantian
    panel.querySelectorAll(".entry, .skill-list li, .social-list li, .project-list li, .edu-card").forEach((item, k) => {
        item.style.setProperty("--k", k);
    });
    panel.querySelector(".back-button").focus();
}

// ===== Transisi layar ala Persona 5 =====
const barColors = ["#000000", "#ffffff", "#d92d2d", "#000000", "#9e1520", "#ffffff", "#000000"];
const BAR_DURATION = 260;  // ms, lama gerak satu strip
const BAR_STEP = 35;       // ms, jeda antar strip
const HOLD = 360;          // ms, lama layar tertutup (tulisan besar tampil)
const ENABLE_SHAKE = true; // false = matikan getaran layar
const phaseTime = BAR_DURATION + BAR_STEP * (barColors.length - 1);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const overlay = document.createElement("div");
overlay.className = "transition";
overlay.setAttribute("aria-hidden", "true");
overlay.style.setProperty("--dur", BAR_DURATION + "ms");
overlay.style.setProperty("--step", BAR_STEP + "ms");
overlay.style.setProperty("--n", barColors.length);

const stage = document.createElement("div");
stage.className = "stage";
barColors.forEach((color, i) => {
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.style.setProperty("--i", i);
    bar.style.setProperty("--a", (-40 + i * 20) + "%");
    bar.style.setProperty("--c", color);
    stage.appendChild(bar);
});
overlay.appendChild(stage);

const title = document.createElement("div");
title.className = "title";
const titleText = document.createElement("span");
titleText.className = "title-text";
title.appendChild(titleText);
overlay.appendChild(title);
document.body.appendChild(overlay);

let busy = false;

// Saat halaman dibuka: layar mulai tertutup strip, lalu strip menyapu keluar
if (!reduceMotion) {
    busy = true;
    overlay.classList.add("active", "out");
    setTimeout(() => {
        overlay.classList.remove("active", "out");
        busy = false;
    }, phaseTime);
    // Setelah animasi pembuka selesai, menu muncul lebih cepat saat kembali dari panel
    setTimeout(() => {
        document.documentElement.style.setProperty("--menu-delay", "0.2s");
    }, 3500);
    setTimeout(finishIntro, 2300);
} else {
    finishIntro();
}

// Strip menutup layar -> tulisan besar + getar -> ganti isi -> strip membuka layar
function runTransition(swap, reverse = false, label = "") {
    if (busy) return;
    if (reduceMotion) {
        swap();
        return;
    }
    busy = true;
    titleText.textContent = label;
    overlay.classList.toggle("reverse", reverse);
    overlay.classList.remove("out", "shake");
    title.classList.remove("show", "leave");
    overlay.classList.add("active", "in");

    // Layar sudah tertutup penuh: tampilkan tulisan besar dan getarkan layar
    setTimeout(() => {
        title.classList.add("show");
        if (ENABLE_SHAKE) overlay.classList.add("shake");
    }, phaseTime);

    // Ganti isi di balik strip, lalu buka layar
    setTimeout(() => {
        swap();
        overlay.classList.remove("in", "shake");
        overlay.classList.add("out");
        title.classList.remove("show");
        title.classList.add("leave");
    }, phaseTime + HOLD);

    setTimeout(() => {
        overlay.classList.remove("active", "out", "reverse");
        title.classList.remove("leave");
        busy = false;
    }, phaseTime * 2 + HOLD);
}

// Klik item menu: transisi maju dengan nama menu sebagai tulisan besar
document.querySelectorAll(".menu-button").forEach((btn) => {
    btn.addEventListener("click", () => {
        // Menu Download PDF: unduh file, tanpa pindah halaman
        if (btn.dataset.download) {
            downloadPdf(btn.dataset.download, btn.dataset.downloadName);
            return;
        }
        runTransition(() => showPanel(btn.dataset.target), false, btn.dataset.label);
    });
});

// ===== Kartu pendidikan: klik untuk membalik =====
const eduCards = document.querySelectorAll(".edu-card");

function toggleCard(card) {
    const flipped = card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", flipped);
}

function resetCards() {
    eduCards.forEach((card) => {
        card.classList.remove("flipped");
        card.setAttribute("aria-pressed", "false");
    });
}

eduCards.forEach((card) => {
    card.addEventListener("click", () => toggleCard(card));
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCard(card);
        }
    });
});

// Unduh file PDF yang ada di folder yang sama dengan index.html
async function downloadPdf(file, saveAs) {
    // Di server (http/https), cek dulu apakah file PDF-nya ada
    if (location.protocol.startsWith("http")) {
        try {
            const res = await fetch(file, { method: "HEAD" });
            if (!res.ok) throw new Error("not found");
        } catch (err) {
            alert("File PDF belum tersedia. Pastikan " + file + " sudah ditaruh di folder yang sama dengan index.html.");
            return;
        }
    }
    const link = document.createElement("a");
    link.href = file;
    link.download = saveAs || file;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// Tombol kembali: transisi arah sebaliknya
document.querySelectorAll(".back-button").forEach((btn) => {
    btn.addEventListener("click", () => runTransition(showMenu, true, "Menu"));
});

// Tombol Escape juga bisa dipakai untuk kembali
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainMenu.hidden && !document.querySelector("dialog[open]")) runTransition(showMenu, true, "Menu");
});

// ===== Mode terang/gelap: gelap = Persona 5 Royal, terang = Persona 3 Reload =====
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const barPalettes = {
    dark: barColors,
    light: ["#02062b", "#ffffff", "#0a1fd8", "#02062b", "#38d9f5", "#ffffff", "#02062b"]
};

function applyTheme(theme, save = true) {
    root.dataset.theme = theme;
    themeBtn.setAttribute("aria-checked", theme === "light");
    overlay.querySelectorAll(".bar").forEach((bar, i) => bar.style.setProperty("--c", barPalettes[theme][i]));
    randomizeLetters();
    if (save) {
        try { localStorage.setItem("theme", theme); } catch (e) { /* abaikan */ }
    }
}

applyTheme(root.dataset.theme === "light" ? "light" : "dark", false);

// Ganti tema dengan transisi layar; tulisan besarnya nama gamenya
themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    runTransition(() => applyTheme(next), false, next === "light" ? "Reload" : "Royal");
});

// ===== Navigasi cepat: pindah antar menu tanpa kembali ke menu utama =====
const sectionButtons = [...menuButtons].filter((b) => b.dataset.target);

function goTo(id) {
    const open = [...panels].find((p) => !p.hidden);
    if (open && open.id === id) return;
    const btn = sectionButtons.find((b) => b.dataset.target === id);
    runTransition(() => showPanel(id), false, btn.dataset.label);
}

panels.forEach((panel) => {
    const nav = document.createElement("nav");
    nav.className = "quick-nav";
    nav.setAttribute("aria-label", "Pindah ke menu lain");
    sectionButtons.forEach((b) => {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "quick-link";
        link.dataset.target = b.dataset.target;
        link.textContent = b.dataset.label;
        link.addEventListener("click", () => goTo(b.dataset.target));
        nav.appendChild(link);
    });
    panel.querySelector(".back-button").insertAdjacentElement("afterend", nav);
});

// Panah kiri/kanan: menu sebelumnya/berikutnya saat sedang di dalam sebuah menu
document.addEventListener("keydown", (e) => {
    if (!mainMenu.hidden || document.querySelector("dialog[open]") || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    const open = [...panels].find((p) => !p.hidden);
    if (!open) return;
    const i = sectionButtons.findIndex((b) => b.dataset.target === open.id);
    const step = e.key === "ArrowRight" ? 1 : -1;
    goTo(sectionButtons[(i + step + sectionButtons.length) % sectionButtons.length].dataset.target);
});

setSection("Menu");

// ===== Pratinjau project: klik thumbnail membuka layar penuh dengan animasi halus =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCap = document.getElementById("lightbox-cap");

function closeLightbox() {
    lightbox.classList.remove("open");
    setTimeout(() => lightbox.open && lightbox.close(), reduceMotion ? 0 : 300);
}

document.querySelectorAll(".project-thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = "Tangkapan layar " + btn.getAttribute("aria-label").replace("Perbesar tangkapan layar: ", "");
        lightboxCap.textContent = btn.dataset.title.replace("&amp;", "&");
        lightbox.showModal();
        requestAnimationFrame(() => lightbox.classList.add("open"));
    });
});

// Klik di luar gambar atau tombol Tutup = tutup; Esc juga memakai animasi yang sama
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.closest(".lightbox-close")) closeLightbox();
});
lightbox.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeLightbox();
});

// ===== Latar laut mode terang: gelembung naik pelan + bulan (CSS menyembunyikannya di mode gelap) =====
function buildSea() {
    const sea = document.createElement("div");
    sea.className = "bg-sea";
    sea.setAttribute("aria-hidden", "true");
    sea.innerHTML = '<div class="sea-moon"></div>';
    for (let i = 0; i < 18; i++) {
        const bubble = document.createElement("span");
        bubble.className = "bubble";
        bubble.style.cssText =
            "--x:" + (Math.random() * 100).toFixed(1) + "%;" +
            "--s:" + (6 + Math.random() * 22).toFixed(0) + "px;" +
            "--d:" + (9 + Math.random() * 10).toFixed(1) + "s;" +
            "--delay:" + (-Math.random() * 18).toFixed(1) + "s;" +
            "--sway:" + (Math.random() * 60 - 30).toFixed(0) + "px";
        sea.appendChild(bubble);
    }
    document.body.prepend(sea);
}
buildSea();

// Tier level skill untuk screen reader dan tooltip (selaras dengan legenda)
document.querySelectorAll(".skill-bar").forEach((bar) => {
    const level = parseInt(bar.getAttribute("aria-valuenow"), 10);
    const tier = level >= 9 ? "Ahli" : level >= 7 ? "Mahir" : level >= 4 ? "Menengah" : "Dasar";
    bar.setAttribute("aria-valuetext", level + " dari 10, " + tier);
    bar.title = tier;
});