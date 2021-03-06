const upload = document.getElementById('upload')
const getText = document.getElementById('getText')
const message = document.getElementById('message')

const btnCore1 = document.getElementById('btnCore1')
const btnCore2 = document.getElementById('btnCore2')
const btnCore3 = document.getElementById('btnCore3')
const btnCore4 = document.getElementById('btnCore4')
const btnCore5 = document.getElementById('btnCore5')

const btnTask1 = document.getElementById('btnTask1')
const btnTask2 = document.getElementById('btnTask2')
const btnTask3 = document.getElementById('btnTask3')
const btnTask4 = document.getElementById('btnTask4')
const btnTask5 = document.getElementById('btnTask5')

var coreMinVal = Array(5).fill(0)
var coreAvgVal = Array(5).fill(0)
var coreMaxVal = Array(5).fill(0)
var coreSDVal = Array(5).fill(0)
var taskMinVal = Array(5).fill(0)
var taskAvgVal = Array(5).fill(0)
var taskMaxVal = Array(5).fill(0)
var taskSDVal = Array(5).fill(0)

var dataset = []

let testCase

var taskMin = {
    x: ['core1', 'core2', 'core3', 'core4', 'core5'],
    y: [
        coreMinVal[0],
        coreMinVal[1],
        coreMinVal[2],
        coreMinVal[3],
        coreMinVal[4],
    ],
    name: 'Min',
    mode: 'lines+markers',
}

var taskAvg = {
    x: ['core1', 'core2', 'core3', 'core4', 'core5'],
    y: [
        coreAvgVal[0],
        coreAvgVal[1],
        coreAvgVal[2],
        coreAvgVal[3],
        coreAvgVal[4],
    ],
    name: 'Avg',
    mode: 'lines+markers',
}

var taskMax = {
    x: ['core1', 'core2', 'core3', 'core4', 'core5'],
    y: [
        coreMaxVal[0],
        coreMaxVal[1],
        coreMaxVal[2],
        coreMaxVal[3],
        coreMaxVal[4],
    ],
    name: 'Max',
    mode: 'lines+markers',
}
var taskSD = {
    x: ['core1', 'core2', 'core3', 'core4', 'core5'],
    y: [coreSDVal[0], coreSDVal[1], coreSDVal[2], coreSDVal[3], coreSDVal[4]],
    name: 'SD',
    mode: 'lines+markers',
}
var coreMin = {
    x: ['task1', 'task2', 'task3', 'task4', 'task5'],
    y: [
        taskMinVal[0],
        taskMinVal[1],
        taskMinVal[2],
        taskMinVal[3],
        taskMinVal[4],
    ],
    name: 'Min',
    mode: 'lines+markers',
}
var coreAvg = {
    x: ['task1', 'task2', 'task3', 'task4', 'task5'],
    y: [
        taskAvgVal[0],
        taskAvgVal[1],
        taskAvgVal[2],
        taskAvgVal[3],
        taskAvgVal[4],
    ],
    name: 'Avg',
    mode: 'lines+markers',
}
var coreMax = {
    x: ['task1', 'task2', 'task3', 'task4', 'task5'],
    y: [
        taskMaxVal[0],
        taskMaxVal[1],
        taskMaxVal[2],
        taskMaxVal[3],
        taskMaxVal[4],
    ],
    name: 'Max',
    mode: 'lines+markers',
}
var coreSD = {
    x: ['task1', 'task2', 'task3', 'task4', 'task5'],
    y: [taskSDVal[0], taskSDVal[1], taskSDVal[2], taskSDVal[3], taskSDVal[4]],
    name: 'SD',
    mode: 'lines+markers',
}

//task?????? core??? max, avg, min, sd??? ???
var taskData = [taskMax, taskAvg, taskMin, taskSD]
//core?????? task??? max, avg, min, sd??? ???
var coreData = [coreMax, coreAvg, coreMin, coreSD]
var layout = {
    title: '????????? ????????????',
}
var data = taskData
// ?????? ????????? ???????????? ??????
Plotly.newPlot('chart', data, layout)

upload.addEventListener('click', async function () {
    const inputFileName = document.getElementById('inputFileName').value
    const file = document.getElementById('inputFile').files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', inputFileName)
    if (!inputFileName) {
        return alert('?????? ????????? ????????? ??????????????? ?????????')
    }
    const response = await fetch('http://localhost:3060/upload', {
        method: 'POST',
        body: formData,
    })
    result = await response.json()
    message.innerText = result.message
    getFile()
})

