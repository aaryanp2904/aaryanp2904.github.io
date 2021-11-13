// Game Sections 
var gameArea = document.getElementById('game-area');
var gameDetails = document.getElementById('game-details');
var selection = document.getElementById('selection');
var messageArea = document.getElementById('message-area');
var messageBox = document.getElementById('message-box');
var roleDetails = document.getElementById('role');
var captainDetails = document.getElementById('captain');
var code = document.getElementById('code');
var gamename = document.getElementById('name');
var loginForm = document.getElementById('login-form');
var gameScreen = document.getElementById('game')

// Selection Variables / Option Choosing Variables
var options = ['writing', 'tier', 'drawing', 'trivia'];
var playerList = [];
var numPlayerLimit;
var optionChosen;
var alienLimit;
var alienNameRadios = [];
var numPlayersChosen = 0;
var playersChosen = [];
var aliensChosen = [];
var triviaAnswers = [];
var triviaQuestionIndex = 0;
var triviaPrompt;
var buttonPushes = 0;

// Buttons 
var joinBtn = document.getElementById('join');
var sendMessageBtn = document.getElementById('send-message')
var alienBtn = document.getElementById('alien-button')
let optionSubmitBtn;
let playerSubmitBtn;
var alienSubmitBtn;
var tierTaskSubmitBtn;
let triviaTaskSubmitBtn;
let writingTaskSubmitBtn;
let bank;

// Button presets
console.log('Disabling button as preset.')
alienBtn.disabled = true
alienBtn.onclick = function () { buttonPushed(); };
sendMessageBtn.disabled = true;

// Style presets for chat
messageArea.style.listStyleType = 'none';
messageBox.disabled = true;

// Input fields - they are already assingned values as I need to add event listeners to them so that
// users can click enter and submit repsonses rather than have to press the button each time.
let triviaInputField = document.createElement('input');
let writingInputField = document.createElement('input');

//Initialise socket connection
var socket = io();



// Joining Room / Initialisation functions

if (sessionStorage.getItem('nickname') && sessionStorage.getItem('room-code')){
    alienBtn.disabled = true
    setTimeout(function() {reconnectToGame()}, 300)
}

joinBtn.addEventListener('click', function (e) {

    // If the code input field is not empty
    if (code.value) {

        // Store the room code in session storage
        sessionStorage.setItem('room-code', code.value)

        // If the name input field is not empty
        if (gamename.value) {

            // Store the name in session storage and send it to the server
            sessionStorage.setItem('nickname', gamename.value)
            socket.emit('client-details', [sessionStorage.getItem('room-code'), sessionStorage.getItem('nickname')])
        }
        
        else {
            alert('Enter name')
        }
    }
    else {
        alert('Enter Room code')
    }

})

socket.on('joining-response', data => {
    if (data) {
        loginForm.innerHTML = ''
        gameArea.textContent = "Successfully joined room with code: " + sessionStorage.getItem('room-code') + '. Your name is ' + sessionStorage.getItem('nickname')
    }

    else {
        alert('No such game. Check your Room code.')
    }
})

socket.on('name-already-in-use', function () {
    alert('Name is already in use')
})

socket.on('role', data => {
    // If player is a human
    if (data === 0) {
        roleDetails.textContent = sessionStorage.getItem('nickname') + ", you are a human. Find out who the aliens are."
    }

    // If player is alien
    else {
        roleDetails.textContent = sessionStorage.getItem('nickname') + ", you are an alien. Hide your identity."
        // Enable the alien chat
        messageBox.disabled = false
        sendMessageBtn.disabled = false
    }
})


// Chat functions

socket.on('receive-alien-chat-message', data => {
    console.log('received message')

    // Add message to chat/message area
    let msg = document.createElement('li')
    msg.textContent = data[0] + ': ' + data[1]
    messageArea.appendChild(msg)
})

