const screen = document.getElementById('screen')
const context = screen.getContext('2d')

screenWidth = null
screenHeight = null

function createGame() {
    const gravity = 0.5
    var scroll = 0

    const state = {
        plataforms: {}
    }

    function gameLoop() {
        state.player.update(gravity)

        for (const plataformId in state.plataforms) {
            const plataform = state.plataforms[plataformId]

            plataform.checkCollision(state.player)
        }

        if (state.player.keys.d && state.player.x >= 400) {
            state.player.velocity.x = 0

            for (const plataformId in state.plataforms) {
                const plataform = state.plataforms[plataformId]

                plataform.x -= 5
                scroll += 5
            }
        } else if (state.player.keys.d) {
            state.player.velocity.x = 5
        }

        if (state.player.keys.a && state.player.x <= 100) {
            state.player.velocity.x = 0

            for (const plataformId in state.plataforms) {
                const plataform = state.plataforms[plataformId]

                plataform.x += 5
                scroll -= 5
            }
        } else if(state.player.keys.a) {
            state.player.velocity.x = -5
        }

        if (scroll >= 5000) {
            console.log('you win')
        }

        if (screen.height - state.player.height == state.player.y) {
            state.player.x = 100
            state.player.y = 100
            scroll = 0

            for (const plataformId in state.plataforms) {
                const plataform = state.plataforms[plataformId]

                plataform.x = plataform.originalX
                plataform.y = plataform.originalY
            }
        }

        requestAnimationFrame(gameLoop)
    }

    function movePlayer(command) {
        const acceptedMoves = {
            w: function() {
                state.player.velocity.y -= 20
            },

            d: function() {
                state.player.keys.d = true
            },

            a: function() {
                state.player.keys.a = true
            },
        }

        if (command.keyDown && acceptedMoves[command.keyDown]) {
            acceptedMoves[command.keyDown]()
        }
    }

    function stopPlayer(command) { 
        if (command.keyUp == 'd' || command.keyUp == 'a') {

            if (command.keyUp == 'd') {
                state.player.keys.d = false
                state.player.velocity.x = 0
            }

            if (command.keyUp == 'a') {
                state.player.keys.a = false
                state.player.velocity.x = 0
            }
        }
    }

    function resizeScreen() {
        screen.width = innerWidth
        screen.height = innerHeight

        if (screen.width != screenWidth) {
            state.player.y = 100
            screenWidth = screen.width
        }

        if (screen.height != screenHeight) {
            state.player.y = 100
            screenHeight = screen.height
        }

        requestAnimationFrame(resizeScreen)
    }

    return {
        state,
        gravity,
        gameLoop,
        movePlayer,
        stopPlayer,
        resizeScreen
    }
}

const game = createGame()

function createEditor() {
    class Player {
        x
        y
        width
        height
        color

        velocity = {
            x: 0,
            y: 0
        }

        keys = {
            d: false,
            a: false
        }

        update(gravity) {
            this.x += this.velocity.x
            this.y += this.velocity.y

            if (this.y + this.height + this.velocity.y <= screen.height) {
                this.velocity.y += gravity
            } else {
                this.velocity.y = 0
            }
        }
    }

    class Plataform {
        x
        y
        width
        height
        image

        originalX
        originalY

        checkCollision(player) {
            if (player.y + player.height <= this.y && player.y + player.height + player.velocity.y >= this.y && player.x + player.width >= this.x && player.x <= this.x + this.width) {
                player.velocity.y = 0
            }
        }
    }

    function createPlayer(x, y, width, height, color) {
        var player = new Player()

        player.x = x
        player.y = y
        player.width = width
        player.height = height
        player.color = color

        return player
    }

    function createPlataform(x, y, width, height, image) {
        var plataform = new Plataform()

        plataform.x = x
        plataform.y = y
        plataform.originalX = x
        plataform.originalY = y
        plataform.width = width
        plataform.height = height
        plataform.image = new Image()
        plataform.image.src = image

        return plataform
    }

    return {
        createPlayer,
        createPlataform
    }
}

const editor = createEditor()

game.state.player = editor.createPlayer(100, 100, 30, 30, 'red')

game.state.plataforms.plataform1 = editor.createPlataform(200, 100, 200, 20, './Images/grass.png')

game.state.plataforms.plataform2 = editor.createPlataform(500, 200, 200, 20, './Images/grass.png')

game.state.plataforms.plataform3 = editor.createPlataform(0, 500, 500, 300, './Images/grass.png')

game.state.plataforms.plataform4 = editor.createPlataform(650, 500, 1700, 300, './Images/grass.png')

game.gameLoop()
game.resizeScreen()

function renderScreen() {
    context.fillStyle = 'white'
    context.clearRect(0, 0, screen.width, screen.height)

    const player = game.state.player
    context.fillStyle = player.color
    context.fillRect(player.x, player.y, player.width, player.height)

    for (const plataformId in game.state.plataforms) {
        const plataform = game.state.plataforms[plataformId]

        context.drawImage(plataform.image, plataform.x, plataform.y, plataform.width, plataform.height)
    }

    requestAnimationFrame(renderScreen)
}

renderScreen()

function createKeyboardListener() {
    const state = {
        observers: []
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    function onKeyDown(information) {
        const keyDown = information.key

        const command = {
            keyDown
        }

        notifyAll(command)
    }

    function onKeyUp(information) {
        const keyUp = information.key

        const command = {
            keyUp
        }

        notifyAll(command)
    }

    return {
        subscribe
    }
}

const keyboardListener = createKeyboardListener()
keyboardListener.subscribe(game.movePlayer)
keyboardListener.subscribe(game.stopPlayer)