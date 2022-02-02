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
})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})