sendMessageBtn.addEventListener('click', function (e) {
    socket.emit('send-alien-chat-message', messageBox.value)

    // Add the message that player sent to the chatbox
    let msg = document.createElement('li')
    msg.textContent = 'You: ' + messageBox.value
    messageArea.appendChild(msg)
    messageBox.value = ''
})


// Captain functions

socket.on('your-turn', data => {

    console.log('Disabling button because it\'s my turn.')
    alienBtn.disabled = true
    captainDetails.textContent = "It is your turn to be captain. Please choose one of the options below. ";

    optionCheckboxes = []
    selection.innerHTML = ''
    numPlayerLimit = data[data.length - 1]
    console.log("Player Limit is:", numPlayerLimit)
    for (let i = 0; i < options.length; i++) {
        br = document.createElement('br')
        selection.appendChild(br)
        checkBox = document.createElement("INPUT")
        checkBox.setAttribute("type", "checkbox");
        checkBox.classList.add('hidden')
        checkBox.id = options[i]
        checkBox.name = options[i]
        labelButton = document.createElement("label")
        labelButton.classList.add('playerName')
        labelButton.textContent = options[i]
        labelButton.setAttribute("for", options[i])
        optionCheckboxes.push(checkBox)
        selection.appendChild(checkBox)
        selection.appendChild(labelButton)
        checkBox.onclick = function () { checkOptionLimit(checkBox) }
    }

    optionSubmitBtn = document.createElement('button')
    optionSubmitBtn.classList.add('btn')
    optionSubmitBtn.classList.add('playerOption')
    optionSubmitBtn.classList.add('block-cube')
    optionSubmitBtn.classList.add('block-cube-hover')
    optionSubmitBtn.onclick = function () { createPlayerButtons(data); };
    optionSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit
        </div>`
    optionSubmitBtn.style.display = 'none'
    selection.appendChild(optionSubmitBtn)

})

function checkPlayerLimit(box) {

    // Reset our alien counter
    numPlayersChosen = 0

    // Wipe our aliens chosen list
    playersChosen.splice(0, playersChosen.length)

    // Iterate through all the checkboxes and for each one ticked, increment the alien chosen counter and add the box's id to our aliens chosen list
    for (let y = 0; y < playerNameCheckboxes.length; y++) {
        if (playerNameCheckboxes[y].checked === true) {
            numPlayersChosen++;
            playersChosen.push(playerNameCheckboxes[y].id)
        }
    }

    console.log(box.id + " checked value is: ", box.checked)

    console.log("Aliens chosen: ", numPlayersChosen)

    // If the number of aliens chosen / number of boxes ticked is the same as the limit 
    if (numPlayersChosen === numPlayerLimit) {

        playerSubmitBtn.style.display = 'block'

        // Then we iterate through all the boxes
        for (let y = 0; y < playerNameCheckboxes.length; y++) {

            // If the box has been ticked, we skip this loop
            if (playerNameCheckboxes[y].checked === true) {
                continue
            }

            // If the box hasn't been ticked then disable the box so that it can't be checked as we have reached the limit
            playerNameCheckboxes[y].disabled = true
        }
    }

    // If the number of aliens chosen is less than the limit
    if (numPlayersChosen < numPlayerLimit) {

        playerSubmitBtn.style.display = 'none'

        // We enable all the boxes
        for (let y = 0; y < playerNameCheckboxes.length; y++) {

            playerNameCheckboxes[y].disabled = false
        }

    }

}

function createPlayerButtons(data) {
    playerNameCheckboxes = []
    selection.innerHTML = ''
    for (let i = 0; i < data.length - 1; i++) {
        br = document.createElement('br')
        selection.appendChild(br)
        checkBox = document.createElement("INPUT")
        checkBox.setAttribute("type", "checkbox");
        checkBox.classList.add('hidden')
        checkBox.id = data[i]
        checkBox.name = data[i]
        labelButton = document.createElement("label")
        labelButton.classList.add('playerName')
        labelButton.textContent = data[i]
        labelButton.setAttribute("for", data[i])
        playerNameCheckboxes.push(checkBox)
        selection.appendChild(checkBox)
        selection.appendChild(labelButton)
        checkBox.onclick = function () { checkPlayerLimit(checkBox) }
    }

    playerSubmitBtn = document.createElement('button')
    playerSubmitBtn.classList.add('btn')
    playerSubmitBtn.classList.add('playerOption')
    playerSubmitBtn.classList.add('block-cube')
    playerSubmitBtn.classList.add('block-cube-hover')
    playerSubmitBtn.onclick = function () { sendPlayers(); };
    playerSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit
        </div>`
    playerSubmitBtn.style.display = 'none'
    selection.appendChild(playerSubmitBtn)
}

function checkOptionLimit(box) {
    // Reset our alien counter
    numOptionsChosen = 0


    // Iterate through all the checkboxes and for each one ticked, increment the alien chosen counter and add the box's id to our aliens chosen list
    for (let y = 0; y < optionCheckboxes.length; y++) {
        if (optionCheckboxes[y].checked === true) {
            numOptionsChosen++;
            optionChosen = optionCheckboxes[y].id
            optionSubmitBtn.style.display = 'block'
        }
    }

    if (numOptionsChosen === 0) {
        optionSubmitBtn.style.display = 'none'
    }

    console.log(box.id + " checked value is: ", box.checked)

    console.log("Aliens chosen: ", numOptionsChosen)

    // If the number of aliens chosen / number of boxes ticked is the same as the limit 
    if (numOptionsChosen === 1) {

        // Then we iterate through all the boxes
        for (let y = 0; y < optionCheckboxes.length; y++) {

            // If the box has been ticked, we skip this loop
            if (optionCheckboxes[y].checked === true) {
                continue
            }

            // If the box hasn't been ticked then disable the box so that it can't be checked as we have reached the limit
            optionCheckboxes[y].disabled = true
        }
    }

    // If the number of aliens chosen is less than the limit
    if (numOptionsChosen < 1) {

        // We enable all the boxes
        for (let y = 0; y < optionCheckboxes.length; y++) {

            optionCheckboxes[y].disabled = false
        }
    }

}

function sendPlayers() {
    socket.emit(optionChosen, playersChosen)
    selection.innerHTML = ''
}

socket.on('choosing', data => {
    console.log('Disabling button since captain is choosing.')
    alienBtn.disabled = true
    if (data !== sessionStorage.getItem('nickname')) {
        captainDetails.textContent = data + " is choosing an option."
    }
})


// Task Option functions

socket.on('writing', data => {
    gameArea.innerHTML = ''
    let prompt = document.createElement('div')
    prompt.textContent = data
    prompt.style.textAlign = 'center'
    gameArea.appendChild(prompt)
    let breakLine = document.createElement('br')
    gameArea.appendChild(breakLine)
    writingInputField.type = 'text'
    writingInputField.style.margin = '0 auto'
    writingInputField.style.marginTop = '50px'
    writingInputField.style.width = '500px'
    writingInputField.style.display = 'block'
    writingTaskSubmitBtn = document.createElement('button')
    writingTaskSubmitBtn.classList.add('btn')
    writingTaskSubmitBtn.classList.add('playerOption')
    writingTaskSubmitBtn.classList.add('block-cube')
    writingTaskSubmitBtn.classList.add('block-cube-hover')
    writingTaskSubmitBtn.onclick = function () { sendWritingResponse(writingInputField.value); };
    writingTaskSubmitBtn.style.margin = '0 auto'
    writingTaskSubmitBtn.style.marginTop = '50px'
    writingTaskSubmitBtn.style.display = 'block'
    writingTaskSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit 
        </div>`
    gameArea.appendChild(writingInputField)
    gameArea.appendChild(breakLine)
    gameArea.appendChild(writingTaskSubmitBtn)
    writingInputField.focus()
})

function sendWritingResponse(data) {
    socket.emit('task-response', data)
    resetAreas()
    gameArea.textContent = "Completed task. Your response was: " + data
}

writingInputField.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        writingTaskSubmitBtn.click()
    }
});

socket.on('drawing', data => {
    gameArea.innerHTML = ''
    let prompt = document.createElement('div')
    prompt.textContent = data
    prompt.style.textAlign = 'center'
    gameArea.appendChild(prompt)
    let breakLine = document.createElement('br')
    gameArea.appendChild(breakLine)
    gameArea.appendChild(breakLine.cloneNode(true));
    let canva = document.createElement('canvas')
    canva.id = "drawingCanvas"
    const myCanvas = new fabric.Canvas("drawingCanvas", {
        width: window.innerWidth - 575,
        height: window.innerHeight - 300,
        backgroundColor: "white",
        isDrawingMode: true,
    });


    gameArea.appendChild(myCanvas.wrapperEl)
    let drawingTaskSubmitBtn = document.createElement('button')
    drawingTaskSubmitBtn.onclick = function () { saveCanvas(myCanvas); };
    drawingTaskSubmitBtn.classList.add('btn')
    drawingTaskSubmitBtn.classList.add('playerOption')
    drawingTaskSubmitBtn.classList.add('block-cube')
    drawingTaskSubmitBtn.classList.add('block-cube-hover')
    drawingTaskSubmitBtn.style.margin = '0 auto'
    drawingTaskSubmitBtn.style.marginTop = '50px'
    drawingTaskSubmitBtn.style.display = 'block'
    drawingTaskSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit
        </div>`
    gameArea.appendChild(drawingTaskSubmitBtn)
})

function saveCanvas(myCanvas) {
    var img = myCanvas.toDataURL("image/png");
    socket.emit('task-response', img);
    resetAreas()
    gameArea.textContent = 'Completed the Drawing task.'
}


socket.on('tier', data => {
    console.log('Tier list chosen')
    console.log(data)
    // Receive prompt as first item and the cards as the other items
    gameArea.innerHTML = ''
    let prompt = document.createElement('div')
    prompt.textContent = 'Rank the cards from ' + data[0]
    prompt.style.textAlign = 'center'
    gameArea.appendChild(prompt)
    let breakLine = document.createElement('br')
    gameArea.appendChild(breakLine)
    gameArea.appendChild(breakLine.cloneNode(true));
    gameArea.innerHTML +=
        `    
  <span class="headerContainer">
    <h1>Tier List</h1>
   </span>
   <div id="capture">
<div id="tierListBoard">
  <div id="board">
    <div class="row" id="S">
      <div class="label">S</div>
    </div>
    <div class="row" id="A">
      <div class="label">A</div>
    </div>
    <div class="row" id="B">
      <div class="label">B</div>
    </div>
    <div class="row" id="C">
      <div class="label">C</div>
    </div>
    <div class="row" id="D">
      <div class="label">D</div>
    </div>
    <div class="row" id="F">
      <div class="label">F</div>
    </div>
  </div>
</div>
</body>`

    selection.innerHTML = `
<h2>  Card Bank</h2>
<div id="bank"></div>`
    bank = document.getElementById('bank')
    const rows = document.querySelectorAll('.row');
    const colors = ['green', 'aquamarine', 'yellow', 'orange', 'orangered', 'red'];

    const onRowDragOver = (event) => {
        event.preventDefault();
    }

    const onRowDrop = (event) => {
        event.preventDefault();
        let draggedCardId = event.dataTransfer.getData('id');
        let draggedCard = document.getElementById(draggedCardId);
        event.target.appendChild(draggedCard);
        console.log('dropped the element');
        checkBankEmpty()
    }

    rows.forEach((row, index) => {
        let label = row.querySelector('.label');
        label.style.backgroundColor = colors[index];
        row.ondragover = onRowDragOver;
        row.ondrop = onRowDrop;
    })
    for (let i = 1; i < data.length; i++) {
        let card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('draggable', 'true');
        card.id = data[i]
        card.ondragstart = onDragStart;
        card.ondragend = onDragEnd;
        card.textContent = data[i]
        bank.appendChild(card)
    }

    tierTaskSubmitBtn = document.createElement('button')
    tierTaskSubmitBtn.onclick = function () { sendTier(); };
    tierTaskSubmitBtn.classList.add('btn')
    tierTaskSubmitBtn.classList.add('playerOption')
    tierTaskSubmitBtn.classList.add('block-cube')
    tierTaskSubmitBtn.classList.add('block-cube-hover')
    tierTaskSubmitBtn.style.margin = '0 auto'
    tierTaskSubmitBtn.style.marginTop = '50px'
    tierTaskSubmitBtn.style.display = 'block'
    tierTaskSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit
        </div>`
    tierTaskSubmitBtn.style.display = 'none'
    gameArea.appendChild(tierTaskSubmitBtn)

})

const onDragStart = (event) => {
    console.log('dragging the element');
    event.dataTransfer.setData('id', event.target.id);
    setTimeout(() => {
        event.target.style.visibility = 'hidden';
    }, 50)
}

const onDragEnd = (event) => {
    event.target.style.visibility = 'visible';
    console.log('ended the drag');
}

function sendTier() {
    gameArea.scrollTop = 0
    tierList = document.getElementById('tierListBoard')
    html2canvas(tierList, {
        onrendered: function (canvas) {
            let pngUrl = canvas.toDataURL(); // png in dataURL format
            socket.emit('task-response', pngUrl)
        },
    });
    setTimeout(function () { resetAreas() }, 100);
}

function checkBankEmpty() {
    if (bank.innerHTML === '') {
        tierTaskSubmitBtn.style.display = 'block'
    }
}

function resetAreas() {
    gameArea.innerHTML = "Completed the Tier List task."
    selection.innerHTML = ''
}

socket.on('trivia', data => {
    setTimeout(function () { sendTriviaAnswers(); }, 30000)
    gameArea.innerHTML = ''
    triviaPrompt = document.createElement('div')
    triviaPrompt.textContent = data[triviaQuestionIndex]
    triviaPrompt.style.textAlign = 'center'
    gameArea.appendChild(triviaPrompt)
    let breakLine = document.createElement('br')
    gameArea.appendChild(breakLine)
    triviaInputField.type = 'text'
    triviaInputField.style.margin = '0 auto'
    triviaInputField.style.marginTop = '50px'
    triviaInputField.style.width = '500px'
    triviaInputField.style.display = 'block'
    triviaTaskSubmitBtn = document.createElement('button')
    triviaTaskSubmitBtn.classList.add('btn')
    triviaTaskSubmitBtn.classList.add('playerOption')
    triviaTaskSubmitBtn.classList.add('block-cube')
    triviaTaskSubmitBtn.classList.add('block-cube-hover')
    triviaTaskSubmitBtn.onclick = function () { addTriviaResponse(data); };
    triviaTaskSubmitBtn.style.margin = '0 auto'
    triviaTaskSubmitBtn.style.marginTop = '50px'
    triviaTaskSubmitBtn.style.display = 'block'
    triviaTaskSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit 
        </div>`
    gameArea.appendChild(triviaInputField)
    gameArea.appendChild(breakLine)
    gameArea.appendChild(triviaTaskSubmitBtn)
    triviaInputField.focus()
})

function addTriviaResponse(data) {
    triviaAnswers.push(triviaInputField.value)
    triviaInputField.value = ''
    triviaQuestionIndex += 1

    if (triviaQuestionIndex < data.length){
        triviaPrompt.textContent = data[triviaQuestionIndex]
    }

    else{
        gameArea.innerHTML = 'Completed Trivia task. '
    }
}

function sendTriviaAnswers() {

    console.log('Sending trivia answers: ', triviaAnswers)

    socket.emit('task-response', triviaAnswers)

    gameArea.innerHTML = 'Completed Trivia task. '

    triviaQuestionIndex = 0

    triviaAnswers = []
}

triviaInputField.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            triviaTaskSubmitBtn.click()
        }
    });

