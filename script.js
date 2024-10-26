// Existing function for the introduction quiz
function checkAnswers() {
    const answersIntro = {
        q1: "address",
        q2: "int *p",
        q3: "&",
        q4: "Dereference",
        q5: "int *p"
    };

    const resultDiv = document.getElementById('result');
    let score = 0;
    let totalQuestions = Object.keys(answersIntro).length;

    for (let q in answersIntro) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answersIntro[q]) {
            score++;
        }
    }

    resultDiv.innerHTML = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
}

// New function for the pointer arithmetic quiz
function checkArithmeticAnswers() {
    const answersArith = {
        q1: "Moves to next element",
        q2: "Moves to next int",
        q3: "Moves to previous element",
        q4: "No",
        q5: "Gives the index difference"
    };

    const resultDiv = document.getElementById('result');
    let score = 0;
    let totalQuestions = Object.keys(answersArith).length;

    for (let q in answersArith) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answersArith[q]) {
            score++;
        }
    }

    resultDiv.innerHTML = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
}

// Attach the appropriate quiz checker based on the page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz')) {
        const submitButton = document.querySelector('button');
        submitButton.onclick = () => {
            if (submitButton.closest('main').querySelector('h1').innerText.includes('Pointer Arithmetic')) {
                checkArithmeticAnswers();
            } else {
                checkAnswers();
            }
        };
    }
});
