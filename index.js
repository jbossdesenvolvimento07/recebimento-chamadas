const express = require('express');
const app = express();
const axios = require('axios');
const sql = require('mssql');
require('dotenv').config();

app.use(express.urlencoded());
app.use(express.json());

const port = process.env.PORT || 8888;


app.get('/', (req, res) => {

    /*console.log('=> Chamada recebida GET')

    console.log('--------- GET ---------')
    console.log(req.query)  
    console.log('-----------------------')
    
    axios.get('https://webhook.site/0977cc28-8d83-46e7-9d00-89ca1ad0167c', req.query)
    .then(() => {})
    console.log('=> Requisição enviada para fora')
 
    
    handleCall(req.query, res);

    res.send('OK')*/
})

app.post('/', (req, res) => {

    console.log('\n\n')
    console.log('--------- POST ---------')
    console.log(req.body)
    console.log('-----------------------')


    axios.post('https://webhook.site/b189fa53-ef42-492e-b4e7-98f6a5a31d38', req.body)
    .then(() => {})
    console.log('=> Requisição enviada para fora')

    /*handleCall(req.body, res);*/

})



app.listen(port, () => {
    console.log('Listening on port ' + port)

    global.con = sql.connect(config, (err) => {
        if (err) console.log(err)
    })
})




function getCodigoVendedor(callEvent) {
    let codigoVendedor = '-1'
    let ramal
    if (callEvent.CallFlow == 'out')
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
                console.log('Erro vendedor: ' + err.message)

            }
            else {

                //codigoVendedor = result.recordset[0].codigoVendedor;
            }
        })
    })

    return codigoVendedor
}

async function getDuracao(idChamada) {
    try {
        let duracao = 0

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `SELECT TOP 1 DATEDIFF(second, dataHora, GETDATE()) duracao FROM ChamadasTemp WHERE idChamada = ${idChamada}`
        let result = await sql.query(qry)

        console.log(result)

        duracao = result.recordset[0].duracao

        return duracao

    } catch (err) {

        throw (err)

    }
}

async function apagarRegistroTemp(idChamada) {
    try{

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `DELETE FROM ChamadasTemp WHERE idChamada = ${idChamada}`
        let result = await sql.query(qry)

        return result

    }catch (err) {

        throw(err)
    }
}

function handleCall(callEvent, res) {

    
    if( callEvent.CalledExtension == '498699990' || callEvent.CallerExtension == '498699990')
        return



    //
    //ANSWER
    //
    if (callEvent.CallStatus == "ANSWER") {
        const idChamada = callEvent.CallID.split('.')[0]


        sql.connect(config, (err) => {
            if (err) console.log(err)

            let qry = `INSERT INTO ChamadasTemp (idChamada, dataHora)
                        VALUES (${idChamada}, GETDATE())`;

            new sql.Request().query(qry, (err, result) => {
                if (err) {
                    console.log('')
                    console.log('----------- Erro -----------')
                    console.log(err)
                    console.log('>>>>>> ' + qry)
                    console.log('----------------------------')
                }
                else {
                    console.log("Cadastrado na tabela temp")

                }
            })
        })

    }


    //
    //HANGUP
    //
    if (callEvent.CallStatus == "HANGUP") {
        const idChamada = callEvent.CallID.split('.')[0];



        let fonte = ''
        let destino = ''
        let lastapp = ''
        let status = ''
        if (callEvent.CallFlow == 'out') {
            fonte = callEvent.CallerExtension.substring(5)
            destino = callEvent.CalledNumber
            lastapp = '1'

        } else {
            fonte = callEvent.CallerIDNum
            destino = callEvent.CalledExtension.substring(5)
            lastapp = '2'

            status = 'R'
        }



        getDuracao(idChamada)
            .then((duracao) => {

                if((duracao == 0) || (duracao == ''))
                    return

                if((callEvent.CallFlow == 'out') && (duracao < 30))
                    status = 'Z'
                


                sql.connect(config, (err) => {
                    if (err) console.log(err)
                })
                qry = ` INSERT INTO Chamadas (idChamada, dataHora, fonte, destino, duracao, lastapp, disposition, status, codigoVendedor, codigoEntidade, obsChamada)
                        VALUES (${idChamada}, GETDATE(), ${fonte}, ${destino}, ${duracao}, ${lastapp}, '', '${status}', ${getCodigoVendedor(callEvent)}, -1, '')`;
                sql.query(qry, (err, result) => {
                    if (err) {
                        console.log('')
                        console.log('----------- Erro -----------')
                        console.log(err)
                        console.log('\n>>>>>> ' + qry)
                        console.log('----------------------------')
                        return
                        
                    }

                    apagarRegistroTemp(idChamada)

                    console.log("Cadastrado na tabela final")
        
                })
            })
            .catch((err) => {
                console.log(err)
            })



    }


    res.send('OK')


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
    user: 'jboss.consulta.06',
    password: 'consulta06@jboss',
    server: 'encopelx.no-ip.biz',
    port: 5023,
    database: 'JM2Online_OLD',
    requestTimeout: 60000,
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};