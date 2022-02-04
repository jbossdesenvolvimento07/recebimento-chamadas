const express = require('express');
const app = express();
const axios = require('axios')

app.use(express.urlencoded());
app.use(express.json());

const port = process.env.PORT || 80;


app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    //console.log('Chamada recebida GET')
    console.log('=> Chamada recebida GET')

    console.log(req.body)

    axios.get('https://enmtyhh3s7v07l7.m.pipedream.net', req.body)
      .then(() => {console.log('=> Requisição enviada para fora')})
    axios.get('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c', { "teste": 124 })
    .then(() => {console.log('=> Requisição enviada para fora')})

    res.send('ok')
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    //console.log('Chamada recebida POST')
    console.log('=> Chamada recebida POST')

    console.log(JSON.stringify(req.body))

    axios.post('https://enmtyhh3s7v07l7.m.pipedream.net', req.body)
      .then(() => {console.log('=> Requisição enviada para fora')})
    axios.post('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c', req.body)
    .then(() => {console.log('=> Requisição enviada para fora')})
    
    
    res.send('ok')

})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})