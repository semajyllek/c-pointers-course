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
        
        //resultHtml += `<p>Q: ${document.querySelector(`label[for="${q}"]`).innerText}`;
        resultHtml += `<p>Q:`;
		
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

        //resultHtml += `<p>Q: ${document.querySelector(`label[for="${q}"]`).innerText}`;
		resultHtml += `<p>Q:`;
        
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


// Function for checking Pointers and Arrays quiz answers
function checkArrayAnswers() {
    const answersArray = {
        q1: "Both",
        q2: "Points to the first element",
        q3: "Size of the whole array",
        q4: "Pointer to the first element",
        q5: "Both"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersArray).length;

    for (let q in answersArray) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersArray[q];

        //resultHtml += `<p>Q: ${document.querySelector(`label[for="${q}"]`).innerText}`;
		resultHtml += `<p>Q:`;
        
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







// Attach the appropriate quiz checker based on the page
document.addEventListener('DOMContentLoaded', () => {
    // Included logic here can add detection for newly created module content
    const introductionQuiz = document.querySelector('#quiz') ? document.title.includes('Introduction') : false;
    const arithmeticQuiz = document.querySelector('#quiz') && document.title.includes('Pointer Arithmetic');
    const arrayQuiz = document.querySelector('#quiz') && document.title.includes('Pointers and Arrays');

    const submitButton = document.querySelector('button');
    submitButton.onclick = () => {
        if (introductionQuiz) {
            checkAnswers();
        } else if (arithmeticQuiz) {
            checkArithmeticAnswers();
        } else if (arrayQuiz) {
            checkArrayAnswers();
        }
    };
});



