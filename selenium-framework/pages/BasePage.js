import { SeleniumUtils } from '../utilities/SeleniumUtils.js';

export class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.utils = new SeleniumUtils(driver);
    }

    async navigateTo(url) {
        await this.driver.get(url);
    }

    async getTitle() {
        return await this.driver.getTitle();
    }

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }

    async refresh() {
        await this.driver.navigate().refresh();
    }

    async goBack() {
        await this.driver.navigate().back();
    }

    async goForward() {
        await this.driver.navigate().forward();
    }
}
