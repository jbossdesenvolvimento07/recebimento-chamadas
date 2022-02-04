const express = require('express');
const app = express();
const axios = require('axios')


const port = process.env.PORT || 80;


app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    //console.log('Chamada recebida GET')
    console.log('=> Chamada recebida GET')

    console.log(req.body)

    axios.post('https://enmtyhh3s7v07l7.m.pipedream.net', req.body)
      .then(() => {console.log('=> Requisição enviada para fora')})

    res.send('ok')
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    //console.log('Chamada recebida POST')
    console.log('=> Chamada recebida POST')

    console.log(req.body)

    axios.post('https://enmtyhh3s7v07l7.m.pipedream.net', req.body)
      .then(() => {console.log('=> Requisição enviada para fora')})
    
    
    res.send('ok')

})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})