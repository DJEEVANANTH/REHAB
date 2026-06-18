# Enterprise Selenium E2E Automation Framework

This is a production-ready, enterprise-grade Selenium WebDriver automation framework for React applications, built using Node.js, Mocha, Chai, and Puppeteer (for dynamic testing).

## Architecture
- **Page Object Model (POM)**: Found in `pages/` directory.
- **Utility Layer**: Reusable components in `utilities/` (Selenium utils, Logger, Excel Reporter, Dynamic Test Generator).
- **Configuration**: Managed in `config/index.js` and driven by `.env`.
- **Dynamic Test Discovery**: Uses Puppeteer to automatically crawl the local application, find forms, and discover validation rules (required, type, min/max length) to generate test scenarios on-the-fly.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configuration:
   Set up your `.env` file at the root to configure behavior if needed:
   ```env
   APP_URL=http://localhost:3000
   TEST_USERNAME=testuser@example.com
   TEST_PASSWORD=Password123!
   BROWSER=chrome
   HEADLESS=true
   ```

## Execution Instructions

**Run tests in Headless mode (Default CI mode)**:
```bash
npm run test:selenium:headless
```

**Run tests on specific browsers**:
```bash
npm run test:selenium:chrome
npm run test:selenium:firefox
npm run test:selenium:edge
```

## Reporting

- **Excel Report**: An advanced Excel report is generated at `selenium-framework/excel/E2E_Report.xlsx` containing: Summary, Test Cases, Failed Tests, and Execution Logs.
- **HTML Report**: Mochawesome HTML and JSON reports are generated at `selenium-framework/reports/`.
- **Logs**: Execution logs are stored at `selenium-framework/logs/execution.log`.
- **Failure Screenshots**: Captured automatically on test failure and stored in `selenium-framework/reports/failures/`.

## CI/CD Integration
This framework is fully integrated with GitHub Actions. It will automatically run across a matrix of browsers on every push and pull request to the `main` branch. Artifacts (reports and screenshots) are uploaded after the run.
