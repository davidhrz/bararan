const textarea = document.querySelector("textarea");
const historyArea = document.querySelector(".history-area");
const outputArea = document.querySelector(".output-area");
const errorArea = document.querySelector(".error-area");

// Start translation after user has stopped writing for 1.2 sec
let timeoutId = 0;
textarea.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(processWord, 1200);
});

async function getAutocompletions(inputWord) {
    return await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://bararanonline.com/words/autocomplete?term=${inputWord}`)}`)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Error fetching autocompletions");
        });
}

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

function resetOutputArea() {
    outputArea.innerHTML = "";
    errorArea.style.display = "none";
}

async function processWord() {
    resetOutputArea();

    let input = textarea.value.trim();
    if (input === "") {
        return;
    }

    outputArea.innerHTML = "...";
    let autocompletions = await getAutocompletions(input);
    console.log(autocompletions);

    let translations;
    try {
        translations = await getTranslations(input);
        resetOutputArea();
        translations.forEach(meaning => {
            let output = document.createElement("p");
            output.className = "output-text";
            output.textContent = meaning[0];
            outputArea.appendChild(output);

            if (meaning.length > 1) {
                let subtext = document.createElement("p");
                subtext.className = "output-subtext";
                subtext.textContent = arrayToPrettyStr(meaning.slice(1));
                outputArea.appendChild(subtext);
            }
        });
    }
    catch (error) {
        outputArea.innerHTML = "";
        errorArea.innerHTML = error.message;
        errorArea.style.display = "block";
    }

    console.log(translations);
    addToHistory(input);
}

function arrayToPrettyStr(array) {
    let result = "";

    for (let i = 0; i < array.length; i++) {
        result += array[i];
        if (i != array.length - 1) {
            result += ", ";
        }
    }

    return result;
}
