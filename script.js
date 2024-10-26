// Function for checking Introduction quiz answers
function checkAnswers() {
    const answersIntro = {
        q1: "address",
        q2: "int *p",
        q3: "&",
        q4: "Dereference",
        q5: "int *p"
    };

    let score = 0;
    let totalQuestions = Object.keys(answersIntro).length;

    for (let q in answersIntro) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answersIntro[q]) {
            score++;
        }
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
}

// Function for checking Pointer Arithmetic quiz answers
function checkArithmeticAnswers() {
    const answersArith = {
        q1: "Moves to next element",
        q2: "Moves to the address of the next int element",
        q3: "Moves to previous element",
        q4: "No",
        q5: "Gives the index difference"
    };

    let score = 0;
    let totalQuestions = Object.keys(answersArith).length;

    for (let q in answersArith) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answersArith[q]) {
            score++;
        }
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
}

// Attach the appropriate quiz checker based on the page and ensure submit button click works
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz')) {
        const submitButton = document.querySelector('button');
        submitButton.onclick = () => {
            if (document.title.includes('Pointer Arithmetic')) {
                checkArithmeticAnswers();
            } else {
                checkAnswers();
            }
        };
    }
});
