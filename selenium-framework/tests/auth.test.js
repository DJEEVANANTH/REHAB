import { expect } from 'chai';
import { getDriver } from './setup.js';
import { LoginPage } from '../pages/LoginPage.js';
import { config } from '../config/index.js';

describe('Authentication Testing', function () {
    let loginPage;

    before(async function () {
        loginPage = new LoginPage(getDriver());
    });

    beforeEach(async function () {
        await loginPage.navigate();
    });

    it('should show error for empty username', async function () {
        await loginPage.login('', 'Password123!');
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.not.be.empty;
    });

    it('should show error for empty password', async function () {
        await loginPage.login('testuser@example.com', '');
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.not.be.empty;
    });

    it('should show error for invalid credentials', async function () {
        await loginPage.login(config.credentials.invalidUser.username, config.credentials.invalidUser.password);
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.contain('Invalid login credentials');
    });

    it('should login successfully with valid credentials', async function () {
        // Skip if you want to prevent true login side effects during normal runs
        await loginPage.login(config.credentials.validUser.username, config.credentials.validUser.password);
        const url = await loginPage.getCurrentUrl();
        expect(url).to.not.include('/auth');
        
        // Validate Logout flow
        const canLogout = await loginPage.isLogoutVisible();
        if (canLogout) {
            await loginPage.logout();
            const urlAfterLogout = await loginPage.getCurrentUrl();
            expect(urlAfterLogout).to.include('/auth');
        }
    });
});
