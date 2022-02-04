const express = require('express');
const app = express();
const axios = require('axios')

app.use(express.urlencoded());
app.use(express.json());

const port = process.env.PORT || 80;


app.get('/', (req, res) => {

    console.log('=> Chamada recebida GET')
    res.send('ok')
})

app.post('/', (req, res) => {

    console.log('=> Chamada recebida POST')


    axios.post('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c', req.body)
    .then(() => {console.log('=> Requisição enviada para fora')})
    
    
    res.send('ok')
})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})