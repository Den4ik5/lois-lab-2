var formulas = [];
var answers = [];
var countOfQuestions = 10;

function createTest() {
    let formula = generateFormula();
    formulas.push(formula);
    answers.push(isInconsistent(formula) ? "yes" : "no");

    let i = 1;
    
    while (i < countOfQuestions) {
        while (formulas.indexOf(formula) !== -1) {
            formula = generateFormula();
        }
    
        formulas.push(formula);
        answers.push(isInconsistent(formula) ? "yes" : "no");
    
        i++;
    }
}

function renderTest() {
    formulas.forEach((formula, i) => {
        document.body.innerHTML += '<p id="formula'+ i + '">' + formula + '</p>' +
        '<input type="radio" id="no' + i +'" name="name' + i + '" value="нет">' +
        '<label for="no' + i + '">нет</label>' +
        '<input type="radio" id="yes' + i + '" name="name' + i + '" value="да">' +
        '<label for="yes' + i + '">да</label>' +
        '<br><br>';
    });
    document.body.innerHTML += '<button class="button" type="submit" onclick="finishTest()">Завершить тест</button>';
}

createTest();
renderTest();

function isInconsistent(formula) {
    let atoms = [...new Set(formula.split(/[^A-Z]/).filter(atom => atom !== ''))];
    if (atoms.length === 0) {
        return getResult(formula) == 0;
    }

    // формула - просто константа 0
    if (formula.match(/^0$/g)) {
        return false;
    }

    let sets = getValueSets(atoms);
    let results = getResults(formula, atoms, sets);

    return results.every(result => result == 0);
}

function getValueSets(atoms) {
    let sets = [];

    for (let setCounter = 0; setCounter < Math.pow(2, atoms.length); setCounter++) {
        let setCounterBinary = Array.from(setCounter.toString(2));
        if (setCounterBinary.length !== atoms.length) {
            let zerosLeft = Array.from('0'.repeat(atoms.length - setCounterBinary.length));
            setCounterBinary.forEach(digit => zerosLeft.push(digit));

            setCounterBinary = zerosLeft;
        }

        sets.push(setCounterBinary);
    }

    return sets;
}

function getResults(formula, atoms, sets) {
    let results = [];

    sets.forEach(set => {
        let injected = injectAtomsValues(formula, atoms, set);
        results.push(getResult(injected));
    });

    return results;
}

function injectAtomsValues(formula, atoms, set) {
    atoms.forEach((atom, index) => formula = formula.replace(new RegExp(atom, 'g'), set[index]));
    return formula;
}

function getResult(formula) {
    while (!formula.match(/^[01]$/g)) {
        formula = calcUnary(formula);
        formula = calcBinary(formula);
    }

    return formula;
}

function calcBinary(formula) {
    formula = formula.replace(/\(1&1\)/g, '1');
    formula = formula.replace(/\(0&1\)|\(1&0\)|\(0&0\)/g, '0');
    formula = formula.replace(/\(0\|0\)/g, '0');
    formula = formula.replace(/\(0\|1\)|\(1\|0\)|\(1\|1\)/g, '1');
    formula = formula.replace(/\(1~1\)|\(0~0\)/g, '1');
    formula = formula.replace(/\(1~0\)|\(0~1\)/g, '0');
    formula = formula.replace(/\(1->0\)/g, '0');
    formula = formula.replace(/\(0->1\)|\(1->1\)|\(0->0\)/g, '1');

    return formula;
}

function calcUnary(formula) {
    formula = formula.replace(/\(!1\)/g, '0');
    formula = formula.replace(/\(!0\)/g, '1');

    return formula;
}

function randomIntFromOne(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

function generateFormula() {
    let formula = '';
    let countOfArgs = randomIntFromOne(2);
    let countOfGroups = randomIntFromOne(3);
    let atoms = ['H', 'C'];

    for (i = 0; i < countOfGroups; i++) {
        let countOfArgsInParticualarGroup = countOfArgs - randomIntFromOne(countOfArgs) + 1;
        let group = '';

        if (countOfGroups !== 1 && i < countOfGroups - 1) {
            formula += '(';
        }

        for (j = 0; j < countOfArgsInParticualarGroup; j++) {
            if (countOfArgsInParticualarGroup !== 1 && j < countOfArgsInParticualarGroup - 1) {
                group += '(';
            }

            let isNegative = (Math.random() >= 0.5);
            let constantReplacement = (Math.random() >= 0.6) ? ((Math.random() >= 0.3) ? '1' : '0') : null;
            group += (isNegative ? '(!' : '') + (constantReplacement ? constantReplacement : atoms[j]) + (isNegative ? ')' : '');
            if (j < countOfArgsInParticualarGroup - 1) {
                let random  = Math.random();
                group += ((random >= 0.2) ? '|' : (random >= 0.1 ? '&' : (random >= 0.05 ? '~' : '->')));
            }
        }

        for (j = 0; j < countOfArgsInParticualarGroup - 1; j++) {
            if (countOfArgsInParticualarGroup !== 1) {
                group += ')';
            }
        }

        formula += group;

        if (i < countOfGroups - 1) {
            let random  = Math.random();
            formula += ((random >= 0.2) ? '&' : (random >= 0.1 ? '|' : (random >= 0.05 ? '~' : '->')));
        }
    }

    for (j = 0; j < countOfGroups - 1; j++) {
        if (countOfGroups !== 1) {
            formula += ')';
        }
    }

    return formula;
}

function finishTest() {
    let i = 0;
    let stars = 0;
    
    while (i < countOfQuestions) {
        let answer = answers[i];

        let answerElement = document.getElementById(answer + '' + i);
        if (answerElement.checked) {
            stars++;
        }
    
        i++;
    }

    document.body.innerHTML = 'Ваша оценка: ' + stars;
}
