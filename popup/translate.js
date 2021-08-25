const textarea = document.querySelector("textarea");
const historyArea = document.querySelector(".history-area");
const outputText = document.querySelector(".output-text");

// Start translation after user has stopped writing for 1.2 sec
let timeoutId = 0;
textarea.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(processWord, 1200);
});

// Returns an array that contains arrays of words. Each array represents a meaning of the word
async function getTranslations(inputWord) {
    return await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://bararanonline.com/${inputWord}`)}`)
        .then(response => {
            if (response.ok) return response.text();
            throw new Error("Error fetching page");
        })
        .then(data => {
            let page = document.createElement('html');
            page.innerHTML = data;

            let translationHeader = page.querySelector("#անգլերեն-թարգմանություն");
            if (translationHeader === null) {
                throw new Error("Word not found");
            }

            let translation = translationHeader.parentNode.nextElementSibling;
            if (translation.querySelector(".no-content") !== null) {
                throw new Error("Translation unavailable");
            }
            else if (translation.childNodes.length === 1) {
                // If there's only one meaning, we don't need to filter or slice the textContent
                return new Array(translation.firstChild.textContent.trim().split(','));
            }
            else {
                // If there's more than one meaning, we filter out non-text tags and slice out the indices (e.g. "1) ")
                return Array.from(translation.childNodes)
                .filter(child => child.tagName === undefined)
                .map(textNode => textNode.textContent.trim().slice(3).split(','));
            }
        });
}

function addToHistory(word) {
    let li = document.createElement("li");
    li.textContent = word;
    historyArea.querySelector("ul").appendChild(li);
}

async function processWord() {
    outputText.textContent = "";
    outputText.style.backgroundColor = "transparent";
    let input = textarea.value.trim();
    if (input === "") {
        return;
    }
    
    outputText.textContent = "...";
    let translations;
    try {
        translations = await getTranslations(input);
        outputText.textContent = translations[0][0];
    }
    catch (error) {
        outputText.textContent = error;
        outputText.style.backgroundColor = "#faa2a9";
        outputText.style.color = "#842029";
    }

    console.log(translations);
    addToHistory(input);
}
