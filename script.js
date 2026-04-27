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
            <td>${data.count || 1} <small>錯: ${data.wrong || 0}</small></td>
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
    
    // 手機輸入優化：自動全選生字，清空翻譯
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

    let options = [correctTrans];
    let otherTrans = words
        .filter(w => w !== correctWord)
        .map(w => vocabData[w].translation)
        .filter(t => t && t !== correctTrans);
    
    otherTrans.sort(() => 0.5 - Math.random());
    options.push(...otherTrans.slice(0, 3));
    while (options.length < 4) options.push("---");
    options.sort(() => 0.5 - Math.random());

    speak(correctWord);

    content.innerHTML = `
        <div class="quiz-question" style="text-align:center;">
            <button onclick="speak('${correctWord}')" class="audio-btn">聽發音 🔊</button>
            <h2>${correctWord}</h2>
        </div>
        <div class="options-grid">
            ${options.map(opt => `
                <button class="option-btn" onclick="checkQuizAnswer('${opt}', '${correctTrans}', '${correctWord}')">${opt}</button>
            `).join('')}
        </div>
        <div id="feedback" style="margin-top:20px; text-align:center; font-weight:bold; font-size:18px; min-height:24px;"></div>
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
        setTimeout(generateQuiz, 800);
    } else {
        feedback.innerHTML = `❌ 正確答案：${correct}`;
        feedback.style.color = "#ff3b30";
        vocabData[word].wrong = (vocabData[word].wrong || 0) + 1;
        vocabData[word].weight = (vocabData[word].weight || 1) + 10;
        saveAndRender();
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
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

document.getElementById('wordInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('transInput').focus(); });
document.getElementById('transInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addWord(); });

renderTable();
