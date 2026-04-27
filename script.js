let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(vocabData).sort((a, b) => new Date(b[1].date) - new Date(a[1].date));

    for (let [word, data] of entries) {
        list.innerHTML += `<tr>
            <td class="selectable" onclick="speak('${word}')">${word} 🔊</td>
            <td>${data.translation || ''}</td>
            <td>${data.count}</td>
        </tr>`;
    }
}

// 發音函式
function speak(text) {
    // 先取消目前正在說的話，避免重疊
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // 設定為美式英文
    utterance.rate = 0.9;     // 語速稍微放慢一點點，聽得更清楚
    window.speechSynthesis.speak(utterance);
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
    
    // 新增完自動讀一遍
    speak(word);

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

    // 生成卡片並立即發音
    speak(randomWord);

    content.innerHTML = `
        <div class="flashcard-wrapper">
            <div class="flashcard" id="card" onclick="this.classList.toggle('is-flipped')">
                <div class="card-front">
                    ${randomWord}
                    <div style="font-size:12px; margin-top:10px;">(點擊翻面)</div>
                </div>
                <div class="card-back">${data.translation || '無翻譯'}</div>
            </div>
        </div>
        <button onclick="speak('${randomWord}')" style="background:#ff9500; margin-bottom:10px;">再聽一次 🔊</button>
    `;
}

// 支援 Enter 跳轉與新增
document.getElementById('wordInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('transInput').focus(); });
document.getElementById('transInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWord(); });

renderTable();
