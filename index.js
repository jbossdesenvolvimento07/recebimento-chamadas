const express = require('express');
const app = express();

const port = process.env.PORT || 80;


app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida GET')

    res.send('ok \n Porta: ' + port)
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida POST')

    res.send('ok')
    
    const options = {
      method: 'POST',
      //headers: headers,
      //body: JSON.stringify({dataUrl: "aaaaaaaaa"})
      
    }
    fetch('https://webhook.site/32de4a03-6804-4b12-bb95-963df723e250', options)

})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})