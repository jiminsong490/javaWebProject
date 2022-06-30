const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()
const fs = require('fs')
const { application } = require('express')
const multer = require('multer')
const { get } = require('express/lib/response')
const { JsonWebTokenError } = require('jsonwebtoken')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
app.use(express.json())
app.use(cors())

const host = process.env.DB_HOST
const pass = process.env.DB_PASSWORD
const user = process.env.DB_USER
const database = process.env.DB_DATABASE

// get
console.log()
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/script.js'))
})

app.get('/pull', async (req, res) => {
    let result = false
    const connection = await mysql.createConnection({
        host: host,
        user: user,
        password: pass,
        database: database,
    })
    const fileNubmer = req.query.fileNumber

    try {
        const getText = await connection.execute(
            'SELECT `text` FROM `javaWeb`.`upload` WHERE `fileNumber` = (?)',
            [fileNubmer]
        )
        result = true
        console.log('파일을 불러왔습니다. \n' + getText[0][0].text)
        res.send({ text: getText[0][0].text, success: result })
    } catch (e) {
        result = false
        const errorMessage =
            '해당 번호의 파일이 존재하지 않아 파일을 불러오지 못했습니다.'
        res.send({ success: result, message: errorMessage })
    }
    // res.send({ success: result })
})

app.get('/files', async (req, res) => {
    let result = false
    const connection = await mysql.createConnection({
        host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: pass,
        database: 'javaWeb',
    })
    try {
        const getFile = await connection.execute(
            'SELECT `fileNumber`,`fileName` FROM `javaWeb`.`upload`'
        )
        result = true
        console.log('모든 파일을 성공적으로 가져왔습니다. \n')
        res.send({ files: getFile, success: result })
    } catch (e) {
        result = false
        const errorMessage = '파일을 가져오지 못했습니다.'
        res.send({ success: result, message: errorMessage })
    }
})

// post
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const connection = await mysql.createConnection({
            host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
            user: 'admin',
            password: pass,
            database: 'javaWeb',
        })
        const inputfile = req.file
        const fileName = req.body.fileName
        // console.log(inputfile)

        //입력받은 파일을 읽고 uploads 폴더에 저장
        const data = fs.readFileSync(inputfile.path, 'utf8')
        // 검색된 모든 fileName를 getFileNumber에 저장
        const getFileNumber = await connection.execute(
            'SELECT `fileNumber` FROM `javaWeb`.`upload`'
        )
        // getFileNumber[0]에 모든 fileNumber값 저장, 즉 fileNumber는 저장된 마지막 파일번호
        let fileNumber =
            getFileNumber[0][getFileNumber[0].length - 1].fileNumber
        fileNumber++
        // console.log(getFileNumber)

        const db = await connection.execute(
            'INSERT INTO `javaWeb`.`upload` (`text`,`fileNumber`,`fileName`) VALUES (?,?,?)',
            [data, fileNumber, fileName]
        )

        result = true

        //저장된 파일 삭제
        fs.unlinkSync(inputfile.path)
        //연결 종료
        connection.destroy()
        const successMessage = '파일을 성공적으로 업로드 하였습니다.'
        res.send({
            fileNumber: fileNumber,
            success: result,
            message: successMessage,
        })
    } catch (e) {
        const connection = await mysql.createConnection({
            host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
            user: 'admin',
            password: pass,
            database: 'javaWeb',
        })
        const inputfile = req.file
        const fileName = req.body.fileName
        const data = fs.readFileSync(inputfile.path, 'utf8')
        // console.log(data)

        const db = await connection.execute(
            'INSERT INTO `javaWeb`.`upload` (`text`,`fileNumber`,`fileName`) VALUES (?,?,?)',
            [data, 1, fileName]
        )

        result = true
        fs.unlinkSync(inputfile.path)
        connection.destroy()
        console.log(e)
        const errorMessage =
            '데이터베이스에 파일이 존재하지 않습니다. fileNumber가 1부터 시작됩니다.'
        res.send({ fileNumber: 1, success: result, message: errorMessage })
    }
})

app.delete('/delete/:fileNumber', async (req, res) => {
    let result = false
    const fileNumber = req.params.fileNumber
    console.log(fileNumber)
    const connection = await mysql.createConnection({
        host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: pass,
        database: 'javaWeb',
    })
    try {
        const deleteFile = await connection.execute(
            'DELETE FROM `javaWeb`.`upload` WHERE  `fileNumber`=(?)',
            [fileNumber]
        )
        result = true
        const successMessage = '파일을 성공적으로 삭제했습니다.'
        res.send({ success: result, message: successMessage })
    } catch (e) {
        result = false
        const errorMessage = '파일을 삭제하지 못했습니다.'
        res.send({ success: result, message: errorMessage })
    }
})

app.listen(3060)
