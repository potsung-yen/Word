let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    if (!list) return;
    list.innerHTML = '';
    
    // 按日期排序（最新的在前面）
    const sortedEntries = Object.entries(vocabData).sort((a, b) => {
        return new Date(b[1].date) - new Date(a[1].date);
    });

    for (let [word, data] of sortedEntries) {
        const row = `<tr>
            <td class="selectable" onclick="selectText(this)">${word}</td>
            <td>${data.count}</td>
            <td style="font-size:12px; color:#86868b;">${data.date}</td>
        </tr>`;
        list.innerHTML += row;
    }
}

function selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function addWord() {
    const wInput = document.getElementById('wordInput');
    const word = wInput.value.trim();

    if (!word) return;

    if (vocabData[word]) {
        vocabData[word].count += 1;
        vocabData[word].date = new Date().toLocaleDateString();
    } else {
        vocabData[word] = { 
            count: 1, 
            date: new Date().toLocaleDateString() 
        };
    }
    
    localStorage.setItem('myVocab', JSON.stringify(vocabData));
    renderTable();

    // 重點：自動選取輸入框文字，方便呼叫 iOS 系統選單（查詢/翻譯）
    wInput.focus();
    wInput.setSelectionRange(0, wInput.value.length);
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Word,Count,LastUpdate\n";
    for (let word in vocabData) {
        csvContent += `${word},${vocabData[word].count},${vocabData[word].date}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vocab_backup.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generateQuiz() {
    const quizArea = document.getElementById('quizArea');
    const content = document.getElementById('quizContent');
    const words = Object.keys(vocabData);
    
    if (words.length === 0) {
        alert("請先新增一些生字！");
        return;
    }

    quizArea.style.display = 'block';
    const randomWord = words[Math.floor(Math.random() * words.length)];

    content.innerHTML = `
        <div class="flashcard">${randomWord}</div>
        <p style="font-size:14px; color:#1d1d1f;">請回憶意思，或點擊單字呼叫手機翻譯</p>
    `;
}

document.getElementById('wordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addWord();
});

renderTable();
