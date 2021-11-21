// Game sections
let roomDetails = document.getElementById('room-details')
let playersList = document.getElementById('players-list')
let gameArea = document.getElementById('host-game-area')
let playerDisconnects = document.getElementById('player-disconnects')
playersList.textContent = "You have not created a game yet. Please start a game first."

// Buttons
let createGamebtn = document.getElementById('create-game-btn')
let startGamebtn = document.getElementById('start-game-btn')


// Button presets
startGamebtn.style.display = 'none'
startGamebtn.style.margin = '38px'


var socket = io()

// Room creation and initialisation
createGamebtn.addEventListener('click', function () {
    socket.emit('create-room')
    playersList.textContent = 'No players in this lobby yet.'
    createGamebtn.style.display = 'none'
})

socket.on('room-details-code', data => {
    // Set session storage key-value pair for room code
    sessionStorage.setItem('room-code', data)

    // Display the room code in the room details section
    let prompt = document.createElement('div')
    prompt.textContent = "The room code is " + sessionStorage.getItem('room-code')
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    roomDetails.appendChild(prompt)
})

socket.on('player-list', data => {

    // Display all the names of the players in the room
    playersList.textContent = 'Players in your room: '
    var list = document.createElement('ul');
    playersList.appendChild(list)

    for (var i = 0; i < data.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.innerText = data[i];

        // Add it to the list:
        list.appendChild(item);
    }

    // Hide start game button 
    startGamebtn.style.display = 'none'

    // Only show start game button based on how many players are in the game
    if (data.length > 3) {
        startGamebtn.style.display = 'block';
    }
})

startGamebtn.addEventListener('click', function () {
    // When the start game button is clicked tell the server the room is ready to start
    socket.emit('game-ready')
    console.log('ready')

    // Hide the start game button
    delete startGamebtn;
})


// Tasks and handling task responses
socket.on('choosing', data => {
    // Show in the game area who the current captain is
    let prompt = document.createElement('div')
    prompt.textContent = data + ' is choosing an option...'
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    gameArea.appendChild(prompt)
})

socket.on('writing', data => {
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display name of captain, what task they have chosen and who they have chosen to do it
    let prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    let chosen = document.createElement('div')
    chosen.textContent = data[0] + ' has chosen the Writing option. Players to be probed are: '
    prompt.appendChild(chosen)
    for (var i = 0; i < data[1].length; i++) {
        let item = document.createElement('div')
        item.textContent = `- ${data[1][i]}`
        item.style.alignContent - 'center'
        prompt.appendChild(document.createElement('br'))
        prompt.appendChild(item)
    }
    gameArea.appendChild(prompt)

})

socket.on('drawing', data => {
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display name of captain, what task they have chosen and who they have chosen to do it
    let prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    let chosen = document.createElement('div')
    chosen.textContent = data[0] + ' has chosen the Drawing option. Players to be probed are: '
    prompt.appendChild(chosen)
    for (var i = 0; i < data[1].length; i++) {
        let item = document.createElement('div')
        item.textContent = `- ${data[1][i]}`
        item.style.alignContent - 'center'
        prompt.appendChild(document.createElement('br'))
        prompt.appendChild(item)
    }
    gameArea.appendChild(prompt)
})

socket.on('tier', data => {
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display name of captain, what task they have chosen and who they have chosen to do it
    let prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    let chosen = document.createElement('div')
    chosen.textContent = data[0] + ' has chosen the Tier List option. Players to be probed are: '
    prompt.appendChild(chosen)
    for (var i = 0; i < data[1].length; i++) {
        let item = document.createElement('div')
        item.textContent = `- ${data[1][i]}`
        item.style.alignContent - 'center'
        prompt.appendChild(document.createElement('br'))
        prompt.appendChild(item)
    }
    gameArea.appendChild(prompt)

})

