// Import of the package to manage paths easily
const path = require('path');

/**
 * Returns a formatted number (octets, ko, Mo ...)
 * @param {Number} bytes 
 * @param {bool} tooltip Display of an HTML tooltip or not
 * @param {Number} decimals Number of decimals
 * @returns {String}
 */
function formatBytes(bytes, tooltip = true, decimals = 2) {
    if (bytes === 0) return "0 octet";
    if (bytes < 2) return parseFloat(bytes.toFixed(decimals)).toString().replace(".", ",") + " octet";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["octets", 'ko', 'Mo', 'Go'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]).replace(".", ",");
}

/**
 * Returns a formatted number (without unit)
 * @param {Number} number 
 * @param {Number} decimals Number of decimals
 * @returns {String}
 */
function formatNumber(number, decimals = 1) {
    const dm = decimals < 0 ? 0 : decimals;

    return (number.toFixed(dm)).replace(".", ",");
}


// Drag & drop
function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

var imagePaths = [];

function dropHandler(ev) {
    document.getElementById("dropZone").style.backgroundColor = "rgb(230,230,230)";
    console.log('File(s) dropped');
    document.getElementById("dropZoneText").innerHTML = ev.dataTransfer.files.length + (ev.dataTransfer.files.length >= 2 ? trad["dropText"][language].replaceAll("(s)", "s") : trad["dropText"][language].replaceAll("(s)", ""));

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.files) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            imagePaths.push(ev.dataTransfer.files[i].path);
        }

        // If the file type is not allowed
        const allowedExtensions = ["jpg", "jpeg", "png", "svg", "gif"];
        const qualityExtensions = ["jpg", "jpeg", "png"];
        document.getElementById("errorDragDrop").innerHTML = "";

        for (var i = imagePaths.length - 1; i >= 0; i--) {
            let extension = imagePaths[i].split(".")[imagePaths[i].split(".").length - 1];
            extension = extension.toLowerCase();

            if (!allowedExtensions.includes(extension)) {
                document.getElementById("errorDragDrop").innerHTML += trad["errorDragDropText"][language].replace("%path%", imagePaths[i]);
                imagePaths.splice(i, 1);
            } else {
                if (!qualityExtensions.includes(extension) && (imagePaths.length == 1)) { // If it is not JPEG, JPG or PNG
                    document.getElementById("quality").setAttribute("disabled", "");
                    document.getElementById("qualityText").className += "gray";
                }
            }
        }
    }
}

// Compression
function compressImage(e) {
    e.preventDefault();

    // Import of the package to compress images
    const { compress } = require("compress-images/promise");

    async function run() {
        var quality = document.getElementById("quality").value;

        var imagePathFolders = [];
        var outputPathFolders = [];

        var numberFile = imagePaths.length;
        var algorithms = [];
        var inputPaths = [];
        var outputPaths = [];
        var inputSizes = [];
        var outputSizes = [];
        var percentSizeReductions = [];

        for (var i = 0; i < imagePaths.length; i++) {
            var imagePath = imagePaths[i];

            // If we drag and drop and that the terminal adds quotation marks
            if (imagePath.startsWith("'")) {
                imagePath = imagePath.substring(1, imagePath.length - 1);
            }

            // var imagePathFolder = imagePath.includes("\\") ? imagePath.slice(0, imagePath.lastIndexOf("\\") + 1) : imagePath.slice(0, imagePath.lastIndexOf("/") + 1);
            var imagePathFolder = path.dirname(imagePath);
            imagePathFolders.push(imagePathFolder);

            var outputPathFolder = imagePathFolder + path.sep + "compressed_images/";
            outputPathFolders.push(outputPathFolder);

            imagePath = imagePath.replaceAll(path.sep, "/"); // surtout pour Windows afin que la fonction compress s'exécute correctement

            // Compression function - see https://www.npmjs.com/package/compress-images
            await compress({
                source: imagePath,
                destination: outputPathFolder,
                enginesSetup: {
                    jpg: { engine: 'mozjpeg', command: ['-quality', quality] },
                    png: { engine: 'pngquant', command: ['--quality=' + quality + '-' + quality, '-o'] },
                    svg: { engine: 'svgo', command: '--multipass' },
                    gif: { engine: 'gifsicle', command: ['--optimize'] }
                }
            }).then((results) => {
                var errors = results.errors;
                var statistics = results.statistics;

                // Gathering of compression statistics
                algorithms.push(statistics[0].algorithm);
                inputPaths.push(statistics[0].input);
                outputPaths.push(statistics[0].path_out_new);
                inputSizes.push(statistics[0].size_in);
                outputSizes.push(statistics[0].size_output);
                percentSizeReductions.push(statistics[0].percent);
            });
        }

        // Adding information in HTML
        document.getElementById("numberFile").innerHTML = numberFile;
        document.getElementById("algorithm").innerHTML = [...new Set(algorithms)].join(", ");
        document.getElementById("inputPath").innerHTML = (numberFile >= 2 ? "<br>" : "") + inputPaths.join("<br>");
        document.getElementById("outputPath").innerHTML = (numberFile >= 2 ? "<br>" : "") + outputPaths.join("<br>");
        document.getElementById("inputSize").className = "bold";
        document.getElementById("inputSize").innerHTML = formatBytes(inputSizes.reduce((partialSum, a) => partialSum + a, 0), 2); // somme des tailles
        document.getElementById("outputSize").className = "bold";
        document.getElementById("outputSize").innerHTML = formatBytes(outputSizes.reduce((partialSum, a) => partialSum + a, 0), 2); // somme des tailles
        document.getElementById("percentSizeReduction").className = "important";
        document.getElementById("percentSizeReduction").innerHTML = formatNumber(Math.abs((outputSizes.reduce((partialSum, a) => partialSum + a, 0) - inputSizes.reduce((partialSum, a) => partialSum + a, 0)) / inputSizes.reduce((partialSum, a) => partialSum + a, 0)) * 100, 2) + " %";

        // Emptying the drag and drop zone
        imagePaths = [];
        document.getElementById("dropZone").style.backgroundColor = "transparent";
        document.getElementById("dropZoneText").innerHTML = trad["dropZoneText"][language];
    }

    run();
}

document.getElementById("compressorForm").addEventListener("submit", compressImage);