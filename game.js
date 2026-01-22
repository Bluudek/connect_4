//COLORS LIST
colors = new Map();
colors.set('red', '#ff5347');
colors.set('yellow', '#ffbf47');
colors.set('blue', '#47bfff');
colors.set('orange', '#ff9e47');
colors.set('green', '#b8ff47');
colors.set('purple', '#7447ff');

//DOM ELEMENTS
const body = document.body; // body
var start_box_wrapper_el; // start box wrapper (as a parent element)
var start_btn_el; // start button

//CLASSES
// !!! parentElement and warnElement must be dedicated only to game purpose !!!
class Board{
    #width; // board width
    #height; // board height
    #data; // board content
    #player1Color; // color of player 1 checker
    #player2Color; // color of player 2 checker
    #parentElement; // game content div
    #warnElement; // warning && info div
    #gameTable; // table for grid
    #colSelectTable; // table for column selection
    #currentPlayer; // currnet player
    constructor(parentElement, warnElement, width, height){
        this.#data = new Array();
        for(let i = 0; i < width * height; i++)
            this.#data[i] = 0;
        this.#width = width;
        this.#height = height;
        this.#warnElement = warnElement;
        this.#parentElement = parentElement;
        this.#currentPlayer = Math.round(Math.random());

        parentElement.innerHTML = "";
        this.#createColSelectTable();
        this.#createGameTable();
        this.#showWarningOrInfo('','');

    }
    #createColSelectTable(){
        this.#colSelectTable = document.createElement('table');
        this.#colSelectTable.id = 'col_select_table';
        // inner content (tbody > tr*1 > td*n)
        this.#colSelectTable.appendChild(document.createElement('tbody'));
        this.#colSelectTable.children[0].appendChild(document.createElement('tr'));
        for(let i = 0; i < this.#width; i++) this.#colSelectTable.children[0].children[0].appendChild(document.createElement('td'));
        
        //  event listeners for columns in col_select_table
        this.#colSelectTable.children[0].children[0].addEventListener('mouseover', (ev) => {
            ev.target.style.cursor = 'pointer';
            switch(this.#currentPlayer){
                case 0:
                    ev.target.className = 'color_1'; // changing hovered selection circle color to color_1 (default: red)
                    break;
                case 1:
                    ev.target.className = 'color_2'; // changes hovered selection circle color to color_2 (default: yellow)
            }
        }, true); // calls selectCulumnColor function with info about the MOUSEOVER event
        this.#colSelectTable.children[0].children[0].addEventListener('mouseout', (ev) => {
            ev.target.className = ''; // changes circle color back to none
                //body.id = 'body_plain_color'; // body background back to plain  // FOR LATER
                ev.target.style.cursor = 'default';
        }, true); // calls selectCulumnColor function with info about the MOUSEOUT event
        this.#colSelectTable.children[0].children[0].addEventListener('click', (ev) => {
            this.#showWarningOrInfo('', '');
            // checks if selected column is full (if true: shows a warning)
            if(this.#data[ev.target.cellIndex] != 0){
                this.#showWarningOrInfo('warn', 'That column is full !');
            } else {
                for(let i = 0; i < this.#height; i++){
                    // checks if:
                    // cell IS NOT in the last row (on the bottom) && the cell below is occupied
                    // OR
                    // cell IS in the last row && the same cell is not occupied
                    // if (at least, but not really lol) one of these are true: sets the color (more precisely - the class name)
                    // if not: checks next rows until the statement is true
                    if((i < this.#height - 1 && this.#data[(this.#width * (i + 1)) + ev.target.cellIndex] != 0) || (i == this.#height - 1 && this.#data[(this.#width * i) + ev.target.cellIndex] == 0)){
                        switch(this.#currentPlayer){
                            case 0: 
                                this.#data[(this.#width * i) + ev.target.cellIndex] = 1;
                                this.#gameTable.children[0].children[i].children[ev.target.cellIndex].className = 'color_1';
                                break;
                            case 1:
                                this.#data[(this.#width * i) + ev.target.cellIndex] = 2;
                                this.#gameTable.children[0].children[i].children[ev.target.cellIndex].className = 'color_2';
                        }
                        this.#checkWin(this.#currentPlayer);
                        switch(this.#currentPlayer){
                            case 0:
                                ev.target.className = 'color_2'; // changing hovered selection circle color to color_1 (default: red)
                                this.#currentPlayer = 1;
                                break;
                            case 1:
                                ev.target.className = 'color_1'; // changes hovered selection circle color to color_2 (default: yellow)
                                this.#currentPlayer = 0;
                        }
                        break;
                    }
                }
            }
        }, true); // calls putToken function with info about the CLICK event

        this.#parentElement.appendChild(this.#colSelectTable);
    }
    #createGameTable(){
        this.#gameTable = document.createElement('table');
        this.#gameTable.id = 'game_table';
        // inner content (tbody > tr*n > td*n)
        this.#gameTable.appendChild(document.createElement('tbody'));
        for(let i = 0; i < this.#height; i++){
            this.#gameTable.children[0].appendChild(document.createElement('tr'));
            for(let j = 0; j < this.#width; j++) this.#gameTable.children[0].children[i].appendChild(document.createElement('td'));
        }
        this.#parentElement.appendChild(this.#gameTable);
    }
    // Player: 1 or 2; Color: lowercase name (e.g.: blue, green)
    #setColor(player, color){
        if(!colors.has(color)) return;
        if(!(player == 1 || player == 2)) return;

        if(player == 1) this.#player1Color = color;
        if(player == 2) this.#player2Color = color;
        document.documentElement.style.setProperty('--player' + player + 'color', colors.get(color));
    }
    //Colors: 1/2/3 (1 <- red and yellow, 2 <- blue and orange, 3 <- green and purple) 
    setPlayerColors(colors){
        if(!(colors == 1 || colors == 2 || colors == 3)) return;
        switch(colors){
            case 1:
                this.#setColor(1, 'red');
                this.#setColor(2, 'yellow');
                break;
            case 2:
                this.#setColor(1, 'blue');
                this.#setColor(2, 'orange');
                break;
            case 3:
                this.#setColor(1, 'green');
                this.#setColor(2, 'purple');
        }
    }
    //CHECKS IF THERE'S 4 IN A ROW (with the same color player just inserted)
    #checkWin(currentPlayer){
        let roofCols = 0;
        for(let x = 0; x < this.#width; x++){if(this.#data[x] != 0) roofCols++;} // checks all of the columns in the first row (the top one) && saves how many of them are occupied

        // checks vertically
        for(let y = 0; y < this.#height - 3; y++){
            for(let x = 0; x < this.#width; x++){
                if(    this.#data[(this.#width * y) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 1)) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 2)) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 3)) + x] == (currentPlayer + 1)){
                    // calls the endGame function if certain conditions are satisfied
                    this.#endGame(currentPlayer, true, roofCols);
                }
            }
        }

        // checks horizontally
        for(let x = 0; x < this.#width - 3; x++){
            for(let y = 0; y < this.#height; y++){
                if(    this.#data[(this.#width * y) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * y) + x + 1] == (currentPlayer + 1)
                    && this.#data[(this.#width * y) + x + 2] == (currentPlayer + 1)
                    && this.#data[(this.#width * y) + x + 3] == (currentPlayer + 1)){
                    // calls the endGame function if certain conditions are satisfied
                    this.#endGame(currentPlayer, true, roofCols);
                }
            }
        }

        // checks diagonal ascending
        for(let x = 3; x < this.#width; x++){
            for(let y = 0; y < this.#height - 3; y++){
                if(    this.#data[(this.#width * y) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 1)) + x - 1] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 2)) + x - 2] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 3)) + x - 3] == (currentPlayer + 1)){
                    // calls the endGame function if certain conditions are satisfied
                    this.#endGame(currentPlayer, true, roofCols);
                }
            }
        }

        // checks diagonal descending
        for(let x = this.#width - 4; x >= 0; x--){
            for(let y = 0; y < this.#height - 3; y++){
                if(    this.#data[(this.#width * y) + x] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 1)) + x + 1] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 2)) + x + 2] == (currentPlayer + 1)
                    && this.#data[(this.#width * (y + 3)) + x + 3] == (currentPlayer + 1)){
                    // calls the endGame function if certain conditions are satisfied
                    this.#endGame(currentPlayer, true, roofCols);
                }
            }
        }

        //  checks if roofCols (number of occupied columns on the top) is the same as the width (in columns)
        //  if true: calls the endGame function and gives all needed info (last inserted token, no wins, roofCols number, and type of none[none of win types])
        if(roofCols == this.#width) this.#endGame(currentPlayer, false, roofCols);
    }

    #endGame(currentPlayer, isWin, roofCols){
        if(isWin == false && roofCols == this.#width) this.#showWarningOrInfo('win', '<b>Draw</b> (all columns are full, and there\'s no tokens in a row)');
        else if(isWin == true && roofCols == this.#width) this.#showWarningOrInfo('win', `${(currentPlayer == 0 ? this.#player1Color : this.#player2Color)} won! (with all columns full)`);
        else if(isWin == true && roofCols != this.#width) this.#showWarningOrInfo('win', `<b>${(currentPlayer == 0 ? this.#player1Color : this.#player2Color)}</b> won!`);
        
        // turns off the option to put more tokens, and also the hovering effect
        let submit = this.#colSelectTable.children[0].children[0];
        let newSubmit = submit.cloneNode(true); 
        submit.parentNode.replaceChild(newSubmit, submit); 
        submit = newSubmit;

        // enables the start button
        start_box_wrapper_el.style.display = 'block';
        createConnect4Game(start_box_wrapper_el);
    }

    #showWarningOrInfo(type, content){
        // changes text color depending on type && changes innerHTML of the warn_box div element
        switch(type){
            case 'warn':
                this.#warnElement.style.color = '#ff5347'; /* red */
                this.#warnElement.innerHTML = `<p>${content}</p>`;
                break;
            case 'info':
                this.#warnElement.style.color = '#ffffff'; /* white */
                this.#warnElement.innerHTML = `<p>${content}</p>`;
                break;
            case 'win':
                this.#warnElement.style.color = '#a4ff4a'; /* green */
                this.#warnElement.innerHTML = `<p>${content}</p>`;
                break;
            default:
                this.#warnElement.innerHTML = '';
        }
    }
}

// VARIABLES
var board;
var gameColors = 1;

// FUNCTIONS
function createConnect4Game(start_box_wrapper){
    let start_box_header_h2_span = document.createElement("span");
    start_box_header_h2_span.classList.add("four");
    start_box_header_h2_span.appendChild(document.createTextNode("4"));

    let start_box_header_h2 = document.createElement("h2");
    start_box_header_h2.appendChild(document.createTextNode("CONNECT "));
    start_box_header_h2.appendChild(start_box_header_h2_span);

    let start_box_header_h3 = document.createElement("h3");
    start_box_header_h3.appendChild(document.createTextNode("Settings"));

    let start_box_header = document.createElement("div");
    start_box_header.id = "start_box_header";
    start_box_header.appendChild(start_box_header_h2);
    start_box_header.appendChild(start_box_header_h3);

    let start_box_body_p1 = document.createElement("p");
    start_box_body_p1.appendChild(document.createTextNode("Select mode"));

    let start_box_body_game_type_local_pvp = document.createElement("option");
    start_box_body_game_type_local_pvp.value = "local-pvp";
    start_box_body_game_type_local_pvp.appendChild(document.createTextNode("local pvp"));
    
    let start_box_body_game_type_online_pvp = document.createElement("option");
    start_box_body_game_type_online_pvp.value = "online-pvp";
    start_box_body_game_type_online_pvp.appendChild(document.createTextNode("online pvp"));
    start_box_body_game_type_online_pvp.disabled = true; // disabled
    
    let start_box_body_game_type_local_pvc = document.createElement("option");
    start_box_body_game_type_local_pvc.value = "local-pvc";
    start_box_body_game_type_local_pvc.appendChild(document.createTextNode("player vs bot"));
    start_box_body_game_type_local_pvc.disabled = true; // disabled

    let start_box_body_game_type = document.createElement("select");
    start_box_body_game_type.id = "game_type";
    start_box_body_game_type.appendChild(start_box_body_game_type_local_pvp);
    start_box_body_game_type.appendChild(start_box_body_game_type_online_pvp);
    start_box_body_game_type.appendChild(start_box_body_game_type_local_pvc);

    let start_box_body_p2 = document.createElement("p");
    start_box_body_p2.appendChild(document.createTextNode("Select grid size"));

    let start_box_body_grid_size_6x7 = document.createElement("option");
    start_box_body_grid_size_6x7.value = "6x7";
    start_box_body_grid_size_6x7.appendChild(document.createTextNode("6x7 (classic)"));
    
    let start_box_body_grid_size_7x9 = document.createElement("option");
    start_box_body_grid_size_7x9.value = "7x9";
    start_box_body_grid_size_7x9.appendChild(document.createTextNode("7x9"));
    
    let start_box_body_grid_size_8x11 = document.createElement("option");
    start_box_body_grid_size_8x11.value = "8x11";
    start_box_body_grid_size_8x11.appendChild(document.createTextNode("8x11"));
    
    let start_box_body_grid_size = document.createElement("select");
    start_box_body_grid_size.id = "grid_size";
    start_box_body_grid_size.appendChild(start_box_body_grid_size_6x7);
    start_box_body_grid_size.appendChild(start_box_body_grid_size_7x9);
    start_box_body_grid_size.appendChild(start_box_body_grid_size_8x11);

    let start_box_body_p3 = document.createElement("p");
    start_box_body_p3.appendChild(document.createTextNode("Select color set"));

    let start_box_body_color_select_btn1 = document.createElement("button");
    start_box_body_color_select_btn1.style = "background: linear-gradient(110deg, " + colors.get("red") + " 50%, " + colors.get("yellow") + " 50%);";
    start_box_body_color_select_btn1.onclick = () => selectColors(1);

    let start_box_body_color_select_btn2 = document.createElement("button");
    start_box_body_color_select_btn2.style = "background: linear-gradient(110deg, " + colors.get("blue") + " 50%, " + colors.get("orange") + " 50%);";
    start_box_body_color_select_btn2.onclick = () => selectColors(2);

    let start_box_body_color_select_btn3 = document.createElement("button");
    start_box_body_color_select_btn3.style = "background: linear-gradient(110deg, " + colors.get("purple") + " 50%, " + colors.get("green") + " 50%);";
    start_box_body_color_select_btn3.onclick = () => selectColors(3);

    let start_box_body_color_select = document.createElement("div");
    start_box_body_color_select.id = "color_select";
    start_box_body_color_select.appendChild(start_box_body_color_select_btn1);
    start_box_body_color_select.appendChild(start_box_body_color_select_btn2);
    start_box_body_color_select.appendChild(start_box_body_color_select_btn3);

    let start_box_body = document.createElement("div");
    start_box_body.appendChild(start_box_body_p1);
    start_box_body.appendChild(start_box_body_game_type);
    start_box_body.appendChild(document.createElement("br"));
    start_box_body.appendChild(document.createElement("br"));
    start_box_body.appendChild(start_box_body_p2);
    start_box_body.appendChild(start_box_body_grid_size);
    start_box_body.appendChild(document.createElement("br"));
    start_box_body.appendChild(document.createElement("br"));
    start_box_body.appendChild(start_box_body_p3);
    start_box_body.appendChild(start_box_body_color_select);

    let start_btn = document.createElement("button");
    start_btn.id = "start_btn";
    start_btn.addEventListener('click', run, true);
    start_btn.appendChild(document.createTextNode("START"));

    let start_box = document.createElement("div");
    start_box.id = "start_box";
    start_box.appendChild(start_box_header);
    start_box.appendChild(start_box_body);
    start_box.appendChild(start_btn);

    start_box_wrapper.appendChild(start_box);

    start_box_wrapper_el = start_box_wrapper;
    start_btn_el = start_btn;
}

function run(){
    switch(document.getElementById('grid_size').value){
        case '6x7': x_in = 7; y_in = 6; break;
        case '7x9': x_in = 9; y_in = 7; break;
        case '8x11': x_in = 11; y_in = 8;
    }
    board = new Board(document.getElementById('main_box'), document.getElementById('warn_box'), x_in, y_in);
    board.setPlayerColors(gameColors);

    handleOrientationChange(mediaQuery_orientationPortrait);

    start_box_wrapper_el.style.display = 'none';
    start_box_wrapper_el.innerHTML = '';
    body.id = 'body_plain_color'; // sets body's color to default

}

function selectColors(value){ gameColors = value;}

//STYLE
const tables = document.getElementsByTagName('table');
const td = document.getElementsByTagName('td');

// MEDIA QUERIES
//  portrait orientation
const mediaQuery_orientationPortrait = window.matchMedia("(orientation: portrait)");
mediaQuery_orientationPortrait.addEventListener("change", handleOrientationChange);

function handleOrientationChange(e){
    if(mediaQuery_orientationPortrait.matches){
        for(i=0;i<tables.length;i++){
            tables[i].style.borderSpacing = '1vw';
        }
        for(i=0;i<td.length;i++){
            td[i].style.height = `calc((100vw/${x_in}) - (${tables[0].style.borderSpacing} + (${tables[0].style.borderSpacing}/${x_in}))`;
            td[i].style.borderRadius = `calc(((100vw/${x_in}) - (${tables[0].style.borderSpacing} + (${tables[0].style.borderSpacing}/${x_in}))/2)`;
        }
    } else {
        for(i=0;i<tables.length;i++){
            tables[i].style.borderSpacing = '10px';
        }
        for(i=0;i<td.length;i++){
            td[i].style.height = '70px';
            td[i].style.width = '70px';
            td[i].style.borderRadius = '35px';
        }
    }
}

// CALL CREATE GAME FUNCTION
createConnect4Game(document.getElementById('start_box_wrapper'));