getText.addEventListener('click', async function () {
    const fileNumber = document.getElementById('inputNumber').value
    const fileNameText = document.getElementById('fileNameText')

    let result
    let response
    try {
        response = await fetch(
            `http://localhost:3060/pull?fileNumber=${fileNumber}`
        )
        result = await response.json()

        fileNameText.innerText = `${fileNumber}??? ??????`
        // ????????? ?????? \n ???????????? ?????????
        const makeTestCase = result.text.split('\n')

        let length = makeTestCase.length
        testCase = [length / 7 + 1]
        let text = ''
        // ?????? ?????? ????????? ???????????? ?????????, ????????? ????????? 10???
        for (let i = 1; i <= length; i++) {
            if (i % 7 == 0) {
                continue
            } else if ((i + 1) % 7 == 0) {
                testCase[(i + 1) / 7] = text
                text = ''
            } else text += makeTestCase[i] + '\n'
        }

        try {
            // ????????? ?????? ???????????? ??????
            dataCalculation()
            message.innerText = '????????? ??????????????? ??????????????????.'
        } catch (e) {
            result.message = '?????? ????????? ????????? ???????????? ????????????.'
            message.innerText = result.message
        }
    } catch (e) {
        message.innerText = result.message
    }
})

Array.matrix = (m, n, initial) => {
    var a,
        i,
        j,
        mat = []
    for (i = 0; i < m; i++) {
        a = []
        for (j = 0; j < n; j += 1) {
            a[j] = initial
        }
        mat[i] = a
    }
    return mat
}

let dataAvg = Array.matrix(5, 5, 0)
let dataMin = Array.matrix(5, 5, 0)
let dataMax = Array.matrix(5, 5, 0)
let dataSD = Array.matrix(5, 5, 0)

const dataCalculation = () => {
    var average = Array.matrix(5, 5, 0)
    var max = Array.matrix(5, 5, Number.MIN_SAFE_INTEGER)
    var min = Array.matrix(5, 5, Number.MAX_SAFE_INTEGER)
    var sd = Array.matrix(5, 5, 0)

    for (var i = 1; i < testCase.length; i++) {
        splitCase(i)
    }

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            let avg = 0
            let MAX = Number.MIN_SAFE_INTEGER
            let MIN = Number.MAX_SAFE_INTEGER
            let SD = 0

            for (k = 1; k < testCase.length; k++) {
                MAX = Math.max(dataset[k][i + 1][j + 1], MAX)
                MIN = Math.min(dataset[k][i + 1][j + 1], MIN)
                avg += parseInt(dataset[k][i + 1][j + 1])
            }

            max[i][j] = MAX
            min[i][j] = MIN
            avg = avg / (testCase.length - 1)
            average[i][j] = avg
            for (k = 1; k < testCase.length; k++) {
                SD = SD + Math.pow(dataset[k][i + 1][j + 1] - avg, 2)
            }

            SD /= testCase.length - 1
            SD = Math.sqrt(SD)
            sd[i][j] = SD
        }
    }

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            dataMin[i][j] = min[i][j]
            dataMax[i][j] = max[i][j]
            dataAvg[i][j] = average[i][j]
            dataSD[i][j] = sd[i][j]
        }
    }

    dataMin = min
    dataMax = max
    dataAvg = average
}

const splitCase = (index) => {
    var inputValue = [0, 0, 0, 0, 0]
    // console.log('????????????:' + index)
    const splitLine = testCase[index].split('\n')
    for (let i = 0; i < splitLine.length - 1; i++) {
        const splitTab = splitLine[i].split('\t')
        var temp = []
        for (let j = 1; j <= 5; j++) {
            temp[j] = splitTab[j]
        }
        inputValue[i + 1] = temp
    }

    dataset[index] = inputValue
}

