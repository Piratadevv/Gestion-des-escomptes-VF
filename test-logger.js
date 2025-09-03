const logger = require('./utils/logger');

console.log('Testing Winston logger...');

// Test basic logging
logger.info('Test info message');
logger.error('Test error message');
logger.warn('Test warning message');

// Test our custom methods
logger.logAction('info', 'Test action message', {
  action: 'TEST_ACTION',
  endpoint: '/test',
  testData: 'sample'
});

logger.logError(new Error('Test error'), 'Test error context', {
  action: 'TEST_ERROR',
  context: 'testing'
});

console.log('Logger test completed. Check log files.');

// Give time for async writes
setTimeout(() => {
  process.exit(0);
}, 1000);