socket.on('trivia', data => {
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display name of captain, what task they have chosen and who they have chosen to do it
    let prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
    let chosen = document.createElement('div')
    chosen.textContent = data[0] + ' has chosen the Trivia option. Players to be probed are: '
    prompt.appendChild(chosen)
    for (var i = 0; i < data[1].length; i++) {
        let item = document.createElement('div')
        item.textContent = `- ${data[1][i]}`
        item.style.alignContent - 'center'
        prompt.appendChild(document.createElement('br'))
        prompt.appendChild(item)
    }
    gameArea.appendChild(prompt)

})

socket.on('responses-writing', data => {
    // We receive a list where the first item is the prompt and the second item is a list of responses 

    // Clear current contents of game area
    gameArea.innerHTML = ''

    // If there are responses
    if (Object.keys(data[1]).length > 0) {
        // Display the name of the tasker and their respective response
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = data[0]
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
        for (const [key, value] of Object.entries(data[1])) {
            m = document.createElement('div')
            m.textContent = `${key}: ${value}`
            m.style.textAlign = 'center'
            m.style.marginTop = "50px"
            gameArea.appendChild(m)
        }
    }

    // If there are no responses then we just display the fact that no responses were submitted
    else {
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = 'It seems like no responses were submitted since all the taskers disconnected.'
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
    }

    // Add a button for host to confirm they've seen the responses
    let confBtn = document.createElement('button')
    confBtn.classList.add('btn')
    confBtn.style.margin = "85px"
    // When button is clicked, call this function
    confBtn.onclick = function () { finishedViewing(); };
    confBtn.classList.add('playerOption')
    confBtn.classList.add('block-cube')
    confBtn.classList.add('block-cube-hover')
    confBtn.innerHTML =
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
              OK
          </div>`
    gameArea.appendChild(confBtn)
})

socket.on('responses-drawing', data => {
    // We receive a list where the first item is the prompt and the second item is a list of responses
    
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // If there are responses
    if (Object.keys(data[1]).length > 0) {
        // Display the name of the tasker and their respective response
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = data[0]
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
        for (const [key, value] of Object.entries(data[1])) {
            // Create a div with the tasker's name
            prompt = document.createElement('div')
            prompt.style.textAlign = 'center'
            prompt.textContent = `${key}`
            prompt.style.margin = "15px"
            // Create a div which stores the image version of their drawing
            m = document.createElement('div')
            var HTMLimg = document.createElement('img');
            HTMLimg.src = value;
            m.appendChild(prompt)
            m.appendChild(document.createElement('br'))
            m.appendChild(HTMLimg);
            m.style.textAlign = 'center'
            gameArea.appendChild(m)
        }
    }

    // If there are no responses then we just display the fact that no responses were submitted
    else {
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = 'It seems like no responses were submitted since all the taskers disconnected.'
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
    }

    // Add a button for host to confirm they've seen the responses
    let confBtn = document.createElement('button')
    confBtn.classList.add('btn')
    confBtn.style.margin = "85px"
    // When button is clicked, call this function
    confBtn.onclick = function () { finishedViewing(); };
    confBtn.classList.add('playerOption')
    confBtn.classList.add('block-cube')
    confBtn.classList.add('block-cube-hover')
    confBtn.innerHTML =
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
                  OK
              </div>`
    gameArea.appendChild(confBtn)
})

