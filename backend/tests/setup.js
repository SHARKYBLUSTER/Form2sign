/**
 * Setup Jest pour Form2Sign
 * Configuration globale pour les tests
 */

// Configuration de l'environnement
process.env.NODE_ENV = 'test';

// Mock des dépendances externes si nécessaire
// Jest va automatiquement hoister ces mocks

// Mock de puppeteer pour les tests unitaires (pas les tests d'intégration)
jest.mock('puppeteer', () => {
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(null),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
      close: jest.fn().mockResolvedValue(null)
    }),
    close: jest.fn().mockResolvedValue(null)
  };
  
  return {
    launch: jest.fn().mockResolvedValue(mockBrowser)
  };
});

// Mock de fs pour certains tests
// defineProperty:

// Initialisation avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});

// Nettoyage après chaque test
afterEach(() => {
  jest.restoreAllMocks();
});

// Messages de démarrage
console.log('\n========================================');
console.log('Form2Sign - Phase 5 Tests');
console.log('Environnement: test');
console.log('========================================\n');
