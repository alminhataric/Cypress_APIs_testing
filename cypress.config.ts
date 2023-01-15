const {defineConfig} = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  env: {
    username: 'cytest@test.com',
    password: '',
    apiUrl: 'https://api.realworld.io'
  },
  
  e2e: {
    setupNodeEvent(on, config){
      const username = process.env.DB_USERNAME
      const password = process.env.PASSWORD

      if(!password){
        throw new Error(`missing PASSWORD environment variable`)
      }

      config.env = {username, password}
      return config
    },
    baseUrl: 'https://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*' , '**/2-advanced-examples/*']
  }
})