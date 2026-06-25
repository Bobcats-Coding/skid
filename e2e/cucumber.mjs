const config = {
  import: ['src/**/*.ts'],
  format: [
    'json:../reports/cucumber-report.json',
    'html:../reports/report.html',
    'summary',
    'progress-bar',
  ],
  formatOptions: { snippetInterface: 'async-await' },
}

config.format.push('@cucumber/pretty-formatter')
export default config
