import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import fs from 'fs';
import path from 'path';

import { config } from '../config/index.js';
import { logger } from '../utilities/Logger.js';
import { excelReporter } from '../utilities/ExcelReporter.js';

let driver;

export const getDriver = () => driver;

before(async function() {
    logger.info('Initializing Selenium WebDriver...');
    
    const builder = new Builder().forBrowser(config.browser);
    
    if (config.headless) {
        const chromeOptions = new chrome.Options().addArguments(
            '--headless', 
            '--disable-gpu', 
            '--window-size=1920,1080',
            '--no-sandbox',
            '--disable-dev-shm-usage'
        );
        const firefoxOptions = new firefox.Options().addArguments('--headless', '--window-size=1920,1080');
        const edgeOptions = new edge.Options().addArguments('--headless', '--disable-gpu', '--window-size=1920,1080');
        
        builder.setChromeOptions(chromeOptions)
               .setFirefoxOptions(firefoxOptions)
               .setEdgeOptions(edgeOptions);
    }

    driver = await builder.build();
    await driver.manage().setTimeouts({ implicit: config.timeout.implicit, pageLoad: config.timeout.pageLoad });
    await driver.manage().window().maximize();
    logger.info(`Browser launched: ${config.browser} (Headless: ${config.headless})`);
});

beforeEach(async function() {
    this.currentTest.startTime = Date.now();
});

afterEach(async function() {
    const testStatus = this.currentTest.state || 'skipped';
    const duration = Date.now() - this.currentTest.startTime;
    let screenshotPath = '';

    if (testStatus === 'failed') {
        const err = this.currentTest.err;
        logger.error(`Test Failed: ${this.currentTest.title} - ${err.message}`);
        
        // Capture Screenshot
        if (!fs.existsSync(config.paths.screenshots)) {
            fs.mkdirSync(config.paths.screenshots, { recursive: true });
        }
        const screenshot = await driver.takeScreenshot();
        const filename = `${this.currentTest.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
        screenshotPath = path.join(config.paths.screenshots, filename);
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        logger.info(`Screenshot saved: ${screenshotPath}`);

        // Log browser current URL
        const url = await driver.getCurrentUrl();
        
        excelReporter.addFailedTest({
            name: this.currentTest.title,
            reason: err.message,
            screenshot: screenshotPath,
            browser: config.browser,
            url: url
        });
        
        excelReporter.addLog({
            name: this.currentTest.title,
            step: 'Execution',
            result: 'FAILED',
            remarks: err.message
        });
    } else if (testStatus === 'passed') {
        logger.info(`Test Passed: ${this.currentTest.title}`);
    }

    excelReporter.addTestCase({
        id: `TC_${Date.now()}`,
        module: this.currentTest.parent.title,
        name: this.currentTest.title,
        browser: config.browser,
        status: testStatus,
        start: new Date(this.currentTest.startTime).toISOString(),
        end: new Date().toISOString(),
        duration: duration
    });
});

after(async function() {
    logger.info('Tearing down Selenium WebDriver...');
    if (driver) {
        await driver.quit();
    }
    await excelReporter.generateReport();
});
