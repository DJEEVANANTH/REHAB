import dotenv from 'dotenv';
dotenv.config();

export const config = {
    baseUrl: process.env.APP_URL || 'http://localhost:3000',
    browser: process.env.BROWSER || 'chrome', // chrome, firefox, edge
    headless: process.env.HEADLESS === 'true',
    timeout: {
        implicit: 10000,
        pageLoad: 30000,
        script: 15000,
        explicit: 15000
    },
    credentials: {
        validUser: {
            username: process.env.TEST_USERNAME || 'testuser@example.com',
            password: process.env.TEST_PASSWORD || 'Password123!'
        },
        invalidUser: {
            username: 'invalid@example.com',
            password: 'WrongPassword!'
        }
    },
    paths: {
        reports: './selenium-framework/reports',
        screenshots: './selenium-framework/reports/failures',
        logs: './selenium-framework/logs',
        excel: './selenium-framework/excel'
    }
};
