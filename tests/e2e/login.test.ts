import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

describe('Rehab App E2E - Login Flow', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    // Setup Chrome options for headless execution in CI
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }, 60000); // 60s timeout for startup

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('should load the login page and find the login button', async () => {
    // Navigate to the local server
    await driver.get('http://localhost:3000');
    
    // Wait for the app to load
    await driver.wait(until.elementLocated(By.tagName('body')), 10000);
    
    // Check page title (assuming Vite default or set in index.html)
    const title = await driver.getTitle();
    expect(title).toBeDefined();

    // Verify a button exists (adjust selector if needed based on actual login page)
    const button = await driver.wait(
      until.elementLocated(By.css('button')),
      5000
    );
    expect(button).toBeDefined();
    
    const buttonText = await button.getText();
    expect(buttonText.length).toBeGreaterThan(0);
  }, 30000);
});