socket.on('task-finished', data => {
    console.log('Turning on alien button.')
    alienBtn.disabled = false
})

// Alien Button functions

socket.on('button-pushed', function () {
    console.log('Disabling button since button has been pushed by someone else.')
    alienBtn.disabled = true
})

socket.on('choose-aliens', data => {

    // This is the exact same process as the one used in captaincy
    alienNameCheckboxes = []
    selection.innerHTML = ''
    alienLimit = data[data.length - 1]
    console.log("AlienLimit is:", alienLimit)
    for (let i = 0; i < data.length - 1; i++) {
        br = document.createElement('br')
        selection.appendChild(br)
        checkBox = document.createElement("INPUT")
        checkBox.setAttribute("type", "checkbox");
        checkBox.classList.add('hidden')
        checkBox.id = data[i]
        checkBox.name = data[i]
        labelButton = document.createElement("label")
        labelButton.classList.add('playerName')
        labelButton.textContent = data[i]
        labelButton.setAttribute("for", data[i])
        alienNameCheckboxes.push(checkBox)
        selection.appendChild(checkBox)
        selection.appendChild(labelButton)
        checkBox.onclick = function () { checkLimit(checkBox) }
    }

    alienSubmitBtn = document.createElement('button')
    alienSubmitBtn.classList.add('btn')
    alienSubmitBtn.classList.add('playerOption')
    alienSubmitBtn.classList.add('block-cube')
    alienSubmitBtn.classList.add('block-cube-hover')
    alienSubmitBtn.onclick = function () { sendAliens(); };
    alienSubmitBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Submit
        </div>`
    alienSubmitBtn.disabled = true
    selection.appendChild(alienSubmitBtn)

})

socket.on('agree-or-disagree', data => {
    l = document.createElement('label')
    l.textContent = "Do you agree or disagree with kicking off the players on the host screen? "
    l.style.textAlign = "center"
    l.style.marginTop = "30px"
    gameArea.textContent = ''
    gameArea.appendChild(l)

    // Create an agree button
    agreeBtn = document.createElement('button')
    agreeBtn.classList.add('btn')
    agreeBtn.classList.add('playerOption')
    agreeBtn.classList.add('block-cube')
    agreeBtn.classList.add('block-cube-hover')
    agreeBtn.style.margin = '0 auto'
    agreeBtn.style.marginTop = '50px'
    agreeBtn.style.display = 'block'
    agreeBtn.onclick = function () { sendDecision(1); };
    agreeBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Agree
        </div>`

    // Create a disagree button
    disagreeBtn = document.createElement('button')
    disagreeBtn.classList.add('btn')
    disagreeBtn.classList.add('playerOption')
    disagreeBtn.classList.add('block-cube')
    disagreeBtn.classList.add('block-cube-hover')
    disagreeBtn.style.margin = '0 auto'
    disagreeBtn.style.marginTop = '50px'
    disagreeBtn.style.display = 'block'
    disagreeBtn.onclick = function () { sendDecision(0); };
    disagreeBtn.innerHTML =
        `            
        <div class='bg-top'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg-right'>
            <div class='bg-inner'></div>
        </div>
        <div class='bg'>
            <div class='bg-inner'></div>
        </div>
        <div class='text'>
            Disagree
        </div>`

    gameArea.appendChild(agreeBtn)
    gameArea.appendChild(disagreeBtn)
})

