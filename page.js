const trad = {
    dropZoneText: {
        fr: "Glissez-déposez une ou plusieurs image(s) ici.",
        en: "Drag and drop one or several image(s) here."
    },
    qualityText: {
        fr: "Choisissez la qualité souhaitée (0-100) : ",
        en: "Choose the quality (0-100): "
    },
    compressText: {
        fr: "Compresser !",
        en: "Compress!"
    },
    statText: {
        fr: "Informations sur la compression",
        en: "Information about the compression"
    },
    numberFileText: {
        fr: "Nombre de fichier(s) : ",
        en: "Number of file(s): "
    },
    algorithmText: {
        fr: "Algorithme(s) utilisé(s) : ",
        en: "Algorithm(s) used: "
    },
    inputPathText: {
        fr: "Chemin du (des) fichier(s) d'entrée : ",
        en: "Input file path(s): "
    },
    outputPathText: {
        fr: "Chemin du (des) fichier(s) de sortie : ",
        en: "Output file path(s): "
    },
    inputSizeText: {
        fr: "Taille du (des) fichier(s) avant compression : ",
        en: "Size of the file(s) before compression: "
    },
    outputSizeText: {
        fr: "Taille du (des) fichier(s) après compression : ",
        en: "Size of the file(s) after compression: "
    },
    percentSizeReductionText: {
        fr: "Réduction de la taille : ",
        en: "Size reduction: "
    }
};

// When the language is changed
document.getElementById("lang").addEventListener("change", () => {
    let language = document.getElementById("lang").value;
    for (let att of Object.keys(trad)) {
        document.getElementById(att).textContent = trad[att][language];
    }
});