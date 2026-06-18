import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';
import { logger } from './Logger.js';

export class ExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.summarySheet = this.workbook.addWorksheet('Summary');
        this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
        this.failedTestsSheet = this.workbook.addWorksheet('Failed Tests');
        this.logsSheet = this.workbook.addWorksheet('Execution Logs');

        this.setupHeaders();
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        };
        this.startTime = Date.now();
    }

    setupHeaders() {
        // Summary Sheet
        this.summarySheet.columns = [
            { header: 'Execution Date', key: 'date', width: 20 },
            { header: 'Environment', key: 'env', width: 20 },
            { header: 'Total Tests', key: 'total', width: 15 },
            { header: 'Passed', key: 'passed', width: 15 },
            { header: 'Failed', key: 'failed', width: 15 },
            { header: 'Skipped', key: 'skipped', width: 15 },
            { header: 'Pass Percentage', key: 'percentage', width: 15 },
            { header: 'Execution Duration (s)', key: 'duration', width: 20 }
        ];

        // Test Cases Sheet
        this.testCasesSheet.columns = [
            { header: 'Test ID', key: 'id', width: 15 },
            { header: 'Module', key: 'module', width: 20 },
            { header: 'Scenario Name', key: 'name', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Start Time', key: 'start', width: 20 },
            { header: 'End Time', key: 'end', width: 20 },
            { header: 'Duration (ms)', key: 'duration', width: 15 }
        ];

        // Failed Tests Sheet
        this.failedTestsSheet.columns = [
            { header: 'Test Name', key: 'name', width: 40 },
            { header: 'Failure Reason', key: 'reason', width: 50 },
            { header: 'Screenshot Path', key: 'screenshot', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'URL', key: 'url', width: 40 }
        ];

        // Execution Logs Sheet
        this.logsSheet.columns = [
            { header: 'Timestamp', key: 'time', width: 25 },
            { header: 'Test Name', key: 'name', width: 30 },
            { header: 'Step Description', key: 'step', width: 50 },
            { header: 'Result', key: 'result', width: 15 },
            { header: 'Remarks', key: 'remarks', width: 30 }
        ];
        
        [this.summarySheet, this.testCasesSheet, this.failedTestsSheet, this.logsSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        });
    }

    addTestCase(testData) {
        this.stats.total++;
        this.stats[testData.status]++;
        this.testCasesSheet.addRow(testData);
    }

    addFailedTest(failData) {
        this.failedTestsSheet.addRow(failData);
    }

    addLog(logData) {
        this.logsSheet.addRow({
            time: new Date().toISOString(),
            ...logData
        });
    }

    async generateReport() {
        if (!fs.existsSync(config.paths.excel)) {
            fs.mkdirSync(config.paths.excel, { recursive: true });
        }

        const endTime = Date.now();
        this.stats.duration = ((endTime - this.startTime) / 1000).toFixed(2);
        const percentage = this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(2) + '%' : '0%';

        this.summarySheet.addRow({
            date: new Date().toLocaleString(),
            env: config.baseUrl,
            total: this.stats.total,
            passed: this.stats.passed,
            failed: this.stats.failed,
            skipped: this.stats.skipped,
            percentage,
            duration: this.stats.duration
        });

        const filePath = path.join(config.paths.excel, 'E2E_Report.xlsx');
        await this.workbook.xlsx.writeFile(filePath);
        logger.info(`Excel report generated at: ${filePath}`);
    }
}

// Export a singleton instance
export const excelReporter = new ExcelReporter();
