/**
 * Form2Sign - Jest Custom Reporter
 * Génère un rapport personnalisé pour les tests Phase 5
 */

class Form2SignReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this._results = [];
    this._startTime = new Date();
  }

  onRunStart(results, options) {
    console.log('\n========================================');
    console.log('🚀 Form2Sign Phase 5 - Tests en cours');
    console.log('========================================\n');
  }

  onTestBegin(test) {
    // Optionnel: log le début de chaque test
    // console.log(`⏳ Démarrage: ${test.title}`);
  }

  onTestResult(test, testResult, results) {
    this._results.push({
      test: test.title,
      status: testResult.numPassingTests > 0 ? 'PASSED' : 'FAILED',
      duration: testResult.perfStats.end - testResult.perfStats.start,
      passing: testResult.numPassingTests,
      failing: testResult.numFailingTests
    });
  }

  onRunComplete(contexts, results) {
    const endTime = new Date();
    const duration = (endTime - this._startTime) / 1000;
    
    console.log('\n========================================');
    console.log('📊 Form2Sign Phase 5 - Rapport de Tests');
    console.log('========================================\n');
    
    console.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`);
    console.log(`📈 Tests exécutés: ${results.numTotalTests}`);
    console.log(`✅ Réussis: ${results.numPassedTests}`);
    console.log(`❌ Échoués: ${results.numFailedTests}`);
    console.log(`⏭️  Ignorés: ${results.numPendingTests}`);
    
    if (results.numFailedTests > 0) {
      console.log('\n🔍 Tests échoués:');
      results.testResults.forEach(testResult => {
        if (testResult.numFailingTests > 0) {
          testResult.failureMessages.forEach(failure => {
            console.log(`  ❌ ${testResult.title}: ${failure}`);
          });
        }
      });
    }
    
    if (results.numPendingTests > 0) {
      console.log('\n⏸️  Tests en attente (TODO):');
      results.testResults.forEach(testResult => {
        testResult.testPaths.forEach(testPath => {
          if (testPath.includes('.todo')) {
            const match = testPath.match(/Scénarios?\s+(\d+):\s*(.+)/);
            if (match) {
              console.log(`  ⏭️  ${match[1]}. ${match[2]}`);
            }
          }
        });
      });
    }
    
    console.log('\n========================================\n');
  }
}

module.exports = Form2SignReporter;
