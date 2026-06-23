exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    port: 4723, // Appium port

    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './e2e/**/*.test.js'
    ],
    exclude: [],

    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        // Capabilities for local Appium Android Emulator
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // In a real environment, you'd specify the built APK path here
        // 'appium:app': path.join(process.cwd(), './android/app/build/outputs/apk/debug/app-debug.apk'),
        'appium:appPackage': 'com.rehab.mobileapp',
        'appium:appActivity': '.MainActivity',
        'appium:autoGrantPermissions': true
    }],

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Services setup
    services: [
        ['appium', {
            args: {
                address: 'localhost',
                port: 4723
            },
            logPath: './'
        }]
    ],

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
