// Function for checking Introduction quiz answers
function checkAnswers() {
    const answersIntro = {
        q1: "address",
        q2: "int *p",
        q3: "&",
        q4: "Dereference",
        q5: "int *p"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersIntro).length;

    for (let q in answersIntro) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersIntro[q];
        
        resultHtml += `<p>Q: ${document.querySelector(`label[for="${q}"]`).innerText}`;
        
        if (selected) {
            const userAnswer = selected.value;
            resultHtml += ` - Your Answer: <span style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</span>`;
            resultHtml += userAnswer === correctAnswer ? ' (Correct)' : ` (Incorrect - Correct answer: <span style="color: green;">${correctAnswer}</span>)`;
            
            if (userAnswer === correctAnswer) {
                score++;
            }
        } else {
            resultHtml += ' - Your Answer: <span style="color: red;">None</span> (Incorrect)';
        }
        
        resultHtml += '</p>';
    }

    resultHtml += `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = resultHtml;
}

// Function for checking Pointer Arithmetic quiz answers
function checkArithmeticAnswers() {
    const answersArith = {
        q1: "Moves to next element",
        q2: "Moves to next int",
        q3: "Moves to previous element",
        q4: "No",
        q5: "Gives the index difference"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersArith).length;

    for (let q in answersArith) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersArith[q];

        resultHtml += `<p>Q: ${document.querySelector(`label[for="${q}"]`).innerText}`;
        
        if (selected) {
            const userAnswer = selected.value;
            resultHtml += ` - Your Answer: <span style="color: ${userAnswer === correctAnswer ? 'green' : 'red'};">${userAnswer}</span>`;
            resultHtml += userAnswer === correctAnswer ? ' (Correct)' : ` (Incorrect - Correct answer: <span style="color: green;">${correctAnswer}</span>)`;
            
            if (userAnswer === correctAnswer) {
                score++;
            }
        } else {
            resultHtml += ' - Your Answer: <span style="color: red;">None</span> (Incorrect)';
        }

        resultHtml += '</p>';
    }

    resultHtml += `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = resultHtml;
}

// Attach the appropriate quiz checker based on the page and ensure submit button click works
document.addEventListener('DOMContentLoaded', () => {
    const introductionQuiz = document.querySelector('#quiz') ? document.title.includes('Introduction') : false;
    const arithmeticQuiz = document.querySelector('#quiz') && document.title.includes('Pointer Arithmetic');

    const submitButton = document.querySelector('button');
    submitButton.onclick = () => {
        if (introductionQuiz) {
            checkAnswers();
        } else if (arithmeticQuiz) {
            checkArithmeticAnswers();
        }
    };
});
