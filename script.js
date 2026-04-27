let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    if (!list) return;
    list.innerHTML = '';
    
    // 按時間排序（最新的在上面）
    const sortedEntries = Object.entries(vocabData).sort((a, b) => {
        return new Date(b[1].date) - new Date(a[1].date);
    });

    for (let [word, data] of sortedEntries) {
        const row = `<tr>
            <td class="selectable" onclick="selectText(this)">${word}</td>
            <td>${data.translation || ''}</td>
            <td>${data.count}</td>
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
    const tInput = document.getElementById('transInput');
    const word = wInput.value.trim();
    const translation = tInput.value.trim();

    if (!word) return;

    if (vocabData[word]) {
        vocabData[word].count += 1;
        // 如果這次有輸入新的翻譯，就更新它
        if (translation) vocabData[word].translation = translation;
        vocabData[word].date = new Date().toISOString();
    } else {
        vocabData[word] = { 
            translation: translation,
            count: 1, 
            date: new Date().toISOString()
        };
    }
    
    localStorage.setItem('myVocab', JSON.stringify(vocabData));
    renderTable();

    // 清空輸入框並回到生字欄位
    wInput.value = '';
    tInput.value = '';
    wInput.focus();
}

// 流程優化：Enter 鍵邏輯
document.getElementById('wordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('transInput').focus(); // 生字輸入完跳到翻譯
    }
});

document.getElementById('transInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addWord(); // 翻譯輸入完直接存檔
    }
});

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Word,Translation,Count,Date\n";
    for (let word in vocabData) {
        csvContent += `${word},${vocabData[word].translation},${vocabData[word].count},${vocabData[word].date}\n`;
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
    
    if (words.length === 0) return;

    quizArea.style.display = 'block';
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const data = vocabData[randomWord];

    content.innerHTML = `
        <div class="flashcard" onclick="this.classList.toggle('show-trans')">
            <div class="card-word">${randomWord}</div>
            <div class="card-trans" id="cardTrans" style="visibility:hidden;">${data.translation || '無翻譯'}</div>
        </div>
        <p style="font-size:13px; color:#86868b;">點擊卡片顯示翻譯，按按鈕換題</p>
    `;
    
    // 簡單的點擊顯示邏輯
    document.querySelector('.flashcard').onclick = function() {
        document.getElementById('cardTrans').style.visibility = 'visible';
    };
}

renderTable();
