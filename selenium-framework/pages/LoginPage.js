import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';
import { config } from '../config/index.js';

export class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Locators
        this.usernameInput = By.css('input[type="email"], input[name="email"], input[name="username"]');
        this.passwordInput = By.css('input[type="password"], input[name="password"]');
        this.loginButton = By.css('button[type="submit"], button.login, .auth-btn');
        this.errorMessage = By.css('.error-message, .alert-danger, [role="alert"]');
        this.logoutButton = By.css('button.logout, a[href*="logout"]');
    }

    async navigate() {
        await this.navigateTo(`${config.baseUrl}/auth`);
    }

    async login(username, password) {
        if (username) {
            await this.utils.typeText(this.usernameInput, username);
        }
        if (password) {
            await this.utils.typeText(this.passwordInput, password);
        }
        await this.utils.click(this.loginButton);
    }

    async getErrorMessage() {
        return await this.utils.getText(this.errorMessage);
    }

    async isLogoutVisible() {
        try {
            await this.utils.waitForElementVisible(this.logoutButton, 5000);
            return true;
        } catch {
            return false;
        }
    }

    async logout() {
        await this.utils.click(this.logoutButton);
    }
}
