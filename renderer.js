const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const uploadBtn = document.getElementById("select-folder");
const nextBtn = document.getElementById("next-image");
const prevBtn = document.getElementById("prev-image");
const addClassBtn = document.getElementById("add-class-btn");
const doneBtn = document.getElementById("done-btn");
const formatSelector = document.getElementById("format-selector");
const classSelector = document.getElementById("class-selector");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

let imagePaths = [];
let currentIndex = 0;
let annotations = {}; 
let folderPath = "";
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentRect = null;
const classColors = {}; 

uploadBtn.addEventListener("click", async () => {
  folderPath = await ipcRenderer.invoke('dialog:openFolder');
  if (folderPath) {
    fs.readdir(folderPath, (err, files) => {
      if (err) return;
      imagePaths = files.filter(f => /\.(png|jpe?g|bmp|gif)$/i.test(f)).map(f => path.join(folderPath, f));
      if (imagePaths.length === 0) {
        status.textContent = "No images found in the selected folder.";
      } else {
        currentIndex = 0;
        loadImage();
        promptForClasses();
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  addClassBtn.addEventListener("click", () => {
    const modal = document.getElementById("class-input-modal");
    const input = document.getElementById("class-input");
    const saveBtn = document.getElementById("class-save-btn");

    modal.style.display = "block";
    input.value = "";

    saveBtn.onclick = () => {
      const newClass = input.value.trim();
      modal.style.display = "none";
      if (newClass) {
        const option = document.createElement("option");
        option.value = newClass;
        option.textContent = newClass;
        classSelector.appendChild(option);
        if (!classColors[newClass]) {
          classColors[newClass] = getRandomColor();
        }
      }
    };
  });

  doneBtn.addEventListener("click", () => {
    if (!folderPath) return;

    const outputDir = path.join(folderPath, "annotations");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const selectedFormat = formatSelector.value;
    const classList = Array.from(classSelector.options)
      .filter(opt => opt.value)
      .map(opt => opt.value);

    for (const imgPath in annotations) {
      const imgName = path.basename(imgPath, path.extname(imgPath));
      const txtPath = path.join(outputDir, `${imgName}.txt`);

      let content = "";
      const boxes = annotations[imgPath] || [];
      boxes.forEach(a => {
        if (selectedFormat === "yolo") {
          const clsIdx = classList.indexOf(a.label);
          const xCenter = (a.x + a.width / 2) / canvas.width;
          const yCenter = (a.y + a.height / 2) / canvas.height;
          const wNorm = a.width / canvas.width;
          const hNorm = a.height / canvas.height;
          content += `${clsIdx} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${wNorm.toFixed(6)} ${hNorm.toFixed(6)}\n`;
        } else {
          content += `${a.label} ${a.x} ${a.y} ${a.width} ${a.height}\n`;
        }
      });
      fs.writeFileSync(txtPath, content.trim());
    }
    alert(`Annotations saved in: ${outputDir}`);
  });
});

function promptForClasses() {
  classSelector.innerHTML = '<option value="" disabled selected>Select Class</option>';
  const modal = document.getElementById("class-input-modal");
  const input = document.getElementById("class-input");
  const saveBtn = document.getElementById("class-save-btn");

  modal.style.display = "block";
  input.value = "";

  saveBtn.onclick = () => {
    const classInput = input.value;
    modal.style.display = "none";

    if (!classInput) return;

    const classes = classInput.split(",").map(c => c.trim()).filter(Boolean);
    classes.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls;
      option.textContent = cls;
      classSelector.appendChild(option);
      if (!classColors[cls]) {
        classColors[cls] = getRandomColor();
      }
    });
  };
}

function loadImage() {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    status.textContent = `${currentIndex + 1} of ${imagePaths.length}`;
    redrawCanvas();
  };
  img.src = imagePaths[currentIndex];
}

nextBtn.addEventListener("click", () => {
  if (imagePaths.length === 0) return;
  if (currentIndex < imagePaths.length - 1) {
    currentIndex++;
    loadImage();
  }
});

prevBtn.addEventListener("click", () => {
  if (imagePaths.length === 0) return;
  if (currentIndex > 0) {
    currentIndex--;
    loadImage();
  }
});

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  currentRect = {
    x: Math.min(startX, mouseX),
    y: Math.min(startY, mouseY),
    width: Math.abs(startX - mouseX),
    height: Math.abs(startY - mouseY)
  };

  redrawCanvas();
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing && currentRect) {
    const selectedClass = classSelector.value;
    if (!selectedClass) {
      alert("Please select a class before annotating.");
      currentRect = null;
      isDrawing = false;
      redrawCanvas();
      return;
    }
    const imgPath = imagePaths[currentIndex];
    if (!annotations[imgPath]) annotations[imgPath] = [];

    if (!classColors[selectedClass]) {
      classColors[selectedClass] = getRandomColor();
    }

    annotations[imgPath].push({ ...currentRect, label: selectedClass });
    currentRect = null;
    isDrawing = false;
    redrawCanvas();
  }
});

function redrawCanvas() {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgPath = imagePaths[currentIndex];
    const boxes = annotations[imgPath] || [];

    boxes.forEach(box => {
      if (!classColors[box.label]) {
        classColors[box.label] = getRandomColor();
      }
      ctx.strokeStyle = classColors[box.label];
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.fillStyle = classColors[box.label];
      ctx.font = "16px Arial";
      ctx.fillText(box.label, box.x + 4, box.y + 16);
    });

    if (currentRect) {
      ctx.strokeStyle = "blue";
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  };
  img.src = imagePaths[currentIndex];
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
}
