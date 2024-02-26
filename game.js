//VARIABLES
var color = Math.floor(Math.random() * 2); //FIRST PLAYER IS PICKED RANDOMLY
var x_in; //TABLE WIDTH (in columns)
var y_in; //TABLE HEIGHT (in rows)

//DOM ELEMENTS
const body = document.body; // body
const start_box_wrapper_el = document.getElementById('start_box_wrapper'); // start box wrapper (as a parent element)
const start_btn_el = document.getElementById('start_btn'); // start button
const warn_box_el = document.getElementById('warn_box'); // warning && info div
const main_box_el = document.getElementById('main_box'); // main game div
const col_select_table_el = document.createElement('table'); // table for column selection
const game_table_el = document.createElement('table'); // table for grid
const stylesheet_game = document.querySelector('link[href*="game.css"]').sheet; // "game.css" stylesheet
const grid_size_select_el = document.getElementById('grid_size');

//COLOR SET SELECTION 
function selectColors(index){
    switch(index){
        case 0:
            stylesheet_game.cssRules[5].style.background = 'var(--red)';
            stylesheet_game.cssRules[6].style.background = 'var(--yellow)';
            break;
        case 1:
            stylesheet_game.cssRules[5].style.background = 'var(--blue)';
            stylesheet_game.cssRules[6].style.background = 'var(--orange)';
            break;
        case 2:
            stylesheet_game.cssRules[5].style.background = 'var(--green)';
            stylesheet_game.cssRules[6].style.background = 'var(--purple)';
    }
}

//GRID BUILDING (COLUMN SELECTION && GAME) with given x && y lengths
function buildGrid(x, y){
    //COLUMN SELECTION TABLE
    col_select_table_el.id = 'col_select_table';
    main_box_el.appendChild(col_select_table_el);

    //  inner content (tbody > tr*1 > td*n)
    col_select_table_el.appendChild(document.createElement('tbody'));
    col_select_table_el.children[0].appendChild(document.createElement('tr'));
    for(i=0; i<x; i++) col_select_table_el.children[0].children[0].appendChild(document.createElement('td'));

    //GAME TABLE
    game_table_el.id = 'game_table';
    main_box_el.appendChild(game_table_el);

    //  inner content (tbody > tr*n > td*n)
    game_table_el.appendChild(document.createElement('tbody'));
    for(i=0; i<y; i++){
        game_table_el.children[0].appendChild(document.createElement('tr'));
        for(j=0; j<x; j++) game_table_el.children[0].children[i].appendChild(document.createElement('td'));
    }    
}

const game_table_array = new Array(y_in);
//GAME START
function startGame(){
    console.log(grid_size_select_el.value);
    switch(grid_size_select_el.value){
        case '6x7': x_in = 7; y_in = 6; break;
        case '7x9': x_in = 9; y_in = 7; break;
        case '8x11': x_in = 11; y_in = 8;
    }

    buildGrid(x_in, y_in);
    //GAME TABLE ARRAY (to reach easier for wanted columns, by using loops)
    
    for(i=0;i<y_in;i++) game_table_array[i] = game_table_el.children[0].children[i].children;

    handleOrientationChange(mediaQuery_orientationPortrait);

    //  event listeners for columns in col_select_table
    col_select_table_el.children[0].children[0].addEventListener('mouseover', selectColumnColor, true); // calls selectCulumnColor function with info about the MOUSEOVER event
    col_select_table_el.children[0].children[0].addEventListener('mouseout', selectColumnColor, true); // calls selectCulumnColor function with info about the MOUSEOUT event
    col_select_table_el.children[0].children[0].addEventListener('click', putToken, true); // calls putToken function with info about the CLICK event

    start_btn_el.disabled = true; // disables the start button, so you can't start while playing
    start_box_wrapper_el.style.display = 'none';
    showWarningOrInfo('',''); // clears warn_box's innerHTML
    body.id = 'body_plain_color'; // sets body's color to default

    for(i=0;i<x_in;i++) col_select_table_el.children[0].children[0].children[i].className = ''; // clears all selection columns, so it won't stuck with the color form a previous game

    // clears all game grid columns (all cells), so it won't stuck with the color form a previous game
    for(y=0;y<y_in;y++){
        for(x=0;x<x_in;x++){
            game_table_array[y][x].className = '';
        }
    }
}

//col_select_table_el STYLE ON HOVER
function selectColumnColor(ev){
    if(ev.type == 'mouseover' || ev.type == 'click'){
        ev.target.style.cursor = 'pointer';
        switch(color){
            case 0:
                //body.id = 'body_color_1'; // changes body's background do color_1 (default: red)  // FOR LATER
                ev.target.className = 'color_1'; // changing hovered selection circle color to color_1 (default: red)
                break;
            case 1:
                //body.id = 'body_color_2'; // changes body's background do color_2 (default: yellow)  // FOR LATER
                ev.target.className = 'color_2'; // changes hovered selection circle color to color_2 (default: yellow)
        }
    } else if(ev.type == 'mouseout') {
        ev.target.className = ''; // changes circle color back to none
        //body.id = 'body_plain_color'; // body background back to plain  // FOR LATER
        ev.target.style.cursor = 'default';
    }
}

