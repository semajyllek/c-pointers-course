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
	let i = 1;

    for (let q in answersIntro) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersIntro[q];
        
        resultHtml += `<p>Q${i}:`;
		i++;

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
	let i = 1;

    for (let q in answersArith) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersArith[q];

		resultHtml += `<p>Q${i}:`;
		i++;

        
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
	let i = 1;

    for (let q in answersArray) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersArray[q];

		resultHtml += `<p>Q${i}:`;
		i++;
        
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


// Function for checking Pointers and Functions quiz answers
function checkFunctionAnswers() {
    const answersFunction = {
        q1: "Both",
        q2: "Modify the variable",
        q3: "The pointer to the first element is passed",
        q4: "Directly from the function",
        q5: "It moves to the previous memory location of the same type"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersFunction).length;
	let i = 1;

    for (let q in answersFunction) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersFunction[q];

		resultHtml += `<p>Q${i}:`;
		i++;
        
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


// Function for checking Dynamic Memory Allocation quiz answers
function checkDynamicMemoryAnswers() {
    const answersDynamicMemory = {
        q1: "Allocates memory",
        q2: "Memory allocation might fail",
        q3: "Frees allocated memory",
        q4: "To change the size of previously allocated memory",
        q5: "Memory leak occurs"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersDynamicMemory).length;
	let i = 1;

    for (let q in answersDynamicMemory) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersDynamicMemory[q];

		resultHtml += `<p>Q${i}:`;
		i++;
        
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




// Function for checking Advanced Pointers quiz answers
function checkAdvancedPointerAnswers() {
    const answersAdvancedPointer = {
        q1: "Pointer to a function",
        q2: "int **ptr",
        q3: "The element located at row i, column j",
        q4: "To prevent memory leaks",
        q5: "Memory that is not freed"
    };

    let resultHtml = '<h3>Quiz Results</h3>';
    let score = 0;
    let totalQuestions = Object.keys(answersAdvancedPointer).length;

	for (let q in answersAdvancedPointer) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const correctAnswer = answersAdvancedPointer[q];

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





// Update the event listener to accommodate the new module
document.addEventListener('DOMContentLoaded', () => {
    const introductionQuiz = document.querySelector('#quiz') ? document.title.includes('Introduction') : false;
    const arithmeticQuiz = document.querySelector('#quiz') && document.title.includes('Pointer Arithmetic');
    const arrayQuiz = document.querySelector('#quiz') && document.title.includes('Pointers and Arrays');
    const functionQuiz = document.querySelector('#quiz') && document.title.includes('Pointers and Functions');
    const dynamicMemoryQuiz = document.querySelector('#quiz') && document.title.includes('Dynamic Memory Allocation');
    const advancedPointerQuiz = document.querySelector('#quiz') && document.title.includes('Advanced Pointers');

    const submitButton = document.querySelector('button');
    submitButton.onclick = () => {
        if (introductionQuiz) {
            checkAnswers();
        } else if (arithmeticQuiz) {
            checkArithmeticAnswers();
        } else if (arrayQuiz) {
            checkArrayAnswers();
        } else if (functionQuiz) {
            checkFunctionAnswers();
        } else if (dynamicMemoryQuiz) {
            checkDynamicMemoryAnswers();
        } else if (advancedPointerQuiz) {
            checkAdvancedPointerAnswers();
        }
    };
});



