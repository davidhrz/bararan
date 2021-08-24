const textarea = document.querySelector("textarea");
const historyArea = document.querySelector(".history-area");

let timeoutId = 0;
textarea.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(processWord, 500);
});

function translateWord() {
    let headers = new Headers();
    headers.append('User-Agent', 'python-requests/2.26.0');
    headers.append('Accept-Encoding', 'gzip, deflate');
    headers.append('Accept', '*/*');
    headers.append('Connection', 'keep-alive');
    var init = { method: 'GET',
    headers: headers,
    mode: 'same-origin'};
    let request = new Request("https://bararanonline.com/բարև", init);
    fetch(request).then((response) => {
        console.log(response);
    });
}

function addToHistory(word) {
    let li = document.createElement("li");
    li.textContent = word;
    historyArea.querySelector("ul").appendChild(li);
}

function processWord() {
    let input = textarea.value.trim();
    if (input === "") {
        return;
    }
    translateWord();
    addToHistory(input);
}