// PUTS THE TOKEN (with given column position)
function putToken(ev){
    showWarningOrInfo('', '');
    // checks if selected column is full (if true: shows a warning)
    if(game_table_array[0][ev.target.cellIndex].className != ''){
        showWarningOrInfo('warn', 'That column is full !');
    } else {
        for(i=0; i<y_in; i++){
            // checks if:
            // cell IS NOT in the last row (on the bottom) && the cell below is occupied
            // OR
            // cell IS in the last row && the same cell is not occupied
            // if (at least, but not really lol) one of these are true: sets the color (more precisely - the class name)
            // if not: checks next rows until the statement is true
            if((i < y_in-1 && game_table_array[i+1][ev.target.cellIndex].className != '') || (i == y_in-1 && game_table_array[i][ev.target.cellIndex].className == '')){
                switch(color){
                    case 0: game_table_array[i][ev.target.cellIndex].className = 'color_1';
                            color = 1;
                            break;
                    case 1: game_table_array[i][ev.target.cellIndex].className = 'color_2';
                            color = 0;
                }
                checkWin(game_table_array[i][ev.target.cellIndex]);
                selectColumnColor(ev);
                break;
            }
        }
    }
}

//CHECKS IF THERE'S 4 IN A ROW (with the same color player just inserted)
function checkWin(token_el){
    let roofCols = 0;
    for(x=0;x<x_in;x++){if(game_table_array[0][x].className != '') roofCols++;} // checks all of the columns in the first row (the top one) && saves how many of them are occupied

    // checks vertically
    for(y=0; y<y_in-3; y++){
        for(x=0; x<x_in; x++){
            if(    game_table_array[y][x].className == token_el.className
                && game_table_array[y+1][x].className == token_el.className
                && game_table_array[y+2][x].className == token_el.className
                && game_table_array[y+3][x].className == token_el.className){
                // calls the endGame function if certain conditions are satisfied
                endGame(token_el, true, roofCols);
            }
        }
    }

    // checks horizontally
    for(x=0; x<x_in-3; x++){
        for(y=0; y<y_in; y++){
            if(    game_table_array[y][x].className == token_el.className
                && game_table_array[y][x+1].className == token_el.className
                && game_table_array[y][x+2].className == token_el.className
                && game_table_array[y][x+3].className == token_el.className){
                // calls the endGame function if certain conditions are satisfied
                endGame(token_el, true, roofCols);
            }
        }
    }

    // checks diagonal ascending
    for(x=3; x<x_in; x++){
        for(y=0; y<y_in-3; y++){
            if(    game_table_array[y][x].className == token_el.className
                && game_table_array[y+1][x-1].className == token_el.className
                && game_table_array[y+2][x-2].className == token_el.className
                && game_table_array[y+3][x-3].className == token_el.className){
                // calls the endGame function if certain conditions are satisfied
                endGame(token_el, true, roofCols);
            }
        }
    }

    // checks diagonal descending
    for(x=x_in-4; x>=0; x--){
        for(y=0; y<y_in-3; y++){
            if(    game_table_array[y][x].className == token_el.className
                && game_table_array[y+1][x+1].className == token_el.className
                && game_table_array[y+2][x+2].className == token_el.className
                && game_table_array[y+3][x+3].className == token_el.className){
                // calls the endGame function if certain conditions are satisfied
                endGame(token_el, true, roofCols);
            }
        }
    }

    //  checks if roofCols (number of occupied columns on the top) is the same as the width (in columns)
    //  if true: calls the endGame function and gives all needed info (last inserted token, no wins, roofCols number, and type of none[none of win types])
    if(roofCols == x_in) endGame(token_el, false, roofCols, '');
}

//GAME END
function endGame(token_el, isWin, roofCols){
    if(isWin == false && roofCols == x_in) showWarningOrInfo('win', '<b>Draw</b> (all columns are full, and there\'s no tokens in a row)');
    else if(isWin == true && roofCols == x_in) showWarningOrInfo('win', `${token_el.className} won! (with all columns full)`);
    else if(isWin == true && roofCols != x_in) showWarningOrInfo('win', `<b>${token_el.className}</b> won!`);
    
    switch(color){
        case 0: color = 1; break;
        case 1: color = 0;
    }
    
    // turns off the option to put more tokens, and hovering effect
    col_select_table_el.children[0].children[0].removeEventListener('mouseover', selectColumnColor, true);
    col_select_table_el.children[0].children[0].removeEventListener('click', putToken, true);
    
    // enables the start button
    start_btn_el.disabled = false;
    start_box_wrapper_el.style.display = 'block';
    for(i=0;i<x_in;i++) col_select_table_el.children[0].children[0].children[i].className = '';
}

//WARNINGS/INFO
function showWarningOrInfo(type, content){
    // changes text color depending on type && changes innerHTML of the warn_box div element
    switch(type){
        case 'warn':
            warn_box_el.style.color = '#ff5347'; /* red */
            warn_box_el.innerHTML = `<p>${content}</p>`;
            break;
        case 'info':
            warn_box_el.style.color = '#ffffff'; /* white */
            warn_box_el.innerHTML = `<p>${content}</p>`;
            break;
        case 'win':
            warn_box_el.style.color = '#a4ff4a'; /* green */
            warn_box_el.innerHTML = `<p>${content}</p>`;
            break;
        default:
            warn_box_el.innerHTML = '';
    }
}


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

