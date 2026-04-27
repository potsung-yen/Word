let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(vocabData).sort((a, b) => new Date(b[1].date) - new Date(a[1].date));

    for (let [word, data] of entries) {
        list.innerHTML += `<tr>
            <td class="selectable">${word}</td>
            <td>${data.translation || ''}</td>
            <td>${data.count}</td>
        </tr>`;
    }
}

function addWord() {
    const wInput = document.getElementById('wordInput');
    const tInput = document.getElementById('transInput');
    const word = wInput.value.trim().toUpperCase();
    const translation = tInput.value.trim();

    if (!word) return;

    if (vocabData[word]) {
        vocabData[word].count += 1;
        if (translation) vocabData[word].translation = translation;
    } else {
        vocabData[word] = { translation: translation, count: 1, date: new Date().toISOString() };
    }
    
    localStorage.setItem('myVocab', JSON.stringify(vocabData));
    renderTable();

    // 手機優化：自動反白生字以便查詢，並清空翻譯
    wInput.focus();
    wInput.setSelectionRange(0, wInput.value.length);
    tInput.value = '';
}

function generateQuiz() {
    const quizArea = document.getElementById('quizArea');
    const content = document.getElementById('quizContent');
    const words = Object.keys(vocabData);
    if (words.length === 0) return alert("資料庫是空的！");

    quizArea.style.display = 'block';
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const data = vocabData[randomWord];

    content.innerHTML = `
        <div class="flashcard-wrapper">
            <div class="flashcard" id="card" onclick="this.classList.toggle('is-flipped')">
                <div class="card-front">${randomWord}</div>
                <div class="card-back">${data.translation || '無翻譯'}</div>
            </div>
        </div>
        <p style="font-size:12px; color:#86868b;">點擊卡片翻轉看答案</p>
    `;
}

// 支援 Enter 跳轉與新增
document.getElementById('wordInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('transInput').focus(); });
document.getElementById('transInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') addWord(); });

renderTable();
