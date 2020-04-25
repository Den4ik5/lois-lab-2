function validateFormula(formula) {
    return formula.match(/^([10A-Z()|&!~]|->)*$/g) && (formula.match(/^[A-Z10]$/) ||
        (!formula.match(/\)\(/) && !formula.match(/[A-Z10]([^|&~]|(?!->))[10A-Z]/) &&
        !formula.match(/[^(]![A-Z10]/) && !formula.match(/![A-Z10][^)]/) &&
        !formula.match(/\([A-Z10]\)/) && validateBracing(formula)));
}

function validateBracing(formula) {
    if (formula.split('(').length !== formula.split(')').length) { // -1 to both?
        return false;
    }

    let formulaCopy = formula;
    let replacingSymbol = 'X';

    while (formulaCopy.match(/([|&~]|->)/g) || !formulaCopy.match(/^[X()]+$/g)) {
        let snapshot = formulaCopy;

        formulaCopy = formulaCopy.replace(/\(![A-Z01]\)/g, replacingSymbol);
        formulaCopy = formulaCopy.replace(/\([A-Z01]([|&~]|->)[A-Z01]\)/g, replacingSymbol);

        if (formulaCopy === snapshot) {
            return false;
        }
    }

    return formulaCopy === replacingSymbol;
}

var _atoms = [];
var _sets = [];
var _results = [];
var _tableElement = document.getElementById('table');

function check(formula) {
    let messageElement = document.getElementById("message");

    let isFormulaValid = validateFormula(formula);
    messageElement.innerHTML = isFormulaValid ? '' : "Введите корректную формулу";
    _tableElement.innerHTML = '';
    
    if (!isFormulaValid) {
        return;
    }

    messageElement.innerHTML = isInconsistent(formula) ? "Формула противоречива" : "Формула непротиворечива";
    if (_atoms.length !== 0) {
        _tableElement.innerHTML = fillTable(_atoms, _sets, _results);
    }
}

function isInconsistent(formula) {
    let atoms = [...new Set(formula.split(/[^A-Z]/).filter(atom => atom !== ''))];
    if (atoms.length === 0) {
        return false;
    }

    let sets = getValueSets(atoms);
    let results = getResults(formula, atoms, sets);

    _atoms = atoms;
    _sets = sets;
    _results = results;

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

function fillTable(atoms, sets, results) {
    let inner = '';

    inner += '<tr>';
    atoms.forEach(atom => {
        inner  += '<th>' + atom + '</th>'
    });
    inner += '<th><i>F</i></th>'
    inner += '</tr>';

    sets.forEach((set, index) => {
        inner += '<tr>';
        set.forEach(value => {
            inner += '<td>' + value + '</td>'
        });

        inner += '<td>' + results[index] + '</td>';
        inner += '</tr>';       
    });

    return inner;
}