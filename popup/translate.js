const translateButton = document.querySelector("button");
const textarea = document.querySelector("textarea");
const outputArea = document.querySelector(".output-area");

translateButton.addEventListener('click', () => {
    let result = document.createElement("p");
    result.nodeValue = textarea.value;
    outputArea.appendChild(result);

});
