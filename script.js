const divOutput = document.getElementById("output");
const divControl = document.getElementById("controlButtons");
const txtInput = document.getElementById("txtInput");
const txtOutput = document.getElementById("txtOutput");
const btnPaste = document.getElementById("btnPaste");
const select = document.getElementById("select");
let btnDone, btnCopy, btnDown;

inicialize();
function inicialize() {
    txtInput.addEventListener("input", txtInputHandler);
    btnPaste.onclick = pasteInput;
    getFunFacts().then((text) => {
        txtInput.value = text;
        txtInputHandler();
    })
}

async function getFunFacts() {
    const request = await fetch("./funFacts.txt");
    const response = await request.text();
    return response;
}

function txtInputHandler() {
    divControl.innerHTML = "";
    if (txtInput.value.trim()) {
        btnDone = setButton("fa-solid fa-check");
        btnDone.onclick = done;
    }
}

function pasteInput() {
    navigator.clipboard
        .readText()
        .then(
            text => {
                txtInput.value = text;
                txtInputHandler();
            },
            err => {
                console.error(err);
            }
        );
}

function setButton(icon) {
    const btn = document.createElement("button");
    const i = document.createElement("i");
    btn.className = "btn btn-info";
    i.className = icon;
    btn.appendChild(i);
    divControl.appendChild(btn);
    return btn;
}

function removeButton(btn) {
    if(btn) {
        btn.remove();
    }
}

function done() {
    txtOutput.value = "";
    const array = clearArray(txtInput.value.split("\n"));
    let arrayCSV, csv;
    if (select.value === "csv") {
        arrayCSV = processArrayCSV(array);
        csv = arrayCSV.join("\n");
    } else if (select.value === "pasteBin") {
        arrayCSV = processArrayPB(array);
        csv = arrayCSV.join(";");
    }

    txtOutput.value = csv;
    divOutput.style.display = "block";

    removeButton(btnCopy);
    removeButton(btnDown);
    
    btnCopy = setButton("fa-solid fa-copy");
    btnCopy.onclick = copyOutput;

    btnDown = setButton("fa-solid fa-download");
    btnDown.onclick = downloadCSV;
}

function clearArray(array) {
    for (let i = array.length - 1; i >= 0; i--) { // clear empty elements in the array
        const elm = array[i];
        if(!elm) {
            array.splice(i, 1);
        }
    }
    return array;
}

function processArrayCSV(array) {
    let arrayCSV = ["header;fact"];

    for (let i = 0; i < array.length; i++) {
        let line = array[i];
        const splitLine = line.split("**");
        splitLine.splice(0, 1);
        if (splitLine.length) {
            splitLine[1] = splitLine[1].replace(": ", "");
            line = splitLine.join(";");
            arrayCSV.push(line);
        }
    }

    return arrayCSV;
}

function processArrayPB(array) {
    let arrayCSV = [];

    let count = 0;
    for (let i = 0; i < array.length; i++) {
        let line = array[i];
        const splitLine = line.split("**");
        splitLine.splice(0, 1);
        if (splitLine.length) {
            count++;
            line = "[Game Fact #" + count + "] ";
            line += splitLine.join("");
            line = line.replaceAll("\"", "\\\"");
            arrayCSV.push(line);
        }
    }
    return arrayCSV;
}

function copyOutput() {
    const text = txtOutput.value;
    navigator.clipboard
        .writeText(text)
        .then(
            success => {
                console.log("copiado com sucesso");
                alert("copiado com sucesso");
            },
            err => {
                console.error(err);
            }
        );
}

function downloadCSV() {
    const textContent = txtOutput.value;
    const textFileAsBlob = new Blob([textContent], {type:'text/plain'});
    const fileNameToSaveAs = 'funFacts.csv';
    const downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }
    downloadLink.click();
}