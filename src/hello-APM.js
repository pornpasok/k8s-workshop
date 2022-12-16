// Add this to the VERY top of the first file loaded in your app
const apm = require('elastic-apm-node').start({
	// Override service name from package.json
	// Allowed characters: a-z, A-Z, 0-9, -, _, and space
	serviceName: 'process.env.ELASTIC_APM_SERVICE_NAME',
  
	// Use if APM Server requires a token
	secretToken: 'process.env.ELASTIC_APM_SECRET_TOKEN',
  
	// Use if APM Server uses API keys for authentication
	apiKey: '',
  
	// Set custom APM Server URL (default: http://localhost:8200)
	serverUrl: 'process.env.ELASTIC_APM_SERVER_URL',
})
  
const express = require('express')
const os = require('os')
const app = express()
const port = 3000

app.get('/', function (req, res) {
	// res.send('<center><h1>สวัสดี สบายดี Hello World! from  ' + String(os.hostname()) + '</h1></center>')
    res.send('<center><h1>' + process.env.ECHO_MSG + String(os.hostname()) + '</h1></center>' + `<script src="https://unpkg.com/@elastic/apm-rum@5.12.0/dist/bundles/elastic-apm-rum.umd.min.js" crossorigin></script>
	<script>
	  elasticApm.init({
		serviceName: '${process.env.ELASTIC_APM_SERVICE_NAME}',
		serverUrl: '${process.env.ELASTIC_APM_SERVER_URL}',
	  })
	</script>`)
})

app.listen(port, () => console.log(`Hello World! listening on port ${port}!`))