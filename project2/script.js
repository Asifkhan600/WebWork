class SecureCalculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForNewInput = false;
        this.calculationHistory = [];
        this.isLoggedIn = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Login elements
        this.loginSection = document.getElementById('loginSection');
        this.calculatorSection = document.getElementById('calculatorSection');
        this.passwordInput = document.getElementById('passwordInput');
        this.loginBtn = document.getElementById('loginBtn');
        this.togglePassword = document.getElementById('togglePassword');
        this.strengthBar = document.querySelector('.strength-bar');

        // Calculator elements
        this.display = document.getElementById('display');
        this.operationDisplay = document.getElementById('operationDisplay');
        this.clearBtn = document.getElementById('clearBtn');
        this.equalsBtn = document.getElementById('equalsBtn');
        this.historyBtn = document.getElementById('historyBtn');
        this.logoutBtn = document.getElementById('logoutBtn');

        // History elements
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.closeHistory = document.getElementById('closeHistory');
        this.clearHistory = document.getElementById('clearHistory');

        // Notification
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');

        // Number and operator buttons
        this.numberButtons = document.querySelectorAll('.btn.number');
        this.operatorButtons = document.querySelectorAll('.btn.operator');
        this.decimalButton = document.querySelector('.btn.decimal');
    }

    attachEventListeners() {
        // Login events
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // Calculator events
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => this.inputNumber(button.dataset.value));
        });

        this.operatorButtons.forEach(button => {
            button.addEventListener('click', () => this.inputOperator(button.dataset.operator));
        });

        this.decimalButton.addEventListener('click', () => this.inputDecimal());
        this.equalsBtn.addEventListener('click', () => this.calculate());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // History events
        this.historyBtn.addEventListener('click', () => this.toggleHistory());
        this.closeHistory.addEventListener('click', () => this.toggleHistory());
        this.clearHistory.addEventListener('click', () => this.clearHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    // Authentication Methods
    checkAuthStatus() {
        const savedAuth = localStorage.getItem('calculatorAuth');
        if (savedAuth === 'true') {
            this.isLoggedIn = true;
            this.showCalculator();
        }
    }

    handleLogin() {
        const password = this.passwordInput.value.trim();
        
        if (password === 'asifak') {
            this.isLoggedIn = true;
            localStorage.setItem('calculatorAuth', 'true');
            this.showCalculator();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Incorrect password! Please try again.', 'error');
            this.shakeLogin();
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('calculatorAuth');
        this.showLogin();
        this.passwordInput.value = '';
        this.updatePasswordStrength();
        this.showNotification('Logged out successfully!', 'success');
    }

    showLogin() {
        this.loginSection.style.display = 'block';
        this.calculatorSection.style.display = 'none';
    }

    showCalculator() {
        this.loginSection.style.display = 'none';
        this.calculatorSection.style.display = 'block';
        this.clear();
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        this.togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }

    updatePasswordStrength() {
        const password = this.passwordInput.value;
        let strength = 0;

        if (password.length > 0) strength += 25;
        if (password.length > 3) strength += 25;
        if (password.length > 5) strength += 25;
        if (password === 'asifak') strength = 100;

        this.strengthBar.style.width = `${strength}%`;
        this.strengthBar.style.background = strength < 50 ? 'var(--error)' : 
                                           strength < 75 ? 'var(--warning)' : 'var(--success)';
    }

    shakeLogin() {
        this.loginSection.style.animation = 'none';
        setTimeout(() => {
            this.loginSection.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    // Calculator Methods
    inputNumber(num) {
        if (this.waitingForNewInput) {
            this.currentInput = num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operation);

            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }

        this.waitingForNewInput = true;
        this.operation = nextOperator;
        this.updateOperationDisplay();
    }

    inputDecimal() {
        if (this.waitingForNewInput) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    calculate() {
        const inputValue = parseFloat(this.currentInput);

        if (this.operation && this.previousInput !== '') {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operation);

            // Save to history
            const historyItem = {
                expression: `${currentValue} ${this.getOperatorSymbol(this.operation)} ${inputValue}`,
                result: newValue
            };
            this.calculationHistory.unshift(historyItem);
            this.updateHistory();

            this.currentInput = String(newValue);
            this.operation = null;
            this.previousInput = '';
            this.waitingForNewInput = true;
            this.updateDisplay();
            this.updateOperationDisplay();
        }
    }

    performCalculation(firstOperand, secondOperand, operation) {
        switch (operation) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                if (secondOperand === 0) {
                    this.showNotification('Error: Division by zero!', 'error');
                    return 0;
                }
                return firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }

    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForNewInput = false;
        this.updateDisplay();
        this.updateOperationDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.formatNumber(this.currentInput);
    }

    updateOperationDisplay() {
        if (this.operation && this.previousInput !== '') {
            this.operationDisplay.textContent = 
                `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operation)}`;
        } else {
            this.operationDisplay.textContent = '';
        }
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(number) > 999999999999 || (Math.abs(number) < 0.000001 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format regular numbers
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 10
        }).format(number);
    }

    // History Methods
    toggleHistory() {
        this.historyPanel.classList.toggle('active');
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        
        this.calculationHistory.slice(0, 10).forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${this.formatNumber(item.result)}</div>
            `;
            this.historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.calculationHistory = [];
        this.updateHistory();
        this.showNotification('History cleared!', 'success');
    }

    // Utility Methods
    handleKeyboardInput(e) {
        if (!this.isLoggedIn) return;

        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.inputDecimal();
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            this.inputOperator(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.handleBackspace();
        }
    }

    handleBackspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    showNotification(message, type = 'error') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SecureCalculator();
});

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);