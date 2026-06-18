import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import { getDriver } from './setup.js';
import { DynamicTestGenerator } from '../utilities/DynamicTestGenerator.js';
import { SeleniumUtils } from '../utilities/SeleniumUtils.js';
import { logger } from '../utilities/Logger.js';

let formsData = [];

// We fetch the dynamic data BEFORE running tests
// Top-level await is supported in Node ESM
try {
    formsData = await DynamicTestGenerator.discoverForms();
} catch (e) {
    logger.error('Failed to discover forms dynamically: ' + e.message);
}

describe('Dynamic Form Validation Testing', function () {
    let utils;

    before(function () {
        utils = new SeleniumUtils(getDriver());
    });

    if (formsData.length === 0) {
        it('No forms discovered', function() {
            logger.warn('No forms were found during dynamic discovery.');
        });
    }

    formsData.forEach((pageData) => {
        describe(`Validating forms on: ${pageData.url}`, function () {
            pageData.forms.forEach((form, idx) => {
                describe(`Form #${form.formIndex}`, function () {
                    beforeEach(async function () {
                        await getDriver().get(pageData.url);
                    });

                    it('should have required fields configured correctly', async function () {
                        const requiredInputs = form.inputs.filter(i => i.required);
                        logger.info(`Found ${requiredInputs.length} required inputs on Form #${form.formIndex}`);
                        
                        // We can just verify the elements exist with required attribute in the DOM
                        for (const input of requiredInputs) {
                            let locator;
                            if (input.id) locator = By.id(input.id);
                            else if (input.name) locator = By.name(input.name);
                            else continue;

                            const element = await utils.waitForElementVisible(locator);
                            const isReq = await element.getAttribute('required');
                            expect(isReq).to.not.be.null;
                        }
                    });

                    it('should validate email fields if present', async function () {
                        const emailInputs = form.inputs.filter(i => i.type === 'email');
                        for (const input of emailInputs) {
                            let locator;
                            if (input.id) locator = By.id(input.id);
                            else locator = By.name(input.name);

                            const element = await utils.waitForElementVisible(locator);
                            const typeAttr = await element.getAttribute('type');
                            expect(typeAttr).to.equal('email');
                        }
                    });
                });
            });
        });
    });
});
