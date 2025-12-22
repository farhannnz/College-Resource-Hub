const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint: http://localhost:3000/api/resources');
    
    const response = await fetch('http://localhost:3000/api/resources');
    const data = await response.json();
    
    console.log('\nResponse Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('\nResources returned:', data.length);
    
    if (data.length > 0) {
      console.log('\nFirst resource:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('\nNo resources returned from API');
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();
