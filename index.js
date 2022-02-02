const express = require('express');
const app = express();
const logger = require('heroku-logger')


const port = process.env.PORT || 80;


app.get('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida GET')
    logger.info('Chamada recebida GET')
    res.send('ok \n Porta: ' + port)
})

app.post('/', (req, res) => {
    //req.body.dataUrl;
    
    console.log('Chamada recebida POST')
    logger.info('Chamada recebida POST')
    res.send('ok')

})



app.listen(port, () => {

    console.log('Listening on port ' + port)
})