let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(vocabData).sort((a, b) => (b[1].weight || 0) - (a[1].weight || 0));

    for (let [word, data] of entries) {
        list.innerHTML += `<tr>
            <td class="selectable" onclick="speak('${word}')">${word} 🔊</td>
            <td>${data.translation || ''}</td>
            <td>${data.count || 1} <br><small style="color:red">錯:${data.wrong || 0}</small></td>
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
        vocabData[word].count = (vocabData[word].count || 0) + 1;
        if (translation) vocabData[word].translation = translation;
        vocabData[word].weight = (vocabData[word].weight || 1) + 2; 
    } else {
        vocabData[word] = { translation: translation, count: 1, wrong: 0, correct: 0, weight: 10, date: new Date().toISOString() };
    }
    saveAndRender();
    speak(word);
    wInput.focus();
    wInput.setSelectionRange(0, wInput.value.length);
    tInput.value = '';
}

function getWeightedRandomWord() {
    const words = Object.keys(vocabData);
    let totalWeight = 0;
    const wordPool = [];
    words.forEach(word => {
        const w = vocabData[word].weight || 1;
        totalWeight += w;
        wordPool.push({ word, cumulativeWeight: totalWeight });
    });
    const random = Math.random() * totalWeight;
    return wordPool.find(item => item.cumulativeWeight >= random).word;
}

function generateQuiz() {
    const quizArea = document.getElementById('quizArea');
    const content = document.getElementById('quizContent');
    const words = Object.keys(vocabData);
    if (words.length < 1) return alert("請先新增生字！");

    quizArea.style.display = 'block';
    const correctWord = getWeightedRandomWord();
    const correctTrans = vocabData[correctWord].translation || "無翻譯";

    // 製作選項：正確答案 + 3個干擾項
    let options = [correctTrans];
    let otherTrans = words
        .filter(w => w !== correctWord)
        .map(w => vocabData[w].translation)
        .filter(t => t && t !== correctTrans);
    
    // 隨機打亂並取前3個
    otherTrans.sort(() => 0.5 - Math.random());
    options.push(...otherTrans.slice(0, 3));

    // 如果選項不足4個（資料庫太少），補上填充字
    while (options.length < 4) options.push("---");

    // 最終打亂選項順序
    options.sort(() => 0.5 - Math.random());

    speak(correctWord);

    content.innerHTML = `
        <div class="quiz-question">
            <h2 style="color:#0071e3; font-size:32px;">${correctWord}</h2>
            <button onclick="speak('${correctWord}')" class="audio-btn">聽發音 🔊</button>
        </div>
        <div class="options-grid">
            ${options.map(opt => `
                <button class="option-btn" onclick="checkQuizAnswer('${opt}', '${correctTrans}', '${correctWord}')">${opt}</button>
            `).join('')}
        </div>
        <div id="feedback" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>
    `;
}

function checkQuizAnswer(selected, correct, word) {
    const feedback = document.getElementById('feedback');
    if (selected === correct) {
        feedback.innerHTML = "✅ 正確！";
        feedback.style.color = "#34c759";
        vocabData[word].correct = (vocabData[word].correct || 0) + 1;
        vocabData[word].weight = Math.max(1, (vocabData[word].weight || 1) - 5);
        saveAndRender();
        // 延遲一下進入下一題
        setTimeout(generateQuiz, 800);
    } else {
        feedback.innerHTML = `❌ 錯了！正確答案是：${correct}`;
        feedback.style.color = "#ff3b30";
        vocabData[word].wrong = (vocabData[word].wrong || 0) + 1;
        vocabData[word].weight = (vocabData[word].weight || 1) + 10;
        saveAndRender();
        // 不自動跳題，讓使用者看清楚答案
    }
}

function saveAndRender() {
    localStorage.setItem('myVocab', JSON.stringify(vocabData));
    renderTable();
}

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
}

document.getElementById('wordInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('transInput').focus(); });
document.getElementById('transInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWord(); });

renderTable();
