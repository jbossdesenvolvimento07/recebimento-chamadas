const express = require('express');
const app = express();

app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida GET')

    res.send('ok')
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida POST')

    res.send('ok')
})

const port = 80;

app.listen(port, () => {

    console.log('Listening on port ' + port)
})