function sendDecision(datum) {
    socket.emit('agree-or-disagree', datum)
    gameArea.innerHTML = ''
}

function buttonPushed() {
    socket.emit('button-pushed')

    // To enforce limit of 2 button pushes in our game
    buttonPushes += 1
    if (buttonPushes > 1){
        alienBtn.style.display = 'none'
    }
}

function sendAliens() {
    socket.emit('aliens-chosen', aliensChosen)
    selection.innerHTML = ''
}

function checkLimit(box) {

    // Reset our alien counter
    numAliensChosen = 0

    // Wipe our aliens chosen list
    aliensChosen.splice(0, aliensChosen.length)

    // Iterate through all the checkboxes and for each one ticked, increment the alien chosen counter and add the box's id to our aliens chosen list
    for (let y = 0; y < alienNameCheckboxes.length; y++) {
        if (alienNameCheckboxes[y].checked === true) {
            numAliensChosen++;
            aliensChosen.push(alienNameCheckboxes[y].id)
            alienSubmitBtn.disabled = false;
        }
    }

    if (numAliensChosen === 0) {
        alienSubmitBtn.disabled = true
    }

    console.log(box.id + " checked value is: ", box.checked)

    console.log("Aliens chosen: ", numAliensChosen)

    // If the number of aliens chosen / number of boxes ticked is the same as the limit 
    if (numAliensChosen === alienLimit) {

        // Then we iterate through all the boxes
        for (let y = 0; y < alienNameCheckboxes.length; y++) {

            // If the box has been ticked, we skip this loop
            if (alienNameCheckboxes[y].checked === true) {
                continue
            }

            // If the box hasn't been ticked then disable the box so that it can't be checked as we have reached the limit
            alienNameCheckboxes[y].disabled = true
        }
    }

    // If the number of aliens chosen is less than the limit
    if (numAliensChosen < alienLimit) {

        // We enable all the boxes
        for (let y = 0; y < alienNameCheckboxes.length; y++) {

            alienNameCheckboxes[y].disabled = false
        }
    }

}


