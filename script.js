function checkAnswers() {
    const answers = {
        q1: "address",
        q2: "int *p",
        q3: "&",
        q4: "Dereference",
        q5: "int *p"
    };

    let score = 0;
    let totalQuestions = Object.keys(answers).length;

    for (let q in answers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answers[q]) {
            score++;
        }
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
}
