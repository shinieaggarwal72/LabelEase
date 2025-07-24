# LabelEase: Cross-Platform Image Annotation App (Ongoing)

![Progress](https://img.shields.io/badge/progress-early%20stage-orange)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-purple)
![Built with](https://img.shields.io/badge/built%20with-Electron.js-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)


A lightweight, native image annotation tool built with Electron.js to support bounding boxes and polygon segmentation for computer vision datasets. Designed for ease-of-use, speed, and multi-format export compatibility.

> ⚠️ **Note:** This project is under active development. Contributions and feedback are welcome!

<br>
<br>




## Features (Current)

- Upload and view images
- Draw bounding boxes on images using HTML5 Canvas
-  Assign class labels to annotations
-  Export label files in simple format

<br>

## Upcoming Features

- Polygon segmentation support
- Class/category management with shortcuts
- One-click export to popular ML formats:
  - YOLO (txt)
  - COCO (JSON)
  - Pascal VOC (XML)
- Project-level save/load with annotation history
- Performance optimization for large image sets
- Security & sandboxing improvements

<br>

## Technologies Used

- [Electron.js](https://www.electronjs.org/)
- [Node.js](https://nodejs.org/)
- Vanilla JavaScript (ES6+)
- HTML5 Canvas

<br>
<br>

## Getting Started

1. Clone the repository:
  ```bash
  git clone https://github.com/shinieaggarwal72/LabelEase.git
  cd LabelEase
  ```

2. Install dependencies
  ```bash
  npm install
  ```

3. Run the app
  ```bash
  npm start
  ```

<br>

## Design Goals
- Lightweight: under 100MB installer
- Cross-platform: works natively on Windows and Linux
- Easy extensibility for new label formats and tools
- Minimal setup for ML engineers and annotators

<bR>

## Inspiration
This project is inspired by the need for a no-login, offline, fast annotation tool that doesn’t rely on browser environments or heavy dependencies.

<br>

## License
This project is released under the MIT License. See LICENSE for details.