// Reconnection and Disconnection handling

socket.on('disconnect', data => {
    setTimeout(function() {window.location.reload(); alert("You disconnected previously.")}, 5000)
})

function reconnectToGame() {
    socket.emit('client-details', [sessionStorage.getItem('room-code'), sessionStorage.getItem('nickname')])

    // // Game Sections 
    // gameArea = document.getElementById('game-area');
    // gameDetails = document.getElementById('game-details');
    // selection = document.getElementById('selection');
    // messageArea = document.getElementById('message-area');
    // messageBox = document.getElementById('message-box');
    // roleDetails = document.getElementById('role');
    // captainDetails = document.getElementById('captain');
    // code = document.getElementById('code');
    // gamename = document.getElementById('name');
    // loginForm = document.getElementById('login-form');
    // gameScreen = document.getElementById('game')

    // // Selection Variables / Option Choosing Variables
    // options = ['writing', 'tier', 'drawing', 'trivia'];
    // playerList = [];

    // alienNameRadios = [];
    // numPlayersChosen = 0;
    // playersChosen = [];
    // aliensChosen = [];
    // triviaAnswers = [];

    // // Buttons 
    // joinBtn = document.getElementById('join');
    // sendMessageBtn = document.getElementById('send-message')
    // alienBtn = document.getElementById('alien-button')

    // // Button presets
    // console.log('Disabling button as preset.')
    // alienBtn.disabled = true
    // alienBtn.onclick = function () { buttonPushed(); };
    // sendMessageBtn.disabled = true;

    // // Style presets for chat
    // messageArea.style.listStyleType = 'none';
    // messageBox.disabled = true;
}

socket.on('game-already-started', data => {
    alert('The game has already started!')
})

socket.on('clear-everything', data => {
    resetAreas()
})

socket.on('game-ended', data => {
    setTimeout(function() {window.location.reload();}, 5000)
    sessionStorage.clear()
    alert('The game has ended. Your tab will refresh in 5 seconds...')
})

socket.on('player-kicked', data => {
    // Refresh the page in 5 seconds
    setTimeout(function() {window.location.reload();}, 5000)

    // Clear session storage so they do not automatically rejoin and alert the player
    sessionStorage.clear()
    alert('You have been kicked. you can continue watching the game on the host screen. Your tab will refresh in 5 seconds...')
})

