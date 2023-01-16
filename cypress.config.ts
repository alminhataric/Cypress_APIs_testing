const {defineConfig} = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  env:{
    username: 'cytest@test.com',
    password: 'Welcome123',
    apiUrl: 'https://api.realworld.io'
  },
  
  e2e: {
    baseUrl: 'https://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*' , '**/2-advanced-examples/*']
  }
})