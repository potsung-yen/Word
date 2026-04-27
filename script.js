// 初始化資料庫
let vocabData = JSON.parse(localStorage.getItem('myVocab')) || {};

function renderTable() {
    const list = document.getElementById('wordList');
    list.innerHTML = '';
    for (let word in vocabData) {
        const row = `<tr>
            <td>${word}</td>
            <td>${vocabData[word].count}</td>
            <td>${vocabData[word].date}</td>
        </tr>`;
        list.innerHTML += row;
    }
}

function addWord() {
    const input = document.getElementById('wordInput');
    const word = input.value.trim();
    if (!word) return;

    if (vocabData[word]) {
        vocabData[word].count += 1;
    } else {
        vocabData[word] = { count: 1, date: new Date().toLocaleDateString() };
    }
    
    vocabData[word].date = new Date().toLocaleDateString();
    localStorage.setItem('myVocab', JSON.stringify(vocabData));
    input.value = '';
    renderTable();
}

// 匯出 CSV 功能
function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,生字,次數,最後更新\n";
    for (let word in vocabData) {
        csvContent += `${word},${vocabData[word].count},${vocabData[word].date}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "生字資料庫備份.csv");
    document.body.appendChild(link);
    link.click();
}

// 簡易練習題生成 (選出出現次數最多的前 3 名)
function generateQuiz() {
    const quizArea = document.getElementById('quizArea');
    const content = document.getElementById('quizContent');
    quizArea.style.display = 'block';
    
    const sorted = Object.entries(vocabData).sort((a, b) => b[1].count - a[1].count);
    const topWords = sorted.slice(0, 3);
    
    content.innerHTML = "請練習以下高頻生字造句：<br><ul>" + 
        topWords.map(w => `<li>${w[0]} (出現 ${w[1].count} 次)</li>`).join('') + "</ul>";
}

renderTable();
