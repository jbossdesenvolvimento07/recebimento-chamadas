const express = require('express');
const app = express();
const axios = require('axios');
const sql = require('mssql');
require('dotenv').config();

app.use(express.urlencoded());
app.use(express.json());

const port = process.env.PORT || 8888;


app.get('/', (req, res) => {

    console.log('=> Chamada recebida GET')
    res.send('ok')
})

app.post('/', (req, res) => {

    console.log('=> Chamada recebida POST')


    axios.post('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c', req.body)
    .then(() => {console.log('=> Requisição enviada para fora')})
    
    handleCall(req.body, res);

    //res.send('ok')
})



app.listen(port, () => {


    console.log('Listening on port ' + port)
})

function getCodigoVendedor(callEvent){
    let codigoVendedor = '0000'
    let ramal 
    if(callEvent.CallFlow == 'out')
        ramal = callEvent.CallerExtension.substring(5)
    else
        ramal = callEvent.CalledExtension.substring(5)

    sql.connect(config, (err) => {
        if (err) console.log(err)

        const qry = `SELECT e.codigo codigoVendedor
                        FROM Ramais r
                        INNER JOIN Entidades e ON r.idUsuario = e.id  
                        WHERE r.ramal = ${ramal}`

        new sql.Request().query(qry, (err, result) => {
            if (err) { 
                console.log(err.message)

            }
            else { 
                console.log("Response: OK")
                
                //codigoVendedor = result.recordset[0].codigoVendedor;
            }
        })
    })

    return codigoVendedor
}

function handleCall(callEvent, res) {
    
    if(callEvent.CallerIDNum == "9990")
        return;

    if(callEvent.CallStatus == "ANSWER"){
        const idChamada = callEvent.CallID.split('.')[0]
        let fonte = '0000'
        let destino = '0000'

        if(callEvent.CallFlow == 'out'){
            fonte = callEvent.CallerExtension.substring(5)
            
        }else{
            fonte = callEvent.CallerIDNum
            destino = callEvent.CalledExtension.substring(5)
        }


        sql.connect(config, (err) => {
            if (err) console.log(err)
    
            console.log(getCodigoVendedor(callEvent))
            let qry = `INSERT INTO Chamadas (idChamada, dataHora, fonte, destino, duracao, status, codigoVendedor)
                        VALUES (${idChamada}, GETDATE(), ${fonte}, ${destino}, 0, 'A', ${getCodigoVendedor(callEvent)})`;
    
            new sql.Request().query(qry, (err, result) => {
                if (err) { 
                    console.log('Erro no Insert: ' + err.message)
                    console.log(qry)
                    res.sendStatus(500) 
                }
                else { 
                    console.log("Response: OK")
                    res.sendStatus(200)  
                }
            })
        })

    }


    if(callEvent.CallStatus == "HANGUP"){
        const idChamada = callEvent.CallID.split('.')[0];
        var duracao;

        sql.connect(config, (err) => {
            if (err) console.log(err)

            let qry = `SELECT DATEDIFF(second, dataHora, GETDATE()) duracao FROM Chamadas WHERE idChamada = ${idChamada}`
            
            new sql.Request().query(qry, (err,result ) => {
                duracao = result.recordset[0].duracao


                qry = `UPDATE Chamadas
                        SET status = 'F', destino = ${callEvent.CalledNumber}, duracao = ${duracao}
                        WHERE idChamada = ${idChamada};`;
    
                new sql.Request().query(qry, (err, result) => {
                    if (err) { 
                        console.log(err.message)
                        res.sendStatus(500) 
                    }
                    else { 
                        console.log("Response: OK")
                        res.sendStatus(200)  
                    }
                })

            })
    

            
        })

    }


}


/*var config = {
    user:  process.env.DB_USER,
    password: process.env.DB_PASS,
    server:  process.env.DB_HOST, 
    port:  Number(process.env.DB_PORT),
    database:  process.env.DB_NAME ,
    requestTimeout: 60000,
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};*/

var config = {
    user:  'jboss.consulta.06',
    password: 'consulta06@jboss',
    server:  'encopelx.no-ip.biz', 
    port:  5023,
    database:  'JM2Online_OLD' ,
    requestTimeout: 60000,
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};