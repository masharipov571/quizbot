// app.js ichidagi kerakli funksiyalarni yangilash
const tg = window.Telegram.WebApp;
tg.expand();

const app = {
    user: {
        id: tg.initDataUnsafe?.user?.id || 123456789,
        first_name: tg.initDataUnsafe?.user?.first_name || 'Foydalanuvchi',
        username: tg.initDataUnsafe?.user?.username || ''
    },
    // ... boshqa o'zgaruvchilar ...

    init() {
        document.getElementById('userNameDisplay').textContent = this.user.first_name.toUpperCase();
        this.checkAdminStatus();
        this.showView('mainMenu');
    },

    // Natijalarni yuklash va diagrammani chizish
    async loadResults() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = 'Yuklanmoqda...';
        try {
            const res = await fetch(`/api/results/${this.user.id}`);
            const data = await res.json();
            
            let tCorrect = 0, tWrong = 0, tTotalPerc = 0;
            data.forEach(r => {
                tCorrect += r.correct_count;
                tWrong += r.incorrect_count;
                tTotalPerc += (r.correct_count / (r.correct_count + r.incorrect_count)) * 100;
            });

            const avg = data.length > 0 ? Math.round(tTotalPerc / data.length) : 0;
            document.getElementById('stTotal').textContent = data.length;
            document.getElementById('stCorrect').textContent = tCorrect;
            document.getElementById('stWrong').textContent = tWrong;
            
            const circle = document.getElementById('avgCircle');
            circle.style.setProperty('--p', `${avg}%`);
            circle.setAttribute('data-text', `${avg}%`);
            document.getElementById('avgText').textContent = avg >= 80 ? "A'lo" : (avg >= 60 ? "Yaxshi" : "Past");

            container.innerHTML = data.map(r => {
                const p = Math.round((r.correct_count / (r.correct_count + r.incorrect_count)) * 100);
                return `
                    <div class="history-item">
                        <div class="h-icon">📝</div>
                        <div class="h-content">
                            <div class="h-name">Quiz #${r.quiz_code}</div>
                            <div class="h-date">${r.date}</div>
                        </div>
                        <div class="h-score-wrap">
                            <span class="h-perc" style="color:${p>=60?'var(--success)':'var(--danger)'}; background:${p>=60?'#f0fdf4':'#fef2f2'};">${p}%</span>
                            <div class="h-total">${r.correct_count}/${r.correct_count+r.incorrect_count}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) { container.innerHTML = 'Xatolik.'; }
    },

    // Quizni ko'rsatish funksiyasini yangilash
    renderQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.finishQuiz();
            return;
        }

        const q = this.currentQuestions[this.currentQuestionIndex];
        const total = this.currentQuestions.length;
        document.getElementById('questionCounter').textContent = `Savol: ${this.currentQuestionIndex + 1}/${total}`;
        document.getElementById('qProgressBar').style.width = `${((this.currentQuestionIndex + 1) / total) * 100}%`;
        
        const container = document.getElementById('questionsContainer');
        container.innerHTML = `
            <p class="q-text">${q.text}</p>
            <div class="options-list">
                ${['a', 'b', 'c', 'd'].map((opt, idx) => `
                    <div class="opt-card" id="opt-${opt}" onclick="app.checkAnswer('${opt}', this)">
                        <div class="opt-label">${String.fromCharCode(65 + idx)}</div>
                        <span>${q['option_' + opt]}</span>
                    </div>
                `).join('')}
            </div>
        `;
        this.startTimer();
    },
    
    // ... boshqa mantiqiy funksiyalar ...
};