function coreChartUpdate(index) {
    taskMinVal = dataMin[index - 1]
    taskMaxVal = dataMax[index - 1]
    taskAvgVal = dataAvg[index - 1]
    taskSDVal = dataSD[index - 1]

    coreMin = {
        x: ['task1', 'task2', 'task3', 'task4', 'task5'],
        y: [
            taskMinVal[0],
            taskMinVal[1],
            taskMinVal[2],
            taskMinVal[3],
            taskMinVal[4],
        ],
        name: 'Min',
        mode: 'lines+markers',
    }
    coreAvg = {
        x: ['task1', 'task2', 'task3', 'task4', 'task5'],
        y: [
            taskAvgVal[0],
            taskAvgVal[1],
            taskAvgVal[2],
            taskAvgVal[3],
            taskAvgVal[4],
        ],
        name: 'Avg',
        mode: 'lines+markers',
    }
    coreMax = {
        x: ['task1', 'task2', 'task3', 'task4', 'task5'],
        y: [
            taskMaxVal[0],
            taskMaxVal[1],
            taskMaxVal[2],
            taskMaxVal[3],
            taskMaxVal[4],
        ],
        name: 'Max',
        mode: 'lines+markers',
    }
    coreSD = {
        x: ['task1', 'task2', 'task3', 'task4', 'task5'],
        y: [
            taskSDVal[0],
            taskSDVal[1],
            taskSDVal[2],
            taskSDVal[3],
            taskSDVal[4],
        ],
        name: 'SD',
        mode: 'lines+markers',
    }

    coreData = [coreMax, coreAvg, coreMin, coreSD]
    data = coreData
    Plotly.newPlot('chart', data, layout)
}
function taskChartUpdate(index) {
    for (var i = 0; i < 5; i++) {
        coreMinVal[i] = dataMin[i][index - 1]
        coreMaxVal[i] = dataMax[i][index - 1]
        coreAvgVal[i] = dataAvg[i][index - 1]
        coreSDVal[i] = dataSD[i][index - 1]
    }

    taskMin = {
        x: ['core1', 'core2', 'core3', 'core4', 'core5'],
        y: [
            coreMinVal[0],
            coreMinVal[1],
            coreMinVal[2],
            coreMinVal[3],
            coreMinVal[4],
        ],
        name: 'Min',
        mode: 'lines+markers',
    }
    taskAvg = {
        x: ['core1', 'core2', 'core3', 'core4', 'core5'],
        y: [
            coreAvgVal[0],
            coreAvgVal[1],
            coreAvgVal[2],
            coreAvgVal[3],
            coreAvgVal[4],
        ],
        name: 'Avg',
        mode: 'lines+markers',
    }
    taskMax = {
        x: ['core1', 'core2', 'core3', 'core4', 'core5'],
        y: [
            coreMaxVal[0],
            coreMaxVal[1],
            coreMaxVal[2],
            coreMaxVal[3],
            coreMaxVal[4],
        ],
        name: 'Max',
        mode: 'lines+markers',
    }
    taskSD = {
        x: ['core1', 'core2', 'core3', 'core4', 'core5'],
        y: [
            coreSDVal[0],
            coreSDVal[1],
            coreSDVal[2],
            coreSDVal[3],
            coreSDVal[4],
        ],
        name: 'SD',
        mode: 'lines+markers',
    }
    taskData = [taskMax, taskAvg, taskMin, taskSD]
    data = taskData
    Plotly.newPlot('chart', data, layout)
}

btnCore1.addEventListener('click', async function () {
    layout = { title: 'Core1??? ???????????? ????????????' }
    coreChartUpdate(1)
})

btnCore2.addEventListener('click', async function () {
    layout = { title: 'Core2??? ???????????? ????????????' }
    coreChartUpdate(2)
})
btnCore3.addEventListener('click', async function () {
    layout = { title: 'Core3??? ???????????? ????????????' }
    coreChartUpdate(3)
})
btnCore4.addEventListener('click', async function () {
    layout = { title: 'Core4??? ???????????? ????????????' }
    coreChartUpdate(4)
})
btnCore5.addEventListener('click', async function () {
    layout = { title: 'Core5??? ???????????? ????????????' }
    coreChartUpdate(5)
})

btnTask1.addEventListener('click', async function () {
    layout = { title: 'Task1??? ????????? ????????????' }
    taskChartUpdate(1)
})
btnTask2.addEventListener('click', async function () {
    layout = { title: 'Task2??? ????????? ????????????' }
    taskChartUpdate(2)
})
btnTask3.addEventListener('click', async function () {
    layout = { title: 'Task3??? ????????? ????????????' }
    taskChartUpdate(3)
})
btnTask4.addEventListener('click', async function () {
    layout = { title: 'Task4??? ????????? ????????????' }
    taskChartUpdate(4)
})
btnTask5.addEventListener('click', async function () {
    layout = { title: 'Task5??? ????????? ????????????' }
    taskChartUpdate(5)
})
const getFile = async () => {
    let response, result
    try {
        response = await fetch(`http://localhost:3060/files`)
        result = await response.json()
        const users = result.files[0]
        const list = document.getElementById('list')
        list.innerHTML = ''
        // response?????? ????????? ???????????? ???????????? ????????? ????????? ??????, ?????? ?????? ??????
        Object.keys(users).map(function (key) {
            const userDiv = document.createElement('div')
            const remove = document.createElement('button')
            const span = document.createElement('span')
            span.textContent = `${users[key].fileName} (${users[key].fileNumber}??? ??????)`
            remove.textContent = '??????'
            let response
            let result
            let userKey = users[key].fileNumber
            // ?????? ?????? ????????? ??????
            remove.addEventListener('click', async () => {
                try {
                    response = await fetch(
                        `http://localhost:3060/delete/${userKey}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    result = await response.json()
                    getFile()
                    message.innerText = result.message
                } catch (err) {
                    console.error(err)
                }
            })
            userDiv.appendChild(remove)
            userDiv.appendChild(span)
            list.appendChild(userDiv)
        })
    } catch (err) {
        console.error(err)
    }
}

window.onload = getFile
