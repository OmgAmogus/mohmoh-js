// ==UserScript==
// @name         Visuals
// @namespace    https://greasyfork.org/users/1064285
// @version      0.2
// @description  description
// @author       atuokib
// @match        *://*.moomoo.io/*
// @icon         https://moomoo.io/img/favicon.png?v=1
// @grant        none
// @run-at       document-end
// @require https://cdn.jsdelivr.net/npm/msgpack-lite@0.1.26/dist/msgpack.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js
// @license MIT
// ==/UserScript==

const customStyle = document.createElement("style");
customStyle.id = "customStyle";
customStyle.innerHTML = `
#storeHolder {
    background: rgba(0, 0, 0, 0) !important;
}
#storeHolder::-webkit-scrollbar {
    width: 0px !important;
}
#storeHolder::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0) !important;
}
#storeHolder::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2) !important;
}
.storeTab {
    background: rgba(50, 50, 50, 0) !important;
    border: none !important;
    color: white !important;
    cursor: pointer !important;
}
`;

document.head.appendChild(customStyle);

const altcha = document.getElementById("altcha");
const checkbox = document.getElementById("altcha_checkbox");
const enterGame = document.getElementById("enterGame");
if (altcha && checkbox && enterGame) {
    // --- 1. Initialisation UI ---
    enterGame.textContent = "Verifying...";
    altcha.style.display = "none";

    // --- 2. Interception propre du setter natif ---
    const nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
    Object.defineProperty(checkbox, "checked", {
        configurable: true,
        get() {
            return nativeDescriptor.get.call(this);
        },
        set(value) {
            // Appel du setter natif
            nativeDescriptor.set.call(this, value);

            // Réaction à la validation
            if (value === true) {
                enterGame.classList.remove("disabled");
                enterGame.textContent = "Enter Game";
            }
        }
    });

    // --- 3. Gestion des erreurs Altcha ---
    altcha.addEventListener("statechange", async event => {
        if (event.detail?.state === "error" && typeof altcha.verify === "function")
        await altcha.verify();
    }
    );

    // --- 4. Lancement de la vérification ---
    if (typeof altcha.verify === "function") {
        altcha.verify();
    }

    // Déclenche le setter intercepté
    checkbox.click();
}

var _document$getElementB;
window.showKeys = true

let storage = JSON.parse(localStorage.getItem("showKeysOverlay"))

if (storage == null) {
    storage = {
        keys: ["Q", "F", "V", "1", "2", "3"],
        cps: true,
        maxCps: true,
        container: 200,
        drag: { left: 20, top: 100 }
    }
    localStorage.setItem("showKeysOverlay", JSON.stringify(storage))
}

const DIV = `
<style>
#ks {
    position:absolute;
    left:${storage.drag.left}px;
    top:${storage.drag.top}px;
    z-index:9999;
    color:white;
    font-family:Arial;
    user-select:none;
}
#ks_bg {
    position:absolute;
    inset:0;
    background:rgba(0,0,0,0.3);
    border-radius:6px;
}
#ks_content {
    position:relative;
    padding:10px;
    width:220px;
}
.ks_row {
    display:${window.showKeys ? "flex" : "none"};
    justify-content:center;
    gap:6px;
    margin-bottom:6px;
}
.key {
    width:36px;
    height:36px;
    display:${window.showKeys ? "flex" : "none"};
    align-items:center;
    justify-content:center;
    border:1px solid white;
    border-radius:4px;
}
.key.active {
    background:white;
    color:black;
}
#mouseRow {
    display:${window.showKeys ? "flex" : "none"};
    justify-content:space-between;
    margin-top:8px;
}
.mouseBtn {
    width:48%;
    padding:4px;
    border:1px solid white;
    border-radius:4px;
    text-align:center;
}
.mouseBtn.active2 {
    background:white;
    color:black;
}
#cpsDisplay, #maxCpsDisplay {
    margin-top:6px;
}
#customKeys {
    display:${storage.container <= 0 || storage.keys.length == 0 ? "none" : window.showKeys ? "flex" : "none"};
    flex-wrap:wrap;
    gap:6px;
    margin-top:6px;
    width:${storage.container}px;
}
</style>

<div id="ks">
<div id="ks_bg"></div>
<div id="ks_content">
<div class="ks_row">
<div class="key" id="key_W">W</div>
</div>
<div class="ks_row">
<div class="key" id="key_A">A</div>
<div class="key" id="key_S">S</div>
<div class="key" id="key_D">D</div>
</div>

<div id="mouseRow">
<div class="mouseBtn" id="mouse_0">L: <span id="cpsL">0</span></div>
<div class="mouseBtn" id="mouse_2">R: <span id="cpsR">0</span></div>
</div>

<div id="cpsDisplay" style="display:${storage.cps ? window.showKeys ? "block" : "none" : "none"}">Total CPS: 0</div>
<div id="maxCpsDisplay" style="display:${storage.maxCps ? window.showKeys ? "block" : "none" : "none"}">MAX CPS: 0</div>

<div id="customKeys"></div>
</div>
</div>
`

const container = document.createElement("div")
container.innerHTML = DIV
document.getElementById("gameUI").appendChild(container)

// On récupère le conteneur
const customKeysContainer = document.getElementById("customKeys");

if (customKeysContainer) {
    // On vide le conteneur pour éviter les doublons avant de recréer les touches
    customKeysContainer.innerHTML = "";

    storage.keys.forEach(key => {
        const el = document.createElement("div");
        el.className = "key";
        el.id = "key_" + key;
        el.textContent = key;
        customKeysContainer.appendChild(el);
    });
}

// Drag Right Click

let dragging = false

let offsetX = 0

let offsetY = 0

const ks = document.getElementById("ks")

ks.addEventListener("contextmenu", e => e.preventDefault())

ks.addEventListener("mousedown", e => {

    if (e.button === 2) {

        dragging = true

        offsetX = e.clientX - ks.offsetLeft

        offsetY = e.clientY - ks.offsetTop

    }

})

window.addEventListener("mousemove", e => {

    if (!dragging) return

    ks.style.left = (e.clientX - offsetX) + "px"

    ks.style.top = (e.clientY - offsetY) + "px"

})

window.addEventListener("mouseup", e => {

    if (e.button === 2 && dragging) {

        dragging = false

        storage.drag.left = parseFloat(ks.style.left)

        storage.drag.top = parseFloat(ks.style.top)

        localStorage.setItem("showKeysOverlay", JSON.stringify(storage))

    }

})

window.changeShowKeyMouseProperty = (id, value) => {
    storage[id] = value
    localStorage.setItem("showKeysOverlay", JSON.stringify(storage))
    document.getElementById("customKeys").style.width = storage.container + "px"
    document.getElementById("customKeys").style.display =
    storage.container <= 0 || storage.keys.length == 0 ? "none" : window.showKeys ? "flex" : "none"
    document.getElementById("cpsDisplay").style.display = storage.cps ? window.showKeys ? "block" : "none" : "none"
    document.getElementById("maxCpsDisplay").style.display = storage.maxCps ? window.showKeys ? "block" : "none" : "none"
}

window.addKey_ShowKeyMouse = () => {
    const key = document.getElementById("enter_key").value.toUpperCase()
    if (!key || storage.keys.includes(key)) return
    if (!document.getElementById("key_" + key)) {
        const el = document.createElement("div")
        el.className = "key"
        el.id = "key_" + key
        el.textContent = key
        document.getElementById("customKeys").appendChild(el)
        storage.keys.push(key)
        localStorage.setItem("showKeysOverlay", JSON.stringify(storage))
    }
}

window.removeKey_ShowKeyMouse = () => {
    const key = document.getElementById("enter_key").value.toUpperCase()
    const el = document.getElementById("key_" + key)
    if (!el) return
    el.remove()
    storage.keys.splice(storage.keys.indexOf(key), 1)
    localStorage.setItem("showKeysOverlay", JSON.stringify(storage))
}

let currentCps = 0
let maxCps = 0
let leftCps = 0
let rightCps = 0

function addCPS(type) {
    currentCps++
    if (type === 0) leftCps++
    if (type === 2) rightCps++

    document.getElementById("cpsDisplay").innerText = "Total CPS: " + currentCps
    document.getElementById("cpsL").innerText = leftCps
    document.getElementById("cpsR").innerText = rightCps

    if (currentCps > maxCps) {
        maxCps = currentCps
        document.getElementById("maxCpsDisplay").innerText = "MAX CPS: " + maxCps
    }

    setTimeout(() => {
        currentCps--
        if (type === 0) leftCps--
        if (type === 2) rightCps--
        document.getElementById("cpsDisplay").innerText = "Total CPS: " + currentCps
        document.getElementById("cpsL").innerText = leftCps
        document.getElementById("cpsR").innerText = rightCps
    }, 1000)
}

function getEl(id) {
    return document.getElementById(id);
}
// STORAGE:
let canStore;
if (typeof Storage !== "undefined") {
    canStore = true;
}
function saveVal(name, val) {
    if (canStore) {
        localStorage.setItem(name, val);
    }
}
function deleteVal(name) {
    if (canStore) {
        localStorage.removeItem(name);
    }
}
function getSavedVal(name) {
    if (canStore) {
        return localStorage.getItem(name);
    }
    return null;
}
class HtmlAction {
    constructor(element) {
        this.element = element;
    }
    add(code) {
        if (!this.element) {
            return undefined;
        }
        this.element.innerHTML += code;
    }
    newLine(amount) {
        let result = `<br>`;
        if (amount > 0) {
            result = ``;
            for (let i = 0; i < amount; i++) {
                result += `<br>`;
            }
        }
        this.add(result);
    }
    checkBox(setting) {
        let newCheck = `<input type = "checkbox"`;
        if (setting.id) {
            newCheck += ` id = ${setting.id}`;
        }
        if (setting.style) {
            newCheck += ` style = ${setting.style.replaceAll(" ", "")}`;
        }
        if (setting.class) {
            newCheck += ` class = ${setting.class}`;
        }
        if (setting.checked) {
            newCheck += ` checked`;
        }
        if (setting.onclick) {
            newCheck += ` onclick = ${setting.onclick}`;
        }
        newCheck += `>`;
        this.add(newCheck);
    }
    text(setting) {
        let newText = `<input type = "text"`;
        if (setting.id) {
            newText += ` id = ${setting.id}`;
        }
        if (setting.style) {
            newText += ` style = ${setting.style.replaceAll(" ", "")}`;
        }
        if (setting.class) {
            newText += ` class = ${setting.class}`;
        }
        if (setting.size) {
            newText += ` size = ${setting.size}`;
        }
        if (setting.maxLength) {
            newText += ` maxLength = ${setting.maxLength}`;
        }
        if (setting.value) {
            newText += ` value = ${setting.value}`;
        }
        if (setting.placeHolder) {
            newText += ` placeHolder = ${setting.placeHolder.replaceAll(" ", "&nbsp;")}`;
        }
        newText += `>`;
        this.add(newText);
    }
    select(setting) {
        let newSelect = `<select`;
        if (setting.id) {
            newSelect += ` id = ${setting.id}`;
        }
        if (setting.style) {
            newSelect += ` style = ${setting.style.replaceAll(" ", "")}`;
        }
        if (setting.class) {
            newSelect += ` class = ${setting.class}`;
        }
        newSelect += `>`;
        for (let options in setting.option) {
            newSelect += `<option value = ${setting.option[options].id}`;
            if (setting.option[options].selected) {
                newSelect += ` selected`;
            }
            newSelect += `>${options}</option>`;
        }
        newSelect += `</select>`;
        this.add(newSelect);
    }
    button(setting) {
        let newButton = `<button`;
        if (setting.id) {
            newButton += ` id = ${setting.id}`;
        }
        if (setting.style) {
            newButton += ` style = ${setting.style.replaceAll(" ", "")}`;
        }
        if (setting.class) {
            newButton += ` class = ${setting.class}`;
        }
        if (setting.onclick) {
            newButton += ` onclick = ${setting.onclick}`;
        }
        newButton += `>`;
        if (setting.innerHTML) {
            newButton += setting.innerHTML;
        }
        newButton += `</button>`;
        this.add(newButton);
    }
    selectMenu(setting) {
        let newSelect = `<select`;
        if (!setting.id) {
            alert("please put id skid");
            return;
        }
        window[setting.id + "Func"] = function () {};
        if (setting.id) {
            newSelect += ` id = ${setting.id}`;
        }
        if (setting.style) {
            newSelect += ` style = ${setting.style.replaceAll(" ", "")}`;
        }
        if (setting.class) {
            newSelect += ` class = ${setting.class}`;
        }
        newSelect += ` onchange = window.${setting.id + "Func"}()`;
        newSelect += `>`;
        let last;
        let i = 0;
        for (let options in setting.menu) {
            newSelect += `<option value = ${"option_" + options} id = ${"O_" + options}`;
            if (setting.menu[options]) {
                newSelect += ` checked`;
            }
            newSelect += ` style = "color: ${setting.menu[options] ? "#000" : "#fff"}; background: ${setting.menu[options] ? "#8ecc51" : "#cc5151"};">${options}</option>`;
            i++;
        }
        newSelect += `</select>`;
        this.add(newSelect);
        i = 0;
        for (let options in setting.menu) {
            window[options + "Func"] = function () {
                setting.menu[options] = getEl("check_" + options).checked ? true : false;
                saveVal(options, setting.menu[options]);
                getEl("O_" + options).style.color = setting.menu[options] ? "#000" : "#fff";
                getEl("O_" + options).style.background = setting.menu[options] ? "#8ecc51" : "#cc5151";
                //getEl(setting.id).style.color = setting.menu[options] ? "#8ecc51" : "#cc5151";
            };
            this.checkBox({
                id: "check_" + options,
                style: `display: ${i == 0 ? "inline-block" : "none"};`,
                class: "checkB",
                onclick: `window.${options + "Func"}()`,
                checked: setting.menu[options]
            });
            i++;
        }
        last = "check_" + getEl(setting.id).value.split("_")[1];
        window[setting.id + "Func"] = function () {
            getEl(last).style.display = "none";
            last = "check_" + getEl(setting.id).value.split("_")[1];
            getEl(last).style.display = "inline-block";
            //getEl(setting.id).style.color = setting.menu[last.split("_")[1]] ? "#8ecc51" : "#fff";
        };
    }
}
class Html {
    constructor() {
        this.element = null;
        this.action = null;
        this.divElement = null;
        this.startDiv = function (setting, func) {
            let newDiv = document.createElement("div");
            if (setting.id) {
                newDiv.id = setting.id;
            }
            if (setting.style) {
                newDiv.style = setting.style;
            }
            if (setting.class) {
                newDiv.className = setting.class;
            }
            this.element.appendChild(newDiv);
            this.divElement = newDiv;
            let addRes = new HtmlAction(newDiv);
            if (typeof func == "function") {
                func(addRes);
            }
        };
        this.addDiv = function (setting, func) {
            let newDiv = document.createElement("div");
            if (setting.id) {
                newDiv.id = setting.id;
            }
            if (setting.style) {
                newDiv.style = setting.style;
            }
            if (setting.class) {
                newDiv.className = setting.class;
            }
            if (setting.appendID) {
                getEl(setting.appendID).appendChild(newDiv);
            }
            this.divElement = newDiv;
            let addRes = new HtmlAction(newDiv);
            if (typeof func == "function") {
                func(addRes);
            }
        };
    }
    set(id) {
        this.element = getEl(id);
        this.action = new HtmlAction(this.element);
    }
    resetHTML(text) {
        if (text) {
            this.element.innerHTML = ``;
        } else {
            this.element.innerHTML = ``;
        }
    }
    setStyle(style) {
        this.element.style = style;
    }
    setCSS(style) {
        this.action.add(`<style>${style}</style>`);
    }
}
const HTML = new Html();
function changeContent(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    const selectedPage = getEl(pageId);
    if (selectedPage) {
        selectedPage.classList.add("active");
    } else {
        console.warn(`Page with ID "${pageId}" not found.`);
    }
}
window.Othersettings = window.Othersettings || {
    disable_game_grid: true,
    building_mark: true,
    wheel_zoom: true,
    hp: true,
};
for (let settingName in window.Othersettings) {
    const savedValue = getSavedVal(settingName);
    if (savedValue !== null) {
        window.Othersettings[settingName] = savedValue === "true";
    }
}
function toggleSetting(settingName, isChecked) {
    window.Othersettings[settingName] = isChecked;
    saveVal(settingName, isChecked);
    console.log(`Setting '${settingName}' is now: ${isChecked}`);

    const keySwitch = document.getElementById("KeySwitch");
    window.showKeys = keySwitch ? keySwitch.checked : false;

    const menu = document.getElementById("ks");
    if (menu) {
        menu.style.display = window.showKeys ? "block" : "none";
    }
}
function setupCheckbox(id, settingName, handler) {
    const checkbox = getEl(id);
    if (checkbox) {
        checkbox.checked = getSavedVal(settingName) === "true";
        // Load saved state
        checkbox.addEventListener("change", function () {
            handler(this.checked);
        });
    } else {
        console.warn(`Checkbox with ID "${id}" not found.`);
    }
}
const menuCss = `
.ingameMenu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: rgba(34, 34, 34, 0.9);
    width: 500px;
    height: 300px;
    border-radius: 8px;
    display: flex;
    transition: transform 0.3s ease-in-out;
    z-index: 9999;
    opacity: 0; /* Use opacity for smoother transition with display */
    visibility: hidden; /* Hide initially without affecting layout */
    pointer-events: none; /* Disable interaction when hidden */
}

.ingameMenu.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    visibility: visible;
    pointer-events: auto; /* Enable interaction when shown */
}

.menu-sidebar {
    width: 120px;
    background: rgba(20, 20, 20, 0.95);
    display: flex;
    flex-direction: column;
    padding: 12px;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 100%;
    border-right: 1px solid rgba(51, 51, 51, 0.9);
}

.menu-sidebar button {
    background: none;
    border: none;
    color: white;
    padding: 10px;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    transition: background 0.3s, transform 0.2s;
    width: 100%;
    border-radius: 4px; /* Added for better appearance */
}

.menu-sidebar button:hover {
    background: rgba(68, 68, 68, 0.9);
    transform: scale(1.02); /* Slightly less aggressive scale */
}

.menu-sidebar button.active {
    background: #0d85ff; /* Highlight active button */
    color: #fff;
}

.menu-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Align items to start */
    justify-content: flex-start;
    padding: 20px;
    overflow-y: auto;
    max-height: 100%;
    color: #eee; /* Default text color */
}

.menu-content h2 {
    color: #fff;
    margin-top: 0;
    margin-bottom: 15px;
    width: 100%;
    text-align: center;
}

.switch-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(51, 51, 51, 0.9);
    border-radius: 12px;
    padding: 10px 15px;
    width: 95%; /* Adjust width for better fit */
    max-width: 400px; /* Max width for consistency */
    margin: 8px auto; /* Centered margin */
    box-sizing: border-box;
    min-height: 44px; /* Ensure minimum height */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    transition: background 0.3s ease;
}

.switch-container label {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 12px;
    font-size: 14px;
    color: #eee;
    cursor: pointer; /* Indicate label is interactive */
}

.switch-container input[type="checkbox"] {
    appearance: none; /* Hide default checkbox */
    -webkit-appearance: none;
    width: 44px;
    height: 24px;
    background: #555;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.4);
}

.switch-container input[type="checkbox"]::before {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.switch-container input[type="checkbox"]:checked {
    background: linear-gradient(145deg, #0d85ff, #0a74da);
}

.switch-container input[type="checkbox"]:checked::before {
    transform: translateX(20px);
}

.menu-content::-webkit-scrollbar { width: 8px; }
.menu-content::-webkit-scrollbar-thumb { background-color: #444; border-radius: 10px; }
.menu-content::-webkit-scrollbar-track { background: rgba(34, 34, 34, 0.6); border-radius: 10px; }
.menu-content { scrollbar-width: thin; scrollbar-color: #444 rgba(34, 34, 34, 0.6); }

.page {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    display: none; /* Hidden by default */
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 10px 0; /* Adjusted padding */
    overflow-y: auto;
    gap: 8px;
    height: 100%; /* Ensure pages take full height for scrolling */
}

.page.active { display: flex; } /* Only active page is displayed */

.page .switch-container, .page .scroll-count-container {
    width: 95%; /* Match .switch-container width */
    margin: 4px auto; /* Centered margin */
    padding: 10px 15px;
    background: rgba(51, 51, 51, 0.95);
    border-radius: 10px;
    box-sizing: border-box;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.page label {
    color: #ddd;
    font-size: 14px;
    flex-grow: 1;
    margin-right: 10px;
}

#Mouse #scrollCountInput {
    width: calc(100% - 24px); /* Account for padding */
    padding: 8px 12px;
    font-size: 14px;
    background: #222;
    border: 1px solid #555;
    border-radius: 6px;
    color: #fff;
    outline: none;
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

#Mouse #scrollCountInput::-webkit-inner-spin-button,
#Mouse #scrollCountInput::-webkit-outer-spin-button {
    opacity: 0.8;
    background-color: #444;
    border-radius: 4px;
}
#Mouse #scrollCountInput[type="number"] {
    -moz-appearance: textfield; /* Firefox */
}
`;
const styleTag = document.createElement("style");
styleTag.innerHTML = menuCss;
document.head.appendChild(styleTag);
const gameUI = getEl("gameUI");
if (gameUI) {
    const ingameMenuElement = document.createElement("div");
    ingameMenuElement.id = "ingameMenu";
    ingameMenuElement.className = "ingameMenu";
    gameUI.appendChild(ingameMenuElement);
    HTML.set("ingameMenu");
    HTML.action.add(`
    <div class="menu-sidebar">
    <button id="visualsButton">
    <i class="fas fa-eye"></i> Visuals
    </button>
    <button id="otherButton">
    <i class="fas fa-asterisk"></i> Other
    </button>
    <button id="cheatsButton">
    <i class="fas fa-terminal"></i> Cheats
    </button>
    </div>
    <div id="menu-content" class="menu-content">
    <!-- ===== VISUALS ===== -->
    <div id="visuals" class="page">
    <h2><i class="fas fa-eye"></i> Visuals</h2>
    </div>

    <!-- ===== CHEATS ===== -->
    <div id="Cheats" class="page">
    <h2><i class="fas fa-skull-crossbones"></i> Cheats</h2>
    </div>

    <!-- ===== OTHER ===== -->
    <div id="Other" class="page">
    <h2><i class="fas fa-cog"></i> Other</h2>
    </div>

    </div>
    `);
    const visualsButton = getEl("visualsButton");
    const cheatsButton = getEl("cheatsButton");
    const otherButton = getEl("otherButton");
    const allMenuButtons = document.querySelectorAll(".menu-sidebar button");
    function setActiveButton(buttonId) {
        var _getEl;
        allMenuButtons.forEach(button => button.classList.remove("active"));
        if ((_getEl = getEl(buttonId)) !== null && _getEl !== undefined) {
            _getEl.classList.add("active");
        }
    }
    if (visualsButton !== null && visualsButton !== undefined) {
        visualsButton.addEventListener("click", () => {
            changeContent("visuals");
            setActiveButton("visualsButton");
        });
    }
    if (cheatsButton !== null && cheatsButton !== undefined) {
        cheatsButton.addEventListener("click", () => {
            changeContent("Cheats");
            setActiveButton("cheatsButton");
        });
    }
    if (otherButton !== null && otherButton !== undefined) {
        otherButton.addEventListener("click", () => {
            changeContent("Other");
            setActiveButton("otherButton");
        });
    }
    setupCheckbox("gridSwitch", "disable_game_grid", isChecked => toggleSetting("disable_game_grid", isChecked));
    setupCheckbox("HealSwitch", "autoHeal", isChecked => toggleSetting("autoHeal", isChecked));
    setupCheckbox("KeySwitch", "show_keys", isChecked => toggleSetting("show_keys", isChecked));
    setupCheckbox("HealthTextSwitch", "health_text", isChecked => toggleSetting("health_text", isChecked));
    setupCheckbox("BuildingMark", "building_mark", isChecked => toggleSetting("building_mark", isChecked));
    setupCheckbox("OtherAnimation", "other_animation", isChecked => toggleSetting("other_animation", isChecked));
    setupCheckbox("AllItemsUnlocked", "AllItemsUnlocked", isChecked => toggleSetting("AllItemsUnlocked", isChecked));
    setupCheckbox("WheelZoom", "wheel_zoom", isChecked => toggleSetting("wheel_zoom", isChecked));
    setupCheckbox("DisableTurn", "disableBuildingsTurn", isChecked => toggleSetting("disableBuildingsTurn", isChecked));
    setupCheckbox("CustomStoreStyles", "customStoreListStyles", isChecked => toggleSetting("customStoreListStyles", isChecked));
    changeContent("visuals");
    setActiveButton("visualsButton");
} else {
    console.error("Game UI element 'gameUI' not found. Menu cannot be injected.");
}

(() => {
    // === SHARED INFO PANEL ===
    function injectInfoPanel() {
        if (document.getElementById("menuInfoPanel")) return;
        const style = document.createElement("style");
        style.textContent = `
        .menu-info-panel {
            position: fixed;
            z-index: 99999;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(180deg, rgba(18,20,24,0.98), rgba(12,14,18,0.95));
            padding: 12px 18px;
            border-radius: 10px;
            color: #e6eef8;
            box-shadow: 0 10px 30px rgba(4,8,20,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
            backdrop-filter: blur(8px) saturate(120%);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
            width: 340px;
            text-align: center;
        }
        .menu-info-panel.visible { opacity: 1; pointer-events: auto; }
        .menu-info-panel h3 { margin: 0; font-size: 15px; color: #fff; }
        .menu-info-panel p { margin: 5px 0 0; font-size: 13px; color: #bcd9ff; }

        .menu-reset-btn {
            margin: 15px auto 5px;
            display: block;
            background: linear-gradient(145deg, #ff3c3c, #b91d1d);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 2px 8px rgba(255,0,0,0.25);
        }
        .menu-reset-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 3px 12px rgba(255,0,0,0.4);
        }
        `;
        document.head.appendChild(style);
        const div = document.createElement("div");
        div.id = "menuInfoPanel";
        div.className = "menu-info-panel";
        div.innerHTML = `<h3></h3><p></p>`;
        document.body.appendChild(div);
    }

    function showInfo(title, text) {
        const panel = document.getElementById("menuInfoPanel");
        if (!panel) return;
        panel.querySelector("h3").innerText = title;
        panel.querySelector("p").innerText = text;
        panel.classList.add("visible");
    }

    function hideInfo() {
        const panel = document.getElementById("menuInfoPanel");
        if (!panel) return;
        panel.classList.remove("visible");
    }

    // === VISUALS ===
    const visualsOptions = [
    { id: "gridSwitch", label: "Disable Game Grid", icon: "fa-border-all", setting: "disable_game_grid", default: true, desc: "Hide the default grid overlay drawn by the game." },
    { id: "KeySwitch", label: "Show Keys", icon: "fa-keyboard", setting: "show_keys", desc: "Show pressed keys (Q, F, V, 1–3, mouse, space)." },
    { id: "HealthTextSwitch", label: "Health Text", icon: "fa-heartbeat", setting: "health_text", desc: "Display health numbers over entities." },
    { id: "BuildingMark", label: "Building Mark", icon: "fa-landmark", setting: "building_mark", default: true, desc: "Add visual markers above buildings." },
    { id: "OtherAnimation", label: "Animated Text / Other Animation", icon: "fa-film", setting: "other_animation", desc: "Toggle extra UI text animations." },
    { id: "WheelZoom", label: "Wheel Zoom", icon: "fa-magnifying-glass", setting: "wheel_zoom", default: true, desc: "Enable zoom with the mouse wheel." },
    { id: "DisableTurn", label: "Disable Turn", icon: "fa-ban", setting: "disableBuildingsTurn", desc: "Prevent automatic turning of placed structures." }
    ];

    // === CHEATS ===
    const cheatsOptions = [
    { id: "HealSwitch", label: "Auto Heal", icon: "fa-plus-circle", setting: "autoHeal", desc: "Automatically use healing when low on HP." },
    { id: "AllItemsUnlocked", label: "All Items Unlocked", icon: "fa-box-open", setting: "AllItemsUnlocked", desc: "Unlocks all items instantly (client-side)." },
    { id: "AutoMill", label: "All Triple Mill", icon: "", setting: "AutoMill", desc: "Enable Auto Triple Mill by pressing [N] Key" }
    ];

    // === OTHER ===
    const otherOptions = [
    { id: "CustomStoreStyles", label: "Custom Store List Styles", icon: "fa-store", setting: "customStoreListStyles", desc: "Hide text from the in-game store list. And Make the shop transparent" },
    { id: "MousedownEquipBuy", label: "Mousedown Hat Equip", icon: "fa-store", setting: "mousedownEquipBuy", desc: "Equips hats instantly on mouse down" }
    ];

    // === BUILDERS ===
    function buildSection(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) return;
        options.forEach(opt => {
            const wrap = document.createElement("div");
            wrap.className = "switch-container";
            wrap.innerHTML = `
            <label for="${opt.id}">
            <i class="fas ${opt.icon}" style="margin-right:8px;color:#0d85ff"></i> ${opt.label}
            </label>
            <input type="checkbox" id="${opt.id}" ${opt.default ? "checked" : ""}>
            `;
            wrap.addEventListener("mouseenter", () => showInfo(opt.label, opt.desc));
            wrap.addEventListener("mouseleave", hideInfo);
            container.appendChild(wrap);
            setupCheckbox(opt.id, opt.setting, checked => toggleSetting(opt.setting, checked));
        });
        const reset = document.createElement("button");
        reset.className = "menu-reset-btn";
        reset.innerHTML = `<i class="fas fa-undo-alt"></i> Reset ${containerId} to Default`;
        reset.addEventListener("click", () => {
            options.forEach(opt => {
                const def = !!opt.default;
                saveVal(opt.setting, def);
                window.Othersettings[opt.setting] = def;
                const el = document.getElementById(opt.id);
                if (el) el.checked = def;
            });
            document.getElementById("show_key_container").style.display =
            document.getElementById("KeySwitch").checked ? "block" : "none";
            alert(`✅ ${containerId} settings reset to default.`);
        });
        container.appendChild(reset);
    }

    // === INIT ===
    function initMenu() {
        injectInfoPanel();
        buildSection("visuals", visualsOptions);
        buildSection("Cheats", cheatsOptions);
        buildSection("Other", otherOptions);
    }

    if (document.readyState === "complete" || document.readyState === "interactive")
    initMenu();
    else
    document.addEventListener("DOMContentLoaded", initMenu);
})();

