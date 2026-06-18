import puppeteer from 'puppeteer';
import { logger } from './Logger.js';
import { config } from '../config/index.js';

export class DynamicTestGenerator {
    static async discoverForms() {
        logger.info('Starting dynamic form discovery...');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        const formsData = [];
        const visited = new Set();
        const queue = [config.baseUrl];

        try {
            while (queue.length > 0) {
                const url = queue.shift();
                if (visited.has(url)) continue;
                visited.add(url);
                
                logger.info(`Crawling: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
                
                // Find all forms on the page
                const forms = await page.evaluate(() => {
                    const result = [];
                    document.querySelectorAll('form').forEach((f, idx) => {
                        const inputs = [];
                        f.querySelectorAll('input, select, textarea').forEach(input => {
                            inputs.push({
                                name: input.name || input.id || 'unnamed',
                                type: input.type || input.tagName.toLowerCase(),
                                required: input.required,
                                minLength: input.minLength > 0 ? input.minLength : null,
                                maxLength: input.maxLength > 0 ? input.maxLength : null,
                                id: input.id
                            });
                        });
                        result.push({
                            formIndex: idx,
                            action: f.action,
                            inputs
                        });
                    });
                    return result;
                });

                if (forms.length > 0) {
                    formsData.push({ url, forms });
                }

                // Find links to navigate (same origin only)
                const links = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => href.startsWith(window.location.origin));
                });

                links.forEach(link => {
                    // Ignore # links or already visited
                    const cleanLink = link.split('#')[0];
                    if (!visited.has(cleanLink) && !queue.includes(cleanLink)) {
                        queue.push(cleanLink);
                    }
                });
            }
        } catch (e) {
            logger.error(`Error during dynamic discovery: ${e.message}`);
        } finally {
            await browser.close();
        }

        logger.info(`Discovered forms on ${formsData.length} pages.`);
        return formsData;
    }
}
