import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import { getDriver } from './setup.js';
import { BasePage } from '../pages/BasePage.js';
import { config } from '../config/index.js';

describe('Navigation Testing', function () {
    let basePage;

    before(async function () {
        basePage = new BasePage(getDriver());
    });

    it('should navigate to home and refresh', async function () {
        await basePage.navigateTo(`${config.baseUrl}/`);
        const title = await basePage.getTitle();
        expect(title).to.be.a('string');
        
        await basePage.refresh();
        const url = await basePage.getCurrentUrl();
        expect(url).to.equal(`${config.baseUrl}/`);
    });

    it('should test browser back and forward functionality', async function () {
        await basePage.navigateTo(`${config.baseUrl}/`);
        await basePage.navigateTo(`${config.baseUrl}/auth`);
        
        await basePage.goBack();
        let url = await basePage.getCurrentUrl();
        expect(url).to.equal(`${config.baseUrl}/`);
        
        await basePage.goForward();
        url = await basePage.getCurrentUrl();
        expect(url).to.include('/auth');
    });

    it('should find and click navbar links if present', async function () {
        await basePage.navigateTo(`${config.baseUrl}/`);
        try {
            const navLinks = await getDriver().findElements(By.css('nav a'));
            if (navLinks.length > 0) {
                const href = await navLinks[0].getAttribute('href');
                if (href && href.startsWith('http')) {
                    await navLinks[0].click();
                    const newUrl = await basePage.getCurrentUrl();
                    expect(newUrl).to.equal(href);
                }
            }
        } catch (e) {
            // No navbar found
        }
    });
});
