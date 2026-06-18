import { until, By } from 'selenium-webdriver';
import { logger } from './Logger.js';

export class SeleniumUtils {
    constructor(driver) {
        this.driver = driver;
    }

    async waitForElement(locator, timeout = 15000) {
        try {
            return await this.driver.wait(until.elementLocated(locator), timeout);
        } catch (error) {
            logger.error(`Failed to wait for element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async waitForElementVisible(locator, timeout = 15000) {
        try {
            const element = await this.waitForElement(locator, timeout);
            return await this.driver.wait(until.elementIsVisible(element), timeout);
        } catch (error) {
            logger.error(`Failed to wait for element visible ${locator}: ${error.message}`);
            throw error;
        }
    }

    async click(locator, timeout = 15000) {
        try {
            const element = await this.waitForElementVisible(locator, timeout);
            await element.click();
            logger.info(`Clicked on element: ${locator}`);
        } catch (error) {
            logger.error(`Failed to click on element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async typeText(locator, text, timeout = 15000) {
        try {
            const element = await this.waitForElementVisible(locator, timeout);
            await element.clear();
            await element.sendKeys(text);
            logger.info(`Typed text into element: ${locator}`);
        } catch (error) {
            logger.error(`Failed to type into element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async getText(locator, timeout = 15000) {
        try {
            const element = await this.waitForElementVisible(locator, timeout);
            const text = await element.getText();
            return text;
        } catch (error) {
            logger.error(`Failed to get text from element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async scrollToElement(locator) {
        try {
            const element = await this.waitForElement(locator);
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
            logger.info(`Scrolled to element: ${locator}`);
        } catch (error) {
            logger.error(`Failed to scroll to element ${locator}: ${error.message}`);
            throw error;
        }
    }

    async executeJS(script, ...args) {
        try {
            return await this.driver.executeScript(script, ...args);
        } catch (error) {
            logger.error(`Failed to execute JS: ${error.message}`);
            throw error;
        }
    }

    async handleAlert(accept = true) {
        try {
            await this.driver.wait(until.alertIsPresent(), 5000);
            const alert = await this.driver.switchTo().alert();
            if (accept) {
                await alert.accept();
            } else {
                await alert.dismiss();
            }
            logger.info(`Handled alert (Accept: ${accept})`);
        } catch (error) {
            logger.info("No alert present to handle.");
        }
    }
}