socket.on('responses-tier', data => {
    // We receive a list where the first item is the prompt and the second item is a list of responses 

    // Clear current contents of game area
    gameArea.innerHTML = ''


    // If there are responses
    if (Object.keys(data[1]).length > 0) {
        // Display the name of the tasker and their respective response
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = 'Players had to rank the cards from ' + data[0][0]
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
        for (const [key, value] of Object.entries(data[1])) {
            // Create a div which shows the tasker's name
            prompt = document.createElement('div')
            prompt.style.textAlign = 'center'
            prompt.textContent = `${key}`
            prompt.style.margin = "15px"
            m = document.createElement('div')

            // Create a div which shows the image version of the tasker's drawing
            var HTMLimg = document.createElement('img');
            HTMLimg.src = value;
            m.appendChild(prompt)
            m.appendChild(document.createElement('br'))
            m.appendChild(HTMLimg);
            m.style.textAlign = 'center'
            gameArea.appendChild(m)
        }
    }

    // If there are no responses then we just display the fact that no responses were submitted
    else {
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = 'It seems like no responses were submitted since all the taskers disconnected.'
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
    }

    // Add a button for host to confirm they've seen the responses
    let confBtn = document.createElement('button')
    confBtn.classList.add('btn')
    confBtn.style.margin = "85px"
    // When button is clicked, call this function
    confBtn.onclick = function () { finishedViewing(); };
    confBtn.classList.add('playerOption')
    confBtn.classList.add('block-cube')
    confBtn.classList.add('block-cube-hover')
    confBtn.innerHTML =
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
                  OK
              </div>`
    gameArea.appendChild(confBtn)
})

socket.on('responses-trivia', data => {

    // Clear current contents of game area
    gameArea.innerHTML = ''

    // If there are responses
    if (Object.keys(data[1]).length > 0) {
        // Display the name of the tasker and their respective response
        for (const [key, value] of Object.entries(data[1])) {
            console.log(`${key} : ${value}`)
            // If no answers were provided then display that and skip the rest of the block of code
            if (value.length === 0) {
                let noResponse = document.createElement('div')
                noResponse.textContent = `${key} submitted no responses.`
                noResponse.style.textAlign = 'center'
                noResponse.style.marginTop = '30px'
                gameArea.appendChild(noResponse)
                continue
            }

            // For each player iterate through their answers and display it
            let name = document.createElement('div')
            name.textContent = `${key}'s responses`
            name.style.textAlign = 'center'
            name.style.marginTop = '50px'
            gameArea.appendChild(name)
            gameArea.appendChild(document.createElement('br'))
            for (let i = 0; i < value.length; i++) {
                let response = document.createElement('div')
                response.textContent = `${data[0][i]} : ${value[i]}`
                response.style.textAlign = 'center'
                response.style.marginTop = '15px'
                gameArea.appendChild(response)
            }
            gameArea.appendChild(document.createElement('br'))

        }
    }

    // If there are no responses then we just display the fact that no responses were submitted
    else {
        prompt = document.createElement('div')
        prompt.style.textAlign = 'center'
        prompt.textContent = 'It seems like no responses were submitted since all the taskers disconnected.'
        prompt.style.margin = "75px"
        gameArea.appendChild(prompt)
    }

    // Add a button for host to confirm they've seen the responses
    let confBtn = document.createElement('button')
    confBtn.classList.add('btn')
    confBtn.style.margin = "85px"
    // When button is clicked, call this function
    confBtn.onclick = function () { finishedViewing(); };
    confBtn.classList.add('playerOption')
    confBtn.classList.add('block-cube')
    confBtn.classList.add('block-cube-hover')
    confBtn.innerHTML =
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
                  OK
              </div>`
    gameArea.appendChild(confBtn)
})

function finishedViewing() {
    // Inform the server we finished viewing the responses
    socket.emit('finished-viewing')

    // Clear current contents of game area
    gameArea.innerHTML = ''
}


// Alien button handling and responses 
socket.on('button-pushed', data => {

    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display who pushed the button on the screen
    let prompt = document.createElement('div')
    prompt.textContent = `${data} has pushed the button!`
    prompt.style.textAlign = 'center'
    prompt.style.marginTop = '30px'
})

socket.on('agree-or-disagree', data => {

    // Clear current contents of game area
    gameArea.innerHTML = ''

    let prompt = document.createElement('div')
    prompt.style.marginTop = '50px'
    prompt.style.textAlign = 'center'

    // If the players were kicked then...
    if (data[0] === 'agree') {
        // For agree we received data = ['agree', alienSuspects, number of aliens left]
        prompt.textContent = 'The room has voted to kick: '
        gameArea.appendChild(prompt)

        //Iterate through every person who was kicked and display their name
        data[1].forEach(name => {
            m = document.createElement('div')
            m.textContent = '- ' + name
            m.style.textAlign = 'center'
            m.style.marginTop = "50px"
            gameArea.appendChild(m)
        })

        // Display how many aliens are left in the game
        let status = document.createElement('div')
        status.textContent = `There are now ${data[2]} aliens left in the game.`
        status.style.marginTop = '50px'
        status.style.textAlign = 'center'
        gameArea.appendChild(status)
    }


    // If the room disagreed...
    else if (data[0] === 'disagree') {
        // Display the result
        prompt.textContent = 'The room has voted to not kick anybody as of now.'
        gameArea.appendChild(prompt)
    }

    // If there are any aliens left in the game, show a confirmation button so the next captain can be chosen 
    if (data[2] !== 0) {
        setTimeout(function () { addConfBtn() }, 4995)
    }

})

function addConfBtn() {
    // Create a new button saying OK
    let confBtn = document.createElement('button')
    confBtn.classList.add('btn')
    confBtn.onclick = function () { finishedViewing(); };
    confBtn.style.margin = "75px"
    confBtn.classList.add('playerOption')
    confBtn.classList.add('block-cube')
    confBtn.classList.add('block-cube-hover')
    confBtn.innerHTML =
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
              OK
          </div>`
    gameArea.appendChild(confBtn)
}

