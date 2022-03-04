const express = require('express');
const app = express();
const axios = require('axios');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

app.use(cors())
app.use(express.urlencoded());
app.use(express.json());

const port = process.env.PORT || 8888;


app.get('/', (req, res) => {

    res.sendStatus(200)
})

app.post('/getRequisicoes', (req, res) => {

    getRequisicoes(res)

})

app.post('/', (req, res) => {

    console.log('\n\n')
    console.log('--------- POST ---------')
    console.log(req.body)
    console.log('-----------------------')


    /*axios.post('https://webhook.site/b189fa53-ef42-492e-b4e7-98f6a5a31d38', req.body)
        .then(() => { })
    console.log('=> Requisição enviada para fora')*/

    handleCall(req.body, res);

    cadastrarRequisicao(req.body)

    res.sendStatus(200)

})



app.listen(port, () => {
    console.log('Listening on port ' + port)

    global.con = sql.connect(config, (err) => {
        if (err) console.log(err)
    })
})



function cadastrarRequisicao(callEvent) {
    sql.connect(config, (err) => {
        if (err) console.log(err)

        let qry = `INSERT INTO ChamadasAPI (CallID, CallerIDNum, CallerIDName, CalledDID, CalledExtension, CallStatus, CallFlow, CallerExtension, CalledNumber, CallAPIID, timestamp)
                    VALUES ('${callEvent.CallID}', '${callEvent.CallerIDNum}',  '${callEvent.CallerIDName}', '${callEvent.CalledDID}', '${callEvent.CalledExtension}', '${callEvent.CallStatus}', '${callEvent.CallFlow}', '${callEvent.CallerExtension}', '${callEvent.CalledNumber}', '${callEvent.CallAPIID}',GETDATE())`;

        new sql.Request().query(qry, (err, result) => {
            if (err) {
                console.log('')
                console.log('----------- Erro -----------')
                console.log(err)
                console.log('>>>>>> ' + qry)
                console.log('----------------------------')
            }
            else {
                console.log(">> Cadastrado na tabela API: " + callEvent.CallID)

            }
        })
    })
}

function getRequisicoes(res) {
    sql.connect(config, (err) => {
        if (err) console.log(err)

        const qry = `SELECT * FROM ChamadasAPI ORDER BY timestamp`

        new sql.Request().query(qry, (err, result) => {

            res.set({
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Origin": "*"
            });

            res.send(result.recordset)
        })
    })

}






function getCodigoVendedor(callEvent) {
    let codigoVendedor = '-1'
    /*let ramal
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
    })*/

    return codigoVendedor
}

async function getDuracao(idChamada) {
    try {
        let duracao = 0

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `SELECT TOP 1 DATEDIFF(second, dataHora, GETDATE()) duracao FROM ChamadasTemp WHERE idChamada = '${idChamada}'`
        let result = await sql.query(qry)

        //console.log(result)

        duracao = result.recordset[0].duracao

        return duracao

    } catch (err) {

        throw (err)

    }
}

async function apagarRegistroTemp(idChamada) {
    try {

        sql.connect(config, (err) => {
            if (err) console.log(err)
        })
        let qry = `DELETE FROM ChamadasTemp WHERE idChamada = '${idChamada}'`
        let result = await sql.query(qry, (err) => {
            if (err) {
                console.log('')
                console.log('----------- Erro Deletando TEMP -----------')
                console.log(err)
                console.log('>>>>>> ' + qry)
                console.log('-------------------------------------------')
            }
        })

        return result

    } catch (err) {

        throw (err)
    }
}

function handleCall(callEvent, res) {

    const idChamada = callEvent.CallAPIID

    //Ignora Filas
    if (callEvent.CallerIDNum == '9999' || callEvent.CallerIDNum == '9990')
        return


    //Ignora chamadas internas e apaga registros caso existam
    if (callEvent.CalledExtension) {
        apagarRegistroTemp(idChamada)
        return
    }


    //Awsner
    if (callEvent.CallStatus === 'ANSWER') {

        sql.connect(config, (err) => {
            if (err) console.log(err)

            let qry = `INSERT INTO ChamadasTemp (idChamada, dataHora)
                        VALUES ('${idChamada}', GETDATE())`;

            new sql.Request().query(qry, (err, result) => {
                if (err) {
                    console.log('')
                    console.log('----------- Erro -----------')
                    console.log(err)
                    console.log('>>>>>> ' + qry)
                    console.log('----------------------------')
                }
                else {
                    console.log(">> Cadastrado na tabela TEMP: " + callEvent.CallID)
                }
            })
        })

    }


    //Hangup
    if (callEvent.CallStatus == "HANGUP") {

        let fonte = ''
        let destino = ''
        let lastapp = ''
        let status = ''


        if (callEvent.CallFlow == 'out') {  //Flow OUT
            fonte = callEvent.CallerExtension.substring(5)
            destino = callEvent.CalledNumber
            lastapp = '1'

        } else {                            //Flow IN
            fonte = callEvent.CallerIDNum
            destino = callEvent.CalledNumber.substring(5)
            lastapp = '2'

            status = 'R'
        }



        getDuracao(idChamada)
            .then((duracao) => {

                if ((duracao == 0) || (duracao == ''))
                    return

                if ((callEvent.CallFlow == 'out') && (duracao < 30))
                    status = 'Z'



                sql.connect(config, (err) => {
                    if (err) console.log(err)
                })
                qry = ` INSERT INTO Chamadas (idChamada, dataHora, fonte, destino, duracao, lastapp, disposition, status, codigoVendedor, codigoEntidade, obsChamada)
                        VALUES (${callEvent.CallID.split('.')[0]}, GETDATE(), '${fonte}', '${destino}', ${duracao}, ${lastapp}, '', '${status}', ${getCodigoVendedor(callEvent)}, -1, '')`;
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

                    console.log(">> Cadastrado na tabela FINAL: " + callEvent.CallID)

                })
            })
            .catch((err) => {
                console.log(err)
            })
    }





    //
    //ANSWER
    //
    /*if (callEvent.CallStatus == "ANSWER") {
        //const idChamada = callEvent.CallID.split('.')[0]
        const idChamada = callEvent.CallAPIID

        sql.connect(config, (err) => {
            if (err) console.log(err)

            let qry = `INSERT INTO ChamadasTemp (idChamada, dataHora)
                        VALUES ('${idChamada}', GETDATE())`;

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
        //const idChamada = callEvent.CallID.split('.')[0];
        const idChamada = callEvent.CallAPIID

        if (callEvent.CallerIDNum === '9999' || callEvent.CallerIDNum === '9990')
            return



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

                if ((duracao == 0) || (duracao == ''))
                    return

                if ((callEvent.CallFlow == 'out') && (duracao < 30))
                    status = 'Z'



                sql.connect(config, (err) => {
                    if (err) console.log(err)
                })
                qry = ` INSERT INTO Chamadas (${callEvent.CallID.split('.')[0]}, dataHora, fonte, destino, duracao, lastapp, disposition, status, codigoVendedor, codigoEntidade, obsChamada)
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


    
    }*/




}



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