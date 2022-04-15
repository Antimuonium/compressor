// Import du package pour gérer facilement les chemins
const path = require('path');

/**
 * Renvoie un nombre formaté (octets, ko, Mo ...)
 * @param {Number} bytes 
 * @param {bool} tooltip Afficher ou non une tooltip en HTML
 * @param {Number} decimals Nombre de chiffres après la virgule
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
 * Renvoie un nombre formaté (sans unité)
 * @param {Number} number 
 * @param {Number} decimals Nombre de chiffres après la virgule
 * @returns {String}
 */
function formatNumber(number, decimals = 1) {
    const dm = decimals < 0 ? 0 : decimals;

    return (number.toFixed(dm)).replace(".", ",");
}


// Drag & drop
function dragOverHandler(ev) {
    document.getElementById("dropZone").style.backgroundColor = "rgb(230,230,230)";

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

var imagePaths = [];

function dropHandler(ev) {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.files) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            imagePaths.push(ev.dataTransfer.files[i].path);
        }
    }
}

// Compression
function compressImage(e) {
    e.preventDefault();

    // Import du package pour compresser images
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

            // Si on glisse-dépose et que le terminal ajoute des guillemets
            if (imagePath.startsWith("'")) {
                imagePath = imagePath.substring(1, imagePath.length - 1);
            }

            // var imagePathFolder = imagePath.includes("\\") ? imagePath.slice(0, imagePath.lastIndexOf("\\") + 1) : imagePath.slice(0, imagePath.lastIndexOf("/") + 1);
            var imagePathFolder = path.dirname(imagePath);
            imagePathFolders.push(imagePathFolder);

            var outputPathFolder = imagePathFolder + path.sep + "compressed_images/";
            outputPathFolders.push(outputPathFolder);

            imagePath = imagePath.replaceAll(path.sep, "/"); // surtout pour Windows afin que la fonction compress s'exécute correctement

            // Fonction de compression - voir https://www.npmjs.com/package/compress-images
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

                // Récupération des statistiques de la compression
                algorithms.push(statistics[0].algorithm);
                inputPaths.push(statistics[0].input);
                outputPaths.push(statistics[0].path_out_new);
                inputSizes.push(statistics[0].size_in);
                outputSizes.push(statistics[0].size_output);
                percentSizeReductions.push(statistics[0].percent);
            });
        }

        // Ajout des informations dans l'HTML
        document.getElementById("numberFile").innerHTML = "Nombre de fichiers : " + numberFile;
        document.getElementById("algorithm").innerHTML = "Algorithme" + (numberFile >= 2 ? "s" : "") + " utilisé" + (numberFile >= 2 ? "s" : "") + " : " + [...new Set(algorithms)].join(", ");
        document.getElementById("inputPath").innerHTML = (numberFile >= 2 ? "<br>" : "") + "Chemin" + (numberFile >= 2 ? "s des" : " du") + " fichier" + (numberFile >= 2 ? "s" : "") + " d'entrée : " + inputPaths.join("<br>");
        document.getElementById("outputPath").innerHTML = (numberFile >= 2 ? "<br>" : "") + "Chemin" + (numberFile >= 2 ? "s des" : " du") + " fichier" + (numberFile >= 2 ? "s" : "") + " de sortie : " + outputPaths.join("<br>");
        document.getElementById("inputSize").innerHTML = "Taille " + (numberFile >= 2 ? "totale des" : "du") + " fichier" + (numberFile >= 2 ? "s" : "") + " avant compression : <span class=\"bold\">" + formatBytes(inputSizes.reduce((partialSum, a) => partialSum + a, 0), 2) + "</span>"; // somme des tailles
        document.getElementById("outputSize").innerHTML = "Taille " + (numberFile >= 2 ? "totale des" : "du") + " fichier" + (numberFile >= 2 ? "s" : "") + " après compression : <span class=\"bold\">" + formatBytes(outputSizes.reduce((partialSum, a) => partialSum + a, 0), 2) + "</span>"; // somme des tailles
        document.getElementById("percentSizeReduction").innerHTML = "Réduction de la taille : <span class=\"important\">" + formatNumber(Math.abs((outputSizes.reduce((partialSum, a) => partialSum + a, 0) - inputSizes.reduce((partialSum, a) => partialSum + a, 0)) / inputSizes.reduce((partialSum, a) => partialSum + a, 0)) * 100, 2) + " %</span>";

        // Vidage de la zone de drag & drop
        imagePaths = [];
        document.getElementById("dropZone").style.backgroundColor = "transparent";
    }

    run();
}

document.getElementById("compressorForm").addEventListener("submit", compressImage);