/******/
(function (modules) {
    // webpackBootstrap
    /******/ // The module cache
    /******/
    var installedModules = {}; /******/ /******/ // The require function
    /******/
    function __webpack_require__(moduleId) {
        /******/ /******/ // Check if module is in cache
        /******/
        if (installedModules[moduleId]) {
            /******/
            return installedModules[moduleId].exports; /******/
        } /******/ // Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/
            i: moduleId,
            /******/l: false,
            /******/exports: {} /******/
        }; /******/ /******/ // Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__); /******/ /******/ // Flag the module as loaded
        /******/
        module.l = true; /******/ /******/ // Return the exports of the module
        /******/
        return module.exports; /******/
    } /******/ /******/ /******/ // expose the modules object (__webpack_modules__)
    /******/
    __webpack_require__.m = modules; /******/ /******/ // expose the module cache
    /******/
    __webpack_require__.c = installedModules; /******/ /******/ // define getter function for harmony exports
    /******/
    __webpack_require__.d = function (exports, name, getter) {
        /******/
        if (!__webpack_require__.o(exports, name)) {
            /******/
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            }); /******/
        } /******/
    }; /******/ /******/ // define __esModule on exports
    /******/
    __webpack_require__.r = function (exports) {
        /******/
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            /******/
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            }); /******/
        } /******/
        Object.defineProperty(exports, "__esModule", {
            value: true
        }); /******/
    }; /******/ /******/ // create a fake namespace object
    /******/ // mode & 1: value is a module id, require it
    /******/ // mode & 2: merge all properties of value into the ns
    /******/ // mode & 4: return value when already ns object
    /******/ // mode & 8|1: behave like require
    /******/
    __webpack_require__.t = function (value, mode) {
        /******/
        if (mode & 1) {
            value = __webpack_require__(value);
        } /******/
        if (mode & 8) {
            return value;
        } /******/
        if (mode & 4 && typeof value === "object" && value && value.__esModule) {
            return value;
        } /******/
        var ns = Object.create(null); /******/
        __webpack_require__.r(ns); /******/
        Object.defineProperty(ns, "default", {
            enumerable: true,
            value: value
        }); /******/
        if (mode & 2 && typeof value != "string") {
            for (var key in value) {
                __webpack_require__.d(ns, key, function (key) {
                    return value[key];
                }.bind(null, key));
            }
        } /******/
        return ns; /******/
    }; /******/ /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/
    __webpack_require__.n = function (module) {
        /******/
        var getter = module && module.__esModule ? /******/function getDefault() {
            return module.default;
        } : /******/function getModuleExports() {
            return module;
        }; /******/
        __webpack_require__.d(getter, "a", getter); /******/
        return getter; /******/
    }; /******/ /******/ // Object.prototype.hasOwnProperty.call
    /******/
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }; /******/ /******/ // __webpack_public_path__
    /******/
    __webpack_require__.p = ""; /******/ /******/ /******/ // Load entry module and return exports
    /******/
    return __webpack_require__(__webpack_require__.s = "./src/js/app.js"); /******/
} /************************************************************************/ /******/)({
    /***/
    "./src/js/app.js":
    /*!***********************!*\
    !*** ./src/js/app.js ***!
    \***********************/
    /*! no static exports found */ /***/
    function (module, exports, __webpack_require__) {
        "use strict";

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function reload() {
            await sleep(1500);
            window.onbeforeunload = null;
            location.reload();
        }

        // Handles errors such as "Server is full", "Failed to find server index" etc
        const symbol = Symbol("errorCallback");
        Object.defineProperty(Object.prototype, "errorCallback", {
            get() {
                return this[symbol];
            },
            set(value) {
                this[symbol] = value;

                if (typeof value !== "function") return;
                this[symbol] = new Proxy(value, {
                    apply(target, _this, args) {
                        window.alert = function(){}
                        reload();
                        return target.apply(_this, args);
                    }
                })
            },
            configurable: true
        })

        window.loadedScript = true; // ENV:
        var isProd = location.hostname !== "127.0.0.1" && !location.hostname.startsWith("192.168."); // IMPORTS:
        __webpack_require__(/*! ./libs/modernizr.js */"./src/js/libs/modernizr.js");
        var io = __webpack_require__(/*! ./libs/io-client.js */"./src/js/libs/io-client.js");
        var UTILS = __webpack_require__(/*! ./libs/utils.js */"./src/js/libs/utils.js");
        var animText = __webpack_require__(/*! ./libs/animText.js */"./src/js/libs/animText.js");
        var config = window.config || {}
        config.skinColors = [
        "#bf8f54",
        "#cbb091",
        "#896c4b",
        "#fadadc",
        "#ececec",
        "#c37373",
        "#4c4c4c",
        "#ecaff7",
        "#738cc3",
        "#8bc373",
        "#91B2DB",
        ];
        var GameObject = __webpack_require__(/*! ./data/gameObject.js */"./src/js/data/gameObject.js");
        var items = __webpack_require__(/*! ./data/items.js */"./src/js/data/items.js");
        var MapManager = __webpack_require__(/*! ./data/mapManager.js */"./src/js/data/mapManager.js");
        var ObjectManager = __webpack_require__(/*! ./data/objectManager.js */"./src/js/data/objectManager.js");
        var Player = __webpack_require__(/*! ./data/player.js */"./src/js/data/player.js");
        var store = __webpack_require__(/*! ./data/store.js */"./src/js/data/store.js");
        var Projectile = __webpack_require__(/*! ./data/projectile.js */"./src/js/data/projectile.js");
        var ProjectileManager = __webpack_require__(/*! ./data/projectileManager.js */"./src/js/data/projectileManager.js");
        var textManager = new animText.TextManager(); // SOCKET & CONNECTION:
        var connected = false;
        var startedConnecting = false;
        const Ye = {
            animationTime: 0,
            land: null,
            lava: null,
            x: config.volcanoLocationX,
            y: config.volcanoLocationY
        };
        window.OriginalWebSocket = window.WebSocket;
        window.WebSocket = class {
            constructor(wsAddress) {
                connectSocket(wsAddress);
            }
        };
        function connectSocket(wsAddress) {
            // CONNECT:
            io.connect(wsAddress, function (error) {
                pingSocket();
                setInterval(() => pingSocket(), 2500);
                if (error) {
                    disconnect(error);
                } else {
                    connected = true;
                    startGame();
                    enterGame(); // DEFINE ENTER GAME BUTTON ON CLICK:
                    enterGameButton.onclick = UTILS.checkTrusted(function () {
                        // START GAME:
                        if (io.connected) {
                            enterGame();
                        }
                    });
                    UTILS.hookTouchEvents(enterGameButton);
                }
            }, {
                A: setInitData,
                B: disconnect,
                C: setupGame,
                D: addPlayer,
                E: removePlayer,
                a: updatePlayers,
                G: updateLeaderboard,
                H: loadGameObject,
                I: loadAI,
                J: animateAI,
                K: gatherAnimation,
                L: wiggleGameObject,
                M: shootTurret,
                N: updatePlayerValue,
                O: updateHealth,
                P: killPlayer,
                Q: killObject,
                R: killObjects,
                S: updateItemCounts,
                T: updateAge,
                U: updateUpgrades,
                V: updateItems,
                X: addProjectile,
                Y: remProjectile,
                Z: serverShutdownNotice,
                g: addAlliance,
                1: deleteAlliance,
                2: allianceNotification,
                3: setPlayerTeam,
                4: setAlliancePlayers,
                5: updateStoreItems,
                6: receiveChat,
                7: updateMinimap,
                8: showText,
                9: pingMap,
                0: pingSocketResponse
            });
        }
        function socketReady() {
            return io.connected;
        }
        function joinParty() {
            var currentKey = serverBrowser.value;
            var key = prompt("party key", currentKey);
            if (key) {
                window.onbeforeunload = undefined; // Don't ask to leave
                window.location.href = "/?server=" + key;
            }
        } /**/ // MATHS:
        var mathPI = Math.PI;
        var mathPI2 = mathPI * 2;
        var mathPI3 = mathPI * 3;
        Math.lerpAngle = function (value1, value2, amount) {
            var difference = Math.abs(value2 - value1);
            if (difference > mathPI) {
                if (value1 > value2) {
                    value2 += mathPI2;
                } else {
                    value1 += mathPI2;
                }
            }
            var value = value2 + (value1 - value2) * amount;
            if (value >= 0 && value <= mathPI2) {
                return value;
            }
            return value % mathPI2;
        }; // REOUNDED RECTANGLE:
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < r * 2) {
                r = w / 2;
            }
            if (h < r * 2) {
                r = h / 2;
            }
            if (r < 0) {
                r = 0;
            }
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        }; // STORAGE:
        var canStore;
        if (typeof Storage !== "undefined") {
            canStore = true;
        }
        function saveVal(name, val) {
            if (canStore) {
                localStorage.setItem(name, val);
            }
        }
        function deleteVal(name) {
            if (canStore) {
                localStorage.removeItem(name);
            }
        }
        function getSavedVal(name) {
            if (canStore) {
                return localStorage.getItem(name);
            }
            return null;
        } // GLOBAL VALUES:
        var moofoll = getSavedVal("moofoll");
        function follmoo() {
            if (!moofoll) {
                moofoll = true;
                saveVal("moofoll", 1);
            }
        }
        follmoo();
        var useNativeResolution;
        var showPing;
        var pixelDensity = 1;
        var delta;
        var now;
        var lastSent;
        var lastUpdate = Date.now();
        var keys;
        var attackState;
        var ais = [];
        var players = [];
        var alliances = [];
        var gameObjects = [];
        var projectiles = [];
        var projectileManager = new ProjectileManager(Projectile, projectiles, players, ais, objectManager, items, config, UTILS);
        var AiManager = __webpack_require__(/*! ./data/aiManager.js */"./src/js/data/aiManager.js");
        var AI = __webpack_require__(/*! ./data/ai.js */"./src/js/data/ai.js");
        var aiManager = new AiManager(ais, AI, players, items, null, config, UTILS);
        var player;
        var playerSID;
        var tmpObj;
        var waterMult = 1;
        var waterPlus = 0;
        var mouseX = 0;
        var mouseY = 0;
        var controllingTouch = {
            id: -1,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        var attackingTouch = {
            id: -1,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        var camX;
        var camY;
        var tmpDir;
        var skinColor = 0;
        var selectColorIndex = 0;
        var maxScreenWidth = config.maxScreenWidth;
        var maxScreenHeight = config.maxScreenHeight;
        var screenWidth;
        var screenHeight;
        var inGame = false;
        var adContainer = document.getElementById("ad-container");
        var mainMenu = document.getElementById("mainMenu");
        var enterGameButton = document.getElementById("enterGame");
        var promoImageButton = document.getElementById("promoImg");
        var partyButton = document.getElementById("partyButton");
        var joinPartyButton = document.getElementById("joinPartyButton");
        var settingsButton = document.getElementById("settingsButton");
        var settingsButtonTitle = settingsButton.getElementsByTagName("span")[0];
        var allianceButton = document.getElementById("allianceButton");
        var storeButton = document.getElementById("storeButton");
        var chatButton = document.getElementById("chatButton");
        var gameCanvas = document.getElementById("gameCanvas");
        var touchControls = document.getElementById("touch-controls-fullscreen");
        var mainContext = gameCanvas.getContext("2d");
        const originalLineTo = mainContext.lineTo
        mainContext.lineTo = function (x, y) {
            if (x === 0) {
                mainContext.lineJoin = "round"
            }

            return originalLineTo.call(this, x, y)
        }
        var serverBrowser = document.getElementById("serverBrowser");
        var nativeResolutionCheckbox = document.getElementById("nativeResolution");
        var showPingCheckbox = document.getElementById("showPing");
        var playMusicCheckbox = document.getElementById("playMusic");
        var pingDisplay = document.getElementById("pingDisplay");
        var shutdownDisplay = document.getElementById("shutdownDisplay");
        var menuCardHolder = document.getElementById("menuCardHolder");
        var guideCard = document.getElementById("guideCard");
        var loadingText = document.getElementById("loadingText");
        var gameUI = document.getElementById("gameUI");
        var actionBar = document.getElementById("actionBar");
        var scoreDisplay = document.getElementById("scoreDisplay");
        var foodDisplay = document.getElementById("foodDisplay");
        var woodDisplay = document.getElementById("woodDisplay");
        var stoneDisplay = document.getElementById("stoneDisplay");
        var killCounter = document.getElementById("killCounter");
        var leaderboardData = document.getElementById("leaderboardData");
        var nameInput = document.getElementById("nameInput");
        var itemInfoHolder = document.getElementById("itemInfoHolder");
        var ageText = document.getElementById("ageText");
        var ageBarBody = document.getElementById("ageBarBody");
        var upgradeHolder = document.getElementById("upgradeHolder");
        var upgradeCounter = document.getElementById("upgradeCounter");
        var allianceMenu = document.getElementById("allianceMenu");
        var allianceHolder = document.getElementById("allianceHolder");
        var allianceManager = document.getElementById("allianceManager");
        var mapDisplay = document.getElementById("mapDisplay");
        var diedText = document.getElementById("diedText");
        var skinColorHolder = document.getElementById("skinColorHolder");
        var mapContext = mapDisplay.getContext("2d");
        mapDisplay.width = 300;
        mapDisplay.height = 300;
        var storeMenu = document.getElementById("storeMenu");
        storeMenu.style.pointerEvents = "none"; //tried to make possible to click through store but failed
        var storeHolder = document.getElementById("storeHolder");
        var noticationDisplay = document.getElementById("noticationDisplay");
        var hats = store.hats;
        var accessories = store.accessories;
        var objectManager = new ObjectManager(GameObject, gameObjects, UTILS, config);
        var outlineColor = "#525252";
        var darkOutlineColor = "#3d3f42";
        var outlineWidth = 5.5;
        touchControls.addEventListener("wheel", event => {
            var _player;
            const storeMenu = document.getElementById("storeMenu");
            const allianceMenu = document.getElementById("allianceMenu");
            //const player = player
            if (storeMenu.style.display && storeMenu.style.display !== "none" || allianceMenu.style.display && allianceMenu.style.display !== "none") {
                return;
            }
            if (!document.getElementById("WheelZoom").checked || (_player = player) === null || _player === undefined || !_player.alive || document.activeElement.tagName === "INPUT") {
                return;
            }
            const power = 1.01;
            if (event.deltaY > 0) {
                if (maxScreenWidth <= 50000) {
                    for (let i = 0; i < 25; i += 1) {
                        setTimeout(() => {
                            if (maxScreenWidth > 50000) {
                                return;
                            }
                            maxScreenWidth *= power;
                            maxScreenHeight *= power;
                            resize();
                        }, i * 5);
                    }
                }
            } else if (maxScreenWidth >= 500) {
                for (let i = 0; i < 25; i += 1) {
                    setTimeout(() => {
                        if (maxScreenWidth < 500) {
                            return;
                        }
                        maxScreenWidth /= power;
                        maxScreenHeight /= power;
                        resize();
                    }, i * 5);
                }
            }
        });

        let nearestFriendlyMill;
        let nearestFriendlyMillX;
        let nearestFriendlyMillY;
        let nearestFriendlyMillScale;
        let isNextToFriendlyMill = false;

        function removeArraysWithValue(arr, valueToRemove) {
            for (let i = arr.length - 1; i >= 0; i--) {
                const innerArray = arr[i];
                if (innerArray.includes(valueToRemove)) {
                    arr.splice(i, 1);
                }
            }
        }

        window.movementDirection = 0

        let nearestRandomObjectX;
        let nearestRandomObjectY;

        function dist(a, b){ return Math.sqrt( Math.pow((b.y-a[2]), 2) + Math.pow((b.x-a[1]), 2) ); };

        function doNewSend(sender){
            io.socket.send(new Uint8Array(Array.from(window.msgpack.encode(sender))));
        }

        // SET INIT DATA:
        function setInitData(data) {
            alliances = data.teams;
        } // ON LOAD:
        var inWindow = true;
        var didLoad = false;
        window.onblur = function () {
            inWindow = false;
        };
        window.onfocus = function () {
            inWindow = true;
            if (player && player.alive) {
                resetMoveDir();
            }
        };
        window.onload = function () {
            didLoad = true;
        };
        gameCanvas.oncontextmenu = function () {
            return false;
        };

        function disconnect(reason) {
            connected = false;
            io.close();
            showLoadingText(reason);
            reload();
        }
        function showLoadingText(text) {
            mainMenu.style.display = "block";
            gameUI.style.display = "none";
            menuCardHolder.style.display = "none";
            diedText.style.display = "none";
            loadingText.style.display = "block";
            loadingText.innerHTML = text + "<a href='javascript:window.location.href=window.location.href' class='ytLink'>reload</a>";
        } // BUTTON EVENTS:
        function bindEvents() {
            promoImageButton.onclick = UTILS.checkTrusted(function () {
                openLink("https://krunker.io/?play=SquidGame_KB");
            });
            UTILS.hookTouchEvents(promoImageButton);
            joinPartyButton.onclick = UTILS.checkTrusted(function () {
                setTimeout(function () {
                    joinParty();
                }, 10);
            });
            UTILS.hookTouchEvents(joinPartyButton);
            settingsButton.onclick = UTILS.checkTrusted(function () {
                toggleSettings();
            });
            UTILS.hookTouchEvents(settingsButton);
            allianceButton.onclick = UTILS.checkTrusted(function () {
                toggleAllianceMenu();
            });
            UTILS.hookTouchEvents(allianceButton);
            storeButton.onclick = UTILS.checkTrusted(function () {
                toggleStoreMenu();
            });
            UTILS.hookTouchEvents(storeButton);
            chatButton.onclick = UTILS.checkTrusted(function () {
                toggleChat();
            });
            UTILS.hookTouchEvents(chatButton);
            mapDisplay.onclick = UTILS.checkTrusted(function () {
                sendMapPing();
            });
            UTILS.hookTouchEvents(mapDisplay);
        } // SHOW ITEM INFO:
        function showItemInfo(item, isWeapon, isStoreItem) {
            if (player && item) {
                UTILS.removeAllChildren(itemInfoHolder);
                itemInfoHolder.classList.add("visible"); // chatButton.classList.add("hide");
                UTILS.generateElement({
                    id: "itemInfoName",
                    text: UTILS.capitalizeFirst(item.name),
                    parent: itemInfoHolder
                });
                UTILS.generateElement({
                    id: "itemInfoDesc",
                    text: item.desc,
                    parent: itemInfoHolder
                });
                if (isStoreItem) {} else if (isWeapon) {
                    UTILS.generateElement({
                        class: "itemInfoReq",
                        text: !item.type ? "primary" : "secondary",
                        parent: itemInfoHolder
                    });
                } else {
                    for (var i = 0; i < item.req.length; i += 2) {
                        UTILS.generateElement({
                            class: "itemInfoReq",
                            html: item.req[i] + "<span class='itemInfoReqVal'> x" + item.req[i + 1] + "</span>",
                            parent: itemInfoHolder
                        });
                    }
                    if (item.group.limit) {
                        UTILS.generateElement({
                            class: "itemInfoLmt",
                            text: (player.itemCounts[item.group.id] || 0) + "/" + item.group.limit,
                            parent: itemInfoHolder
                        });
                    }
                }
            } else {
                itemInfoHolder.classList.remove("visible"); // chatButton.classList.remove("hide");
            }
        } // SHOW ALLIANCE MENU:
        var allianceNotifications = [];
        var alliancePlayers = [];
        function allianceNotification(sid, name) {
            allianceNotifications.push({
                sid: sid,
                name: name
            });
            updateNotifications();
        }
        function updateNotifications() {
            if (allianceNotifications[0]) {
                var tmpN = allianceNotifications[0];
                UTILS.removeAllChildren(noticationDisplay);
                noticationDisplay.style.display = "block";
                UTILS.generateElement({
                    class: "notificationText",
                    text: tmpN.name,
                    parent: noticationDisplay
                });
                UTILS.generateElement({
                    class: "notifButton",
                    html: "<i class='material-icons' style='font-size:28px;color:#cc5151;'>&#xE14C;</i>",
                    parent: noticationDisplay,
                    onclick: function () {
                        aJoinReq(0);
                    },
                    hookTouch: true
                });
                UTILS.generateElement({
                    class: "notifButton",
                    html: "<i class='material-icons' style='font-size:28px;color:#8ecc51;'>&#xE876;</i>",
                    parent: noticationDisplay,
                    onclick: function () {
                        aJoinReq(1);
                    },
                    hookTouch: true
                });
            } else {
                noticationDisplay.style.display = "none";
            }
        }
        function addAlliance(data) {
            alliances.push(data);
            if (allianceMenu.style.display == "block") {
                showAllianceMenu();
            }
        }
        function setPlayerTeam(team, isOwner) {
            if (player) {
                player.team = team;
                player.isOwner = isOwner;
                if (allianceMenu.style.display == "block") {
                    showAllianceMenu();
                }
            }
        }
        function setAlliancePlayers(data) {
            alliancePlayers = data;
            if (allianceMenu.style.display == "block") {
                showAllianceMenu();
            }
        }
        function deleteAlliance(sid) {
            for (var i = alliances.length - 1; i >= 0; i--) {
                if (alliances[i].sid == sid) {
                    alliances.splice(i, 1);
                }
            }
            if (allianceMenu.style.display == "block") {
                showAllianceMenu();
            }
        }
        function toggleAllianceMenu() {
            resetMoveDir();
            if (allianceMenu.style.display != "block") {
                showAllianceMenu();
            } else {
                allianceMenu.style.display = "none";
            }
        }
        function showAllianceMenu() {
            if (player && player.alive) {
                closeChat();
                storeMenu.style.display = "none";
                allianceMenu.style.display = "block";
                UTILS.removeAllChildren(allianceHolder);
                if (player.team) {
                    for (var i = 0; i < alliancePlayers.length; i += 2) {
                        (function (i) {
                            var tmp = UTILS.generateElement({
                                class: "allianceItem",
                                style: "color:" + (alliancePlayers[i] == player.sid ? "#fff" : "rgba(255,255,255,0.6)"),
                                text: alliancePlayers[i + 1],
                                parent: allianceHolder
                            });
                            if (player.isOwner && alliancePlayers[i] != player.sid) {
                                UTILS.generateElement({
                                    class: "joinAlBtn",
                                    text: "Kick",
                                    onclick: function () {
                                        kickFromClan(alliancePlayers[i]);
                                    },
                                    hookTouch: true,
                                    parent: tmp
                                });
                            }
                        })(i);
                    }
                } else if (alliances.length) {
                    for (var i = 0; i < alliances.length; ++i) {
                        (function (i) {
                            var tmp = UTILS.generateElement({
                                class: "allianceItem",
                                style: "color:" + (alliances[i].sid == player.team ? "#fff" : "rgba(255,255,255,0.6)"),
                                text: alliances[i].sid,
                                parent: allianceHolder
                            });
                            UTILS.generateElement({
                                class: "joinAlBtn",
                                text: "Join",
                                onclick: function () {
                                    sendJoin(i);
                                },
                                hookTouch: true,
                                parent: tmp
                            });
                        })(i);
                    }
                } else {
                    UTILS.generateElement({
                        class: "allianceItem",
                        text: "No Tribes Yet",
                        parent: allianceHolder
                    });
                }
                UTILS.removeAllChildren(allianceManager);
                if (player.team) {
                    UTILS.generateElement({
                        class: "allianceButtonM",
                        style: "width: 360px",
                        text: player.isOwner ? "Delete Tribe" : "Leave Tribe",
                        onclick: function () {
                            leaveAlliance();
                        },
                        hookTouch: true,
                        parent: allianceManager
                    });
                } else {
                    UTILS.generateElement({
                        tag: "input",
                        type: "text",
                        id: "allianceInput",
                        maxLength: 7,
                        placeholder: "unique name",
                        ontouchstart: function (ev) {
                            ev.preventDefault();
                            var newValue = prompt("unique name", ev.currentTarget.value);
                            ev.currentTarget.value = newValue.slice(0, 7);
                        },
                        parent: allianceManager
                    });
                    UTILS.generateElement({
                        tag: "div",
                        class: "allianceButtonM",
                        style: "width: 140px;",
                        text: "Create",
                        onclick: function () {
                            createAlliance();
                        },
                        hookTouch: true,
                        parent: allianceManager
                    });
                }
            }
        }
        function aJoinReq(join) {
            io.send("11", allianceNotifications[0].sid, join);
            allianceNotifications.splice(0, 1);
            updateNotifications();
        }
        function kickFromClan(sid) {
            io.send("12", sid);
        }
        function sendJoin(index) {
            io.send("10", alliances[index].sid);
        }
        function createAlliance() {
            io.send("8", document.getElementById("allianceInput").value);
        }
        function leaveAlliance() {
            allianceNotifications = [];
            updateNotifications();
            io.send("9");
        } // window.testRateLimiting = function() {
        //     setInterval(() => {
        //         if (Math.random() > 0.5) {
        //             io.send("8", "test");
        //         } else {
        //             io.send("9");
        //         }
        //     }, 50);
        // }
        // MINIMAP:
        var lastDeath;
        var minimapData;
        var mapMarker;
        var mapPings = [];
        var tmpPing;
        function MapPing() {
            this.init = function (x, y) {
                this.scale = 0;
                this.x = x;
                this.y = y;
                this.active = true;
            };
            this.update = function (ctxt, delta) {
                if (this.active) {
                    this.scale += delta * 0.05;
                    if (this.scale >= config.mapPingScale) {
                        this.active = false;
                    } else {
                        ctxt.globalAlpha = 1 - Math.max(0, this.scale / config.mapPingScale);
                        ctxt.beginPath();
                        ctxt.arc(this.x / config.mapScale * mapDisplay.width, this.y / config.mapScale * mapDisplay.width, this.scale, 0, Math.PI * 2);
                        ctxt.stroke();
                    }
                }
            };
        }
        function pingMap(x, y) {
            for (var i = 0; i < mapPings.length; ++i) {
                if (!mapPings[i].active) {
                    tmpPing = mapPings[i];
                    break;
                }
            }
            if (!tmpPing) {
                tmpPing = new MapPing();
                mapPings.push(tmpPing);
            }
            tmpPing.init(x, y);
        }
        function updateMapMarker() {
            if (!mapMarker) {
                mapMarker = {};
            }
            mapMarker.x = player.x;
            mapMarker.y = player.y;
        }
        function updateMinimap(data) {
            minimapData = data;
        }
        function renderMinimap(delta) {
            if (player && player.alive) {
                mapContext.clearRect(0, 0, mapDisplay.width, mapDisplay.height); // RENDER PINGS:
                mapContext.strokeStyle = "#fff";
                mapContext.lineWidth = 4;
                for (var i = 0; i < mapPings.length; ++i) {
                    tmpPing = mapPings[i];
                    tmpPing.update(mapContext, delta);
                } // RENDER PLAYERS:
                mapContext.globalAlpha = 1;
                mapContext.fillStyle = "#fff";
                renderCircle(player.x / config.mapScale * mapDisplay.width, player.y / config.mapScale * mapDisplay.height, 7, mapContext, true);
                mapContext.fillStyle = "rgba(255,255,255,0.35)";
                if (player.team && minimapData) {
                    for (var i = 0; i < minimapData.length;) {
                        renderCircle(minimapData[i] / config.mapScale * mapDisplay.width, minimapData[i + 1] / config.mapScale * mapDisplay.height, 7, mapContext, true);
                        i += 2;
                    }
                } // DEATH LOCATION:
                if (lastDeath) {
                    mapContext.fillStyle = "#fc5553";
                    mapContext.font = "34px Hammersmith One";
                    mapContext.textBaseline = "middle";
                    mapContext.textAlign = "center";
                    mapContext.fillText("x", lastDeath.x / config.mapScale * mapDisplay.width, lastDeath.y / config.mapScale * mapDisplay.height);
                } // MAP MARKER:
                if (mapMarker) {
                    mapContext.fillStyle = "#fff";
                    mapContext.font = "34px Hammersmith One";
                    mapContext.textBaseline = "middle";
                    mapContext.textAlign = "center";
                    mapContext.fillText("x", mapMarker.x / config.mapScale * mapDisplay.width, mapMarker.y / config.mapScale * mapDisplay.height);
                }
            }
        } // STORE MENU:
        var currentStoreIndex = 0;
        var playerItems = {};
        function changeStoreIndex(index) {
            if (currentStoreIndex != index) {
                currentStoreIndex = index;
                generateStoreList();
            }
        }
        function toggleStoreMenu() {
            if (storeMenu.style.display != "block") {
                storeMenu.style.display = "block";
                allianceMenu.style.display = "none";
                closeChat();
                generateStoreList();
            } else {
                storeMenu.style.display = "none";
            }
        }
        function updateStoreItems(type, id, index) {
            if (index) {
                if (!type) {
                    player.tails[id] = 1;
                } else {
                    player.tailIndex = id;
                }
            } else if (!type) {
                player.skins[id] = 1;
            } else {
                player.skinIndex = id;
            }
            if (storeMenu.style.display == "block") {
                generateStoreList();
            }
        }
        function generateStoreList() {
            if (player) {
                UTILS.removeAllChildren(storeHolder);
                var index = currentStoreIndex;
                var tmpArray = index ? accessories : hats;
                for (var i = 0; i < tmpArray.length; ++i) {
                    if (!tmpArray[i].dontSell) {
                        (function (i) {
                            var tmp = UTILS.generateElement({
                                id: "storeDisplay" + i,
                                class: "storeItem",
                                onmouseout: function () {
                                    showItemInfo();
                                },
                                onmouseover: function () {
                                    showItemInfo(tmpArray[i], false, true);
                                },
                                parent: storeHolder
                            });
                            UTILS.hookTouchEvents(tmp, true);
                            UTILS.generateElement({
                                tag: "img",
                                class: "hatPreview",
                                src: "../img/" + (index ? "accessories/access_" : "hats/hat_") + tmpArray[i].id + (tmpArray[i].topSprite ? "_p" : "") + ".png",
                                parent: tmp
                            });
                            if (!document.getElementById("CustomStoreStyles").checked) {
                                UTILS.generateElement({
                                    tag: "span",
                                    text: tmpArray[i].name,
                                    parent: tmp
                                });
                                if (customStyle.parentNode) {
                                    customStyle.remove();
                                }
                            } else {
                                document.head.appendChild(customStyle);
                            }
                            if (index ? !player.tails[tmpArray[i].id] : !player.skins[tmpArray[i].id]) {
                                UTILS.generateElement({
                                    class: "joinAlBtn",
                                    style: "margin-top: 5px",
                                    text: "Buy",
                                    onclick: function () {
                                        storeBuy(tmpArray[i].id, index);
                                    },
                                    hookTouch: true,
                                    parent: tmp
                                });
                                if (!document.getElementById("CustomStoreStyles").checked) {
                                    UTILS.generateElement({
                                        tag: "span",
                                        class: "itemPrice",
                                        text: tmpArray[i].price,
                                        parent: tmp
                                    });
                                    if (customStyle.parentNode) {
                                        customStyle.remove();
                                    }
                                } else {
                                    document.head.appendChild(customStyle);
                                }
                            } else if ((index ? player.tailIndex : player.skinIndex) == tmpArray[i].id) {
                                UTILS.generateElement({
                                    class: "joinAlBtn",
                                    style: "margin-top: 5px",
                                    text: "Unequip",
                                    onclick: function () {
                                        storeEquip(0, index);
                                    },
                                    hookTouch: true,
                                    parent: tmp
                                });
                            } else {
                                UTILS.generateElement({
                                    class: "joinAlBtn",
                                    style: "margin-top: 5px",
                                    text: "Equip",
                                    onclick: function () {
                                        storeEquip(tmpArray[i].id, index);
                                    },
                                    hookTouch: true,
                                    parent: tmp
                                });
                            }
                        })(i);
                    }
                }
            }
        }
        function storeEquip(id, index) {
            io.send("13c", 0, id, index);
        }
        function storeBuy(id, index) {
            io.send("13c", 1, id, index);
        } // HIDE WINDOWS:
        function hideAllWindows() {
            storeMenu.style.display = "none";
            allianceMenu.style.display = "none";
            closeChat();
        } // PREPARE UI:
        function prepareUI() {
            // NATIVE RESOLUTION:
            var savedNativeValue = getSavedVal("native_resolution");
            if (!savedNativeValue) {
                setUseNativeResolution(typeof cordova !== "undefined"); // Only default to native if on mobile
            } else {
                setUseNativeResolution(savedNativeValue == "true");
            } // SHOW PING:
            showPing = getSavedVal("show_ping") == "true";
            pingDisplay.hidden = !showPing; // SKIN COLOR PICKER:
            updateSkinColorPicker(); // ACTION BAR:
            UTILS.removeAllChildren(actionBar);
            for (var i = 0; i < items.weapons.length + items.list.length; ++i) {
                (function (i) {
                    UTILS.generateElement({
                        id: "actionBarItem" + i,
                        class: "actionBarItem",
                        style: "display:none",
                        onmouseout: function () {
                            showItemInfo();
                        },
                        parent: actionBar
                    });
                })(i);
            }
            for (var i = 0; i < items.list.length + items.weapons.length; ++i) {
                (function (i) {
                    var tmpCanvas = document.createElement("canvas");
                    tmpCanvas.width = tmpCanvas.height = 66;
                    var tmpContext = tmpCanvas.getContext("2d");
                    tmpContext.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
                    tmpContext.imageSmoothingEnabled = false;
                    tmpContext.webkitImageSmoothingEnabled = false;
                    tmpContext.mozImageSmoothingEnabled = false;
                    if (items.weapons[i]) {
                        tmpContext.rotate(Math.PI / 4 + Math.PI);
                        var tmpSprite = new Image();
                        toolSprites[items.weapons[i].src] = tmpSprite;
                        tmpSprite.onload = function () {
                            this.isLoaded = true;
                            var tmpPad = 1 / (this.height / this.width);
                            var tmpMlt = items.weapons[i].iPad || 1;
                            tmpContext.drawImage(this, -(tmpCanvas.width * tmpMlt * config.iconPad * tmpPad) / 2, -(tmpCanvas.height * tmpMlt * config.iconPad) / 2, tmpCanvas.width * tmpMlt * tmpPad * config.iconPad, tmpCanvas.height * tmpMlt * config.iconPad);
                            tmpContext.fillStyle = "rgba(0, 0, 70, 0.1)";
                            tmpContext.globalCompositeOperation = "source-atop";
                            tmpContext.fillRect(-tmpCanvas.width / 2, -tmpCanvas.height / 2, tmpCanvas.width, tmpCanvas.height);
                            document.getElementById("actionBarItem" + i).style.backgroundImage = "url(" + tmpCanvas.toDataURL() + ")";
                        };
                        tmpSprite.src = ".././img/weapons/" + items.weapons[i].src + ".png";
                        var tmpUnit = document.getElementById("actionBarItem" + i);
                        tmpUnit.onmouseover = UTILS.checkTrusted(function () {
                            showItemInfo(items.weapons[i], true);
                        });
                        tmpUnit.onclick = UTILS.checkTrusted(function () {
                            selectToBuild(i, true);
                        });
                        UTILS.hookTouchEvents(tmpUnit);
                    } else {
                        var tmpSprite = getItemSprite(items.list[i - items.weapons.length], true);
                        var tmpScale = Math.min(tmpCanvas.width - config.iconPadding, tmpSprite.width);
                        tmpContext.globalAlpha = 1;
                        tmpContext.drawImage(tmpSprite, -tmpScale / 2, -tmpScale / 2, tmpScale, tmpScale);
                        tmpContext.fillStyle = "rgba(0, 0, 70, 0.1)";
                        tmpContext.globalCompositeOperation = "source-atop";
                        tmpContext.fillRect(-tmpScale / 2, -tmpScale / 2, tmpScale, tmpScale);
                        document.getElementById("actionBarItem" + i).style.backgroundImage = "url(" + tmpCanvas.toDataURL() + ")";
                        var tmpUnit = document.getElementById("actionBarItem" + i);
                        tmpUnit.onmouseover = UTILS.checkTrusted(function () {
                            showItemInfo(items.list[i - items.weapons.length]);
                        });
                        tmpUnit.onclick = UTILS.checkTrusted(function () {
                            selectToBuild(i - items.weapons.length);
                        });
                        UTILS.hookTouchEvents(tmpUnit);
                    }
                })(i);
            } // MOBILE NAME INPUT:
            nameInput.ontouchstart = UTILS.checkTrusted(function (e) {
                e.preventDefault();
                var newValue = prompt("enter name", e.currentTarget.value);
                e.currentTarget.value = newValue.slice(0, 15);
            }); // SETTINGS:
            nativeResolutionCheckbox.checked = useNativeResolution;
            nativeResolutionCheckbox.onchange = UTILS.checkTrusted(function (e) {
                setUseNativeResolution(e.target.checked);
            });
            showPingCheckbox.checked = showPing;
            showPingCheckbox.onchange = UTILS.checkTrusted(function (e) {
                showPing = showPingCheckbox.checked;
                pingDisplay.hidden = !showPing;
                saveVal("show_ping", showPing ? "true" : "false");
            });

        }
        function updateItems(data, wpn) {
            if (data) {
                if (wpn) {
                    player.weapons = data;
                } else {
                    player.items = data;
                }
            }
            for (var i = 0; i < items.list.length; ++i) {
                var tmpI = items.weapons.length + i;
                document.getElementById("actionBarItem" + tmpI).style.display = player.items.indexOf(items.list[i].id) >= 0 ? "inline-block" : "none";
            }
            for (var i = 0; i < items.weapons.length; ++i) {
                document.getElementById("actionBarItem" + i).style.display = player.weapons[items.weapons[i].type] == items.weapons[i].id ? "inline-block" : "none";
            }
        }
        function setUseNativeResolution(useNative) {
            useNativeResolution = useNative;
            pixelDensity = (useNative ? window.devicePixelRatio || 1 : 1) * 0.8;
            nativeResolutionCheckbox.checked = useNative;
            saveVal("native_resolution", useNative.toString());
            resize();
        }
        setUseNativeResolution(true);
        function updateGuide() {
            if (usingTouch) {
                guideCard.classList.add("touch");
            } else {
                guideCard.classList.remove("touch");
            }
        } // SETTINGS STUFF:
        function toggleSettings() {
            if (guideCard.classList.contains("showing")) {
                guideCard.classList.remove("showing");
                settingsButtonTitle.innerText = "Settings";
            } else {
                guideCard.classList.add("showing");
                settingsButtonTitle.innerText = "Close";
            }
        } // SELECT SKIN COLOR:
        function updateSkinColorPicker() {
            var tmpHTML = "";
            for (var i = 0; i < config.skinColors.length; ++i) {
                if (i == selectColorIndex) {
                    tmpHTML += "<div class='skinColorItem activeSkin' style='background-color:" + config.skinColors[i] + "' onclick='selectSkinColor(" + i + ")'></div>";
                } else {
                    tmpHTML += "<div class='skinColorItem' style='background-color:" + config.skinColors[i] + "' onclick='selectSkinColor(" + i + ")'></div>";
                }
            }
            skinColorHolder.innerHTML = tmpHTML;
        }
        function selectSkinColor(index) {
            selectColorIndex = index;
            skinColor = index == 10 ? "toString" : index;
            updateSkinColorPicker();
        }
        // CHAT STUFF:
        var chatBox = document.getElementById("chatBox");
        var chatHolder = document.getElementById("chatHolder");
        function toggleChat() {
            if (!usingTouch) {
                if (chatHolder.style.display == "block") {
                    if (chatBox.value) {
                        sendChat(chatBox.value);
                    }
                    closeChat();
                } else {
                    storeMenu.style.display = "none";
                    allianceMenu.style.display = "none";
                    chatHolder.style.display = "block";
                    chatBox.focus();
                    resetMoveDir();
                }
            } else {
                setTimeout(function () {
                    // Timeout lets the `hookTouchEvents` function exit
                    var chatMessage = prompt("chat message");
                    if (chatMessage) {
                        sendChat(chatMessage);
                    }
                }, 1);
            }
            chatBox.value = "";
        }
        function sendChat(message) {
            io.send("ch", message.slice(0, 30));
        }
        function closeChat() {
            chatBox.value = "";
            chatHolder.style.display = "none";
        } // SEND MESSAGE:
        var profanityList = ["cunt", "whore", "fuck", "shit", "faggot", "nigger", "nigga", "dick", "vagina", "minge", "cock", "rape", "cum", "sex", "tits", "penis", "clit", "pussy", "meatcurtain", "jizz", "prune", "douche", "wanker", "damn", "bitch", "dick", "fag", "bastard"];
        function checkProfanityString(text) {
            var tmpString;
            for (var i = 0; i < profanityList.length; ++i) {
                if (text.indexOf(profanityList[i]) > -1) {
                    tmpString = "";
                    for (var y = 0; y < profanityList[i].length; ++y) {
                        tmpString += tmpString.length ? "o" : "M";
                    }
                    var re = new RegExp(profanityList[i], "g");
                    text = text.replace(re, tmpString);
                }
            }
            return text;
        }
        function receiveChat(sid, message) {
            var tmpPlayer = findPlayerBySID(sid);
            if (tmpPlayer) {
                tmpPlayer.chatMessage = checkProfanityString(message);
                tmpPlayer.chatCountdown = config.chatCountdown;
            }
        } // RESIZE:
        window.addEventListener("resize", UTILS.checkTrusted(resize));
        function resize() {
            screenWidth = window.innerWidth;
            screenHeight = window.innerHeight;
            var scaleFillNative = Math.max(screenWidth / maxScreenWidth, screenHeight / maxScreenHeight) * pixelDensity;
            gameCanvas.width = screenWidth * pixelDensity;
            gameCanvas.height = screenHeight * pixelDensity;
            gameCanvas.style.width = screenWidth + "px";
            gameCanvas.style.height = screenHeight + "px";
            mainContext.setTransform(scaleFillNative, 0, 0, scaleFillNative, (screenWidth * pixelDensity - maxScreenWidth * scaleFillNative) / 2, (screenHeight * pixelDensity - maxScreenHeight * scaleFillNative) / 2);
        }
        resize(); // TOUCH INPUT:
        var usingTouch;
        setUsingTouch(false);
        function setUsingTouch(using) {
            usingTouch = using;
            updateGuide(); // if (using) {
            //     chatButton.classList.add("mobile");
            // } else {
            //     chatButton.classList.remove("mobile");
            // }
        }
        window.setUsingTouch = setUsingTouch;
        touchControls.addEventListener("touchmove", UTILS.checkTrusted(touchMove), false);
        function touchMove(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            setUsingTouch(true);
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var t = ev.changedTouches[i];
                if (t.identifier == controllingTouch.id) {
                    controllingTouch.currentX = t.pageX;
                    controllingTouch.currentY = t.pageY;
                    sendMoveDir();
                } else if (t.identifier == attackingTouch.id) {
                    attackingTouch.currentX = t.pageX;
                    attackingTouch.currentY = t.pageY;
                    attackState = 1;
                }
            }
        }
        touchControls.addEventListener("touchstart", UTILS.checkTrusted(touchStart), false);
        function touchStart(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            setUsingTouch(true);
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var t = ev.changedTouches[i];
                if (t.pageX < document.body.scrollWidth / 2 && controllingTouch.id == -1) {
                    controllingTouch.id = t.identifier;
                    controllingTouch.startX = controllingTouch.currentX = t.pageX;
                    controllingTouch.startY = controllingTouch.currentY = t.pageY;
                    sendMoveDir();
                } else if (t.pageX > document.body.scrollWidth / 2 && attackingTouch.id == -1) {
                    attackingTouch.id = t.identifier;
                    attackingTouch.startX = attackingTouch.currentX = t.pageX;
                    attackingTouch.startY = attackingTouch.currentY = t.pageY;
                    if (player.buildIndex < 0) {
                        attackState = 1;
                        sendAtckState();
                    }
                }
            }
        }
        touchControls.addEventListener("touchend", UTILS.checkTrusted(touchEnd), false);
        touchControls.addEventListener("touchcancel", UTILS.checkTrusted(touchEnd), false);
        touchControls.addEventListener("touchleave", UTILS.checkTrusted(touchEnd), false);
        function touchEnd(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            setUsingTouch(true);
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var t = ev.changedTouches[i];
                if (t.identifier == controllingTouch.id) {
                    controllingTouch.id = -1;
                    sendMoveDir();
                } else if (t.identifier == attackingTouch.id) {
                    attackingTouch.id = -1;
                    if (player.buildIndex >= 0) {
                        attackState = 1;
                        sendAtckState();
                    }
                    attackState = 0;
                    sendAtckState();
                }
            }
        }
        // MOUSE INPUT:
        touchControls.addEventListener("mousemove", gameInput, false);
        function gameInput(e) {
            e.preventDefault();
            e.stopPropagation();
            setUsingTouch(false);
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
        touchControls.addEventListener("mousedown", mouseDown, false);
        function mouseDown(e) {
            setUsingTouch(false);
            if (attackState != 1) {
                attackState = 1;
                sendAtckState();
            }
            const mouseEl = document.getElementById("mouse_" + e.button)
            if (mouseEl) mouseEl.classList.add("active2")
        }
        touchControls.addEventListener("mouseup", mouseUp, false);
        function mouseUp(e) {
            setUsingTouch(false);
            if (attackState != 0) {
                attackState = 0;
                sendAtckState();
            }
            const mouseEl = document.getElementById("mouse_" + e.button)
            if (mouseEl) mouseEl.classList.remove("active2")
        }

        // INPUT UTILS:
        function getMoveDir() {
            var dx = 0;
            var dy = 0;
            if (controllingTouch.id != -1) {
                dx += controllingTouch.currentX - controllingTouch.startX;
                dy += controllingTouch.currentY - controllingTouch.startY;
            } else {
                for (var key in moveKeys) {
                    var tmpDir = moveKeys[key];
                    dx += !!keys[key] * tmpDir[0];
                    dy += !!keys[key] * tmpDir[1];
                }
            }
            if (dx == 0 && dy == 0) {
                return undefined;
            } else {
                return UTILS.fixTo(Math.atan2(dy, dx), 2);
            }
        }
        var lastDir;
        function getAttackDir() {
            if (!player) {
                return 0;
            }
            if (attackingTouch.id != -1) {
                lastDir = Math.atan2(attackingTouch.currentY - attackingTouch.startY, attackingTouch.currentX - attackingTouch.startX);
            } else if (!player.lockDir && !usingTouch) {
                lastDir = Math.atan2(mouseY - screenHeight / 2, mouseX - screenWidth / 2);
            }
            return UTILS.fixTo(lastDir || 0, 2);
        } // KEYS:
        var keys = {};
        var moveKeys = {
            87: [0, -1],
            38: [0, -1],
            83: [0, 1],
            40: [0, 1],
            65: [-1, 0],
            37: [-1, 0],
            68: [1, 0],
            39: [1, 0]
        };
        function resetMoveDir() {
            keys = {};
            io.send("rmd");
        }
        function keysActive() {
            return allianceMenu.style.display != "block" && chatHolder.style.display != "block";
        }
        let automilling = false
        let automill = false
        function keyDown(event) {
            var keyNum = event.which || event.keyCode || 0;
            if (keyNum == 27) {
                hideAllWindows();
            } else if (player && player.alive && keysActive()) {
                if (!keys[keyNum]) {
                    keys[keyNum] = 1;
                    if (keyNum === 113) {
                        event.preventDefault();
                        hideAllWindows();
                        const ingameMenu = getEl("ingameMenu");
                        if (ingameMenu) {
                            ingameMenu.classList.toggle("show");
                        }
                    } else if (keyNum == 69) {
                        sendAutoGather();
                    } else if (keyNum == 67) {
                        updateMapMarker();
                    } else if (keyNum == 88) {
                        sendLockDir();
                    } else if (player.weapons[keyNum - 49] != undefined) {
                        selectToBuild(player.weapons[keyNum - 49], true);
                    } else if (player.items[keyNum - 49 - player.weapons.length] != undefined) {
                        selectToBuild(player.items[keyNum - 49 - player.weapons.length]);
                    } else if (keyNum == 81) {
                        selectToBuild(player.items[0]);
                    } else if (keyNum == 70 && player.items[4]) {
                        selectToBuild(player.items[4]);
                    } else if (keyNum == 78) {
                        document.getElementById("AutoMill").checked ? automill = !automill : selectToBuild(player.items[3]);
                    } else if (keyNum == 86) {
                        selectToBuild(player.items[2]);
                    } else if (keyNum == 82) {
                        sendMapPing();
                    } else if (moveKeys[keyNum]) {
                        sendMoveDir();
                    } else if (keyNum == 32) {
                        attackState = 1;
                        sendAtckState();
                    } else if (event.key.toLowerCase() === "b") {
                        const ingameMenu = getEl("ingameMenu");
                        if (ingameMenu && ingameMenu.classList.contains("show")) {
                            ingameMenu.classList.remove("show");
                        }
                        const activeElement = document.activeElement;
                        if (activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA") {
                            toggleStoreMenu();
                        }
                    }
                    let keyDiv = document.getElementById("key_" + event.key.toUpperCase());
                    if (keyDiv && !keyDiv.classList.contains("active")) {
                        keyDiv.classList.add("active");
                    }
                }
            }
        }
        window.addEventListener("keydown", UTILS.checkTrusted(keyDown));
        function keyUp(event) {
            if (player && player.alive) {
                var keyNum = event.which || event.keyCode || 0;
                if (keyNum == 13) {
                    toggleChat();
                } else if (keysActive()) {
                    if (keys[keyNum]) {
                        keys[keyNum] = 0;
                        if (moveKeys[keyNum]) {
                            sendMoveDir();
                        } else if (keyNum == 32) {
                            attackState = 0;
                            sendAtckState();
                        }
                        let keyDiv = document.getElementById("key_" + event.key.toUpperCase());
                        if (keyDiv && keyDiv.classList.contains("active")) {
                            keyDiv.classList.remove("active");
                        }
                    }
                }
            }
        }
        window.addEventListener("keyup", UTILS.checkTrusted(keyUp));
        function sendAtckState() {
            if (player && player.alive) {
                io.send("c", attackState, player.buildIndex >= 0 ? getAttackDir() : null);
            }
        }
        var lastMoveDir = undefined;
        function sendMoveDir() {
            var newMoveDir = getMoveDir();
            if (lastMoveDir == undefined || newMoveDir == undefined || Math.abs(newMoveDir - lastMoveDir) > 0.3) {
                io.send("33", newMoveDir);
                lastMoveDir = newMoveDir;
            }
        }
        function sendLockDir() {
            player.lockDir = player.lockDir ? 0 : 1;
            io.send("7", 0);
        }
        function sendMapPing() {
            io.send("14", 1);
        }
        function sendAutoGather() {
            io.send("7", 1);
        }
        function selectToBuild(index, wpn) {
            io.send("5", index, wpn);
        } // ENTER GAME:
        function enterGame() {
            saveVal("moo_name", nameInput.value);
            if (!inGame && socketReady()) {
                inGame = true;
                showLoadingText("Loading...");
                io.send("sp", {
                    name: nameInput.value,
                    moofoll: moofoll,
                    skin: skinColor
                });
            }
        } // SETUP GAME:
        var firstSetup = true;
        function setupGame(yourSID) {
            loadingText.style.display = "none";
            menuCardHolder.style.display = "block";
            mainMenu.style.display = "none";
            keys = {};
            playerSID = yourSID;
            attackState = 0;
            inGame = true;
            if (firstSetup) {
                firstSetup = false;
                gameObjects.length = 0;
            }
        } // SHOW ANIM TEXT:
        function showText(x, y, value, type) {
            if (type === -1) {
                textManager.showText(x, y, 50, 0.18, 500, value, "#ee5551");
            } else {
                textManager.showText(x, y, 50, 0.18, 500, Math.abs(value), value >= 0 ? "#fff" : "#8ecc51");
            }
        } // KILL PLAYER:
        var deathTextScale = 99999;
        function killPlayer() {
            inGame = false;
            try {
                factorem.refreshAds([2], true);
        } catch (e) {}
            gameUI.style.display = "none";
            hideAllWindows();
            lastDeath = {
                x: player.x,
                y: player.y
            };
            loadingText.style.display = "none";
            diedText.style.display = "block";
            diedText.style.fontSize = "0px";
            deathTextScale = 0;
            setTimeout(function () {
                menuCardHolder.style.display = "block";
                mainMenu.style.display = "block";
                diedText.style.display = "none";
            }, config.deathFadeout);
        } // KILL ALL OBJECTS BY A PLAYER:
        function killObjects(sid) {
            if (player) {
                objectManager.removeAllItems(sid);
            }
        } // KILL OBJECT:
        function killObject(sid) {
            objectManager.disableBySid(sid);
        } // UPDATE SCORE DISPLAY:
        function updateStatusDisplay() {
            scoreDisplay.innerText = player.points;
            foodDisplay.innerText = player.food;
            woodDisplay.innerText = player.wood;
            stoneDisplay.innerText = player.stone;
            killCounter.innerText = player.kills;
        } // ICONS:
        var iconSprites = {};
        var icons = ["crown", "skull"];
        function loadIcons() {
            for (var i = 0; i < icons.length; ++i) {
                var tmpSprite = new Image();
                tmpSprite.onload = function () {
                    this.isLoaded = true;
                };
                tmpSprite.src = ".././img/icons/" + icons[i] + ".png";
                iconSprites[icons[i]] = tmpSprite;
            }
        } // UPDATE UPGRADES:
        var tmpList = [];
        function updateUpgrades(points, age) {
            player.upgradePoints = points;
            player.upgrAge = age;
            if (points > 0) {
                tmpList.length = 0;
                UTILS.removeAllChildren(upgradeHolder);
                for (var i = 0; i < items.weapons.length; ++i) {
                    //if (document.getElementById("AllItemsUnlocked").checked) items.weapons[i].pre = undefined;
                    if (items.weapons[i].age == age && (items.weapons[i].pre == undefined || player.weapons.indexOf(items.weapons[i].pre) >= 0)) {
                        var e = UTILS.generateElement({
                            id: "upgradeItem" + i,
                            class: "actionBarItem",
                            onmouseout: function () {
                                showItemInfo();
                            },
                            parent: upgradeHolder
                        });
                        e.style.backgroundImage = document.getElementById("actionBarItem" + i).style.backgroundImage;
                        tmpList.push(i);
                    }
                }
                for (var i = 0; i < items.list.length; ++i) {
                    if (items.list[i].age == age && ((document.getElementById("AllItemsUnlocked").checked ? true : items.list[i].pre == undefined) || player.items.indexOf(items.list[i].pre) >= 0)) {
                        var tmpI = items.weapons.length + i;
                        var e = UTILS.generateElement({
                            id: "upgradeItem" + tmpI,
                            class: "actionBarItem",
                            onmouseout: function () {
                                showItemInfo();
                            },
                            parent: upgradeHolder
                        });
                        e.style.backgroundImage = document.getElementById("actionBarItem" + tmpI).style.backgroundImage;
                        tmpList.push(tmpI);
                    }
                }
                for (var i = 0; i < tmpList.length; i++) {
                    (function (i) {
                        var tmpItem = document.getElementById("upgradeItem" + i);
                        tmpItem.onmouseover = function () {
                            if (items.weapons[i]) {
                                showItemInfo(items.weapons[i], true);
                            } else {
                                showItemInfo(items.list[i - items.weapons.length]);
                            }
                        };
                        tmpItem.onclick = UTILS.checkTrusted(function () {
                            io.send("6", i);
                        });
                        UTILS.hookTouchEvents(tmpItem);
                    })(tmpList[i]);
                }
                if (tmpList.length) {
                    upgradeHolder.style.display = "block";
                    upgradeCounter.style.display = "block";
                    upgradeCounter.innerHTML = "SELECT ITEMS (" + points + ")";
                } else {
                    upgradeHolder.style.display = "none";
                    upgradeCounter.style.display = "none";
                    showItemInfo();
                }
            } else {
                upgradeHolder.style.display = "none";
                upgradeCounter.style.display = "none";
                showItemInfo();
            }
        }
        function sendUpgrade(index) {
            io.send("6", index);
        } // UPDATE AGE:
        function updateAge(xp, mxp, age) {
            if (xp != undefined) {
                player.XP = xp;
            }
            if (mxp != undefined) {
                player.maxXP = mxp;
            }
            if (age != undefined) {
                player.age = age;
            }
            if (age == config.maxAge) {
                ageText.innerHTML = "MAX AGE";
                ageBarBody.style.width = "100%";
            } else {
                ageText.innerHTML = "AGE " + player.age;
                ageBarBody.style.width = player.XP / player.maxXP * 100 + "%";
            }
        } // UPDATE LEADERBOARD:
        function updateLeaderboard(data) {
            UTILS.removeAllChildren(leaderboardData);
            var tmpC = 1;
            for (var i = 0; i < data.length; i += 3) {
                (function (i) {
                    UTILS.generateElement({
                        class: "leaderHolder",
                        parent: leaderboardData,
                        children: [UTILS.generateElement({
                            class: "leaderboardItem",
                            style: "color:" + (data[i] == playerSID ? "#fff" : "rgba(255,255,255,0.6)"),
                            text: tmpC + ". " + (data[i + 1] != "" ? data[i + 1] : "unknown")
                        }), UTILS.generateElement({
                            class: "leaderScore",
                            text: UTILS.kFormat(data[i + 2]) || "0"
                        })]
                    });
                })(i);
                tmpC++;
            }
        } // UPDATE GAME:
        function updateGame() {
            if (true) {
                // AutoHeal Ticks:
                game.tick++;
                if (game.tickQueue[game.tick]) {
                    game.tickQueue[game.tick].forEach(function (callback) {
                        callback();
                    });
                    delete game.tickQueue[game.tick];
                }
                // UPDATE DIRECTION:
                if (player) {
                    if (!lastSent || now - lastSent >= 1000 / config.clientSendRate) {
                        lastSent = now;
                        io.send("2", getAttackDir());
                    }
                }
                // DEATH TEXT:
                if (deathTextScale < 120) {
                    deathTextScale += delta * 0.1;
                    diedText.style.fontSize = Math.min(Math.round(deathTextScale), 120) + "px";
                }
                // MOVE CAMERA:
                if (player) {
                    var tmpDist = UTILS.getDistance(camX, camY, player.x, player.y);
                    var tmpDir = UTILS.getDirection(player.x, player.y, camX, camY);
                    var camSpd = Math.min(tmpDist * 0.01 * delta, tmpDist);
                    if (tmpDist > 0.05) {
                        camX += camSpd * Math.cos(tmpDir);
                        camY += camSpd * Math.sin(tmpDir);
                    } else {
                        camX = player.x;
                        camY = player.y;
                    }
                } else {
                    camX = config.mapScale / 2;
                    camY = config.mapScale / 2;
                }
                // INTERPOLATE PLAYERS AND AI:
                var lastTime = now - 1000 / config.serverUpdateRate;
                var tmpDiff;
                for (var i = 0; i < players.length + ais.length; ++i) {
                    tmpObj = players[i] || ais[i - players.length];
                    if (tmpObj && tmpObj.visible) {
                        if (tmpObj.forcePos) {
                            tmpObj.x = tmpObj.x2;
                            tmpObj.y = tmpObj.y2;
                            tmpObj.dir = tmpObj.d2;
                        } else {
                            var total = tmpObj.t2 - tmpObj.t1;
                            var fraction = lastTime - tmpObj.t1;
                            var ratio = fraction / total;
                            var rate = 170;
                            tmpObj.dt += delta;
                            var tmpRate = Math.min(1.7, tmpObj.dt / rate);
                            var tmpDiff = tmpObj.x2 - tmpObj.x1;
                            tmpObj.x = tmpObj.x1 + tmpDiff * tmpRate;
                            tmpDiff = tmpObj.y2 - tmpObj.y1;
                            tmpObj.y = tmpObj.y1 + tmpDiff * tmpRate;
                            tmpObj.dir = Math.lerpAngle(tmpObj.d2, tmpObj.d1, Math.min(1.2, ratio));
                        }
                    }
                }
                // RENDER CORDS:
                var xOffset = camX - maxScreenWidth / 2;
                var yOffset = camY - maxScreenHeight / 2;
                // RENDER BACKGROUND:
                if (config.snowBiomeTop - yOffset <= 0 && config.mapScale - config.snowBiomeTop - yOffset >= maxScreenHeight) {
                    mainContext.fillStyle = "#b6db66";
                    mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
                } else if (config.mapScale - config.snowBiomeTop - yOffset <= 0) {
                    mainContext.fillStyle = "#dbc666";
                    mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
                } else if (config.snowBiomeTop - yOffset >= maxScreenHeight) {
                    mainContext.fillStyle = "#fff";
                    mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
                } else if (config.snowBiomeTop - yOffset >= 0) {
                    mainContext.fillStyle = "#fff";
                    mainContext.fillRect(0, 0, maxScreenWidth, config.snowBiomeTop - yOffset);
                    mainContext.fillStyle = "#b6db66";
                    mainContext.fillRect(0, config.snowBiomeTop - yOffset, maxScreenWidth, maxScreenHeight - (config.snowBiomeTop - yOffset));
                } else {
                    mainContext.fillStyle = "#b6db66";
                    mainContext.fillRect(0, 0, maxScreenWidth, config.mapScale - config.snowBiomeTop - yOffset);
                    mainContext.fillStyle = "#dbc666";
                    mainContext.fillRect(0, config.mapScale - config.snowBiomeTop - yOffset, maxScreenWidth, maxScreenHeight - (config.mapScale - config.snowBiomeTop - yOffset));
                }
                // RENDER WATER AREAS:
                if (!firstSetup) {
                    waterMult += waterPlus * config.waveSpeed * delta;
                    if (waterMult >= config.waveMax) {
                        waterMult = config.waveMax;
                        waterPlus = -1;
                    } else if (waterMult <= 1) {
                        waterMult = waterPlus = 1;
                    }
                    mainContext.globalAlpha = 1;
                    mainContext.fillStyle = "#dbc666";
                    renderWaterBodies(xOffset, yOffset, mainContext, config.riverPadding);
                    mainContext.fillStyle = "#91b2db";
                    renderWaterBodies(xOffset, yOffset, mainContext, (waterMult - 1) * 250);
                }
                // RENDER GRID:
                if (!document.getElementById("gridSwitch").checked) {
                    mainContext.lineWidth = 4;
                    mainContext.strokeStyle = "#000";
                    mainContext.globalAlpha = 0.06;
                    mainContext.beginPath();
                    for (var x = -camX; x < maxScreenWidth; x += maxScreenHeight / 18) {
                        if (x > 0) {
                            mainContext.moveTo(x, 0);
                            mainContext.lineTo(x, maxScreenHeight);
                        }
                    }
                    for (var y = -camY; y < maxScreenHeight; y += maxScreenHeight / 18) {
                        if (x > 0) {
                            mainContext.moveTo(0, y);
                            mainContext.lineTo(maxScreenWidth, y);
                        }
                    }
                    mainContext.stroke();
                }
                // RENDER BOTTOM LAYER:
                mainContext.globalAlpha = 1;
                mainContext.strokeStyle = outlineColor;
                renderGameObjects(-1, xOffset, yOffset);
                // RENDER PROJECTILES:
                mainContext.globalAlpha = 1;
                mainContext.lineWidth = outlineWidth;
                renderProjectiles(0, xOffset, yOffset);
                // RENDER PLAYERS:
                renderPlayers(xOffset, yOffset, 0);
                // RENDER AI:
                mainContext.globalAlpha = 1;
                for (var i = 0; i < ais.length; ++i) {
                    tmpObj = ais[i];
                    if (tmpObj.active && tmpObj.visible) {
                        tmpObj.animate(delta);
                        mainContext.save();
                        mainContext.translate(tmpObj.x - xOffset, tmpObj.y - yOffset);
                        mainContext.rotate(tmpObj.dir + tmpObj.dirPlus - Math.PI / 2);
                        renderAI(tmpObj, mainContext);
                        mainContext.restore();
                    }
                }
                // RENDER GAME OBJECTS (LAYERED):
                renderGameObjects(0, xOffset, yOffset);
                renderProjectiles(1, xOffset, yOffset);
                renderGameObjects(1, xOffset, yOffset);
                renderPlayers(xOffset, yOffset, 1);
                renderGameObjects(2, xOffset, yOffset);
                renderGameObjects(3, xOffset, yOffset);
                // MAP BOUNDARIES:
                mainContext.fillStyle = "#000";
                mainContext.globalAlpha = 0.09;
                if (xOffset <= 0) {
                    mainContext.fillRect(0, 0, -xOffset, maxScreenHeight);
                }
                if (config.mapScale - xOffset <= maxScreenWidth) {
                    var tmpY = Math.max(0, -yOffset);
                    mainContext.fillRect(config.mapScale - xOffset, tmpY, maxScreenWidth - (config.mapScale - xOffset), maxScreenHeight - tmpY);
                }
                if (yOffset <= 0) {
                    mainContext.fillRect(-xOffset, 0, maxScreenWidth + xOffset, -yOffset);
                }
                if (config.mapScale - yOffset <= maxScreenHeight) {
                    var tmpX = Math.max(0, -xOffset);
                    var tmpMin = 0;
                    if (config.mapScale - xOffset <= maxScreenWidth) {
                        tmpMin = maxScreenWidth - (config.mapScale - xOffset);
                    }
                    mainContext.fillRect(tmpX, config.mapScale - yOffset, maxScreenWidth - tmpX - tmpMin, maxScreenHeight - (config.mapScale - yOffset));
                }
                // RENDER DAY/NIGHT TIME:
                mainContext.globalAlpha = 1;
                mainContext.fillStyle = "rgba(0, 0, 70, 0.35)";
                mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
                // RENDER PLAYER AND AI UI:
                mainContext.strokeStyle = darkOutlineColor;
                for (var i = 0; i < players.length + ais.length; ++i) {
                    tmpObj = players[i] || ais[i - players.length];
                    if (tmpObj.visible) {
                        // NAME AND HEALTH:
                        if (tmpObj.skinIndex != 10 || tmpObj == player || tmpObj.team && tmpObj.team == player.team) {
                            var tmpText = (tmpObj.team ? "#" + tmpObj.team + " " : "") + (tmpObj.name || ""); // ""[" + tmpObj.team + "] "
                            if (tmpText != "") {
                                mainContext.font = (tmpObj.nameScale || 20) + "px Hammersmith One"; // 30
                                mainContext.fillStyle = "#fff";
                                mainContext.textBaseline = "middle";
                                mainContext.textAlign = "center";
                                mainContext.lineWidth = tmpObj.nameScale ? 11 : 8;
                                mainContext.lineJoin = "round";
                                mainContext.strokeText(tmpText, tmpObj.x - xOffset, tmpObj.y - yOffset - tmpObj.scale - config.nameY);
                                mainContext.fillText(tmpText, tmpObj.x - xOffset, tmpObj.y - yOffset - tmpObj.scale - config.nameY);
                                if (tmpObj.isLeader && iconSprites.crown.isLoaded) {
                                    var tmpS = config.crownIconScale;
                                    var tmpX = tmpObj.x - xOffset - tmpS / 2 - mainContext.measureText(tmpText).width / 2 - config.crownPad;
                                    mainContext.drawImage(iconSprites.crown, tmpX, tmpObj.y - yOffset - tmpObj.scale - config.nameY - tmpS / 2 - 5, tmpS, tmpS);
                                }
                                if (tmpObj.iconIndex == 1 && iconSprites.skull.isLoaded) {
                                    var tmpS = config.crownIconScale;
                                    var tmpX = tmpObj.x - xOffset - tmpS / 2 + mainContext.measureText(tmpText).width / 2 + config.crownPad;
                                    mainContext.drawImage(iconSprites.skull, tmpX, tmpObj.y - yOffset - tmpObj.scale - config.nameY - tmpS / 2 - 5, tmpS, tmpS);
                                }
                            }
                            if (tmpObj.isPlayer) {} else if (document.getElementById("HealthTextSwitch").checked) {
                                const x = tmpObj.x - xOffset;
                                const y = tmpObj.y - yOffset + tmpObj.scale + config.nameY * 2;
                                const text = `${~~tmpObj.health}/${~~tmpObj.maxHealth}`;
                                mainContext.save();
                                mainContext.font = "18px Hammersmith One";
                                mainContext.fillStyle = "#fff";
                                mainContext.textBaseline = "middle";
                                mainContext.textAlign = "center";
                                mainContext.lineWidth = 8;
                                mainContext.lineJoin = "round";
                                mainContext.strokeText(text, x, y);
                                mainContext.fillText(text, x, y);
                                mainContext.restore();
                            }
                            if (tmpObj.health > 0) {
                                // HEALTH HOLDER:
                                var tmpWidth = config.healthBarWidth;
                                mainContext.fillStyle = darkOutlineColor;
                                mainContext.roundRect(tmpObj.x - xOffset - config.healthBarWidth - config.healthBarPad, tmpObj.y - yOffset + tmpObj.scale + config.nameY, config.healthBarWidth * 2 + config.healthBarPad * 2, 17, 8);
                                mainContext.fill();
                                // HEALTH BAR:
                                mainContext.fillStyle = tmpObj == player || tmpObj.team && tmpObj.team == player.team ? "#8ecc51" : "#cc5151";
                                mainContext.roundRect(tmpObj.x - xOffset - config.healthBarWidth, tmpObj.y - yOffset + tmpObj.scale + config.nameY + config.healthBarPad, config.healthBarWidth * 2 * (tmpObj.health / tmpObj.maxHealth), 17 - config.healthBarPad * 2, 7);
                                mainContext.fill();
                            }
                            let downYOffset = false ? 17 : 0;
                            if (tmpObj.isPlayer && document.getElementById("HealthTextSwitch").checked) {
                                const x = tmpObj.x - xOffset;
                                const y = tmpObj.y - yOffset + tmpObj.scale + config.nameY * 2 + downYOffset;
                                const text = `${~~tmpObj.health}/${~~tmpObj.maxHealth}`;
                                mainContext.save();
                                mainContext.font = "18px Hammersmith One";
                                mainContext.fillStyle = "#fff";
                                mainContext.textBaseline = "middle";
                                mainContext.textAlign = "center";
                                mainContext.lineWidth = 8;
                                mainContext.lineJoin = "round";
                                mainContext.strokeText(text, x, y);
                                mainContext.fillText(text, x, y);
                                mainContext.restore();
                                downYOffset += config.nameY / 2 + 4;
                            }
                        }
                    }
                }
                // RENDER ANIM TEXTS:
                textManager.update(delta, mainContext, xOffset, yOffset);
                // RENDER CHAT MESSAGES:
                for (var i = 0; i < players.length; ++i) {
                    tmpObj = players[i];
                    if (tmpObj.visible && tmpObj.chatCountdown > 0) {
                        tmpObj.chatCountdown -= delta;
                        if (tmpObj.chatCountdown <= 0) {
                            tmpObj.chatCountdown = 0;
                        }
                        mainContext.font = "32px Hammersmith One";
                        var tmpSize = mainContext.measureText(tmpObj.chatMessage);
                        mainContext.textBaseline = "middle";
                        mainContext.textAlign = "center";
                        var tmpX = tmpObj.x - xOffset;
                        var tmpY = tmpObj.y - tmpObj.scale - yOffset - 90;
                        var tmpH = 47;
                        var tmpW = tmpSize.width + 17;
                        mainContext.fillStyle = "rgba(0,0,0,0.2)";
                        mainContext.roundRect(tmpX - tmpW / 2, tmpY - tmpH / 2, tmpW, tmpH, 6);
                        mainContext.fill();
                        mainContext.fillStyle = "#fff";
                        mainContext.fillText(tmpObj.chatMessage, tmpX, tmpY);
                    }
                }
            }
            // RENDER MINIMAP:
            renderMinimap(delta);
            // RENDER CONTROLS:
            if (controllingTouch.id !== -1) {
                renderControl(controllingTouch.startX, controllingTouch.startY, controllingTouch.currentX, controllingTouch.currentY);
            }
            if (attackingTouch.id !== -1) {
                renderControl(attackingTouch.startX, attackingTouch.startY, attackingTouch.currentX, attackingTouch.currentY);
            }
        } // RENDER CONTROL:
        function renderControl(startX, startY, currentX, currentY) {
            mainContext.save();
            mainContext.setTransform(1, 0, 0, 1, 0, 0); // mainContext.resetTransform();
            mainContext.scale(pixelDensity, pixelDensity);
            var controlRadius = 50;
            mainContext.beginPath();
            mainContext.arc(startX, startY, controlRadius, 0, Math.PI * 2, false);
            mainContext.closePath();
            mainContext.fillStyle = "rgba(255, 255, 255, 0.3)";
            mainContext.fill();
            var controlRadius = 50;
            var offsetX = currentX - startX;
            var offsetY = currentY - startY;
            var mag = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
            var divisor = mag > controlRadius ? mag / controlRadius : 1;
            offsetX /= divisor;
            offsetY /= divisor;
            mainContext.beginPath();
            mainContext.arc(startX + offsetX, startY + offsetY, controlRadius * 0.5, 0, Math.PI * 2, false);
            mainContext.closePath();
            mainContext.fillStyle = "white";
            mainContext.fill();
            mainContext.restore();
        } // RENDER PROJECTILES:
        function renderProjectiles(layer, xOffset, yOffset) {
            for (var i = 0; i < projectiles.length; ++i) {
                tmpObj = projectiles[i];
                if (tmpObj.active && tmpObj.layer == layer) {
                    tmpObj.update(delta);
                    if (tmpObj.active && isOnScreen(tmpObj.x - xOffset, tmpObj.y - yOffset, tmpObj.scale)) {
                        mainContext.save();
                        mainContext.translate(tmpObj.x - xOffset, tmpObj.y - yOffset);
                        mainContext.rotate(tmpObj.dir);
                        renderProjectile(0, 0, tmpObj, mainContext, 1);
                        mainContext.restore();
                    }
                }
            }
        } // RENDER PROJECTILE:
        var projectileSprites = {};
        function renderProjectile(x, y, obj, ctxt, debug) {
            if (obj.src) {
                var tmpSrc = items.projectiles[obj.indx].src;
                var tmpSprite = projectileSprites[tmpSrc];
                if (!tmpSprite) {
                    tmpSprite = new Image();
                    tmpSprite.onload = function () {
                        this.isLoaded = true;
                    };
                    tmpSprite.src = ".././img/weapons/" + tmpSrc + ".png";
                    projectileSprites[tmpSrc] = tmpSprite;
                }
                if (tmpSprite.isLoaded) {
                    ctxt.drawImage(tmpSprite, x - obj.scale / 2, y - obj.scale / 2, obj.scale, obj.scale);
                }
            } else if (obj.indx == 1) {
                ctxt.fillStyle = "#939393";
                renderCircle(x, y, obj.scale, ctxt);
            }
        }

        function Ud() {
            let t = camX - maxScreenWidth / 2;
            let i = camY - maxScreenHeight / 2;
            Ye.animationTime += delta;
            Ye.animationTime %= config.volcanoAnimationDuration;
            let d = config.volcanoAnimationDuration / 2;
            let $ = 1.7 + Math.abs(d - Ye.animationTime) / d * 0.3;
            let n = config.innerVolcanoScale * $;
            mainContext.drawImage(Ye.land, Ye.x - config.volcanoScale - t, Ye.y - config.volcanoScale - i, config.volcanoScale * 2, config.volcanoScale * 2);
            mainContext.drawImage(Ye.lava, Ye.x - n - t, Ye.y - n - i, n * 2, n * 2);
        }
        // RENDER WATER BODIES:
        function renderWaterBodies(xOffset, yOffset, ctxt, padding) {
            // MIDDLE RIVER:
            var tmpW = config.riverWidth + padding;
            var tmpY = config.mapScale / 2 - yOffset - tmpW / 2;
            if (tmpY < maxScreenHeight && tmpY + tmpW > 0) {
                ctxt.fillRect(0, tmpY, maxScreenWidth, tmpW);
            }
        } // RENDER GAME OBJECTS:
        function renderGameObjects(layer, xOffset, yOffset) {
            var tmpSprite;
            var tmpX;
            var tmpY;
            for (var i = 0; i < gameObjects.length; ++i) {
                tmpObj = gameObjects[i];
                if (tmpObj.active) {
                    tmpX = tmpObj.x + tmpObj.xWiggle - xOffset;
                    tmpY = tmpObj.y + tmpObj.yWiggle - yOffset;
                    if (layer == 0) {
                        tmpObj.update(delta);
                    }
                    if (tmpObj.layer == layer && isOnScreen(tmpX, tmpY, tmpObj.scale + (tmpObj.blocker || 0))) {
                        mainContext.globalAlpha = tmpObj.hideFromEnemy ? 0.6 : 1;
                        if (tmpObj.isItem) {
                            var _player2;
                            tmpSprite = getItemSprite(tmpObj);
                            mainContext.save();
                            mainContext.translate(tmpX, tmpY);
                            mainContext.rotate(tmpObj.dir);
                            mainContext.drawImage(tmpSprite, -(tmpSprite.width / 2), -(tmpSprite.height / 2));
                            if (tmpObj.blocker) {
                                mainContext.strokeStyle = "#db6e6e";
                                mainContext.globalAlpha = 0.3;
                                mainContext.lineWidth = 6;
                                renderCircle(0, 0, tmpObj.blocker, mainContext, false, true);
                            }
                            mainContext.restore();
                            if (document.getElementById("BuildingMark").checked && (_player2 = player) !== null && _player2 !== undefined && _player2.alive) {
                                const distance = Math.hypot(tmpObj.y - player.y, tmpObj.x - player.x);
                                if (distance <= 1500) {
                                    const color = isClanMember(tmpObj.owner.sid) ? "#8ecc51" : "#cc5151";
                                    const scale = tmpObj.scale * 0.65 / 2;
                                    mainContext.save();
                                    mainContext.fillStyle = color;
                                    mainContext.translate(tmpX, tmpY);
                                    mainContext.beginPath();
                                    mainContext.arc(0, 0, scale, 0, Math.PI * 2);
                                    mainContext.fill();
                                    mainContext.restore();
                                }
                            }
                        } else if (tmpObj.type === 4) {
                            Ud();
                        } else {
                            tmpSprite = getResSprite(tmpObj);
                            mainContext.drawImage(tmpSprite, tmpX - tmpSprite.width / 2, tmpY - tmpSprite.height / 2);
                        }
                    }
                }
            }
        } // GATHER ANIMATION:
        function gatherAnimation(sid, didHit, index) {
            tmpObj = findPlayerBySID(sid);
            if (tmpObj) {
                tmpObj.startAnim(didHit, index);
            }
        } // RENDER PLAYERS:
        function renderPlayers(xOffset, yOffset, zIndex) {
            mainContext.globalAlpha = 1;
            for (var i = 0; i < players.length; ++i) {
                tmpObj = players[i];
                if (tmpObj.zIndex == zIndex) {
                    tmpObj.animate(delta);
                    if (tmpObj.visible) {
                        tmpObj.skinRot += delta * 0.002;
                        tmpDir = (tmpObj == player ? getAttackDir() : tmpObj.dir) + tmpObj.dirPlus;
                        mainContext.save();
                        mainContext.translate(tmpObj.x - xOffset, tmpObj.y - yOffset); // RENDER PLAYER:
                        mainContext.rotate(tmpDir);
                        renderPlayer(tmpObj, mainContext);
                        mainContext.restore();
                    }
                }
            }
        } // RENDER PLAYER:
        function renderPlayer(obj, ctxt) {
            ctxt = ctxt || mainContext;
            ctxt.lineWidth = outlineWidth;
            ctxt.lineJoin = "miter";
            var handAngle = Math.PI / 4 * (items.weapons[obj.weaponIndex].armS || 1);
            var oHandAngle = obj.buildIndex < 0 ? items.weapons[obj.weaponIndex].hndS || 1 : 1;
            var oHandDist = obj.buildIndex < 0 ? items.weapons[obj.weaponIndex].hndD || 1 : 1; // TAIL/CAPE:
            if (obj.tailIndex > 0) {
                renderTail(obj.tailIndex, ctxt, obj);
            } // WEAPON BELLOW HANDS:
            if (obj.buildIndex < 0 && !items.weapons[obj.weaponIndex].aboveHand) {
                renderTool(items.weapons[obj.weaponIndex], config.weaponVariants[obj.weaponVariant].src, obj.scale, 0, ctxt);
                if (items.weapons[obj.weaponIndex].projectile != undefined && !items.weapons[obj.weaponIndex].hideProjectile) {
                    renderProjectile(obj.scale, 0, items.projectiles[items.weapons[obj.weaponIndex].projectile], mainContext);
                }
            } // HANDS:
            ctxt.fillStyle = config.skinColors[obj.skinColor];
            renderCircle(obj.scale * Math.cos(handAngle), obj.scale * Math.sin(handAngle), 14);
            renderCircle(obj.scale * oHandDist * Math.cos(-handAngle * oHandAngle), obj.scale * oHandDist * Math.sin(-handAngle * oHandAngle), 14); // WEAPON ABOVE HANDS:
            if (obj.buildIndex < 0 && items.weapons[obj.weaponIndex].aboveHand) {
                renderTool(items.weapons[obj.weaponIndex], config.weaponVariants[obj.weaponVariant].src, obj.scale, 0, ctxt);
                if (items.weapons[obj.weaponIndex].projectile != undefined && !items.weapons[obj.weaponIndex].hideProjectile) {
                    renderProjectile(obj.scale, 0, items.projectiles[items.weapons[obj.weaponIndex].projectile], mainContext);
                }
            } // BUILD ITEM:
            if (obj.buildIndex >= 0) {
                var tmpSprite = getItemSprite(items.list[obj.buildIndex]);
                ctxt.drawImage(tmpSprite, obj.scale - items.list[obj.buildIndex].holdOffset, -tmpSprite.width / 2);
            } // BODY:
            renderCircle(0, 0, obj.scale, ctxt); // SKIN:
            if (obj.skinIndex > 0) {
                ctxt.rotate(Math.PI / 2);
                renderSkin(obj.skinIndex, ctxt, null, obj);
            }
        } // RENDER SKINS:
        var skinSprites = {};
        var skinPointers = {};
        var tmpSkin;
        function renderSkin(index, ctxt, parentSkin, owner) {
            tmpSkin = skinSprites[index];
            if (!tmpSkin) {
                var tmpImage = new Image();
                tmpImage.onload = function () {
                    this.isLoaded = true;
                    this.onload = null;
                };
                tmpImage.src = ".././img/hats/hat_" + index + ".png";
                skinSprites[index] = tmpImage;
                tmpSkin = tmpImage;
            }
            var tmpObj = parentSkin || skinPointers[index];
            if (!tmpObj) {
                for (var i = 0; i < hats.length; ++i) {
                    if (hats[i].id == index) {
                        tmpObj = hats[i];
                        break;
                    }
                }
                skinPointers[index] = tmpObj;
            }
            if (tmpSkin.isLoaded) {
                ctxt.drawImage(tmpSkin, -tmpObj.scale / 2, -tmpObj.scale / 2, tmpObj.scale, tmpObj.scale);
            }
            if (!parentSkin && tmpObj.topSprite) {
                ctxt.save();
                ctxt.rotate(owner.skinRot);
                renderSkin(index + "_top", ctxt, tmpObj, owner);
                ctxt.restore();
            }
        } // RENDER TAIL:
        var accessSprites = {};
        var accessPointers = {};
        function renderTail(index, ctxt, owner) {
            tmpSkin = accessSprites[index];
            if (!tmpSkin) {
                var tmpImage = new Image();
                tmpImage.onload = function () {
                    this.isLoaded = true;
                    this.onload = null;
                };
                tmpImage.src = ".././img/accessories/access_" + index + ".png";
                accessSprites[index] = tmpImage;
                tmpSkin = tmpImage;
            }
            var tmpObj = accessPointers[index];
            if (!tmpObj) {
                for (var i = 0; i < accessories.length; ++i) {
                    if (accessories[i].id == index) {
                        tmpObj = accessories[i];
                        break;
                    }
                }
                accessPointers[index] = tmpObj;
            }
            if (tmpSkin.isLoaded) {
                ctxt.save();
                ctxt.translate(-20 - (tmpObj.xOff || 0), 0);
                if (tmpObj.spin) {
                    ctxt.rotate(owner.skinRot);
                }
                ctxt.drawImage(tmpSkin, -(tmpObj.scale / 2), -(tmpObj.scale / 2), tmpObj.scale, tmpObj.scale);
                ctxt.restore();
            }
        } // RENDER TOOL:
        var toolSprites = {};
        function renderTool(obj, variant, x, y, ctxt) {
            var tmpSrc = obj.src + (variant || "");
            var tmpSprite = toolSprites[tmpSrc];
            if (!tmpSprite) {
                tmpSprite = new Image();
                tmpSprite.onload = function () {
                    this.isLoaded = true;
                };
                tmpSprite.src = ".././img/weapons/" + tmpSrc + ".png";
                toolSprites[tmpSrc] = tmpSprite;
            }
            if (tmpSprite.isLoaded) {
                ctxt.drawImage(tmpSprite, x + obj.xOff - obj.length / 2, y + obj.yOff - obj.width / 2, obj.length, obj.width);
            }
        } // RENDER GAME OBJECTS:
        var gameObjectSprites = {};
        function getResSprite(obj) {
            var biomeID = obj.y >= config.mapScale - config.snowBiomeTop ? 2 : obj.y <= config.snowBiomeTop ? 1 : 0;
            var tmpIndex = obj.type + "_" + obj.scale + "_" + biomeID;
            var tmpSprite = gameObjectSprites[tmpIndex];
            if (!tmpSprite) {
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = tmpCanvas.height = obj.scale * 2.1 + outlineWidth;
                var tmpContext = tmpCanvas.getContext("2d");
                tmpContext.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
                tmpContext.rotate(UTILS.randFloat(0, Math.PI));
                tmpContext.strokeStyle = outlineColor;
                tmpContext.lineWidth = outlineWidth;
                if (obj.type == 0) {
                    var tmpScale;
                    for (var i = 0; i < 2; ++i) {
                        tmpScale = tmpObj.scale * (!i ? 1 : 0.5);
                        renderStar(tmpContext, 7, tmpScale, tmpScale * 0.7);
                        tmpContext.fillStyle = !biomeID ? !i ? "#9ebf57" : "#b4db62" : !i ? "#e3f1f4" : "#fff";
                        tmpContext.fill();
                        if (!i) {
                            tmpContext.stroke();
                        }
                    }
                } else if (obj.type == 1) {
                    if (biomeID == 2) {
                        tmpContext.fillStyle = "#606060";
                        renderStar(tmpContext, 6, obj.scale * 0.3, obj.scale * 0.71);
                        tmpContext.fill();
                        tmpContext.stroke();
                        tmpContext.fillStyle = "#89a54c";
                        renderCircle(0, 0, obj.scale * 0.55, tmpContext);
                        tmpContext.fillStyle = "#a5c65b";
                        renderCircle(0, 0, obj.scale * 0.3, tmpContext, true);
                    } else {
                        renderBlob(tmpContext, 6, tmpObj.scale, tmpObj.scale * 0.7);
                        tmpContext.fillStyle = biomeID ? "#e3f1f4" : "#89a54c";
                        tmpContext.fill();
                        tmpContext.stroke();
                        tmpContext.fillStyle = biomeID ? "#6a64af" : "#c15555";
                        var tmpRange;
                        var berries = 4;
                        var rotVal = mathPI2 / berries;
                        for (var i = 0; i < berries; ++i) {
                            tmpRange = UTILS.randInt(tmpObj.scale / 3.5, tmpObj.scale / 2.3);
                            renderCircle(tmpRange * Math.cos(rotVal * i), tmpRange * Math.sin(rotVal * i), UTILS.randInt(10, 12), tmpContext);
                        }
                    }
                } else if (obj.type == 2 || obj.type == 3) {
                    tmpContext.fillStyle = obj.type == 2 ? biomeID == 2 ? "#938d77" : "#939393" : "#e0c655";
                    renderStar(tmpContext, 3, obj.scale, obj.scale);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = obj.type == 2 ? biomeID == 2 ? "#b2ab90" : "#bcbcbc" : "#ebdca3";
                    renderStar(tmpContext, 3, obj.scale * 0.55, obj.scale * 0.65);
                    tmpContext.fill();
                }
                tmpSprite = tmpCanvas;
                gameObjectSprites[tmpIndex] = tmpSprite;
            }
            return tmpSprite;
        }

        function Do(_, t, i) {
            let $ = _.lineWidth || 0;
            i /= 2;
            _.beginPath();
            let n = Math.PI * 2 / t;
            for (let s = 0; s < t; s++) {
                _.lineTo(i + (i - $ / 2) * Math.cos(n * s), i + (i - $ / 2) * Math.sin(n * s));
            }
            _.closePath();
        }
        function Yd() {
            let t = config.volcanoScale * 2;
            let i = document.createElement("canvas");
            i.width = t;
            i.height = t;
            let d = i.getContext("2d");
            d.strokeStyle = "#3e3e3e";
            d.lineWidth = outlineWidth;
            d.fillStyle = "#7f7f7f";
            Do(d, 10, t);
            d.fill();
            d.stroke();
            Ye.land = i;
            let $ = document.createElement("canvas");
            let n = config.innerVolcanoScale * 2;
            $.width = n;
            $.height = n;
            let s = $.getContext("2d");
            s.strokeStyle = darkOutlineColor;
            s.lineWidth = outlineWidth*1;
            s.fillStyle = "#f54e16";
            s.strokeStyle = "#f56f16";
            Do(s, 10, n);
            s.fill();
            s.stroke();
            Ye.lava = $;
        }
        Yd();
        // GET ITEM SPRITE:
        var itemSprites = [];
        function getItemSprite(obj, asIcon) {
            var tmpSprite = itemSprites[obj.id];
            if (!tmpSprite || asIcon) {
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = tmpCanvas.height = obj.scale * 2.5 + outlineWidth + (items.list[obj.id].spritePadding || 0);
                var tmpContext = tmpCanvas.getContext("2d");
                tmpContext.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
                tmpContext.rotate(asIcon ? 0 : Math.PI / 2);
                tmpContext.strokeStyle = outlineColor;
                tmpContext.lineWidth = outlineWidth * (asIcon ? tmpCanvas.width / 81 : 1);
                if (obj.name == "apple") {
                    tmpContext.fillStyle = "#c15555";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fillStyle = "#89a54c";
                    var leafDir = -(Math.PI / 2);
                    renderLeaf(obj.scale * Math.cos(leafDir), obj.scale * Math.sin(leafDir), 25, leafDir + Math.PI / 2, tmpContext);
                } else if (obj.name == "cookie") {
                    tmpContext.fillStyle = "#cca861";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fillStyle = "#937c4b";
                    var chips = 4;
                    var rotVal = mathPI2 / chips;
                    var tmpRange;
                    for (var i = 0; i < chips; ++i) {
                        tmpRange = UTILS.randInt(obj.scale / 2.5, obj.scale / 1.7);
                        renderCircle(tmpRange * Math.cos(rotVal * i), tmpRange * Math.sin(rotVal * i), UTILS.randInt(4, 5), tmpContext, true);
                    }
                } else if (obj.name == "cheese") {
                    tmpContext.fillStyle = "#f4f3ac";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fillStyle = "#c3c28b";
                    var chips = 4;
                    var rotVal = mathPI2 / chips;
                    var tmpRange;
                    for (var i = 0; i < chips; ++i) {
                        tmpRange = UTILS.randInt(obj.scale / 2.5, obj.scale / 1.7);
                        renderCircle(tmpRange * Math.cos(rotVal * i), tmpRange * Math.sin(rotVal * i), UTILS.randInt(4, 5), tmpContext, true);
                    }
                } else if (obj.name == "wood wall" || obj.name == "stone wall" || obj.name == "castle wall") {
                    tmpContext.fillStyle = obj.name == "castle wall" ? "#83898e" : obj.name == "wood wall" ? "#a5974c" : "#939393";
                    var sides = obj.name == "castle wall" ? 4 : 3;
                    renderStar(tmpContext, sides, obj.scale * 1.1, obj.scale * 1.1);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = obj.name == "castle wall" ? "#9da4aa" : obj.name == "wood wall" ? "#c9b758" : "#bcbcbc";
                    renderStar(tmpContext, sides, obj.scale * 0.65, obj.scale * 0.65);
                    tmpContext.fill();
                } else if (obj.name == "spikes" || obj.name == "greater spikes" || obj.name == "poison spikes" || obj.name == "spinning spikes") {
                    tmpContext.fillStyle = obj.name == "poison spikes" ? "#7b935d" : "#939393";
                    var tmpScale = obj.scale * 0.6;
                    renderStar(tmpContext, obj.name == "spikes" ? 5 : 6, obj.scale, tmpScale);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#a5974c";
                    renderCircle(0, 0, tmpScale, tmpContext);
                    tmpContext.fillStyle = "#c9b758";
                    renderCircle(0, 0, tmpScale / 2, tmpContext, true);
                } else if (obj.name == "windmill" || obj.name == "faster windmill" || obj.name == "power mill") {
                    tmpContext.fillStyle = "#a5974c";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fillStyle = "#c9b758";
                    renderRectCircle(0, 0, obj.scale * 1.5, 29, 4, tmpContext);
                    tmpContext.fillStyle = "#a5974c";
                    renderCircle(0, 0, obj.scale * 0.5, tmpContext);
                } else if (obj.name == "mine") {
                    tmpContext.fillStyle = "#939393";
                    renderStar(tmpContext, 3, obj.scale, obj.scale);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#bcbcbc";
                    renderStar(tmpContext, 3, obj.scale * 0.55, obj.scale * 0.65);
                    tmpContext.fill();
                } else if (obj.name == "sapling") {
                    for (var i = 0; i < 2; ++i) {
                        var tmpScale = obj.scale * (!i ? 1 : 0.5);
                        renderStar(tmpContext, 7, tmpScale, tmpScale * 0.7);
                        tmpContext.fillStyle = !i ? "#9ebf57" : "#b4db62";
                        tmpContext.fill();
                        if (!i) {
                            tmpContext.stroke();
                        }
                    }
                } else if (obj.name == "pit trap") {
                    tmpContext.fillStyle = "#a5974c";
                    renderStar(tmpContext, 3, obj.scale * 1.1, obj.scale * 1.1);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = outlineColor;
                    renderStar(tmpContext, 3, obj.scale * 0.65, obj.scale * 0.65);
                    tmpContext.fill();
                } else if (obj.name == "boost pad") {
                    tmpContext.fillStyle = "#7e7f82";
                    renderRect(0, 0, obj.scale * 2, obj.scale * 2, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#dbd97d";
                    renderTriangle(obj.scale * 1, tmpContext);
                } else if (obj.name == "turret") {
                    tmpContext.fillStyle = "#a5974c";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#939393";
                    var tmpLen = 50;
                    renderRect(0, -tmpLen / 2, obj.scale * 0.9, tmpLen, tmpContext);
                    renderCircle(0, 0, obj.scale * 0.6, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                } else if (obj.name == "platform") {
                    tmpContext.fillStyle = "#cebd5f";
                    var tmpCount = 4;
                    var tmpS = obj.scale * 2;
                    var tmpW = tmpS / tmpCount;
                    var tmpX = -(obj.scale / 2);
                    for (var i = 0; i < tmpCount; ++i) {
                        renderRect(tmpX - tmpW / 2, 0, tmpW, obj.scale * 2, tmpContext);
                        tmpContext.fill();
                        tmpContext.stroke();
                        tmpX += tmpS / tmpCount;
                    }
                } else if (obj.name == "healing pad") {
                    tmpContext.fillStyle = "#7e7f82";
                    renderRect(0, 0, obj.scale * 2, obj.scale * 2, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#db6e6e";
                    renderRectCircle(0, 0, obj.scale * 0.65, 20, 4, tmpContext, true);
                } else if (obj.name == "spawn pad") {
                    tmpContext.fillStyle = "#7e7f82";
                    renderRect(0, 0, obj.scale * 2, obj.scale * 2, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.fillStyle = "#71aad6";
                    renderCircle(0, 0, obj.scale * 0.6, tmpContext);
                } else if (obj.name == "blocker") {
                    tmpContext.fillStyle = "#7e7f82";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.rotate(Math.PI / 4);
                    tmpContext.fillStyle = "#db6e6e";
                    renderRectCircle(0, 0, obj.scale * 0.65, 20, 4, tmpContext, true);
                } else if (obj.name == "teleporter") {
                    tmpContext.fillStyle = "#7e7f82";
                    renderCircle(0, 0, obj.scale, tmpContext);
                    tmpContext.fill();
                    tmpContext.stroke();
                    tmpContext.rotate(Math.PI / 4);
                    tmpContext.fillStyle = "#d76edb";
                    renderCircle(0, 0, obj.scale * 0.5, tmpContext, true);
                }
                tmpSprite = tmpCanvas;
                if (!asIcon) {
                    itemSprites[obj.id] = tmpSprite;
                }
            }
            return tmpSprite;
        } // RENDER LEAF:
        function renderLeaf(x, y, l, r, ctxt) {
            var endX = x + l * Math.cos(r);
            var endY = y + l * Math.sin(r);
            var width = l * 0.4;
            ctxt.moveTo(x, y);
            ctxt.beginPath();
            ctxt.quadraticCurveTo((x + endX) / 2 + width * Math.cos(r + Math.PI / 2), (y + endY) / 2 + width * Math.sin(r + Math.PI / 2), endX, endY);
            ctxt.quadraticCurveTo((x + endX) / 2 - width * Math.cos(r + Math.PI / 2), (y + endY) / 2 - width * Math.sin(r + Math.PI / 2), x, y);
            ctxt.closePath();
            ctxt.fill();
            ctxt.stroke();
        } // RENDER CIRCLE:
        function renderCircle(x, y, scale, tmpContext, dontStroke, dontFill) {
            tmpContext = tmpContext || mainContext;
            tmpContext.beginPath();
            tmpContext.arc(x, y, scale, 0, Math.PI * 2);
            if (!dontFill) {
                tmpContext.fill();
            }
            if (!dontStroke) {
                tmpContext.stroke();
            }
        } // RENDER STAR SHAPE:
        function renderStar(ctxt, spikes, outer, inner) {
            var rot = Math.PI / 2 * 3;
            var x;
            var y;
            var step = Math.PI / spikes;
            ctxt.beginPath();
            ctxt.moveTo(0, -outer);
            for (var i = 0; i < spikes; i++) {
                x = Math.cos(rot) * outer;
                y = Math.sin(rot) * outer;
                ctxt.lineTo(x, y);
                rot += step;
                x = Math.cos(rot) * inner;
                y = Math.sin(rot) * inner;
                ctxt.lineTo(x, y);
                rot += step;
            }
            ctxt.lineTo(0, -outer);
            ctxt.closePath();
        } // RENDER RECTANGLE:
        function renderRect(x, y, w, h, ctxt, stroke) {
            ctxt.fillRect(x - w / 2, y - h / 2, w, h);
            if (!stroke) {
                ctxt.strokeRect(x - w / 2, y - h / 2, w, h);
            }
        } // RENDER RECTCIRCLE:
        function renderRectCircle(x, y, s, sw, seg, ctxt, stroke) {
            ctxt.save();
            ctxt.translate(x, y);
            seg = Math.ceil(seg / 2);
            for (var i = 0; i < seg; i++) {
                renderRect(0, 0, s * 2, sw, ctxt, stroke);
                ctxt.rotate(Math.PI / seg);
            }
            ctxt.restore();
        } // RENDER BLOB:
        function renderBlob(ctxt, spikes, outer, inner) {
            var rot = Math.PI / 2 * 3;
            var x;
            var y;
            var step = Math.PI / spikes;
            var tmpOuter;
            ctxt.beginPath();
            ctxt.moveTo(0, -inner);
            for (var i = 0; i < spikes; i++) {
                tmpOuter = UTILS.randInt(outer + 0.9, outer * 1.2);
                ctxt.quadraticCurveTo(Math.cos(rot + step) * tmpOuter, Math.sin(rot + step) * tmpOuter, Math.cos(rot + step * 2) * inner, Math.sin(rot + step * 2) * inner);
                rot += step * 2;
            }
            ctxt.lineTo(0, -inner);
            ctxt.closePath();
        } // RENDER TRIANGLE:
        function renderTriangle(s, ctx) {
            ctx = ctx || mainContext;
            var h = s * (Math.sqrt(3) / 2);
            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-s / 2, h / 2);
            ctx.lineTo(s / 2, h / 2);
            ctx.lineTo(0, -h / 2);
            ctx.fill();
            ctx.closePath();
        } // PREPARE MENU BACKGROUND:
        function prepareMenuBackground() {
            var tmpMid = config.mapScale / 2;
            objectManager.add(0, tmpMid, tmpMid + 200, 0, config.treeScales[3], 0);
            objectManager.add(1, tmpMid, tmpMid - 480, 0, config.treeScales[3], 0);
            objectManager.add(2, tmpMid + 300, tmpMid + 450, 0, config.treeScales[3], 0);
            objectManager.add(3, tmpMid - 950, tmpMid - 130, 0, config.treeScales[2], 0);
            objectManager.add(4, tmpMid - 750, tmpMid - 400, 0, config.treeScales[3], 0);
            objectManager.add(5, tmpMid - 700, tmpMid + 400, 0, config.treeScales[2], 0);
            objectManager.add(6, tmpMid + 800, tmpMid - 200, 0, config.treeScales[3], 0);
            objectManager.add(7, tmpMid - 260, tmpMid + 340, 0, config.bushScales[3], 1);
            objectManager.add(8, tmpMid + 760, tmpMid + 310, 0, config.bushScales[3], 1);
            objectManager.add(9, tmpMid - 800, tmpMid + 100, 0, config.bushScales[3], 1);
            objectManager.add(10, tmpMid - 800, tmpMid + 300, 0, items.list[4].scale, items.list[4].id, items.list[10]);
            objectManager.add(11, tmpMid + 650, tmpMid - 390, 0, items.list[4].scale, items.list[4].id, items.list[10]);
            objectManager.add(12, tmpMid - 400, tmpMid - 450, 0, config.rockScales[2], 2);

            // Recursive hook function to redefine a property on window
            const hook = (prop, cb) => (function recursiveHook() {
                Object.defineProperty(window, prop, {
                    set(value) {
                        // Remove the property to avoid infinite recursion
                        delete window[prop];
                        // Assign the new value
                        window[prop] = value;
                        // Call the callback with the new value
                        // If callback returns false, re-hook the property
                        if (!cb(value)) recursiveHook();
                    },
                    configurable: true
                });
            })();
            // MutationObserver to remove ad elements dynamically as they appear in the DOM
            const adIds = ["wideAdCard", "promoImgHolder", "adCard"];
            const observer = new MutationObserver(() => {
                adIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.remove();
                    }
                });
            });
            // Start observing the entire document for added nodes and subtree modifications
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }

        // LOAD GAME OBJECT:
        function loadGameObject(data) {
            for (var i = 0; i < data.length;) {
                objectManager.add(data[i], data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], items.list[data[i + 6]], true, data[i + 7] >= 0 ? {
                    sid: data[i + 7]
                } : null);
                i += 8;
            }
        } // WIGGLE GAME OBJECT:
        function wiggleGameObject(dir, sid) {
            tmpObj = findObjectBySid(sid);
            if (tmpObj) {
                tmpObj.xWiggle += config.gatherWiggle * Math.cos(dir);
                tmpObj.yWiggle += config.gatherWiggle * Math.sin(dir);
            }
        } // SHOOT TURRET:
        function shootTurret(sid, dir) {
            tmpObj = findObjectBySid(sid);
            if (tmpObj) {
                tmpObj.dir = dir;
                tmpObj.xWiggle += config.gatherWiggle * Math.cos(dir + Math.PI);
                tmpObj.yWiggle += config.gatherWiggle * Math.sin(dir + Math.PI);
            }
        } // ADD PROJECTILE:
        function addProjectile(x, y, dir, range, speed, indx, layer, sid) {
            if (inWindow) {
                projectileManager.addProjectile(x, y, dir, range, speed, indx, null, null, layer).sid = sid;
            }
        } // REMOVE PROJECTILE:
        function remProjectile(sid, range) {
            for (var i = 0; i < projectiles.length; ++i) {
                if (projectiles[i].sid == sid) {
                    projectiles[i].range = range;
                }
            }
        } // ANIMATE AI:
        function animateAI(sid) {
            tmpObj = findAIBySID(sid);
            if (tmpObj) {
                tmpObj.startAnim();
            }
        } // ADD AI:
        function loadAI(data) {
            for (var i = 0; i < ais.length; ++i) {
                ais[i].forcePos = !ais[i].visible;
                ais[i].visible = false;
            }
            if (data) {
                var tmpTime = Date.now();
                for (var i = 0; i < data.length;) {
                    tmpObj = findAIBySID(data[i]);
                    if (tmpObj) {
                        tmpObj.index = data[i + 1];
                        tmpObj.t1 = tmpObj.t2 === undefined ? tmpTime : tmpObj.t2;
                        tmpObj.t2 = tmpTime;
                        tmpObj.x1 = tmpObj.x;
                        tmpObj.y1 = tmpObj.y;
                        tmpObj.x2 = data[i + 2];
                        tmpObj.y2 = data[i + 3];
                        tmpObj.d1 = tmpObj.d2 === undefined ? data[i + 4] : tmpObj.d2;
                        tmpObj.d2 = data[i + 4];
                        tmpObj.health = data[i + 5];
                        tmpObj.dt = 0;
                        tmpObj.visible = true;
                    } else {
                        tmpObj = aiManager.spawn(data[i + 2], data[i + 3], data[i + 4], data[i + 1]);
                        tmpObj.x2 = tmpObj.x;
                        tmpObj.y2 = tmpObj.y;
                        tmpObj.d2 = tmpObj.dir;
                        tmpObj.health = data[i + 5];
                        if (!aiManager.aiTypes[data[i + 1]].name) {
                            tmpObj.name = config.cowNames[data[i + 6]];
                        }
                        tmpObj.forcePos = true;
                        tmpObj.sid = data[i];
                        tmpObj.visible = true;
                    }
                    i += 7;
                }
            }
        } // RENDER AI:
        var aiSprites = {};
        function renderAI(obj, ctxt) {
            var tmpIndx = obj.index;
            var tmpSprite = aiSprites[tmpIndx];
            if (!tmpSprite) {
                var tmpImg = new Image();
                tmpImg.onload = function () {
                    this.isLoaded = true;
                    this.onload = null;
                };
                tmpImg.src = ".././img/animals/" + obj.src + ".png";
                tmpSprite = tmpImg;
                aiSprites[tmpIndx] = tmpSprite;
            }
            if (tmpSprite.isLoaded) {
                var tmpScale = obj.scale * 1.2 * (obj.spriteMlt || 1);
                ctxt.drawImage(tmpSprite, -tmpScale, -tmpScale, tmpScale * 2, tmpScale * 2);
            }
        } // OBJECT ON SCREEN:
        function isOnScreen(x, y, s) {
            return x + s >= 0 && x - s <= maxScreenWidth && y + s >= 0 && y - s <= maxScreenHeight;
        } // ADD NEW PLAYER:
        function addPlayer(data, isYou) {
            var tmpPlayer = findPlayerByID(data[0]);
            if (!tmpPlayer) {
                tmpPlayer = new Player(data[0], data[1], config, UTILS, projectileManager, objectManager, players, ais, items, hats, accessories);
                players.push(tmpPlayer);
            }
            tmpPlayer.spawn(isYou ? moofoll : null);
            tmpPlayer.visible = false;
            tmpPlayer.x2 = undefined;
            tmpPlayer.y2 = undefined;
            tmpPlayer.setData(data);
            if (isYou) {
                player = tmpPlayer;
                camX = player.x;
                camY = player.y;
                updateItems();
                updateStatusDisplay();
                updateAge();
                updateUpgrades(0);
                gameUI.style.display = "block";
            }
        } // REMOVE PLAYER:
        function removePlayer(id) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == id) {
                    players.splice(i, 1);
                    break;
                }
            }
        } // UPDATE PLAYER ITEM VALUES:
        function updateItemCounts(index, value) {
            if (player) {
                player.itemCounts[index] = value;
            }
        } // UPDATE PLAYER VALUE:
        function updatePlayerValue(index, value, updateView) {
            if (player) {
                player[index] = value;
                if (updateView) {
                    updateStatusDisplay();
                }
            }
        }
        let AUTOHEAL_SPEED = 100;
        function place(id, angle) {
            let weapon = player.weaponIndex;
            io.send("c", id, false)
            io.send("5", 1, angle);
            io.send("5", 0, angle);
            io.send("c", weapon, true)
        }
        // Game tick system для AutoHeal
        let game = {
            tick: 0,
            tickQueue: [],
            tickBase: function (set, tick) {
                const targetTick = this.tick + tick;
                if (!this.tickQueue[targetTick]) {
                    this.tickQueue[targetTick] = [];
                }
                this.tickQueue[targetTick].push(set);
            },
            tickRate: 1000 / config.serverUpdateRate,
            tickSpeed: 0,
            lastTick: performance.now(),
            lastTickUpdate: Date.now()
        };

        let lastHealTime = 0;
        let healCooldown = 0;
        function updateHealth(sid, value) {
            tmpObj = findPlayerBySID(sid);
            if (tmpObj) {
                tmpObj.health = value;
                if (tmpObj === player && sid == player.sid && document.getElementById("HealSwitch").checked && player && player.alive) {
                    var currentTime = Date.now();
                    var healthPercent = (player.health / player.maxHealth) * 100;
                    if (healthPercent < 90 && (currentTime - lastHealTime >= healCooldown)) {
                        var foodId = null;
                        let food = player.items[0];
                        if (foodId == undefined) foodId = food;
                        var missingHealth = player.maxHealth - player.health;
                        var foodHealing = {
                            0: 20,
                            1: 40,
                            2: 30
                        };
                        var foodPriority = [0, 2, 1];
                        for (var j = 0; j < foodPriority.length; j++) {
                            var foodItemId = foodPriority[j];
                            var healAmount = foodHealing[foodItemId];
                            if (player.items.indexOf(foodItemId) >= 0 && missingHealth >= healAmount * 0.5) {
                                foodId = foodItemId;
                                break;
                            }
                        }
                        if (foodId === null) {
                            for (var i = 0; i < items.list.length; i++) {
                                var item = items.list[i];
                                if (item.group && (item.group.id === 0 || item.group.name === "food")) {
                                    if (player.items.indexOf(item.id) >= 0) {
                                        foodId = item.id;
                                        break;
                                    }
                                }
                            }
                        }
                        if (foodId !== null) {
                            lastHealTime = currentTime;
                            io.send("5", foodId, false);
                            setTimeout(() => {
                                let keyDiv = document.getElementById(`key_KeyQ`);
                                if (keyDiv && !keyDiv.classList.contains("active")) {
                                    keyDiv.classList.add("active");
                                }
                                setTimeout(() => {
                                    let keyDiv = document.getElementById(`key_KeyQ`);
                                    if (keyDiv && keyDiv.classList.contains("active")) {
                                        keyDiv.classList.remove("active");
                                    }
                                }, 50);
                            }, 50);
                            setTimeout(() => {
                                let mouseDiv = document.getElementById(`mouse_0`);
                                if (mouseDiv && !mouseDiv.classList.contains("active2")) {
                                    mouseDiv.classList.add("active2");
                                }
                                setTimeout(() => {
                                    let mouseDiv = document.getElementById(`mouse_0`);
                                    if (mouseDiv && mouseDiv.classList.contains("active2")) {
                                        mouseDiv.classList.remove("active2");
                                    }
                                }, 50);
                            }, 50);
                            setTimeout(function () {
                                if (player && player.alive) {
                                    let mouseDiv = document.getElementById(`mouse_0`);
                                    if (mouseDiv && !mouseDiv.classList.contains("active2")) {
                                        mouseDiv.classList.add("active2");
                                    }
                                    io.send("c", 1, null);
                                    setTimeout(function () {
                                        io.send("c", 0, null);
                                    }, AUTOHEAL_SPEED);
                                }
                            }, AUTOHEAL_SPEED);
                        }
                    }
                }
            }
        }
        // UPDATE PLAYER DATA:
        window.fps = 0
        function updatePlayers(data) {
            var tmpTime = Date.now();
            for (var i = 0; i < players.length; ++i) {
                players[i].forcePos = !players[i].visible;
                players[i].visible = false;
            }
            for (var i = 0; i < data.length;) {
                tmpObj = findPlayerBySID(data[i]);
                if (tmpObj) {
                    tmpObj.t1 = tmpObj.t2 === undefined ? tmpTime : tmpObj.t2;
                    tmpObj.t2 = tmpTime;
                    tmpObj.x1 = tmpObj.x;
                    tmpObj.y1 = tmpObj.y;
                    tmpObj.x2 = data[i + 1];
                    tmpObj.y2 = data[i + 2];
                    tmpObj.d1 = tmpObj.d2 === undefined ? data[i + 3] : tmpObj.d2;
                    tmpObj.d2 = data[i + 3];
                    tmpObj.dt = 0;
                    tmpObj.buildIndex = data[i + 4];
                    tmpObj.weaponIndex = data[i + 5];
                    tmpObj.weaponVariant = data[i + 6];
                    tmpObj.team = data[i + 7];
                    tmpObj.isLeader = data[i + 8];
                    tmpObj.skinIndex = data[i + 9];
                    tmpObj.tailIndex = data[i + 10];
                    tmpObj.iconIndex = data[i + 11];
                    tmpObj.zIndex = data[i + 12];
                    tmpObj.visible = true;
                }
                i += 13;
            }
            if (document.getElementById("AutoMill").checked) {
                if(automill == true && !isNextToFriendlyMill && (player.itemCounts[3] < 295 || player.itemCounts[3] == undefined) && automilling == false){
                    automilling = true;
                    doNewSend(["z",[player.items[3], null]])
                    doNewSend(["F",[1, (window.movementDirection - 1.90)]])
                    doNewSend(["F",[0, (window.movementDirection - 1.90)]])
                    doNewSend(["z",[player.weaponIndex, true]])
                    doNewSend(["z",[player.items[3], null]])
                    doNewSend(["F",[1, (window.movementDirection - 3.14)]])
                    doNewSend(["F",[0, (window.movementDirection - 3.14)]])
                    doNewSend(["z",[player.weaponIndex, true]])
                    doNewSend(["z",[player.items[3], null]])
                    doNewSend(["F",[1, (window.movementDirection + 1.90)]])
                    doNewSend(["F",[0, (window.movementDirection + 1.90)]])
                    doNewSend(["z",[player.weaponIndex, true]])
                    automilling = false
                }
                if(gameObjects.length){
                    nearestFriendlyMill = gameObjects.filter((e)=>e.active && Math.sqrt(Math.pow((player.y-e.y), 2) + Math.pow((player.x-e.x), 2)) <= 101).sort((a,b) => dist(a, player) - dist(b, player))[0];
                    if (nearestFriendlyMill) {
                        isNextToFriendlyMill = true
                    } else isNextToFriendlyMill = false;
                } else {
                    nearestFriendlyMill = undefined
                    isNextToFriendlyMill = false
                }
            }
        } // FIND OBJECTS BY ID/SID:
        function isClanMember(sid) {
            if (player && player.sid == sid) {
                return true;
            }
            if (!player || !player.team || sid < 0) {
                return false;
            }
            for (var i = 0; i < alliancePlayers.length; i += 2) {
                let allySid = alliancePlayers[i];
                if (sid == allySid) {
                    return true;
                }
            }
            return false;
        }
        function findPlayerByID(id) {
            for (var i = 0; i < players.length; ++i) {
                if (players[i].id == id) {
                    return players[i];
                }
            }
            return null;
        }
        function findPlayerBySID(sid) {
            for (var i = 0; i < players.length; ++i) {
                if (players[i].sid == sid) {
                    return players[i];
                }
            }
            return null;
        }
        function findAIBySID(sid) {
            for (var i = 0; i < ais.length; ++i) {
                if (ais[i].sid == sid) {
                    return ais[i];
                }
            }
            return null;
        }
        function findObjectBySid(sid) {
            for (var i = 0; i < gameObjects.length; ++i) {
                if (gameObjects[i].sid == sid) {
                    return gameObjects[i];
                }
            }
            return null;
        } // PING:
        var lastPing = -1;
        function pingSocketResponse() {
            var ping = Date.now() - lastPing;
            window.pingTime = ping;
            pingDisplay.style.textAlign = "center"
            pingDisplay.style.pointerEvets = "none"
            pingDisplay.style.zIndex = 1

            pingDisplay.innerHTML = `Ping: ${ping} ms<br>FPS: ${window.fps.toFixed(0)}`
        }
        function pingSocket() {
            lastPing = Date.now();
            io.send("pp");
        } // SERVER SHUTDOWN NOTICE:
        function serverShutdownNotice(countdown) {
            if (countdown < 0) {
                return;
            }
            var minutes = Math.floor(countdown / 60);
            var seconds = countdown % 60;
            seconds = ("0" + seconds).slice(-2);
            shutdownDisplay.innerText = "Server restarting in " + minutes + ":" + seconds;
            shutdownDisplay.hidden = false;
        }
        const gatherAngle = Math.PI / 2.6;
        function getAngleDist(a, b) {
            const angle = Math.abs(b - a) % (Math.PI * 2);
            if (angle > Math.PI) {
                return Math.PI * 2 - angle;
            } else {
                return angle;
            }
        }
        // UPDATE & ANIMATE:
        const oldReqAnimFrame = window.requestAnimationFrame;
        window.requestAnimFrame = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                if (true) {
                    return window.setTimeout(callback, 1000 / 111);
                }
                return oldReqAnimFrame(callback);
            };
        }();
        function doUpdate() {
            window.fps += (1000 / Math.max(Date.now() - lastUpdate, 1) - window.fps) / 10
            now = Date.now();
            delta = now - lastUpdate;
            lastUpdate = now;
            updateGame();
            requestAnimFrame(doUpdate);
        } // START GAME:
        function startGame() {
            bindEvents();
            loadIcons();
            loadingText.style.display = "none";
            menuCardHolder.style.display = "block";
            nameInput.value = getSavedVal("moo_name") || "";
            prepareUI();
        }
        prepareMenuBackground();
        doUpdate();

        // OPEN LINK:
        function openLink(link) {
            window.open(link, "_blank");
        } // EXPORT VALUES:
        window.openLink = openLink;
        window.aJoinReq = aJoinReq;
        window.follmoo = follmoo;
        window.kickFromClan = kickFromClan;
        window.sendJoin = sendJoin;
        window.leaveAlliance = leaveAlliance;
        window.createAlliance = createAlliance;
        window.storeBuy = storeBuy;
        window.storeEquip = storeEquip;
        window.showItemInfo = showItemInfo;
        window.selectSkinColor = selectSkinColor;
        window.changeStoreIndex = changeStoreIndex;
        /***/
    },
    /***/"./src/js/data/ai.js":
    /*!***************************!*\
    !*** ./src/js/data/ai.js ***!
    \***************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        var PI2 = Math.PI * 2;
        module.exports = function (sid, objectManager, players, items, UTILS, config, scoreCallback, server) {
            this.sid = sid;
            this.isAI = true;
            this.nameIndex = UTILS.randInt(0, config.cowNames.length - 1); // INIT:
            this.init = function (x, y, dir, index, data) {
                this.x = x;
                this.y = y;
                this.startX = data.fixedSpawn ? x : null;
                this.startY = data.fixedSpawn ? y : null;
                this.xVel = 0;
                this.yVel = 0;
                this.zIndex = 0;
                this.dir = dir;
                this.dirPlus = 0;
                this.index = index;
                this.src = data.src;
                if (data.name) {
                    this.name = data.name;
                }
                this.weightM = data.weightM;
                this.speed = data.speed;
                this.killScore = data.killScore;
                this.turnSpeed = data.turnSpeed;
                this.scale = data.scale;
                this.maxHealth = data.health;
                this.leapForce = data.leapForce;
                this.health = this.maxHealth;
                this.chargePlayer = data.chargePlayer;
                this.viewRange = data.viewRange;
                this.drop = data.drop;
                this.dmg = data.dmg;
                this.hostile = data.hostile;
                this.dontRun = data.dontRun;
                this.hitRange = data.hitRange;
                this.hitDelay = data.hitDelay;
                this.hitScare = data.hitScare;
                this.spriteMlt = data.spriteMlt;
                this.nameScale = data.nameScale;
                this.colDmg = data.colDmg;
                this.noTrap = data.noTrap;
                this.spawnDelay = data.spawnDelay;
                this.hitWait = 0;
                this.waitCount = 1000;
                this.moveCount = 0;
                this.targetDir = 0;
                this.active = true;
                this.alive = true;
                this.runFrom = null;
                this.chargeTarget = null;
                this.dmgOverTime = {};
            }; // UPDATE:
            var timerCount = 0;
            this.update = function (delta) {
                if (this.active) {
                    // SPAWN DELAY:
                    if (this.spawnCounter) {
                        this.spawnCounter -= delta;
                        if (this.spawnCounter <= 0) {
                            this.spawnCounter = 0;
                            this.x = this.startX || UTILS.randInt(0, config.mapScale);
                            this.y = this.startY || UTILS.randInt(0, config.mapScale);
                        }
                        return;
                    } // REGENS AND AUTO:
                    timerCount -= delta;
                    if (timerCount <= 0) {
                        if (this.dmgOverTime.dmg) {
                            this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer);
                            this.dmgOverTime.time -= 1;
                            if (this.dmgOverTime.time <= 0) {
                                this.dmgOverTime.dmg = 0;
                            }
                        }
                        timerCount = 1000;
                    } // BEHAVIOUR:
                    var charging = false;
                    var slowMlt = 1;
                    if (!this.zIndex && !this.lockMove && this.y >= config.mapScale / 2 - config.riverWidth / 2 && this.y <= config.mapScale / 2 + config.riverWidth / 2) {
                        slowMlt = 0.33;
                        this.xVel += config.waterCurrent * delta;
                    }
                    if (this.lockMove) {
                        this.xVel = 0;
                        this.yVel = 0;
                    } else if (this.waitCount > 0) {
                        this.waitCount -= delta;
                        if (this.waitCount <= 0) {
                            if (this.chargePlayer) {
                                var tmpPlayer;
                                var bestDst;
                                var tmpDist;
                                for (var i = 0; i < players.length; ++i) {
                                    if (players[i].alive && (!players[i].skin || !players[i].skin.bullRepel)) {
                                        tmpDist = UTILS.getDistance(this.x, getDistthis.y, players[i].x, players[i].y);
                                        if (tmpDist <= this.viewRange && (!tmpPlayer || tmpDist < bestDst)) {
                                            bestDst = tmpDist;
                                            tmpPlayer = players[i];
                                        }
                                    }
                                }
                                if (tmpPlayer) {
                                    this.chargeTarget = tmpPlayer;
                                    this.moveCount = UTILS.randInt(8000, 12000);
                                } else {
                                    this.moveCount = UTILS.randInt(1000, 2000);
                                    this.targetDir = UTILS.randFloat(-Math.PI, Math.PI);
                                }
                            } else {
                                this.moveCount = UTILS.randInt(4000, 10000);
                                this.targetDir = UTILS.randFloat(-Math.PI, Math.PI);
                            }
                        }
                    } else if (this.moveCount > 0) {
                        var tmpSpd = this.speed * slowMlt;
                        if (this.runFrom && this.runFrom.active && (!this.runFrom.isPlayer || !!this.runFrom.alive)) {
                            this.targetDir = UTILS.getDirection(this.x, this.y, this.runFrom.x, this.runFrom.y);
                            tmpSpd *= 1.42;
                        } else if (this.chargeTarget && this.chargeTarget.alive) {
                            this.targetDir = UTILS.getDirection(this.chargeTarget.x, this.chargeTarget.y, this.x, this.y);
                            tmpSpd *= 1.75;
                            charging = true;
                        }
                        if (this.hitWait) {
                            tmpSpd *= 0.3;
                        }
                        if (this.dir != this.targetDir) {
                            this.dir %= PI2;
                            var netAngle = (this.dir - this.targetDir + PI2) % PI2;
                            var amnt = Math.min(Math.abs(netAngle - PI2), netAngle, this.turnSpeed * delta);
                            var sign = netAngle - Math.PI >= 0 ? 1 : -1;
                            this.dir += sign * amnt + PI2;
                        }
                        this.dir %= PI2;
                        this.xVel += tmpSpd * delta * Math.cos(this.dir);
                        this.yVel += tmpSpd * delta * Math.sin(this.dir);
                        this.moveCount -= delta;
                        if (this.moveCount <= 0) {
                            this.runFrom = null;
                            this.chargeTarget = null;
                            this.waitCount = this.hostile ? 1500 : UTILS.randInt(1500, 6000);
                        }
                    } // OBJECT COLL:
                    this.zIndex = 0;
                    this.lockMove = false;
                    var tmpList;
                    var tmpSpeed = UTILS.getDistance(0, 0, this.xVel * delta, this.yVel * delta);
                    var depth = Math.min(4, Math.max(1, Math.round(tmpSpeed / 40)));
                    var tMlt = 1 / depth;
                    for (var i = 0; i < depth; ++i) {
                        if (this.xVel) {
                            this.x += this.xVel * delta * tMlt;
                        }
                        if (this.yVel) {
                            this.y += this.yVel * delta * tMlt;
                        }
                        tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                        for (var x = 0; x < tmpList.length; ++x) {
                            for (var y = 0; y < tmpList[x].length; ++y) {
                                if (tmpList[x][y].active) {
                                    objectManager.checkCollision(this, tmpList[x][y], tMlt);
                                }
                            }
                        }
                    } // HITTING:
                    var hitting = false;
                    if (this.hitWait > 0) {
                        this.hitWait -= delta;
                        if (this.hitWait <= 0) {
                            hitting = true;
                            this.hitWait = 0;
                            if (this.leapForce && !UTILS.randInt(0, 2)) {
                                this.xVel += this.leapForce * Math.cos(this.dir);
                                this.yVel += this.leapForce * Math.sin(this.dir);
                            }
                            var tmpList = objectManager.getGridArrays(this.x, this.y, this.hitRange);
                            var tmpObj;
                            var tmpDst;
                            for (var t = 0; t < tmpList.length; ++t) {
                                for (var x = 0; x < tmpList[t].length; ++x) {
                                    tmpObj = tmpList[t][x];
                                    if (tmpObj.health) {
                                        tmpDst = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y);
                                        if (tmpDst < tmpObj.scale + this.hitRange) {
                                            if (tmpObj.changeHealth(-this.dmg * 5)) {
                                                objectManager.disableObj(tmpObj);
                                            }
                                            objectManager.hitObj(tmpObj, UTILS.getDirection(this.x, this.y, tmpObj.x, tmpObj.y));
                                        }
                                    }
                                }
                            }
                            for (var x = 0; x < players.length; ++x) {
                                if (players[x].canSee(this)) {
                                    server.send(players[x].id, "aa", this.sid);
                                }
                            }
                        }
                    } // PLAYER COLLISIONS:
                    if (charging || hitting) {
                        var tmpObj;
                        var tmpDst;
                        var tmpDir;
                        for (var i = 0; i < players.length; ++i) {
                            tmpObj = players[i];
                            if (tmpObj && tmpObj.alive) {
                                tmpDst = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y);
                                if (this.hitRange) {
                                    if (!this.hitWait && tmpDst <= this.hitRange + tmpObj.scale) {
                                        if (hitting) {
                                            tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                                            tmpObj.changeHealth(-this.dmg);
                                            tmpObj.xVel += Math.cos(tmpDir) * 0.6;
                                            tmpObj.yVel += Math.sin(tmpDir) * 0.6;
                                            this.runFrom = null;
                                            this.chargeTarget = null;
                                            this.waitCount = 3000;
                                            this.hitWait = !UTILS.randInt(0, 2) ? 600 : 0;
                                        } else {
                                            this.hitWait = this.hitDelay;
                                        }
                                    }
                                } else if (tmpDst <= this.scale + tmpObj.scale) {
                                    tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                                    tmpObj.changeHealth(-this.dmg);
                                    tmpObj.xVel += Math.cos(tmpDir) * 0.55;
                                    tmpObj.yVel += Math.sin(tmpDir) * 0.55;
                                }
                            }
                        }
                    } // DECEL:
                    if (this.xVel) {
                        this.xVel *= Math.pow(config.playerDecel, delta);
                    }
                    if (this.yVel) {
                        this.yVel *= Math.pow(config.playerDecel, delta);
                    } // MAP BOUNDARIES:
                    var tmpScale = this.scale;
                    if (this.x - tmpScale < 0) {
                        this.x = tmpScale;
                        this.xVel = 0;
                    } else if (this.x + tmpScale > config.mapScale) {
                        this.x = config.mapScale - tmpScale;
                        this.xVel = 0;
                    }
                    if (this.y - tmpScale < 0) {
                        this.y = tmpScale;
                        this.yVel = 0;
                    } else if (this.y + tmpScale > config.mapScale) {
                        this.y = config.mapScale - tmpScale;
                        this.yVel = 0;
                    }
                }
            }; // CAN SEE:
            this.canSee = function (other) {
                if (!other) {
                    return false;
                }
                if (other.skin && other.skin.invisTimer && other.noMovTimer >= other.skin.invisTimer) {
                    return false;
                }
                var dx = Math.abs(other.x - this.x) - other.scale;
                var dy = Math.abs(other.y - this.y) - other.scale;
                return dx <= config.maxScreenWidth / 2 * 1.3 && dy <= config.maxScreenHeight / 2 * 1.3;
            };
            var tmpRatio = 0;
            var animIndex = 0;
            this.animate = function (delta) {
                if (this.animTime > 0) {
                    this.animTime -= delta;
                    if (this.animTime <= 0) {
                        this.animTime = 0;
                        this.dirPlus = 0;
                        tmpRatio = 0;
                        animIndex = 0;
                    } else if (animIndex == 0) {
                        tmpRatio += delta / (this.animSpeed * config.hitReturnRatio);
                        this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.min(1, tmpRatio));
                        if (tmpRatio >= 1) {
                            tmpRatio = 1;
                            animIndex = 1;
                        }
                    } else {
                        tmpRatio -= delta / (this.animSpeed * (1 - config.hitReturnRatio));
                        this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.max(0, tmpRatio));
                    }
                }
            }; // ANIMATION:
            this.startAnim = function () {
                this.animTime = this.animSpeed = 600;
                this.targetAngle = Math.PI * 0.8;
                tmpRatio = 0;
                animIndex = 0;
            }; // CHANGE HEALTH:
            this.changeHealth = function (val, doer, runFrom) {
                if (this.active) {
                    this.health += val;
                    if (runFrom) {
                        if (this.hitScare && !UTILS.randInt(0, this.hitScare)) {
                            this.runFrom = runFrom;
                            this.waitCount = 0;
                            this.moveCount = 2000;
                        } else if (this.hostile && this.chargePlayer && runFrom.isPlayer) {
                            this.chargeTarget = runFrom;
                            this.waitCount = 0;
                            this.moveCount = 8000;
                        } else if (!this.dontRun) {
                            this.runFrom = runFrom;
                            this.waitCount = 0;
                            this.moveCount = 2000;
                        }
                    }
                    if (val < 0 && this.hitRange && UTILS.randInt(0, 1)) {
                        this.hitWait = 500;
                    }
                    if (doer && doer.canSee(this) && val < 0) {
                        server.send(doer.id, "t", Math.round(this.x), Math.round(this.y), Math.round(-val), 1);
                    }
                    if (this.health <= 0) {
                        if (this.spawnDelay) {
                            this.spawnCounter = this.spawnDelay;
                            this.x = -1000000;
                            this.y = -1000000;
                        } else {
                            this.x = this.startX || UTILS.randInt(0, config.mapScale);
                            this.y = this.startY || UTILS.randInt(0, config.mapScale);
                        }
                        this.health = this.maxHealth;
                        this.runFrom = null;
                        if (doer) {
                            scoreCallback(doer, this.killScore);
                            if (this.drop) {
                                for (var i = 0; i < this.drop.length;) {
                                    doer.addResource(config.resourceTypes.indexOf(this.drop[i]), this.drop[i + 1]);
                                    i += 2;
                                }
                            }
                        }
                    }
                }
            };
        }; /***/
    },
    /***/"./src/js/data/aiManager.js":
    /*!**********************************!*\
    !*** ./src/js/data/aiManager.js ***!
    \**********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // AI MANAGER:
        module.exports = function (ais, AI, players, items, objectManager, config, UTILS, scoreCallback, server) {
            // AI TYPES:
            this.aiTypes = [{
                id: 0,
                src: "cow_1",
                killScore: 150,
                health: 500,
                weightM: 0.8,
                speed: 0.00095,
                turnSpeed: 0.001,
                scale: 72,
                drop: ["food", 50]
            }, {
                id: 1,
                src: "pig_1",
                killScore: 200,
                health: 800,
                weightM: 0.6,
                speed: 0.00085,
                turnSpeed: 0.001,
                scale: 72,
                drop: ["food", 80]
            }, {
                id: 2,
                name: "Bull",
                src: "bull_2",
                hostile: true,
                dmg: 20,
                killScore: 1000,
                health: 1800,
                weightM: 0.5,
                speed: 0.00094,
                turnSpeed: 0.00074,
                scale: 78,
                viewRange: 800,
                chargePlayer: true,
                drop: ["food", 100]
            }, {
                id: 3,
                name: "Bully",
                src: "bull_1",
                hostile: true,
                dmg: 20,
                killScore: 2000,
                health: 2800,
                weightM: 0.45,
                speed: 0.001,
                turnSpeed: 0.0008,
                scale: 90,
                viewRange: 900,
                chargePlayer: true,
                drop: ["food", 400]
            }, {
                id: 4,
                name: "Wolf",
                src: "wolf_1",
                hostile: true,
                dmg: 8,
                killScore: 500,
                health: 300,
                weightM: 0.45,
                speed: 0.001,
                turnSpeed: 0.002,
                scale: 84,
                viewRange: 800,
                chargePlayer: true,
                drop: ["food", 200]
            }, {
                id: 5,
                name: "Quack",
                src: "chicken_1",
                dmg: 8,
                killScore: 2000,
                noTrap: true,
                health: 300,
                weightM: 0.2,
                speed: 0.0018,
                turnSpeed: 0.006,
                scale: 70,
                drop: ["food", 100]
            }, {
                id: 6,
                name: "MOOSTAFA",
                nameScale: 50,
                src: "enemy",
                hostile: true,
                dontRun: true,
                fixedSpawn: true,
                spawnDelay: 60000,
                noTrap: true,
                colDmg: 100,
                dmg: 40,
                killScore: 8000,
                health: 18000,
                weightM: 0.4,
                speed: 0.0007,
                turnSpeed: 0.01,
                scale: 80,
                spriteMlt: 1.8,
                leapForce: 0.9,
                viewRange: 1000,
                hitRange: 210,
                hitDelay: 1000,
                chargePlayer: true,
                drop: ["food", 100]
            }, {
                id: 7,
                name: "Treasure",
                hostile: true,
                nameScale: 35,
                src: "crate_1",
                fixedSpawn: true,
                spawnDelay: 120000,
                colDmg: 200,
                killScore: 5000,
                health: 20000,
                weightM: 0.1,
                speed: 0,
                turnSpeed: 0,
                scale: 70,
                spriteMlt: 1
            }, {
                id: 8,
                name: "MOOFIE",
                src: "wolf_2",
                hostile: true,
                fixedSpawn: true,
                dontRun: true,
                hitScare: 4,
                spawnDelay: 30000,
                noTrap: true,
                nameScale: 35,
                dmg: 10,
                colDmg: 100,
                killScore: 3000,
                health: 7000,
                weightM: 0.45,
                speed: 0.0015,
                turnSpeed: 0.002,
                scale: 90,
                viewRange: 800,
                chargePlayer: true,
                drop: ["food", 1000]
            }, {
                id: 9,
                name: "💀MOOFIE",
                src: "wolf_2",
                hostile: true,
                fixedSpawn: true,
                dontRun: true,
                hitScare: 50,
                spawnDelay: 60000,
                noTrap: true,
                nameScale: 35,
                dmg: 12,
                colDmg: 100,
                killScore: 3000,
                health: 9000,
                weightM: 0.45,
                speed: 0.0015,
                turnSpeed: 0.0025,
                scale: 94,
                viewRange: 1440,
                chargePlayer: true,
                drop: ["food", 3000],
                minSpawnRange: 0.85,
                maxSpawnRange: 0.9
            }, {
                id: 10,
                name: "💀Wolf",
                src: "wolf_1",
                hostile: true,
                fixedSpawn: true,
                dontRun: true,
                hitScare: 50,
                spawnDelay: 30000,
                dmg: 10,
                killScore: 700,
                health: 500,
                weightM: 0.45,
                speed: 0.00115,
                turnSpeed: 0.0025,
                scale: 88,
                viewRange: 1440,
                chargePlayer: true,
                drop: ["food", 400],
                minSpawnRange: 0.85,
                maxSpawnRange: 0.9
            }, {
                id: 11,
                name: "💀Bully",
                src: "bull_1",
                hostile: true,
                fixedSpawn: true,
                dontRun: true,
                hitScare: 50,
                dmg: 20,
                killScore: 5000,
                health: 5000,
                spawnDelay: 100000,
                weightM: 0.45,
                speed: 0.00115,
                turnSpeed: 0.0025,
                scale: 94,
                viewRange: 1440,
                chargePlayer: true,
                drop: ["food", 800],
                minSpawnRange: 0.85,
                maxSpawnRange: 0.9
            }]; // SPAWN AI:
            this.spawn = function (x, y, dir, index) {
                var tmpObj;
                for (var i = 0; i < ais.length; ++i) {
                    if (!ais[i].active) {
                        tmpObj = ais[i];
                        break;
                    }
                }
                if (!tmpObj) {
                    tmpObj = new AI(ais.length, objectManager, players, items, UTILS, config, scoreCallback, server);
                    ais.push(tmpObj);
                }
                tmpObj.init(x, y, dir, index, this.aiTypes[index]);
                return tmpObj;
            };
        }; /***/
    },
    /***/"./src/js/data/gameObject.js":
    /*!***********************************!*\
    !*** ./src/js/data/gameObject.js ***!
    \***********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        module.exports = function (sid) {
            this.sid = sid; // INIT:
            this.init = function (x, y, dir, scale, type, data, owner) {
                data = data || {};
                this.sentTo = {};
                this.gridLocations = [];
                this.active = true;
                this.doUpdate = data.doUpdate;
                this.x = x;
                this.y = y;
                this.dir = dir;
                this.xWiggle = 0;
                this.yWiggle = 0;
                this.scale = scale;
                this.type = type;
                this.id = data.id;
                this.owner = owner;
                this.name = data.name;
                this.isItem = this.id != undefined;
                this.group = data.group;
                this.health = data.health;
                this.layer = 2;
                if (this.group != undefined) {
                    this.layer = this.group.layer;
                } else if (this.type == 0) {
                    this.layer = 3;
                } else if (this.type == 2) {
                    this.layer = 0;
                } else if (this.type == 4) {
                    this.layer = -1;
                }
                this.colDiv = data.colDiv || 1;
                this.blocker = data.blocker;
                this.ignoreCollision = data.ignoreCollision;
                this.dontGather = data.dontGather;
                this.hideFromEnemy = data.hideFromEnemy;
                this.friction = data.friction;
                this.projDmg = data.projDmg;
                this.dmg = data.dmg;
                this.pDmg = data.pDmg;
                this.pps = data.pps;
                this.zIndex = data.zIndex || 0;
                this.turnSpeed = data.turnSpeed;
                this.req = data.req;
                this.trap = data.trap;
                this.healCol = data.healCol;
                this.teleport = data.teleport;
                this.boostSpeed = data.boostSpeed;
                this.projectile = data.projectile;
                this.shootRange = data.shootRange;
                this.shootRate = data.shootRate;
                this.shootCount = this.shootRate;
                this.spawnPoint = data.spawnPoint;
            }; // GET HIT:
            this.changeHealth = function (amount, doer) {
                this.health += amount;
                return this.health <= 0;
            }; // GET SCALE:
            this.getScale = function (sM, ig) {
                sM = sM || 1;
                return this.scale * (this.isItem || this.type == 2 || this.type == 3 || this.type == 4 ? 1 : sM * 0.6) * (ig ? 1 : this.colDiv);
            }; // VISIBLE TO PLAYER:
            this.visibleToPlayer = function (player) {
                return !this.hideFromEnemy || this.owner && (this.owner == player || this.owner.team && player.team == this.owner.team);
            }; // UPDATE:
            this.update = function (delta) {
                if (this.active) {
                    if (this.xWiggle) {
                        this.xWiggle *= Math.pow(0.99, delta);
                    }
                    if (this.yWiggle) {
                        this.yWiggle *= Math.pow(0.99, delta);
                    }
                    if (!document.getElementById("DisableTurn").checked) {
                        if (this.turnSpeed) {
                            this.dir += this.turnSpeed * delta;
                        }
                    }
                }
            };
        }; /***/
    },
    /***/"./src/js/data/items.js":
    /*!******************************!*\
    !*** ./src/js/data/items.js ***!
    \******************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // ITEM GROUPS:
        module.exports.groups = [{
            id: 0,
            name: "food",
            layer: 0
        }, {
            id: 1,
            name: "walls",
            place: true,
            limit: 30,
            layer: 0
        }, {
            id: 2,
            name: "spikes",
            place: true,
            limit: 15,
            layer: 0
        }, {
            id: 3,
            name: "mill",
            place: true,
            limit: 7,
            layer: 1
        }, {
            id: 4,
            name: "mine",
            place: true,
            limit: 1,
            layer: 0
        }, {
            id: 5,
            name: "trap",
            place: true,
            limit: 6,
            layer: -1
        }, {
            id: 6,
            name: "booster",
            place: true,
            limit: 12,
            layer: -1
        }, {
            id: 7,
            name: "turret",
            place: true,
            limit: 2,
            layer: 1
        }, {
            id: 8,
            name: "watchtower",
            place: true,
            limit: 12,
            layer: 1
        }, {
            id: 9,
            name: "buff",
            place: true,
            limit: 4,
            layer: -1
        }, {
            id: 10,
            name: "spawn",
            place: true,
            limit: 1,
            layer: -1
        }, {
            id: 11,
            name: "sapling",
            place: true,
            limit: 2,
            layer: 0
        }, {
            id: 12,
            name: "blocker",
            place: true,
            limit: 3,
            layer: -1
        }, {
            id: 13,
            name: "teleporter",
            place: true,
            limit: 2,
            layer: -1
        }]; // PROJECTILES:
        exports.projectiles = [{
            indx: 0,
            layer: 0,
            src: "arrow_1",
            dmg: 25,
            speed: 1.6,
            scale: 103,
            range: 1000
        }, {
            indx: 1,
            layer: 1,
            dmg: 25,
            scale: 20
        }, {
            indx: 0,
            layer: 0,
            src: "arrow_1",
            dmg: 35,
            speed: 2.5,
            scale: 103,
            range: 1200
        }, {
            indx: 0,
            layer: 0,
            src: "arrow_1",
            dmg: 30,
            speed: 2,
            scale: 103,
            range: 1200
        }, {
            indx: 1,
            layer: 1,
            dmg: 16,
            scale: 20
        }, {
            indx: 0,
            layer: 0,
            src: "bullet_1",
            dmg: 50,
            speed: 3.6,
            scale: 160,
            range: 1400
        }]; // WEAPONS:
        exports.weapons = [{
            id: 0,
            type: 0,
            name: "tool hammer",
            desc: "tool for gathering all resources",
            src: "hammer_1",
            length: 140,
            width: 140,
            xOff: -3,
            yOff: 18,
            dmg: 25,
            range: 65,
            gather: 1,
            speed: 300
        }, {
            id: 1,
            type: 0,
            age: 2,
            name: "hand axe",
            desc: "gathers resources at a higher rate",
            src: "axe_1",
            length: 140,
            width: 140,
            xOff: 3,
            yOff: 24,
            dmg: 30,
            spdMult: 1,
            range: 70,
            gather: 2,
            speed: 400
        }, {
            id: 2,
            type: 0,
            age: 8,
            pre: 1,
            name: "great axe",
            desc: "deal more damage and gather more resources",
            src: "great_axe_1",
            length: 140,
            width: 140,
            xOff: -8,
            yOff: 25,
            dmg: 35,
            spdMult: 1,
            range: 75,
            gather: 4,
            speed: 400
        }, {
            id: 3,
            type: 0,
            age: 2,
            name: "short sword",
            desc: "increased attack power but slower move speed",
            src: "sword_1",
            iPad: 1.3,
            length: 130,
            width: 210,
            xOff: -8,
            yOff: 46,
            dmg: 35,
            spdMult: 0.85,
            range: 110,
            gather: 1,
            speed: 300
        }, {
            id: 4,
            type: 0,
            age: 8,
            pre: 3,
            name: "katana",
            desc: "greater range and damage",
            src: "samurai_1",
            iPad: 1.3,
            length: 130,
            width: 210,
            xOff: -8,
            yOff: 59,
            dmg: 40,
            spdMult: 0.8,
            range: 118,
            gather: 1,
            speed: 300
        }, {
            id: 5,
            type: 0,
            age: 2,
            name: "polearm",
            desc: "long range melee weapon",
            src: "spear_1",
            iPad: 1.3,
            length: 130,
            width: 210,
            xOff: -8,
            yOff: 53,
            dmg: 45,
            knock: 0.2,
            spdMult: 0.82,
            range: 142,
            gather: 1,
            speed: 700
        }, {
            id: 6,
            type: 0,
            age: 2,
            name: "bat",
            desc: "fast long range melee weapon",
            src: "bat_1",
            iPad: 1.3,
            length: 110,
            width: 180,
            xOff: -8,
            yOff: 53,
            dmg: 20,
            knock: 0.7,
            range: 110,
            gather: 1,
            speed: 300
        }, {
            id: 7,
            type: 0,
            age: 2,
            name: "daggers",
            desc: "really fast short range weapon",
            src: "dagger_1",
            iPad: 0.8,
            length: 110,
            width: 110,
            xOff: 18,
            yOff: 0,
            dmg: 20,
            knock: 0.1,
            range: 65,
            gather: 1,
            hitSlow: 0.1,
            spdMult: 1.13,
            speed: 100
        }, {
            id: 8,
            type: 0,
            age: 2,
            name: "stick",
            desc: "great for gathering but very weak",
            src: "stick_1",
            length: 140,
            width: 140,
            xOff: 3,
            yOff: 24,
            dmg: 1,
            spdMult: 1,
            range: 70,
            gather: 7,
            speed: 400
        }, {
            id: 9,
            type: 1,
            age: 6,
            name: "hunting bow",
            desc: "bow used for ranged combat and hunting",
            src: "bow_1",
            req: ["wood", 4],
            length: 120,
            width: 120,
            xOff: -6,
            yOff: 0,
            projectile: 0,
            spdMult: 0.75,
            speed: 600
        }, {
            id: 10,
            type: 1,
            age: 6,
            name: "great hammer",
            desc: "hammer used for destroying structures",
            src: "great_hammer_1",
            length: 140,
            width: 140,
            xOff: -9,
            yOff: 25,
            dmg: 10,
            spdMult: 0.88,
            range: 75,
            sDmg: 7.5,
            gather: 1,
            speed: 400
        }, {
            id: 11,
            type: 1,
            age: 6,
            name: "wooden shield",
            desc: "blocks projectiles and reduces melee damage",
            src: "shield_1",
            length: 120,
            width: 120,
            shield: 0.2,
            xOff: 6,
            yOff: 0,
            spdMult: 0.7
        }, {
            id: 12,
            type: 1,
            age: 8,
            pre: 9,
            name: "crossbow",
            desc: "deals more damage and has greater range",
            src: "crossbow_1",
            req: ["wood", 5],
            aboveHand: true,
            armS: 0.75,
            length: 120,
            width: 120,
            xOff: -4,
            yOff: 0,
            projectile: 2,
            spdMult: 0.7,
            speed: 700
        }, {
            id: 13,
            type: 1,
            age: 9,
            pre: 12,
            name: "repeater crossbow",
            desc: "high firerate crossbow with reduced damage",
            src: "crossbow_2",
            req: ["wood", 10],
            aboveHand: true,
            armS: 0.75,
            length: 120,
            width: 120,
            xOff: -4,
            yOff: 0,
            projectile: 3,
            spdMult: 0.7,
            speed: 230
        }, {
            id: 14,
            type: 1,
            age: 6,
            name: "mc grabby",
            desc: "steals resources from enemies",
            src: "grab_1",
            length: 130,
            width: 210,
            xOff: -8,
            yOff: 53,
            dmg: 0,
            steal: 250,
            knock: 0.2,
            spdMult: 1.05,
            range: 125,
            gather: 0,
            speed: 700
        }, {
            id: 15,
            type: 1,
            age: 9,
            pre: 12,
            name: "musket",
            desc: "slow firerate but high damage and range",
            src: "musket_1",
            req: ["stone", 10],
            aboveHand: true,
            rec: 0.35,
            armS: 0.6,
            hndS: 0.3,
            hndD: 1.6,
            length: 205,
            width: 205,
            xOff: 25,
            yOff: 0,
            projectile: 5,
            hideProjectile: true,
            spdMult: 0.6,
            speed: 1500
        }]; // ITEMS:
        module.exports.list = [{
            group: module.exports.groups[0],
            name: "apple",
            desc: "restores 20 health when consumed",
            req: ["food", 10],
            consume: function (doer) {
                return doer.changeHealth(20, doer);
            },
            scale: 22,
            holdOffset: 15
        }, {
            age: 3,
            group: module.exports.groups[0],
            name: "cookie",
            desc: "restores 40 health when consumed",
            req: ["food", 15],
            consume: function (doer) {
                return doer.changeHealth(40, doer);
            },
            scale: 27,
            holdOffset: 15
        }, {
            age: 7,
            group: module.exports.groups[0],
            name: "cheese",
            desc: "restores 30 health and another 50 over 5 seconds",
            req: ["food", 25],
            consume: function (doer) {
                if (doer.changeHealth(30, doer) || doer.health < 100) {
                    doer.dmgOverTime.dmg = -10;
                    doer.dmgOverTime.doer = doer;
                    doer.dmgOverTime.time = 5;
                    return true;
                }
                return false;
            },
            scale: 27,
            holdOffset: 15
        }, {
            group: module.exports.groups[1],
            name: "wood wall",
            desc: "provides protection for your village",
            req: ["wood", 10],
            projDmg: true,
            health: 380,
            scale: 50,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 3,
            group: module.exports.groups[1],
            name: "stone wall",
            desc: "provides improved protection for your village",
            req: ["stone", 25],
            health: 900,
            scale: 50,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            pre: 1,
            group: module.exports.groups[1],
            name: "castle wall",
            desc: "provides powerful protection for your village",
            req: ["stone", 35],
            health: 1500,
            scale: 52,
            holdOffset: 20,
            placeOffset: -5
        }, {
            group: module.exports.groups[2],
            name: "spikes",
            desc: "damages enemies when they touch them",
            req: ["wood", 20, "stone", 5],
            health: 400,
            dmg: 20,
            scale: 49,
            spritePadding: -23,
            holdOffset: 8,
            placeOffset: -5
        }, {
            age: 5,
            group: module.exports.groups[2],
            name: "greater spikes",
            desc: "damages enemies when they touch them",
            req: ["wood", 30, "stone", 10],
            health: 500,
            dmg: 35,
            scale: 52,
            spritePadding: -23,
            holdOffset: 8,
            placeOffset: -5
        }, {
            age: 9,
            pre: 1,
            group: module.exports.groups[2],
            name: "poison spikes",
            desc: "poisons enemies when they touch them",
            req: ["wood", 35, "stone", 15],
            health: 600,
            dmg: 30,
            pDmg: 5,
            scale: 52,
            spritePadding: -23,
            holdOffset: 8,
            placeOffset: -5
        }, {
            age: 9,
            pre: 2,
            group: module.exports.groups[2],
            name: "spinning spikes",
            desc: "damages enemies when they touch them",
            req: ["wood", 30, "stone", 20],
            health: 500,
            dmg: 45,
            turnSpeed: 0.003,
            scale: 52,
            spritePadding: -23,
            holdOffset: 8,
            placeOffset: -5
        }, {
            group: module.exports.groups[3],
            name: "windmill",
            desc: "generates gold over time",
            req: ["wood", 50, "stone", 10],
            health: 400,
            pps: 1,
            turnSpeed: 0.0016,
            spritePadding: 25,
            iconLineMult: 12,
            scale: 45,
            holdOffset: 20,
            placeOffset: 5
        }, {
            age: 5,
            pre: 1,
            group: module.exports.groups[3],
            name: "faster windmill",
            desc: "generates more gold over time",
            req: ["wood", 60, "stone", 20],
            health: 500,
            pps: 1.5,
            turnSpeed: 0.0025,
            spritePadding: 25,
            iconLineMult: 12,
            scale: 47,
            holdOffset: 20,
            placeOffset: 5
        }, {
            age: 8,
            pre: 1,
            group: module.exports.groups[3],
            name: "power mill",
            desc: "generates more gold over time",
            req: ["wood", 100, "stone", 50],
            health: 800,
            pps: 2,
            turnSpeed: 0.005,
            spritePadding: 25,
            iconLineMult: 12,
            scale: 47,
            holdOffset: 20,
            placeOffset: 5
        }, {
            age: 5,
            group: module.exports.groups[4],
            type: 2,
            name: "mine",
            desc: "allows you to mine stone",
            req: ["wood", 20, "stone", 100],
            iconLineMult: 12,
            scale: 65,
            holdOffset: 20,
            placeOffset: 0
        }, {
            age: 5,
            group: module.exports.groups[11],
            type: 0,
            name: "sapling",
            desc: "allows you to farm wood",
            req: ["wood", 150],
            iconLineMult: 12,
            colDiv: 0.5,
            scale: 110,
            holdOffset: 50,
            placeOffset: -15
        }, {
            age: 4,
            group: module.exports.groups[5],
            name: "pit trap",
            desc: "pit that traps enemies if they walk over it",
            req: ["wood", 30, "stone", 30],
            trap: true,
            ignoreCollision: true,
            hideFromEnemy: true,
            health: 500,
            colDiv: 0.2,
            scale: 50,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 4,
            group: module.exports.groups[6],
            name: "boost pad",
            desc: "provides boost when stepped on",
            req: ["stone", 20, "wood", 5],
            ignoreCollision: true,
            boostSpeed: 1.5,
            health: 150,
            colDiv: 0.7,
            scale: 45,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            group: module.exports.groups[7],
            doUpdate: true,
            name: "turret",
            desc: "defensive structure that shoots at enemies",
            req: ["wood", 200, "stone", 150],
            health: 800,
            projectile: 1,
            shootRange: 700,
            shootRate: 2200,
            scale: 43,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            group: module.exports.groups[8],
            name: "platform",
            desc: "platform to shoot over walls and cross over water",
            req: ["wood", 20],
            ignoreCollision: true,
            zIndex: 1,
            health: 300,
            scale: 43,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            group: module.exports.groups[9],
            name: "healing pad",
            desc: "standing on it will slowly heal you",
            req: ["wood", 30, "food", 10],
            ignoreCollision: true,
            healCol: 15,
            health: 400,
            colDiv: 0.7,
            scale: 45,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 9,
            group: module.exports.groups[10],
            name: "spawn pad",
            desc: "you will spawn here when you die but it will dissapear",
            req: ["wood", 100, "stone", 100],
            health: 400,
            ignoreCollision: true,
            spawnPoint: true,
            scale: 45,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            group: module.exports.groups[12],
            name: "blocker",
            desc: "blocks building in radius",
            req: ["wood", 30, "stone", 25],
            ignoreCollision: true,
            blocker: 300,
            health: 400,
            colDiv: 0.7,
            scale: 45,
            holdOffset: 20,
            placeOffset: -5
        }, {
            age: 7,
            group: module.exports.groups[13],
            name: "teleporter",
            desc: "teleports you to a random point on the map",
            req: ["wood", 60, "stone", 60],
            ignoreCollision: true,
            teleport: true,
            health: 200,
            colDiv: 0.7,
            scale: 45,
            holdOffset: 20,
            placeOffset: -5
        }]; // ASSIGN IDS:
        for (var i = 0; i < module.exports.list.length; ++i) {
            module.exports.list[i].id = i;
            if (module.exports.list[i].pre) {
                module.exports.list[i].pre = i - module.exports.list[i].pre;
            }
        } // TROLOLOLOL:
        if (typeof window !== "undefined") {
            function shuffle(a) {
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }
        } /***/
    },
    /***/"./src/js/data/mapManager.js":
    /*!***********************************!*\
    !*** ./src/js/data/mapManager.js ***!
    \***********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // GLOBAL MAPMANAGER:
        module.exports = {}; /***/
    },
    /***/"./src/js/data/objectManager.js":
    /*!**************************************!*\
    !*** ./src/js/data/objectManager.js ***!
    \**************************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        var mathFloor = Math.floor;
        var mathABS = Math.abs;
        var mathCOS = Math.cos;
        var mathSIN = Math.sin;
        var mathPOW = Math.pow;
        var mathSQRT = Math.sqrt;
        module.exports = function (GameObject, gameObjects, UTILS, config, players, server) {
            this.objects = gameObjects;
            this.grids = {};
            this.updateObjects = []; // SET OBJECT GRIDS:
            var tmpX;
            var tmpY;
            var tmpS = config.mapScale / config.colGrid;
            this.setObjectGrids = function (obj) {
                var objX = Math.min(config.mapScale, Math.max(0, obj.x));
                var objY = Math.min(config.mapScale, Math.max(0, obj.y));
                for (var x = 0; x < config.colGrid; ++x) {
                    tmpX = x * tmpS;
                    for (var y = 0; y < config.colGrid; ++y) {
                        tmpY = y * tmpS;
                        if (objX + obj.scale >= tmpX && objX - obj.scale <= tmpX + tmpS && objY + obj.scale >= tmpY && objY - obj.scale <= tmpY + tmpS) {
                            if (!this.grids[x + "_" + y]) {
                                this.grids[x + "_" + y] = [];
                            }
                            this.grids[x + "_" + y].push(obj);
                            obj.gridLocations.push(x + "_" + y);
                        }
                    }
                }
            }; // REMOVE OBJECT FROM GRID:
            this.removeObjGrid = function (obj) {
                var tmpIndx;
                for (var i = 0; i < obj.gridLocations.length; ++i) {
                    tmpIndx = this.grids[obj.gridLocations[i]].indexOf(obj);
                    if (tmpIndx >= 0) {
                        this.grids[obj.gridLocations[i]].splice(tmpIndx, 1);
                    }
                }
            }; // DISABLE OBJ:
            this.disableObj = function (obj) {
                obj.active = false;
                if (server) {
                    if (obj.owner && obj.pps) {
                        obj.owner.pps -= obj.pps;
                    }
                    this.removeObjGrid(obj);
                    var tmpIndx = this.updateObjects.indexOf(obj);
                    if (tmpIndx >= 0) {
                        this.updateObjects.splice(tmpIndx, 1);
                    }
                }
            }; // HIT OBJECT:
            this.hitObj = function (tmpObj, tmpDir) {
                for (var p = 0; p < players.length; ++p) {
                    if (players[p].active) {
                        if (tmpObj.sentTo[players[p].id]) {
                            if (!tmpObj.active) {
                                server.send(players[p].id, "12", tmpObj.sid);
                            } else if (players[p].canSee(tmpObj)) {
                                server.send(players[p].id, "8", UTILS.fixTo(tmpDir, 1), tmpObj.sid);
                            }
                        }
                        if (!tmpObj.active && tmpObj.owner == players[p]) {
                            players[p].changeItemCount(tmpObj.group.id, -1);
                        }
                    }
                }
            }; // GET GRID ARRAY:
            var tmpArray = [];
            var tmpGrid;
            this.getGridArrays = function (xPos, yPos, s) {
                tmpX = mathFloor(xPos / tmpS);
                tmpY = mathFloor(yPos / tmpS);
                tmpArray.length = 0;
                try {
                    if (this.grids[tmpX + "_" + tmpY]) {
                        tmpArray.push(this.grids[tmpX + "_" + tmpY]);
                    }
                    if (xPos + s >= (tmpX + 1) * tmpS) {
                        // RIGHT
                        tmpGrid = this.grids[tmpX + 1 + "_" + tmpY];
                        if (tmpGrid) {
                            tmpArray.push(tmpGrid);
                        }
                        if (tmpY && yPos - s <= tmpY * tmpS) {
                            // TOP RIGHT
                            tmpGrid = this.grids[tmpX + 1 + "_" + (tmpY - 1)];
                            if (tmpGrid) {
                                tmpArray.push(tmpGrid);
                            }
                        } else if (yPos + s >= (tmpY + 1) * tmpS) {
                            // BOTTOM RIGHT
                            tmpGrid = this.grids[tmpX + 1 + "_" + (tmpY + 1)];
                            if (tmpGrid) {
                                tmpArray.push(tmpGrid);
                            }
                        }
                    }
                    if (tmpX && xPos - s <= tmpX * tmpS) {
                        // LEFT
                        tmpGrid = this.grids[tmpX - 1 + "_" + tmpY];
                        if (tmpGrid) {
                            tmpArray.push(tmpGrid);
                        }
                        if (tmpY && yPos - s <= tmpY * tmpS) {
                            // TOP LEFT
                            tmpGrid = this.grids[tmpX - 1 + "_" + (tmpY - 1)];
                            if (tmpGrid) {
                                tmpArray.push(tmpGrid);
                            }
                        } else if (yPos + s >= (tmpY + 1) * tmpS) {
                            // BOTTOM LEFT
                            tmpGrid = this.grids[tmpX - 1 + "_" + (tmpY + 1)];
                            if (tmpGrid) {
                                tmpArray.push(tmpGrid);
                            }
                        }
                    }
                    if (yPos + s >= (tmpY + 1) * tmpS) {
                        // BOTTOM
                        tmpGrid = this.grids[tmpX + "_" + (tmpY + 1)];
                        if (tmpGrid) {
                            tmpArray.push(tmpGrid);
                        }
                    }
                    if (tmpY && yPos - s <= tmpY * tmpS) {
                        // TOP
                        tmpGrid = this.grids[tmpX + "_" + (tmpY - 1)];
                        if (tmpGrid) {
                            tmpArray.push(tmpGrid);
                        }
                    }
            } catch (e) {}
                return tmpArray;
            }; // ADD NEW:
            var tmpObj;
            this.add = function (sid, x, y, dir, s, type, data, setSID, owner) {
                tmpObj = null;
                for (var i = 0; i < gameObjects.length; ++i) {
                    if (gameObjects[i].sid == sid) {
                        tmpObj = gameObjects[i];
                        break;
                    }
                }
                if (!tmpObj) {
                    for (var i = 0; i < gameObjects.length; ++i) {
                        if (!gameObjects[i].active) {
                            tmpObj = gameObjects[i];
                            break;
                        }
                    }
                }
                if (!tmpObj) {
                    tmpObj = new GameObject(sid);
                    gameObjects.push(tmpObj);
                }
                if (setSID) {
                    tmpObj.sid = sid;
                }
                tmpObj.init(x, y, dir, s, type, data, owner);
                if (server) {
                    this.setObjectGrids(tmpObj);
                    if (tmpObj.doUpdate) {
                        this.updateObjects.push(tmpObj);
                    }
                }
            }; // DISABLE BY SID:
            this.disableBySid = function (sid) {
                for (var i = 0; i < gameObjects.length; ++i) {
                    if (gameObjects[i].sid == sid) {
                        this.disableObj(gameObjects[i]);
                        break;
                    }
                }
            }; // REMOVE ALL FROM PLAYER:
            this.removeAllItems = function (sid, server) {
                for (var i = 0; i < gameObjects.length; ++i) {
                    if (gameObjects[i].active && gameObjects[i].owner && gameObjects[i].owner.sid == sid) {
                        this.disableObj(gameObjects[i]);
                    }
                }
                if (server) {
                    server.broadcast("13", sid);
                }
            }; // FETCH SPAWN OBJECT:
            this.fetchSpawnObj = function (sid) {
                var tmpLoc = null;
                for (var i = 0; i < gameObjects.length; ++i) {
                    tmpObj = gameObjects[i];
                    if (tmpObj.active && tmpObj.owner && tmpObj.owner.sid == sid && tmpObj.spawnPoint) {
                        tmpLoc = [tmpObj.x, tmpObj.y];
                        this.disableObj(tmpObj);
                        server.broadcast("12", tmpObj.sid);
                        if (tmpObj.owner) {
                            tmpObj.owner.changeItemCount(tmpObj.group.id, -1);
                        }
                        break;
                    }
                }
                return tmpLoc;
            }; // CHECK IF PLACABLE:
            this.checkItemLocation = function (x, y, s, sM, indx, ignoreWater, placer) {
                for (var i = 0; i < gameObjects.length; ++i) {
                    var blockS = gameObjects[i].blocker ? gameObjects[i].blocker : gameObjects[i].getScale(sM, gameObjects[i].isItem);
                    if (gameObjects[i].active && UTILS.getDistance(x, y, gameObjects[i].x, gameObjects[i].y) < s + blockS) {
                        return false;
                    }
                }
                if (!ignoreWater && indx != 18 && y >= config.mapScale / 2 - config.riverWidth / 2 && y <= config.mapScale / 2 + config.riverWidth / 2) {
                    return false;
                }
                return true;
            }; // ADD PROJECTILE:
            this.addProjectile = function (x, y, dir, range, indx) {
                var tmpData = items.projectiles[indx];
                var tmpProj;
                for (var i = 0; i < projectiles.length; ++i) {
                    if (!projectiles[i].active) {
                        tmpProj = projectiles[i];
                        break;
                    }
                }
                if (!tmpProj) {
                    tmpProj = new Projectile(players, UTILS);
                    projectiles.push(tmpProj);
                }
                tmpProj.init(indx, x, y, dir, tmpData.speed, range, tmpData.scale);
            }; // CHECK PLAYER COLLISION:
            this.checkCollision = function (player, other, delta) {
                delta = delta || 1;
                var dx = player.x - other.x;
                var dy = player.y - other.y;
                var tmpLen = player.scale + other.scale;
                if (mathABS(dx) <= tmpLen || mathABS(dy) <= tmpLen) {
                    tmpLen = player.scale + (other.getScale ? other.getScale() : other.scale);
                    var tmpInt = mathSQRT(dx * dx + dy * dy) - tmpLen;
                    if (tmpInt <= 0) {
                        if (!other.ignoreCollision) {
                            var tmpDir = UTILS.getDirection(player.x, player.y, other.x, other.y);
                            var tmpDist = UTILS.getDistance(player.x, player.y, other.x, other.y);
                            if (other.isPlayer) {
                                tmpInt = tmpInt * -1 / 2;
                                player.x += tmpInt * mathCOS(tmpDir);
                                player.y += tmpInt * mathSIN(tmpDir);
                                other.x -= tmpInt * mathCOS(tmpDir);
                                other.y -= tmpInt * mathSIN(tmpDir);
                            } else {
                                player.x = other.x + tmpLen * mathCOS(tmpDir);
                                player.y = other.y + tmpLen * mathSIN(tmpDir);
                                player.xVel *= 0.75;
                                player.yVel *= 0.75;
                            }
                            if (other.dmg && other.owner != player && (!other.owner || !other.owner.team || other.owner.team != player.team)) {
                                player.changeHealth(-other.dmg, other.owner, other);
                                var tmpSpd = (other.weightM || 1) * 1.5;
                                player.xVel += tmpSpd * mathCOS(tmpDir);
                                player.yVel += tmpSpd * mathSIN(tmpDir);
                                if (other.pDmg && (!player.skin || !player.skin.poisonRes)) {
                                    player.dmgOverTime.dmg = other.pDmg;
                                    player.dmgOverTime.time = 5;
                                    player.dmgOverTime.doer = other.owner;
                                }
                                if (player.colDmg && other.health) {
                                    if (other.changeHealth(-player.colDmg)) {
                                        this.disableObj(other);
                                    }
                                    this.hitObj(other, UTILS.getDirection(player.x, player.y, other.x, other.y));
                                }
                            }
                        } else if (other.trap && !player.noTrap && other.owner != player && (!other.owner || !other.owner.team || other.owner.team != player.team)) {
                            player.lockMove = true;
                            other.hideFromEnemy = false;
                        } else if (other.boostSpeed) {
                            player.xVel += delta * other.boostSpeed * (other.weightM || 1) * mathCOS(other.dir);
                            player.yVel += delta * other.boostSpeed * (other.weightM || 1) * mathSIN(other.dir);
                        } else if (other.healCol) {
                            player.healCol = other.healCol;
                        } else if (other.teleport) {
                            player.x = UTILS.randInt(0, config.mapScale);
                            player.y = UTILS.randInt(0, config.mapScale);
                        }
                        if (other.zIndex > player.zIndex) {
                            player.zIndex = other.zIndex;
                        }
                        return true;
                    }
                }
                return false;
            };
        }; /***/
    },
    /***/"./src/js/data/player.js":
    /*!*******************************!*\
    !*** ./src/js/data/player.js ***!
    \*******************************/
    /*! no static exports found */ /***/
    function (module, exports, __webpack_require__) {
        var mathABS = Math.abs;
        var mathCOS = Math.cos;
        var mathSIN = Math.sin;
        var mathPOW = Math.pow;
        var mathSQRT = Math.sqrt;
        module.exports = function (id, sid, config, UTILS, projectileManager, objectManager, players, ais, items, hats, accessories, server, scoreCallback, iconCallback) {
            this.id = id;
            this.sid = sid;
            this.tmpScore = 0;
            this.team = null;
            this.skinIndex = 0;
            this.tailIndex = 0;
            this.hitTime = 0;
            this.tails = {};
            for (var i = 0; i < accessories.length; ++i) {
                if (accessories[i].price <= 0) {
                    this.tails[accessories[i].id] = 1;
                }
            }
            this.skins = {};
            for (var i = 0; i < hats.length; ++i) {
                if (hats[i].price <= 0) {
                    this.skins[hats[i].id] = 1;
                }
            }
            this.points = 0;
            this.dt = 0;
            this.hidden = false;
            this.itemCounts = {};
            this.isPlayer = true;
            this.pps = 0;
            this.moveDir = undefined;
            this.skinRot = 0;
            this.lastPing = 0;
            this.iconIndex = 0;
            this.skinColor = 0; // SPAWN:
            this.spawn = function (moofoll) {
                this.active = true;
                this.alive = true;
                this.lockMove = false;
                this.lockDir = false;
                this.minimapCounter = 0;
                this.chatCountdown = 0;
                this.shameCount = 0;
                this.shameTimer = 0;
                this.sentTo = {};
                this.gathering = 0;
                this.autoGather = 0;
                this.animTime = 0;
                this.animSpeed = 0;
                this.mouseState = 0;
                this.buildIndex = -1;
                this.weaponIndex = 0;
                this.dmgOverTime = {};
                this.noMovTimer = 0;
                this.maxXP = 300;
                this.XP = 0;
                this.age = 1;
                this.kills = 0;
                this.upgrAge = 2;
                this.upgradePoints = 0;
                this.x = 0;
                this.y = 0;
                this.zIndex = 0;
                this.xVel = 0;
                this.yVel = 0;
                this.slowMult = 1;
                this.dir = 0;
                this.dirPlus = 0;
                this.targetDir = 0;
                this.targetAngle = 0;
                this.maxHealth = 100;
                this.health = this.maxHealth;
                this.scale = config.playerScale;
                this.speed = config.playerSpeed;
                this.resetMoveDir();
                this.resetResources(moofoll);
                this.items = [0, 3, 6, 10];
                this.weapons = [0];
                this.shootCount = 0;
                this.weaponXP = [];
                this.reloads = {};
            }; // RESET MOVE DIR:
            this.resetMoveDir = function () {
                this.moveDir = undefined;
            }; // RESET RESOURCES:
            this.resetResources = function (moofoll) {
                for (var i = 0; i < config.resourceTypes.length; ++i) {
                    this[config.resourceTypes[i]] = moofoll ? 100 : 0;
                }
            }; // ADD ITEM:
            this.addItem = function (id) {
                var tmpItem = items.list[id];
                if (tmpItem) {
                    for (var i = 0; i < this.items.length; ++i) {
                        if (items.list[this.items[i]].group == tmpItem.group) {
                            if (this.buildIndex == this.items[i]) {
                                this.buildIndex = id;
                            }
                            this.items[i] = id;
                            return true;
                        }
                    }
                    this.items.push(id);
                    return true;
                }
                return false;
            }; // SET USER DATA:
            this.setUserData = function (data) {
                if (data) {
                    // SET INITIAL NAME:
                    this.name = "unknown"; // VALIDATE NAME:
                    var name = data.name + "";
                    name = name.slice(0, config.maxNameLength);
                    name = name.replace(/[^\w:\(\)\/? -]+/gim, " "); // USE SPACE SO WE CAN CHECK PROFANITY
                    name = name.replace(/[^\x00-\x7F]/g, " ");
                    name = name.trim(); // CHECK IF IS PROFANE:
                    var isProfane = false;
                    var convertedName = name.toLowerCase().replace(/\s/g, "").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s");
                    for (var word of langFilter.list) {
                        if (convertedName.indexOf(word) != -1) {
                            isProfane = true;
                            break;
                        }
                    }
                    if (name.length > 0 && !isProfane) {
                        this.name = name;
                    } // SKIN:
                    this.skinColor = 0;
                    if (config.skinColors[data.skin]) {
                        this.skinColor = data.skin;
                    }
                }
            }; // GET DATA TO SEND:
            this.getData = function () {
                return [this.id, this.sid, this.name, UTILS.fixTo(this.x, 2), UTILS.fixTo(this.y, 2), UTILS.fixTo(this.dir, 3), this.health, this.maxHealth, this.scale, this.skinColor];
            }; // SET DATA:
            this.setData = function (data) {
                this.id = data[0];
                this.sid = data[1];
                this.name = data[2];
                this.x = data[3];
                this.y = data[4];
                this.dir = data[5];
                this.health = data[6];
                this.maxHealth = data[7];
                this.scale = data[8];
                this.skinColor = data[9];
            }; // UPDATE:
            var timerCount = 0;
            this.update = function (delta) {
                if (!this.alive) {
                    return;
                } // SHAME SHAME SHAME:
                if (this.shameTimer > 0) {
                    this.shameTimer -= delta;
                    if (this.shameTimer <= 0) {
                        this.shameTimer = 0;
                        this.shameCount = 0;
                    }
                } // REGENS AND AUTO:
                timerCount -= delta;
                if (timerCount <= 0) {
                    var regenAmount = (this.skin && this.skin.healthRegen ? this.skin.healthRegen : 0) + (this.tail && this.tail.healthRegen ? this.tail.healthRegen : 0);
                    if (regenAmount) {
                        this.changeHealth(regenAmount, this);
                    }
                    if (this.dmgOverTime.dmg) {
                        this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer);
                        this.dmgOverTime.time -= 1;
                        if (this.dmgOverTime.time <= 0) {
                            this.dmgOverTime.dmg = 0;
                        }
                    }
                    if (this.healCol) {
                        this.changeHealth(this.healCol, this);
                    }
                    timerCount = 1000;
                } // CHECK KILL:
                if (!this.alive) {
                    return;
                } // SLOWER:
                if (this.slowMult < 1) {
                    this.slowMult += delta * 0.0008;
                    if (this.slowMult > 1) {
                        this.slowMult = 1;
                    }
                } // MOVE:
                this.noMovTimer += delta;
                if (this.xVel || this.yVel) {
                    this.noMovTimer = 0;
                }
                if (this.lockMove) {
                    this.xVel = 0;
                    this.yVel = 0;
                } else {
                    var spdMult = (this.buildIndex >= 0 ? 0.5 : 1) * (items.weapons[this.weaponIndex].spdMult || 1) * (this.skin ? this.skin.spdMult || 1 : 1) * (this.tail ? this.tail.spdMult || 1 : 1) * (this.y <= config.snowBiomeTop ? this.skin && this.skin.coldM ? 1 : config.snowSpeed : 1) * this.slowMult;
                    if (!this.zIndex && this.y >= config.mapScale / 2 - config.riverWidth / 2 && this.y <= config.mapScale / 2 + config.riverWidth / 2) {
                        if (this.skin && this.skin.watrImm) {
                            spdMult *= 0.75;
                            this.xVel += config.waterCurrent * 0.4 * delta;
                        } else {
                            spdMult *= 0.33;
                            this.xVel += config.waterCurrent * delta;
                        }
                    }
                    var xVel = this.moveDir != undefined ? mathCOS(this.moveDir) : 0;
                    var yVel = this.moveDir != undefined ? mathSIN(this.moveDir) : 0;
                    var length = mathSQRT(xVel * xVel + yVel * yVel);
                    if (length != 0) {
                        xVel /= length;
                        yVel /= length;
                    }
                    if (xVel) {
                        this.xVel += xVel * this.speed * spdMult * delta;
                    }
                    if (yVel) {
                        this.yVel += yVel * this.speed * spdMult * delta;
                    }
                } // OBJECT COLL:
                this.zIndex = 0;
                this.lockMove = false;
                this.healCol = 0;
                var tmpList;
                var tmpSpeed = UTILS.getDistance(0, 0, this.xVel * delta, this.yVel * delta);
                var depth = Math.min(4, Math.max(1, Math.round(tmpSpeed / 40)));
                var tMlt = 1 / depth;
                for (var i = 0; i < depth; ++i) {
                    if (this.xVel) {
                        this.x += this.xVel * delta * tMlt;
                    }
                    if (this.yVel) {
                        this.y += this.yVel * delta * tMlt;
                    }
                    tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                    for (var x = 0; x < tmpList.length; ++x) {
                        for (var y = 0; y < tmpList[x].length; ++y) {
                            if (tmpList[x][y].active) {
                                objectManager.checkCollision(this, tmpList[x][y], tMlt);
                            }
                        }
                    }
                } // PLAYER COLLISIONS:
                var tmpIndx = players.indexOf(this);
                for (var i = tmpIndx + 1; i < players.length; ++i) {
                    if (players[i] != this && players[i].alive) {
                        objectManager.checkCollision(this, players[i]);
                    }
                } // DECEL:
                if (this.xVel) {
                    this.xVel *= mathPOW(config.playerDecel, delta);
                    if (this.xVel <= 0.01 && this.xVel >= -0.01) {
                        this.xVel = 0;
                    }
                }
                if (this.yVel) {
                    this.yVel *= mathPOW(config.playerDecel, delta);
                    if (this.yVel <= 0.01 && this.yVel >= -0.01) {
                        this.yVel = 0;
                    }
                } // MAP BOUNDARIES:
                if (this.x - this.scale < 0) {
                    this.x = this.scale;
                } else if (this.x + this.scale > config.mapScale) {
                    this.x = config.mapScale - this.scale;
                }
                if (this.y - this.scale < 0) {
                    this.y = this.scale;
                } else if (this.y + this.scale > config.mapScale) {
                    this.y = config.mapScale - this.scale;
                } // USE WEAPON OR TOOL:
                if (this.buildIndex < 0) {
                    if (this.reloads[this.weaponIndex] > 0) {
                        this.reloads[this.weaponIndex] -= delta;
                        this.gathering = this.mouseState;
                    } else if (this.gathering || this.autoGather) {
                        var worked = true;
                        if (items.weapons[this.weaponIndex].gather != undefined) {
                            this.gather(players);
                        } else if (items.weapons[this.weaponIndex].projectile != undefined && this.hasRes(items.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0)) {
                            this.useRes(items.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0);
                            this.noMovTimer = 0;
                            var tmpIndx = items.weapons[this.weaponIndex].projectile;
                            var projOffset = this.scale * 2;
                            var aMlt = this.skin && this.skin.aMlt ? this.skin.aMlt : 1;
                            if (items.weapons[this.weaponIndex].rec) {
                                this.xVel -= items.weapons[this.weaponIndex].rec * mathCOS(this.dir);
                                this.yVel -= items.weapons[this.weaponIndex].rec * mathSIN(this.dir);
                            }
                            projectileManager.addProjectile(this.x + projOffset * mathCOS(this.dir), this.y + projOffset * mathSIN(this.dir), this.dir, items.projectiles[tmpIndx].range * aMlt, items.projectiles[tmpIndx].speed * aMlt, tmpIndx, this, null, this.zIndex);
                        } else {
                            worked = false;
                        }
                        this.gathering = this.mouseState;
                        if (worked) {
                            this.reloads[this.weaponIndex] = items.weapons[this.weaponIndex].speed * (this.skin ? this.skin.atkSpd || 1 : 1);
                        }
                    }
                }
            }; // ADD WEAPON XP:
            this.addWeaponXP = function (amnt) {
                if (!this.weaponXP[this.weaponIndex]) {
                    this.weaponXP[this.weaponIndex] = 0;
                }
                this.weaponXP[this.weaponIndex] += amnt;
            }; // EARN XP:
            this.earnXP = function (amount) {
                if (this.age < config.maxAge) {
                    this.XP += amount;
                    if (this.XP >= this.maxXP) {
                        if (this.age < config.maxAge) {
                            this.age++;
                            this.XP = 0;
                            this.maxXP *= 1.2;
                        } else {
                            this.XP = this.maxXP;
                        }
                        this.upgradePoints++;
                        server.send(this.id, "16", this.upgradePoints, this.upgrAge);
                        server.send(this.id, "15", this.XP, UTILS.fixTo(this.maxXP, 1), this.age);
                    } else {
                        server.send(this.id, "15", this.XP);
                    }
                }
            }; // CHANGE HEALTH:
            this.changeHealth = function (amount, doer) {
                if (amount > 0 && this.health >= this.maxHealth) {
                    return false;
                }
                if (amount < 0 && this.skin) {
                    amount *= this.skin.dmgMult || 1;
                }
                if (amount < 0 && this.tail) {
                    amount *= this.tail.dmgMult || 1;
                }
                if (amount < 0) {
                    this.hitTime = Date.now();
                }
                this.health += amount;
                if (this.health > this.maxHealth) {
                    amount -= this.health - this.maxHealth;
                    this.health = this.maxHealth;
                }
                if (this.health <= 0) {
                    this.kill(doer);
                }
                for (var i = 0; i < players.length; ++i) {
                    if (this.sentTo[players[i].id]) {
                        server.send(players[i].id, "h", this.sid, Math.round(this.health));
                    }
                }
                if (doer && doer.canSee(this) && (doer != this || !(amount < 0))) {
                    server.send(doer.id, "t", Math.round(this.x), Math.round(this.y), Math.round(-amount), 1);
                }
                return true;
            }; // KILL:
            this.kill = function (doer) {
                if (doer && doer.alive) {
                    doer.kills++;
                    if (doer.skin && doer.skin.goldSteal) {
                        scoreCallback(doer, Math.round(this.points / 2));
                    } else {
                        scoreCallback(doer, Math.round(this.age * 100 * (doer.skin && doer.skin.kScrM ? doer.skin.kScrM : 1)));
                    }
                    server.send(doer.id, "9", "kills", doer.kills, 1);
                }
                this.alive = false;
                server.send(this.id, "11");
                iconCallback();
            }; // ADD RESOURCE:
            this.addResource = function (type, amount, auto) {
                if (!auto && amount > 0) {
                    this.addWeaponXP(amount);
                }
                if (type == 3) {
                    scoreCallback(this, amount, true);
                } else {
                    this[config.resourceTypes[type]] += amount;
                    server.send(this.id, "9", config.resourceTypes[type], this[config.resourceTypes[type]], 1);
                }
            }; // CHANGE ITEM COUNT:
            this.changeItemCount = function (index, value) {
                this.itemCounts[index] = this.itemCounts[index] || 0;
                this.itemCounts[index] += value;
                server.send(this.id, "14", index, this.itemCounts[index]);
            }; // BUILD:
            this.buildItem = function (item) {
                var tmpS = this.scale + item.scale + (item.placeOffset || 0);
                var tmpX = this.x + tmpS * mathCOS(this.dir);
                var tmpY = this.y + tmpS * mathSIN(this.dir);
                if (this.canBuild(item) && (!item.consume || !this.skin || !this.skin.noEat) && (item.consume || objectManager.checkItemLocation(tmpX, tmpY, item.scale, 0.6, item.id, false, this))) {
                    var worked = false;
                    if (item.consume) {
                        if (this.hitTime) {
                            var timeSinceHit = Date.now() - this.hitTime;
                            this.hitTime = 0;
                            if (timeSinceHit <= 120) {
                                this.shameCount++;
                                if (this.shameCount >= 8) {
                                    this.shameTimer = 30000;
                                    this.shameCount = 0;
                                }
                            } else {
                                this.shameCount -= 2;
                                if (this.shameCount <= 0) {
                                    this.shameCount = 0;
                                }
                            }
                        }
                        if (this.shameTimer <= 0) {
                            worked = item.consume(this);
                        }
                    } else {
                        worked = true;
                        if (item.group.limit) {
                            this.changeItemCount(item.group.id, 1);
                        }
                        if (item.pps) {
                            this.pps += item.pps;
                        }
                        objectManager.add(objectManager.objects.length, tmpX, tmpY, this.dir, item.scale, item.type, item, false, this);
                    }
                    if (worked) {
                        this.useRes(item);
                        this.buildIndex = -1;
                    }
                }
            }; // HAS RESOURCES:
            this.hasRes = function (item, mult) {
                for (var i = 0; i < item.req.length;) {
                    if (this[item.req[i]] < Math.round(item.req[i + 1] * (mult || 1))) {
                        return false;
                    }
                    i += 2;
                }
                return true;
            }; // USE RESOURCES:
            this.useRes = function (item, mult) {
                if (config.inSandbox) {
                    return;
                }
                for (var i = 0; i < item.req.length;) {
                    this.addResource(config.resourceTypes.indexOf(item.req[i]), -Math.round(item.req[i + 1] * (mult || 1)));
                    i += 2;
                }
            }; // CAN BUILD:
            this.canBuild = function (item) {
                if (config.inSandbox) {
                    return true;
                }
                if (item.group.limit && this.itemCounts[item.group.id] >= item.group.limit) {
                    return false;
                }
                return this.hasRes(item);
            }; // GATHER:
            this.gather = function () {
                // SHOW:
                this.noMovTimer = 0; // SLOW MOVEMENT:
                this.slowMult -= items.weapons[this.weaponIndex].hitSlow || 0.3;
                if (this.slowMult < 0) {
                    this.slowMult = 0;
                } // VARIANT DMG:
                var tmpVariant = config.fetchVariant(this);
                var applyPoison = tmpVariant.poison;
                var variantDmg = tmpVariant.val; // CHECK IF HIT GAME OBJECT:
                var hitObjs = {};
                var tmpDist;
                var tmpDir;
                var tmpObj;
                var hitSomething;
                var tmpList = objectManager.getGridArrays(this.x, this.y, items.weapons[this.weaponIndex].range);
                for (var t = 0; t < tmpList.length; ++t) {
                    for (var i = 0; i < tmpList[t].length; ++i) {
                        tmpObj = tmpList[t][i];
                        if (tmpObj.active && !tmpObj.dontGather && !hitObjs[tmpObj.sid] && tmpObj.visibleToPlayer(this)) {
                            tmpDist = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y) - tmpObj.scale;
                            if (tmpDist <= items.weapons[this.weaponIndex].range) {
                                tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                                if (UTILS.getAngleDist(tmpDir, this.dir) <= config.gatherAngle) {
                                    hitObjs[tmpObj.sid] = 1;
                                    if (tmpObj.health) {
                                        if (tmpObj.changeHealth(-items.weapons[this.weaponIndex].dmg * variantDmg * (items.weapons[this.weaponIndex].sDmg || 1) * (this.skin && this.skin.bDmg ? this.skin.bDmg : 1), this)) {
                                            for (var x = 0; x < tmpObj.req.length;) {
                                                this.addResource(config.resourceTypes.indexOf(tmpObj.req[x]), tmpObj.req[x + 1]);
                                                x += 2;
                                            }
                                            objectManager.disableObj(tmpObj);
                                        }
                                    } else {
                                        this.earnXP(items.weapons[this.weaponIndex].gather * 4);
                                        var count = items.weapons[this.weaponIndex].gather + (tmpObj.type == 3 ? 4 : 0);
                                        if (this.skin && this.skin.extraGold) {
                                            this.addResource(3, 1);
                                        }
                                        this.addResource(tmpObj.type, count);
                                    }
                                    hitSomething = true;
                                    objectManager.hitObj(tmpObj, tmpDir);
                                }
                            }
                        }
                    }
                } // CHECK IF HIT PLAYER:
                for (var i = 0; i < players.length + ais.length; ++i) {
                    tmpObj = players[i] || ais[i - players.length];
                    if (tmpObj != this && tmpObj.alive && (!tmpObj.team || tmpObj.team != this.team)) {
                        tmpDist = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y) - tmpObj.scale * 1.8;
                        if (tmpDist <= items.weapons[this.weaponIndex].range) {
                            tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                            if (UTILS.getAngleDist(tmpDir, this.dir) <= config.gatherAngle) {
                                // STEAL RESOURCES:
                                var stealCount = items.weapons[this.weaponIndex].steal;
                                if (stealCount && tmpObj.addResource) {
                                    stealCount = Math.min(tmpObj.points || 0, stealCount);
                                    this.addResource(3, stealCount);
                                    tmpObj.addResource(3, -stealCount);
                                } // MELEE HIT PLAYER:
                                var dmgMlt = variantDmg;
                                if (tmpObj.weaponIndex != undefined && items.weapons[tmpObj.weaponIndex].shield && UTILS.getAngleDist(tmpDir + Math.PI, tmpObj.dir) <= config.shieldAngle) {
                                    dmgMlt = items.weapons[tmpObj.weaponIndex].shield;
                                }
                                var dmgVal = items.weapons[this.weaponIndex].dmg * (this.skin && this.skin.dmgMultO ? this.skin.dmgMultO : 1) * (this.tail && this.tail.dmgMultO ? this.tail.dmgMultO : 1);
                                var tmpSpd = (tmpObj.weightM || 1) * 0.3 + (items.weapons[this.weaponIndex].knock || 0);
                                tmpObj.xVel += tmpSpd * mathCOS(tmpDir);
                                tmpObj.yVel += tmpSpd * mathSIN(tmpDir);
                                if (this.skin && this.skin.healD) {
                                    this.changeHealth(dmgVal * dmgMlt * this.skin.healD, this);
                                }
                                if (this.tail && this.tail.healD) {
                                    this.changeHealth(dmgVal * dmgMlt * this.tail.healD, this);
                                }
                                if (tmpObj.skin && tmpObj.skin.dmg && dmgMlt == 1) {
                                    this.changeHealth(-dmgVal * tmpObj.skin.dmg, tmpObj);
                                }
                                if (tmpObj.tail && tmpObj.tail.dmg && dmgMlt == 1) {
                                    this.changeHealth(-dmgVal * tmpObj.tail.dmg, tmpObj);
                                }
                                if (tmpObj.dmgOverTime && this.skin && this.skin.poisonDmg && (!tmpObj.skin || !tmpObj.skin.poisonRes)) {
                                    tmpObj.dmgOverTime.dmg = this.skin.poisonDmg;
                                    tmpObj.dmgOverTime.time = this.skin.poisonTime || 1;
                                    tmpObj.dmgOverTime.doer = this;
                                }
                                if (tmpObj.dmgOverTime && applyPoison && (!tmpObj.skin || !tmpObj.skin.poisonRes)) {
                                    tmpObj.dmgOverTime.dmg = 5;
                                    tmpObj.dmgOverTime.time = 5;
                                    tmpObj.dmgOverTime.doer = this;
                                }
                                if (tmpObj.skin && tmpObj.skin.dmgK) {
                                    this.xVel -= tmpObj.skin.dmgK * mathCOS(tmpDir);
                                    this.yVel -= tmpObj.skin.dmgK * mathSIN(tmpDir);
                                }
                                tmpObj.changeHealth(-dmgVal * dmgMlt, this, this);
                            }
                        }
                    }
                } // SEND FOR ANIMATION:
                this.sendAnimation(hitSomething ? 1 : 0);
            }; // SEND ANIMATION:
            this.sendAnimation = function (hit) {
                for (var i = 0; i < players.length; ++i) {
                    if (this.sentTo[players[i].id] && this.canSee(players[i])) {
                        server.send(players[i].id, "7", this.sid, hit ? 1 : 0, this.weaponIndex);
                    }
                }
            }; // ANIMATE:
            var tmpRatio = 0;
            var animIndex = 0;
            this.animate = function (delta) {
                if (this.animTime > 0) {
                    this.animTime -= delta;
                    if (this.animTime <= 0) {
                        this.animTime = 0;
                        this.dirPlus = 0;
                        tmpRatio = 0;
                        animIndex = 0;
                    } else if (animIndex == 0) {
                        tmpRatio += delta / (this.animSpeed * config.hitReturnRatio);
                        this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.min(1, tmpRatio));
                        if (tmpRatio >= 1) {
                            tmpRatio = 1;
                            animIndex = 1;
                        }
                    } else {
                        tmpRatio -= delta / (this.animSpeed * (1 - config.hitReturnRatio));
                        this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.max(0, tmpRatio));
                    }
                }
            }; // GATHER ANIMATION:
            this.startAnim = function (didHit, index) {
                this.animTime = this.animSpeed = items.weapons[index].speed;
                this.targetAngle = didHit ? -config.hitAngle : -Math.PI;
                tmpRatio = 0;
                animIndex = 0;
            }; // CAN SEE:
            this.canSee = function (other) {
                if (!other) {
                    return false;
                }
                if (other.skin && other.skin.invisTimer && other.noMovTimer >= other.skin.invisTimer) {
                    return false;
                }
                var dx = mathABS(other.x - this.x) - other.scale;
                var dy = mathABS(other.y - this.y) - other.scale;
                return dx <= config.maxScreenWidth / 2 * 1.3 && dy <= config.maxScreenHeight / 2 * 1.3;
            };
        }; /***/
    },
    /***/"./src/js/data/projectile.js":
    /*!***********************************!*\
    !*** ./src/js/data/projectile.js ***!
    \***********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        module.exports = function (players, ais, objectManager, items, config, UTILS, server) {
            // INIT:
            this.init = function (indx, x, y, dir, spd, dmg, rng, scl, owner) {
                this.active = true;
                this.indx = indx;
                this.x = x;
                this.y = y;
                this.dir = dir;
                this.skipMov = true;
                this.speed = spd;
                this.dmg = dmg;
                this.scale = scl;
                this.range = rng;
                this.owner = owner;
                if (server) {
                    this.sentTo = {};
                }
            }; // UPDATE:
            var objectsHit = [];
            var tmpObj;
            this.update = function (delta) {
                if (this.active) {
                    var tmpSpeed = this.speed * delta;
                    var tmpScale;
                    if (!this.skipMov) {
                        this.x += tmpSpeed * Math.cos(this.dir);
                        this.y += tmpSpeed * Math.sin(this.dir);
                        this.range -= tmpSpeed;
                        if (this.range <= 0) {
                            this.x += this.range * Math.cos(this.dir);
                            this.y += this.range * Math.sin(this.dir);
                            tmpSpeed = 1;
                            this.range = 0;
                            this.active = false;
                        }
                    } else {
                        this.skipMov = false;
                    }
                    if (server) {
                        for (var i = 0; i < players.length; ++i) {
                            if (!this.sentTo[players[i].id] && players[i].canSee(this)) {
                                this.sentTo[players[i].id] = 1;
                                server.send(players[i].id, "18", UTILS.fixTo(this.x, 1), UTILS.fixTo(this.y, 1), UTILS.fixTo(this.dir, 2), UTILS.fixTo(this.range, 1), this.speed, this.indx, this.layer, this.sid);
                            }
                        }
                        objectsHit.length = 0;
                        for (var i = 0; i < players.length + ais.length; ++i) {
                            tmpObj = players[i] || ais[i - players.length];
                            if (tmpObj.alive && tmpObj != this.owner && (!this.owner.team || tmpObj.team != this.owner.team)) {
                                if (UTILS.lineInRect(tmpObj.x - tmpObj.scale, tmpObj.y - tmpObj.scale, tmpObj.x + tmpObj.scale, tmpObj.y + tmpObj.scale, this.x, this.y, this.x + tmpSpeed * Math.cos(this.dir), this.y + tmpSpeed * Math.sin(this.dir))) {
                                    objectsHit.push(tmpObj);
                                }
                            }
                        }
                        var tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                        for (var x = 0; x < tmpList.length; ++x) {
                            for (var y = 0; y < tmpList[x].length; ++y) {
                                tmpObj = tmpList[x][y];
                                tmpScale = tmpObj.getScale();
                                if (tmpObj.active && this.ignoreObj != tmpObj.sid && this.layer <= tmpObj.layer && objectsHit.indexOf(tmpObj) < 0 && !tmpObj.ignoreCollision && UTILS.lineInRect(tmpObj.x - tmpScale, tmpObj.y - tmpScale, tmpObj.x + tmpScale, tmpObj.y + tmpScale, this.x, this.y, this.x + tmpSpeed * Math.cos(this.dir), this.y + tmpSpeed * Math.sin(this.dir))) {
                                    objectsHit.push(tmpObj);
                                }
                            }
                        } // HIT OBJECTS:
                        if (objectsHit.length > 0) {
                            var hitObj = null;
                            var shortDist = null;
                            var tmpDist = null;
                            for (var i = 0; i < objectsHit.length; ++i) {
                                tmpDist = UTILS.getDistance(this.x, this.y, objectsHit[i].x, objectsHit[i].y);
                                if (shortDist == null || tmpDist < shortDist) {
                                    shortDist = tmpDist;
                                    hitObj = objectsHit[i];
                                }
                            }
                            if (hitObj.isPlayer || hitObj.isAI) {
                                var tmpSd = (hitObj.weightM || 1) * 0.3;
                                hitObj.xVel += tmpSd * Math.cos(this.dir);
                                hitObj.yVel += tmpSd * Math.sin(this.dir);
                                if (hitObj.weaponIndex == undefined || !items.weapons[hitObj.weaponIndex].shield || !(UTILS.getAngleDist(this.dir + Math.PI, hitObj.dir) <= config.shieldAngle)) {
                                    hitObj.changeHealth(-this.dmg, this.owner, this.owner);
                                }
                            } else {
                                if (hitObj.projDmg && hitObj.health && hitObj.changeHealth(-this.dmg)) {
                                    objectManager.disableObj(hitObj);
                                }
                                for (var i = 0; i < players.length; ++i) {
                                    if (players[i].active) {
                                        if (hitObj.sentTo[players[i].id]) {
                                            if (hitObj.active) {
                                                if (players[i].canSee(hitObj)) {
                                                    server.send(players[i].id, "8", UTILS.fixTo(this.dir, 2), hitObj.sid);
                                                }
                                            } else {
                                                server.send(players[i].id, "12", hitObj.sid);
                                            }
                                        }
                                        if (!hitObj.active && hitObj.owner == players[i]) {
                                            players[i].changeItemCount(hitObj.group.id, -1);
                                        }
                                    }
                                }
                            }
                            this.active = false;
                            for (var i = 0; i < players.length; ++i) {
                                if (this.sentTo[players[i].id]) {
                                    server.send(players[i].id, "19", this.sid, UTILS.fixTo(shortDist, 1));
                                }
                            }
                        }
                    }
                }
            };
        }; /***/
    },
    /***/"./src/js/data/projectileManager.js":
    /*!******************************************!*\
    !*** ./src/js/data/projectileManager.js ***!
    \******************************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        module.exports = function (Projectile, projectiles, players, ais, objectManager, items, config, UTILS, server) {
            this.addProjectile = function (x, y, dir, range, speed, indx, owner, ignoreObj, layer) {
                var tmpData = items.projectiles[indx];
                var tmpProj;
                for (var i = 0; i < projectiles.length; ++i) {
                    if (!projectiles[i].active) {
                        tmpProj = projectiles[i];
                        break;
                    }
                }
                if (!tmpProj) {
                    tmpProj = new Projectile(players, ais, objectManager, items, config, UTILS, server);
                    tmpProj.sid = projectiles.length;
                    projectiles.push(tmpProj);
                }
                tmpProj.init(indx, x, y, dir, speed, tmpData.dmg, range, tmpData.scale, owner);
                tmpProj.ignoreObj = ignoreObj;
                tmpProj.layer = layer || tmpData.layer;
                tmpProj.src = tmpData.src;
                return tmpProj;
            };
        }; /***/
    },
    /***/"./src/js/data/store.js":
    /*!******************************!*\
    !*** ./src/js/data/store.js ***!
    \******************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // STORE HATS:
        module.exports.hats = [{
            id: 45,
            name: "Shame!",
            dontSell: true,
            price: 0,
            scale: 120,
            desc: "hacks are for losers"
        }, {
            id: 51,
            name: "Moo Cap",
            price: 0,
            scale: 120,
            desc: "coolest mooer around"
        }, {
            id: 50,
            name: "Apple Cap",
            price: 0,
            scale: 120,
            desc: "apple farms remembers"
        }, {
            id: 28,
            name: "Moo Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 29,
            name: "Pig Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 30,
            name: "Fluff Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 36,
            name: "Pandou Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 37,
            name: "Bear Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 38,
            name: "Monkey Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 44,
            name: "Polar Head",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 35,
            name: "Fez Hat",
            price: 0,
            scale: 120,
            desc: "no effect"
        }, {
            id: 42,
            name: "Enigma Hat",
            price: 0,
            scale: 120,
            desc: "join the enigma army"
        }, {
            id: 43,
            name: "Blitz Hat",
            price: 0,
            scale: 120,
            desc: "hey everybody i'm blitz"
        }, {
            id: 49,
            name: "Bob XIII Hat",
            price: 0,
            scale: 120,
            desc: "like and subscribe"
        }, {
            id: 57,
            name: "Pumpkin",
            price: 50,
            scale: 120,
            desc: "Spooooky"
        }, {
            id: 8,
            name: "Bummle Hat",
            price: 100,
            scale: 120,
            desc: "no effect"
        }, {
            id: 2,
            name: "Straw Hat",
            price: 500,
            scale: 120,
            desc: "no effect"
        }, {
            id: 15,
            name: "Winter Cap",
            price: 600,
            scale: 120,
            desc: "allows you to move at normal speed in snow",
            coldM: 1
        }, {
            id: 5,
            name: "Cowboy Hat",
            price: 1000,
            scale: 120,
            desc: "no effect"
        }, {
            id: 4,
            name: "Ranger Hat",
            price: 2000,
            scale: 120,
            desc: "no effect"
        }, {
            id: 18,
            name: "Explorer Hat",
            price: 2000,
            scale: 120,
            desc: "no effect"
        }, {
            id: 31,
            name: "Flipper Hat",
            price: 2500,
            scale: 120,
            desc: "have more control while in water",
            watrImm: true
        }, {
            id: 1,
            name: "Marksman Cap",
            price: 3000,
            scale: 120,
            desc: "increases arrow speed and range",
            aMlt: 1.3
        }, {
            id: 10,
            name: "Bush Gear",
            price: 3000,
            scale: 160,
            desc: "allows you to disguise yourself as a bush"
        }, {
            id: 48,
            name: "Halo",
            price: 3000,
            scale: 120,
            desc: "no effect"
        }, {
            id: 6,
            name: "Soldier Helmet",
            price: 4000,
            scale: 120,
            desc: "reduces damage taken but slows movement",
            spdMult: 0.94,
            dmgMult: 0.75
        }, {
            id: 23,
            name: "Anti Venom Gear",
            price: 4000,
            scale: 120,
            desc: "makes you immune to poison",
            poisonRes: 1
        }, {
            id: 13,
            name: "Medic Gear",
            price: 5000,
            scale: 110,
            desc: "slowly regenerates health over time",
            healthRegen: 3
        }, {
            id: 9,
            name: "Miners Helmet",
            price: 5000,
            scale: 120,
            desc: "earn 1 extra gold per resource",
            extraGold: 1
        }, {
            id: 32,
            name: "Musketeer Hat",
            price: 5000,
            scale: 120,
            desc: "reduces cost of projectiles",
            projCost: 0.5
        }, {
            id: 7,
            name: "Bull Helmet",
            price: 6000,
            scale: 120,
            desc: "increases damage done but drains health",
            healthRegen: -5,
            dmgMultO: 1.5,
            spdMult: 0.96
        }, {
            id: 22,
            name: "Emp Helmet",
            price: 6000,
            scale: 120,
            desc: "turrets won't attack but you move slower",
            antiTurret: 1,
            spdMult: 0.7
        }, {
            id: 12,
            name: "Booster Hat",
            price: 6000,
            scale: 120,
            desc: "increases your movement speed",
            spdMult: 1.16
        }, {
            id: 26,
            name: "Barbarian Armor",
            price: 8000,
            scale: 120,
            desc: "knocks back enemies that attack you",
            dmgK: 0.6
        }, {
            id: 21,
            name: "Plague Mask",
            price: 10000,
            scale: 120,
            desc: "melee attacks deal poison damage",
            poisonDmg: 5,
            poisonTime: 6
        }, {
            id: 46,
            name: "Bull Mask",
            price: 10000,
            scale: 120,
            desc: "bulls won't target you unless you attack them",
            bullRepel: 1
        }, {
            id: 14,
            name: "Windmill Hat",
            topSprite: true,
            price: 10000,
            scale: 120,
            desc: "generates points while worn",
            pps: 1.5
        }, {
            id: 11,
            name: "Spike Gear",
            topSprite: true,
            price: 10000,
            scale: 120,
            desc: "deal damage to players that damage you",
            dmg: 0.45
        }, {
            id: 53,
            name: "Turret Gear",
            topSprite: true,
            price: 10000,
            scale: 120,
            desc: "you become a walking turret",
            turret: {
                proj: 1,
                range: 700,
                rate: 2500
            },
            spdMult: 0.7
        }, {
            id: 20,
            name: "Samurai Armor",
            price: 12000,
            scale: 120,
            desc: "increased attack speed and fire rate",
            atkSpd: 0.78
        }, {
            id: 58,
            name: "Dark Knight",
            price: 12000,
            scale: 120,
            desc: "restores health when you deal damage",
            healD: 0.4
        }, {
            id: 27,
            name: "Scavenger Gear",
            price: 15000,
            scale: 120,
            desc: "earn double points for each kill",
            kScrM: 2
        }, {
            id: 40,
            name: "Tank Gear",
            price: 15000,
            scale: 120,
            desc: "increased damage to buildings but slower movement",
            spdMult: 0.3,
            bDmg: 3.3
        }, {
            id: 52,
            name: "Thief Gear",
            price: 15000,
            scale: 120,
            desc: "steal half of a players gold when you kill them",
            goldSteal: 0.5
        }, {
            id: 55,
            name: "Bloodthirster",
            price: 20000,
            scale: 120,
            desc: "Restore Health when dealing damage. And increased damage",
            healD: 0.25,
            dmgMultO: 1.2
        }, {
            id: 56,
            name: "Assassin Gear",
            price: 20000,
            scale: 120,
            desc: "Go invisible when not moving. Can't eat. Increased speed",
            noEat: true,
            spdMult: 1.1,
            invisTimer: 1000
        }]; // STORE ACCESSORIES:
        module.exports.accessories = [{
            id: 12,
            name: "Snowball",
            price: 1000,
            scale: 105,
            xOff: 18,
            desc: "no effect"
        }, {
            id: 9,
            name: "Tree Cape",
            price: 1000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 10,
            name: "Stone Cape",
            price: 1000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 3,
            name: "Cookie Cape",
            price: 1500,
            scale: 90,
            desc: "no effect"
        }, {
            id: 8,
            name: "Cow Cape",
            price: 2000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 11,
            name: "Monkey Tail",
            price: 2000,
            scale: 97,
            xOff: 25,
            desc: "Super speed but reduced damage",
            spdMult: 1.35,
            dmgMultO: 0.2
        }, {
            id: 17,
            name: "Apple Basket",
            price: 3000,
            scale: 80,
            xOff: 12,
            desc: "slowly regenerates health over time",
            healthRegen: 1
        }, {
            id: 6,
            name: "Winter Cape",
            price: 3000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 4,
            name: "Skull Cape",
            price: 4000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 5,
            name: "Dash Cape",
            price: 5000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 2,
            name: "Dragon Cape",
            price: 6000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 1,
            name: "Super Cape",
            price: 8000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 7,
            name: "Troll Cape",
            price: 8000,
            scale: 90,
            desc: "no effect"
        }, {
            id: 14,
            name: "Thorns",
            price: 10000,
            scale: 115,
            xOff: 20,
            desc: "no effect"
        }, {
            id: 15,
            name: "Blockades",
            price: 10000,
            scale: 95,
            xOff: 15,
            desc: "no effect"
        }, {
            id: 20,
            name: "Devils Tail",
            price: 10000,
            scale: 95,
            xOff: 20,
            desc: "no effect"
        }, {
            id: 16,
            name: "Sawblade",
            price: 12000,
            scale: 90,
            spin: true,
            xOff: 0,
            desc: "deal damage to players that damage you",
            dmg: 0.15
        }, {
            id: 13,
            name: "Angel Wings",
            price: 15000,
            scale: 138,
            xOff: 22,
            desc: "slowly regenerates health over time",
            healthRegen: 3
        }, {
            id: 19,
            name: "Shadow Wings",
            price: 15000,
            scale: 138,
            xOff: 22,
            desc: "increased movement speed",
            spdMult: 1.1
        }, {
            id: 18,
            name: "Blood Wings",
            price: 20000,
            scale: 178,
            xOff: 26,
            desc: "restores health when you deal damage",
            healD: 0.2
        }, {
            id: 21,
            name: "Corrupt X Wings",
            price: 20000,
            scale: 178,
            xOff: 26,
            desc: "deal damage to players that damage you",
            dmg: 0.25
        }]; /***/
    },
    /***/"./src/js/libs/animText.js":
    /*!*********************************!*\
    !*** ./src/js/libs/animText.js ***!
    \*********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // ANIMATED TEXT:
        module.exports.AnimText = function () {
            // INIT:
            this.init = function (x, y, scale, speed, life, text, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.scale = scale;
                this.startScale = this.scale * (document.getElementById("OtherAnimation").checked ? 0.8 : 1);
                this.maxScale = scale * 1.5;
                this.scaleSpeed = 0.7;
                this.speed = speed;
                this.life = 500;
                this.text = text;
                this.movSpeed = Math.random() * 1 + 1;
                this.movAngle = Math.random() * 1 < 0.5;
            };
            // UPDATE:
            this.update = function (delta) {
                if (!this.life) {
                    return;
                }
                if (!document.getElementById("OtherAnimation").checked) {
                    this.life -= delta;
                    this.y -= this.speed * delta;
                    this.scale += this.scaleSpeed * delta;
                    if (this.scale >= this.maxScale) {
                        this.scale = this.maxScale;
                        this.scaleSpeed *= -1;
                    } else if (this.scale <= this.startScale) {
                        this.scale = this.startScale;
                        this.scaleSpeed = 0;
                    }
                    if (this.life <= 0) {
                        this.life = 0;
                    }
                } else {
                    this.life -= delta;
                    if (this.scaleSpeed != -0.35) {
                        this.y -= this.speed * delta;
                        if (this.movAngle) {
                            this.x -= this.speed * delta * this.movSpeed;
                        } else {
                            this.x += this.speed * delta * this.movSpeed;
                        }
                    } else {
                        this.y += this.speed * delta;
                    }
                    this.scale += this.scaleSpeed * (delta / 4.5);
                    this.scale = Math.max(this.scale, this.startScale);
                    if (this.speed < this.speedMax) {
                        this.speed += this.speedMax * 0.01;
                    }
                    if (this.scale >= this.maxScale) {
                        this.scale = this.maxScale;
                        this.scaleSpeed *= -0.5;
                        this.speed = this.speed * 0.5;
                    }
                    if (this.life <= 0) {
                        this.life = 0;
                    }
                }
            };
            // RENDER:
            this.render = function (ctxt, xOff, yOff) {
                if (document.getElementById("OtherAnimation").checked ) {
                    const color = "#3d3f42";
                    const lineWidth = "8";
                    ctxt.save();
                    ctxt.font = this.scale + "px Hammersmith One";
                    ctxt.strokeStyle = color;
                    ctxt.textBaseline = "middle";
                    ctxt.textAlign = "center";
                    ctxt.lineWidth = lineWidth;
                    ctxt.lineJoin = "round";
                    ctxt.strokeText(this.text, this.x - xOff, this.y - yOff);
                    ctxt.restore();
                }
                ctxt.fillStyle = this.color;
                ctxt.font = this.scale + "px Hammersmith One";
                ctxt.fillText(this.text, this.x - xOff, this.y - yOff);
            };
        };
        // TEXT MANAGER:
        module.exports.TextManager = function () {
            this.texts = [];
            // UPDATE:
            this.update = function (delta, ctxt, xOff, yOff) {
                ctxt.textBaseline = "middle";
                ctxt.textAlign = "center";
                for (var i = 0; i < this.texts.length; ++i) {
                    if (this.texts[i].life) {
                        this.texts[i].update(delta);
                        this.texts[i].render(ctxt, xOff, yOff);
                    }
                }
            };
            // SHOW TEXT:
            this.showText = function (x, y, scale, speed, life, text, color) {
                var tmpText;
                for (var i = 0; i < this.texts.length; ++i) {
                    if (!this.texts[i].life) {
                        tmpText = this.texts[i];
                        break;
                    }
                }
                if (!tmpText) {
                    tmpText = new module.exports.AnimText();
                    this.texts.push(tmpText);
                }
                tmpText.init(x, y, scale, speed, life, text, color);
            };
        };
        /***/
    },
    /***/"./src/js/libs/io-client.js":
    /*!**********************************!*\
    !*** ./src/js/libs/io-client.js ***!
    \**********************************/
    /*! no static exports found */ /***/
    function (module, exports, __webpack_require__) {
        var msgpack = window.msgpack
        var config = window.config || {}
        module.exports = {
            socket: null,
            connected: false,
            socketId: -1,
            connect: function (address, callback, events) {
                if (this.socket) {
                    return;
                } // CREATE SOCKET:
                var _this = this;
                try {
                    var socketError = false;
                    var socketAddress = address;
                    this.socket = new OriginalWebSocket(socketAddress);
                    this.socket.binaryType = "arraybuffer";
                    this.socket.addEventListener("message", function (message) {
                        // PARSE MESSAGE:f
                        var data = new Uint8Array(message.data);
                        var parsed = msgpack.decode(data);
                        var type = parsed[0];
                        var data = parsed[1]; // CALL EVENT:
                        if (type == "io-init") {
                            _this.socketId = data[0];
                        } else {
                            events[type].apply(undefined, data);
                        }
                    });
                    this.socket.onopen = function () {
                        _this.connected = true;
                        callback();
                    };
                    this.socket.onclose = function (event) {
                        _this.connected = false;
                        if (event.code == 4001) {
                            callback("Invalid Connection");
                        } else if (!socketError) {
                            callback("disconnected");
                        }
                    };
                    this.socket.onerror = function (error) {
                        if (this.socket && this.socket.readyState != WebSocket.OPEN) {
                            socketError = true;
                            console.error("Socket error", arguments);
                            callback("Socket error");
                        }
                    };
                } catch (e) {
                    console.warn("Socket connection error:", e);
                    callback(e);
                }
            },
            send: function (type) {
                // EXTRACT DATA ARRAY:
                var data = Array.prototype.slice.call(arguments, 1); // SEND MESSAGE:
                var binary = msgpack.encode([type, data]);
                if (type == "F" && data[0] == "1") {
                    addCPS();
                }
                if(type == '9'){
                    window.movementDirection = data[0]
                }
                this.socket.send(binary);
            },
            socketReady: function () {
                return this.socket && this.connected;
            },
            close: function () {
                if (this.socket) {
                    this.socket.close();
                }
            }
        }; /***/
    },
    /***/"./src/js/libs/modernizr.js":
    /*!**********************************!*\
    !*** ./src/js/libs/modernizr.js ***!
    \**********************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        (function (e, n, s) {
            function o(e, n) {
                return typeof e === n;
            }
            function a() {
                var e;
                var n;
                var s;
                var a;
                var t;
                var f;
                var l;
                for (var c in r) {
                    if (r.hasOwnProperty(c)) {
                        e = [];
                        n = r[c];
                        if (n.name && (e.push(n.name.toLowerCase()), n.options && n.options.aliases && n.options.aliases.length)) {
                            for (s = 0; s < n.options.aliases.length; s++) {
                                e.push(n.options.aliases[s].toLowerCase());
                            }
                        }
                        a = o(n.fn, "function") ? n.fn() : n.fn;
                        t = 0;
                        for (; t < e.length; t++) {
                            f = e[t];
                            l = f.split(".");
                            if (l.length === 1) {
                                Modernizr[l[0]] = a;
                            } else {
                                if (!!Modernizr[l[0]] && !(Modernizr[l[0]] instanceof Boolean)) {
                                    Modernizr[l[0]] = new Boolean(Modernizr[l[0]]);
                                }
                                Modernizr[l[0]][l[1]] = a;
                            }
                            i.push((a ? "" : "no-") + l.join("-"));
                        }
                    }
                }
            }
            function t(e) {
                var n = l.className;
                var s = Modernizr._config.classPrefix || "";
                if (c) {
                    n = n.baseVal;
                }
                if (Modernizr._config.enableJSClass) {
                    var o = new RegExp("(^|\\s)" + s + "no-js(\\s|$)");
                    n = n.replace(o, "$1" + s + "js$2");
                }
                if (Modernizr._config.enableClasses) {
                    n += " " + s + e.join(" " + s);
                    if (c) {
                        l.className.baseVal = n;
                    } else {
                        l.className = n;
                    }
                }
            }
            var i = [];
            var r = [];
            var f = {
                _version: "3.5.0",
                _config: {
                    classPrefix: "",
                    enableClasses: true,
                    enableJSClass: true,
                    usePrefixes: true
                },
                _q: [],
                on: function (e, n) {
                    var s = this;
                    setTimeout(function () {
                        n(s[e]);
                    }, 0);
                },
                addTest: function (e, n, s) {
                    r.push({
                        name: e,
                        fn: n,
                        options: s
                    });
                },
                addAsyncTest: function (e) {
                    r.push({
                        name: null,
                        fn: e
                    });
                }
            };
            function Modernizr() {}
            Modernizr.prototype = f;
            Modernizr = new Modernizr();
            var l = n.documentElement;
            var c = l.nodeName.toLowerCase() === "svg";
            Modernizr.addTest("passiveeventlisteners", function () {
                var n = false;
                try {
                    var s = Object.defineProperty({}, "passive", {
                        get: function () {
                            n = true;
                        }
                    });
                    e.addEventListener("test", null, s);
            } catch (o) {}
                return n;
            });
            a();
            t(i);
            delete f.addTest;
            delete f.addAsyncTest;
            for (var u = 0; u < Modernizr._q.length; u++) {
                Modernizr._q[u]();
            }
            e.Modernizr = Modernizr;
        })(window, document);
        /***/
    },
    /***/"./src/js/libs/utils.js":
    /*!******************************!*\
    !*** ./src/js/libs/utils.js ***!
    \******************************/
    /*! no static exports found */ /***/
    function (module, exports) {
        // MATH UTILS:
        var mathABS = Math.abs;
        var mathCOS = Math.cos;
        var mathSIN = Math.sin;
        var mathPOW = Math.pow;
        var mathSQRT = Math.sqrt;
        var mathATAN2 = Math.atan2;
        var mathPI = Math.PI; // GLOBAL UTILS:
        module.exports.randInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        module.exports.randFloat = function (min, max) {
            return Math.random() * (max - min + 1) + min;
        };
        module.exports.lerp = function (value1, value2, amount) {
            return value1 + (value2 - value1) * amount;
        };
        module.exports.decel = function (val, cel) {
            if (val > 0) {
                val = Math.max(0, val - cel);
            } else if (val < 0) {
                val = Math.min(0, val + cel);
            }
            return val;
        };
        module.exports.getDistance = function (x1, y1, x2, y2) {
            return mathSQRT((x2 -= x1) * x2 + (y2 -= y1) * y2);
        };
        module.exports.getDist = function(tmp1, tmp2, type1, type2) {
            let tmpXY1 = {
                x: type1 == 0 ? tmp1.x : type1 == 1 ? tmp1.x1 : type1 == 2 ? tmp1.x2 : type1 == 3 && tmp1.x3,
                y: type1 == 0 ? tmp1.y : type1 == 1 ? tmp1.y1 : type1 == 2 ? tmp1.y2 : type1 == 3 && tmp1.y3,
            };
            let tmpXY2 = {
                x: type2 == 0 ? tmp2.x : type2 == 1 ? tmp2.x1 : type2 == 2 ? tmp2.x2 : type2 == 3 && tmp2.x3,
                y: type2 == 0 ? tmp2.y : type2 == 1 ? tmp2.y1 : type2 == 2 ? tmp2.y2 : type2 == 3 && tmp2.y3,
            };
            return mathSQRT((tmpXY2.x -= tmpXY1.x) * tmpXY2.x + (tmpXY2.y -= tmpXY1.y) * tmpXY2.y);
        }
        ;
        module.exports.getDirection = function (x1, y1, x2, y2) {
            return mathATAN2(y1 - y2, x1 - x2);
        };
        module.exports.getAngleDist = function (a, b) {
            var p = mathABS(b - a) % (mathPI * 2);
            if (p > mathPI) {
                return mathPI * 2 - p;
            } else {
                return p;
            }
        };
        module.exports.isNumber = function (n) {
            return typeof n == "number" && !isNaN(n) && isFinite(n);
        };
        module.exports.isString = function (s) {
            return s && typeof s == "string";
        };
        module.exports.kFormat = function (num) {
            if (num > 999) {
                return (num / 1000).toFixed(1) + "k";
            } else {
                return num;
            }
        };
        module.exports.capitalizeFirst = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        module.exports.fixTo = function (n, v) {
            return parseFloat(n.toFixed(v));
        };
        module.exports.sortByPoints = function (a, b) {
            return parseFloat(b.points) - parseFloat(a.points);
        };
        module.exports.lineInRect = function (recX, recY, recX2, recY2, x1, y1, x2, y2) {
            var minX = x1;
            var maxX = x2;
            if (x1 > x2) {
                minX = x2;
                maxX = x1;
            }
            if (maxX > recX2) {
                maxX = recX2;
            }
            if (minX < recX) {
                minX = recX;
            }
            if (minX > maxX) {
                return false;
            }
            var minY = y1;
            var maxY = y2;
            var dx = x2 - x1;
            if (Math.abs(dx) > 1e-7) {
                var a = (y2 - y1) / dx;
                var b = y1 - a * x1;
                minY = a * minX + b;
                maxY = a * maxX + b;
            }
            if (minY > maxY) {
                var tmp = maxY;
                maxY = minY;
                minY = tmp;
            }
            if (maxY > recY2) {
                maxY = recY2;
            }
            if (minY < recY) {
                minY = recY;
            }
            if (minY > maxY) {
                return false;
            }
            return true;
        };
        module.exports.containsPoint = function (element, x, y) {
            var bounds = element.getBoundingClientRect();
            var left = bounds.left + window.scrollX;
            var top = bounds.top + window.scrollY;
            var width = bounds.width;
            var height = bounds.height;
            var insideHorizontal = x > left && x < left + width;
            var insideVertical = y > top && y < top + height;
            return insideHorizontal && insideVertical;
        };
        module.exports.mousifyTouchEvent = function (event) {
            var touch = event.changedTouches[0];
            event.screenX = touch.screenX;
            event.screenY = touch.screenY;
            event.clientX = touch.clientX;
            event.clientY = touch.clientY;
            event.pageX = touch.pageX;
            event.pageY = touch.pageY;
        };
        module.exports.hookTouchEvents = function (element, skipPrevent) {
            var preventDefault = !skipPrevent;
            var isHovering = false;
            var passive = false;
            element.addEventListener("touchstart", module.exports.checkTrusted(touchStart), passive);
            element.addEventListener("touchmove", module.exports.checkTrusted(touchMove), passive);
            element.addEventListener("touchend", module.exports.checkTrusted(touchEnd), passive);
            element.addEventListener("touchcancel", module.exports.checkTrusted(touchEnd), passive);
            element.addEventListener("touchleave", module.exports.checkTrusted(touchEnd), passive);
            function touchStart(e) {
                module.exports.mousifyTouchEvent(e);
                window.setUsingTouch(true);
                if (preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (element.onmouseover) {
                    element.onmouseover(e);
                }
                isHovering = true;
                if (document.getElementById("MousedownEquipBuy").checked) {
                    if (element.onclick) {
                        element.onclick(e);
                    }
                    if (element.onmouseout) {
                        element.onmouseout(e);
                    }
                    isHovering = false;
                }
            }
            function touchMove(e) {
                module.exports.mousifyTouchEvent(e);
                window.setUsingTouch(true);
                if (preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (module.exports.containsPoint(element, e.pageX, e.pageY)) {
                    if (!isHovering) {
                        if (element.onmouseover) {
                            element.onmouseover(e);
                        }
                        isHovering = true;
                    }
                } else if (isHovering) {
                    if (element.onmouseout) {
                        element.onmouseout(e);
                    }
                    isHovering = false;
                }
            }
            function touchEnd(e) {
                module.exports.mousifyTouchEvent(e);
                window.setUsingTouch(true);
                if (preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (!(document.getElementById("MousedownEquipBuy") && document.getElementById("MousedownEquipBuy").checked) && isHovering) {
                    if (element.onclick) {
                        element.onclick(e);
                    }
                    if (element.onmouseout) {
                        element.onmouseout(e);
                    }
                    isHovering = false;
                }
            }
        };
        module.exports.removeAllChildren = function (element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.lastChild);
            }
        };
        module.exports.generateElement = function (config) {
            var element = document.createElement(config.tag || "div");
            function bind(configValue, elementValue) {
                if (config[configValue]) {
                    element[elementValue] = config[configValue];
                }
            }
            bind("text", "textContent");
            bind("html", "innerHTML");
            bind("class", "className");
            for (var key in config) {
                switch (key) {
                    case "tag":
                    case "text":
                    case "html":
                    case "class":
                    case "style":
                    case "hookTouch":
                    case "parent":
                    case "children":
                    continue;
                    default:
                    break;
                }
                element[key] = config[key];
            }
            if (element.onclick) {
                element.onclick = module.exports.checkTrusted(element.onclick);
                element.addEventListener("mousedown", function(e) {
                    var cb = document.getElementById("MousedownEquipBuy");
                    if (cb && cb.checked && element.onclick) {
                        e.preventDefault();
                        element.onclick(e);
                    }
                });
            }
            if (element.onmouseover) {
                element.onmouseover = module.exports.checkTrusted(element.onmouseover);
            }
            if (element.onmouseout) {
                element.onmouseout = module.exports.checkTrusted(element.onmouseout);
            }
            if (config.style) {
                element.style.cssText = config.style;
            }
            if (config.hookTouch) {
                module.exports.hookTouchEvents(element);
            }
            if (config.parent) {
                config.parent.appendChild(element);
            }
            if (config.children) {
                for (var i = 0; i < config.children.length; i++) {
                    element.appendChild(config.children[i]);
                }
            }
            return element;
        };
        module.exports.eventIsTrusted = function (ev) {
            if (ev && typeof ev.isTrusted == "boolean") {
                return ev.isTrusted;
            } else {
                return true;
            }
        };
        module.exports.checkTrusted = function (callback) {
            return callback
        };
        module.exports.randomString = function (length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };
        module.exports.countInArray = function (array, val) {
            var count = 0;
            for (var i = 0; i < array.length; i++) {
                if (array[i] === val) {
                    count++;
                }
            }
            return count;
        }; /***/
    } /******/
});