socket.on('aliens-chosen', data => {
    // Clear current contents of game area
    gameArea.innerHTML = ''

    // Display the names of the aliens chosen
    prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.textContent = data[data.length - 1] + ' thinks the aliens are: '
    prompt.style.margin = "75px"
    gameArea.appendChild(prompt)
    for (let i = 0; i < data.length - 1; i++) {
        m = document.createElement('div')
        m.textContent = `- ` + data[i]
        m.style.textAlign = 'center'
        m.style.marginTop = '25px'
        gameArea.appendChild(m)
    }
})


socket.on('aliens-won', data => {
    let humansWon = false

    // Call the game ended function after 5 seconds
    setTimeout(function () { gameEnded(humansWon, data) }, 5000)
})

function gameEnded(humansWon, aliens) {
    // Display who won
    gameArea.innerHTML = ''
    prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    if (humansWon) {
        prompt.textContent = 'Humans have won the game. The Aliens were: '
    }

    else {
        prompt.textContent = 'Aliens have won. The Aliens were: '
    }

    prompt.style.margin = "75px"
    gameArea.appendChild(prompt)

    // Display the names of the aliens
    for (let i = 0; i < aliens.length; i++) {
        m = document.createElement('div')
        m.textContent = `- ` + aliens[i]
        m.style.textAlign = 'center'
        m.style.marginTop = '25px'
        gameArea.appendChild(m)
    }

    // After 3 seconds create an end game button
    setTimeout(function () { createEndGameButton() }, 3000)
}

function createEndGameButton() {
    // Just another button but with a different onCilck function
    let endGameBtn = document.createElement('button')
    endGameBtn.classList.add('btn')
    // Reloads the page so the host can make a new game
    endGameBtn.onclick = function () { window.location.reload() };
    endGameBtn.style.margin = "75px"
    endGameBtn.classList.add('playerOption')
    endGameBtn.classList.add('block-cube')
    endGameBtn.classList.add('block-cube-hover')
    endGameBtn.innerHTML =
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
              Return
          </div>`
    gameArea.appendChild(endGameBtn)
    socket.emit('game-ended')
}

socket.on('humans-won', data => {
    let humansWon = true
    setTimeout(function () { gameEnded(humansWon, data) }, 5000)
})

socket.on('captain-disconnected', data => {
    // Emit finished-viewing to increment captain index
    socket.emit('finished-viewing')

    // Display the fact that the previous captain disconnected.
    gameArea.innerHTML = ''
    prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.textContent = ' The previous captain disconnected. The new captain should choose an option. '
    prompt.style.margin = "75px"
    gameArea.appendChild(prompt)
})

socket.on('tasker-disconnected', data => {

    // Display the fact that a tasker disconnected
    playerDisconnects.innerHTML = ''
    prompt = document.createElement('div')
    prompt.style.textAlign = 'center'
    prompt.textContent = `Tasker ${data} disconnected.`
    prompt.style.margin = "2px"
    playerDisconnects.appendChild(prompt)

    // Host acts as a tasker and emits a message tto balance out task response numbers
    socket.emit('disconnected-tasker-response')
})
