/**
 * Form2Sign - Tests pour captureHtmlToPdf
 * Tests supplémentaires pour la génération PDF
 */

const path = require('path');
const fs = require('fs');

// Charger les fonctions depuis app.js
const appPath = path.join(__dirname, '../app.js');
const appContent = fs.readFileSync(appPath, 'utf8');
eval(appContent);

describe('captureHtmlToPdf() - Tests unitaires', () => {
  
  beforeAll(() => {
    // Mock de puppeteer pour les tests unitaires
    jest.unmock('puppeteer');
  });

  test('Devrait exister et être une fonction asynchrone', () => {
    expect(captureHtmlToPdf).toBeDefined();
    expect(typeof captureHtmlToPdf).toBe('function');
  });

  test('Devrait accepter des options par défaut', async () => {
    const html = '<html><body><h1>Test</h1></body></html>';
    const mockPdfBuffer = Buffer.from('test-pdf');
    
    // Mock puppeteer
    const puppeteer = require('puppeteer');
    puppeteer.launch.mockResolvedValueOnce({
      newPage: jest.fn().mockResolvedValueOnce({
        setContent: jest.fn().mockResolvedValueOnce(null),
        pdf: jest.fn().mockResolvedValueOnce(mockPdfBuffer),
        close: jest.fn().mockResolvedValueOnce(null)
      }),
      close: jest.fn().mockResolvedValueOnce(null)
    });

    const result = await captureHtmlToPdf(html);
    expect(result).toEqual(mockPdfBuffer);
    
    // Vérifier que puppeteer a été appelé avec les bonnes options
    expect(puppeteer.launch).toHaveBeenCalledWith(expect.objectContaining({
      headless: 'new',
      args: expect.arrayContaining([
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ])
    }));
  });

  test('Devrait fusionner les options personnalisées', async () => {
    const html = '<html><body><h1>Test</h1></body></html>';
    const customOptions = {
      format: 'A5',
      orientation: 'landscape',
      margin: '20mm'
    };
    
    const mockPdfBuffer = Buffer.from('test-pdf');
    
    const puppeteer = require('puppeteer');
    puppeteer.launch.mockResolvedValueOnce({
      newPage: jest.fn().mockResolvedValueOnce({
        setContent: jest.fn().mockResolvedValueOnce(null),
        pdf: jest.fn().mockResolvedValueOnce(mockPdfBuffer),
        close: jest.fn().mockResolvedValueOnce(null)
      }),
      close: jest.fn().mockResolvedValueOnce(null)
    });

    await captureHtmlToPdf(html, customOptions);
    
    // Vérifier que page.pdf a été appelé avec les options fusionnées
    const page = puppeteer.launch().newPage();
    expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({
      format: 'A5',
      orientation: 'landscape',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      }
    }));
  });

  test('Devrait gérer les marges sous forme de string unique', async () => {
    const html = '<html><body><h1>Test</h1></body></html>';
    const options = { margin: '15mm' };
    
    const mockPdfBuffer = Buffer.from('test-pdf');
    
    const puppeteer = require('puppeteer');
    puppeteer.launch.mockResolvedValueOnce({
      newPage: jest.fn().mockResolvedValueOnce({
        setContent: jest.fn().mockResolvedValueOnce(null),
        pdf: jest.fn().mockResolvedValueOnce(mockPdfBuffer),
        close: jest.fn().mockResolvedValueOnce(null)
      }),
      close: jest.fn().mockResolvedValueOnce(null)
    });

    await captureHtmlToPdf(html, options);
    
    const page = puppeteer.launch().newPage();
    expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      }
    }));
  });

  test('Devrait gérer les marges sous forme de nombre', async () => {
    const html = '<html><body><h1>Test</h1></body></html>';
    const options = { margin: 25 };
    
    const mockPdfBuffer = Buffer.from('test-pdf');
    
    const puppeteer = require('puppeteer');
    puppeteer.launch.mockResolvedValueOnce({
      newPage: jest.fn().mockResolvedValueOnce({
        setContent: jest.fn().mockResolvedValueOnce(null),
        pdf: jest.fn().mockResolvedValueOnce(mockPdfBuffer),
        close: jest.fn().mockResolvedValueOnce(null)
      }),
      close: jest.fn().mockResolvedValueOnce(null)
    });

    await captureHtmlToPdf(html, options);
    
    const page = puppeteer.launch().newPage();
    expect(page.pdf).toHaveBeenCalledWith(expect.objectContaining({
      margin: {
        top: '25mm',
        bottom: '25mm',
        left: '25mm',
        right: '25mm'
      }
    }));
  });
});

// Tests d'intégration pour les routes API (nécessitent serveur)
describe('API Routes - Tests d\'intégration', () => {
  
  test.todo('GET /api/forms devrait lister les formulaires');
  test.todo('GET /api/forms/:id/preview devrait retourner HTML valide');
  test.todo('POST /api/generate-pdf devrait retourner PDF valide');
  test.todo('POST /api/config devrait sauvegarder la config');
  test.todo('GET /api/config devrait retourner la config');
});
