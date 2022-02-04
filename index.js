const express = require('express');
const app = express();
const logger = require('heroku-logger')


const port = process.env.PORT || 80;


app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    //console.log('Chamada recebida GET')
    console.log('=> Chamada recebida GET')

    console.log(req.body)
    
    fetch('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c')
        .then(() => {logger.info('=> Requisição enviada para outro webhook')})

    res.send('ok')
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    //console.log('Chamada recebida POST')
    console.log('=> Chamada recebida POST')

    console.log(req.body)

    fetch('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c')
        .then(() => {logger.info('=> Requisição enviada para outro webhook')})
    
    
    res.send('ok')

})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})