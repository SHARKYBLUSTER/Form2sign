/**
 * Configuration Jest pour Form2Sign
 * Phase 5 - Tests
 */

module.exports = {
  // Racine du projet
  rootDir: '.',
  
  // Fichiers de test
  testMatch: [
    '**/backend/tests/**/*.test.js',
    '**/backend/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  
  // Environnement pour les tests Node.js
  testEnvironment: 'node',
  
  // Setup global
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  
  // Couverture de code (optionnel pour la Phase 5)
  collectCoverage: false,
  // collectCoverageFrom: [
  //   'backend/**/*.js',
  //   '!backend/app.js',
  //   '!backend/tests/**'
  // ],
  
  // Modules à ignorer
  modulePathIgnorePatterns: [
    'node_modules',
    'uploads',
    'frontend'
  ],
  
  // Timeout pour les tests (utile pour Puppeteer)
  testTimeout: 30000,
  
  // Verbosité
  verbose: true,
  
  // Rapports
  reporters: [
    'default',
    ['<rootDir>/backend/tests/jest-reporter.js', {}]
  ]
};
