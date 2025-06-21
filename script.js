class DarkCalculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.resultElement = document.getElementById('result');
        this.lastAnswerElement = document.getElementById('lastAnswer');
        this.lastAnswer = '0'; // Store last answer
        this.usingAns = false; // Track if Ans is being used
        this.init();
    }

    init() {
        this.updateDisplay();
        this.addEventListeners();
    }

    addEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.inputNumber(e.target.dataset.number);
                this.animateButton(e.target);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.inputOperator(e.target.dataset.operator);
                this.animateButton(e.target);
                this.setActiveOperator(e.target);
            });
        });

        // Function buttons
        document.querySelector('[data-action="clear"]').addEventListener('click', (e) => {
            this.clear();
            this.animateButton(e.target);
        });

        document.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            this.delete();
            this.animateButton(e.target);
        });

        // Extra row function buttons
        document.querySelector('[data-action="percent"]').addEventListener('click', (e) => {
            this.percent();
            this.animateButton(e.target);
        });
        document.querySelector('[data-action="toggle-sign"]').addEventListener('click', (e) => {
            this.toggleSign();
            this.animateButton(e.target);
        });
        document.querySelector('[data-action="reciprocal"]').addEventListener('click', (e) => {
            this.reciprocal();
            this.animateButton(e.target);
        });
        document.querySelector('[data-action="square"]').addEventListener('click', (e) => {
            this.square();
            this.animateButton(e.target);
        });

        // Ans button
        document.querySelector('[data-action="ans"]').addEventListener('click', (e) => {
            this.inputAns();
            this.animateButton(e.target);
        });

        // Decimal button
        document.querySelector('[data-decimal]').addEventListener('click', (e) => {
            this.inputDecimal();
            this.animateButton(e.target);
        });

        // Equals button
        document.querySelector('[data-equals]').addEventListener('click', (e) => {
            this.calculate();
            this.animateButton(e.target);
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    inputNumber(number) {
        if (this.waitingForOperand || this.usingAns) {
            this.currentOperand = number;
            this.waitingForOperand = false;
            this.usingAns = false;
        } else {
            if (this.currentOperand === '0') {
                this.currentOperand = number;
            } else {
                if (this.currentOperand.length < 9) {
                    this.currentOperand += number;
                }
            }
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand || this.usingAns) {
            this.currentOperand = '0.';
            this.waitingForOperand = false;
            this.usingAns = false;
        } else if (this.currentOperand.indexOf('.') === -1) {
            this.currentOperand += '.';
        }
        this.updateDisplay();
    }

    inputOperator(nextOperator) {
        let inputValue;
        if (this.usingAns) {
            inputValue = parseFloat(this.lastAnswer);
            this.usingAns = false;
        } else {
            inputValue = parseFloat(this.currentOperand);
        }
        if (this.previousOperand === '') {
            this.previousOperand = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousOperand || 0;
            const newValue = this.performCalculation();
            if (newValue === null) return;
            this.currentOperand = String(newValue);
            this.previousOperand = newValue;
        }
        this.waitingForOperand = true;
        this.operation = nextOperator;
        this.updateDisplay();
    }

    performCalculation() {
        let result;
        const previous = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(previous) || isNaN(current)) return null;

        switch (this.operation) {
            case '+':
                result = previous + current;
                break;
            case '-':
                result = previous - current;
                break;
            case '×':
                result = previous * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return null;
                }
                result = previous / current;
                break;
            default:
                return null;
        }

        // Round to avoid floating point errors
        result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
        
        // Handle very large numbers
        if (result.toString().length > 9) {
            if (Math.abs(result) > 999999999) {
                result = result.toExponential(3);
            } else {
                result = parseFloat(result.toFixed(6));
            }
        }

        return result;
    }

    calculate() {
        if (this.operation && !this.waitingForOperand) {
            let operand = this.currentOperand;
            if (this.usingAns) {
                operand = this.lastAnswer;
                this.usingAns = false;
            }
            const prevCurrent = this.currentOperand;
            this.currentOperand = operand;
            const newValue = this.performCalculation();
            if (newValue !== null) {
                this.currentOperand = String(newValue);
                this.lastAnswer = this.currentOperand; // Store last answer
                this.previousOperand = '';
                this.operation = null;
                this.waitingForOperand = true;
                this.updateDisplay();
            } else {
                this.currentOperand = prevCurrent;
            }
        }
        this.clearActiveOperator();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.clearActiveOperator();
        this.resultElement.classList.remove('error');
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand !== '0') {
            if (this.currentOperand.length > 1) {
                this.currentOperand = this.currentOperand.slice(0, -1);
            } else {
                this.currentOperand = '0';
            }
            this.updateDisplay();
        }
    }

    percent() {
        let value = this.usingAns ? parseFloat(this.lastAnswer) : parseFloat(this.currentOperand);
        if (!isNaN(value)) {
            this.currentOperand = String(value / 100);
            this.usingAns = false;
            this.updateDisplay();
        }
    }

    toggleSign() {
        let value = this.usingAns ? this.lastAnswer : this.currentOperand;
        if (value === '0' || value === 'Ans') return;
        if (value.startsWith('-')) {
            value = value.substring(1);
        } else {
            value = '-' + value;
        }
        this.currentOperand = value;
        this.usingAns = false;
        this.updateDisplay();
    }

    reciprocal() {
        let value = this.usingAns ? parseFloat(this.lastAnswer) : parseFloat(this.currentOperand);
        if (value === 0) {
            this.showError();
            return;
        }
        this.currentOperand = String(1 / value);
        this.usingAns = false;
        this.updateDisplay();
    }

    square() {
        let value = this.usingAns ? parseFloat(this.lastAnswer) : parseFloat(this.currentOperand);
        this.currentOperand = String(value * value);
        this.usingAns = false;
        this.updateDisplay();
    }

    showError() {
        this.resultElement.textContent = 'Error';
        this.resultElement.classList.add('error');
        this.resultElement.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            this.clear();
            this.resultElement.style.animation = '';
        }, 1500);
    }

    inputAns() {
        this.usingAns = true;
        this.resultElement.textContent = 'Ans';
    }

    updateDisplay() {
        if (!this.resultElement.classList.contains('error')) {
            if (this.usingAns) {
                this.resultElement.textContent = 'Ans';
            } else {
                this.resultElement.textContent = this.formatNumber(this.currentOperand);
            }
        }
        if (this.lastAnswerElement) {
            this.lastAnswerElement.textContent = 'Ans: ' + this.lastAnswer;
        }
    }

    formatNumber(number) {
        if (number.includes('e')) return number; // Scientific notation
        
        const parts = number.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        if (integerPart.length > 9) {
            return parseFloat(number).toExponential(3);
        }
        
        return number;
    }

    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    setActiveOperator(button) {
        this.clearActiveOperator();
        button.classList.add('active');
    }

    clearActiveOperator() {
        document.querySelectorAll('.btn.operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    handleKeyboard(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.=Enter%'.includes(key) || key === 'Backspace' || key === 'Escape') {
            e.preventDefault();
        }

        // Numbers
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
            this.animateButtonByKey(key);
        }

        // Operators
        const operatorMap = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };

        if (operatorMap[key]) {
            this.inputOperator(operatorMap[key]);
            this.animateOperatorByKey(operatorMap[key]);
        }

        // Decimal
        if (key === '.') {
            this.inputDecimal();
            this.animateButtonBySelector('[data-decimal]');
        }

        // Equals
        if (key === 'Enter' || key === '=') {
            this.calculate();
            this.animateButtonBySelector('[data-equals]');
        }

        // Clear
        if (key === 'Escape') {
            this.clear();
            this.animateButtonBySelector('[data-action="clear"]');
        }

        // Delete/Backspace
        if (key === 'Backspace') {
            this.delete();
            this.animateButtonBySelector('[data-action="delete"]');
        }

        // Percent
        if (key === '%') {
            this.percent();
            this.animateButtonBySelector('[data-action="percent"]');
        }
    }

    animateButtonByKey(key) {
        const button = document.querySelector(`[data-number="${key}"]`);
        if (button) this.animateButton(button);
    }

    animateOperatorByKey(operator) {
        const button = document.querySelector(`[data-operator="${operator}"]`);
        if (button) {
            this.animateButton(button);
            this.setActiveOperator(button);
        }
    }

    animateButtonBySelector(selector) {
        const button = document.querySelector(selector);
        if (button) this.animateButton(button);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkCalculator();
});
