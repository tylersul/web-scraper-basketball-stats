// ================================================================== //
// ====================== Variable Instantiation ==================== //
// ================================================================== //

const cheerio  = require('cheerio'),
      request  = require("request"),
      fs       = require('fs');
      readline = require('readline');


// ================================================================== //
// ====================== Process User Input ======================== //
// ================================================================== //

let inputArray = process.argv.slice(2),
    firstName  = inputArray[0],
    lastName   = inputArray[1],
    version    = inputArray[2];

// players = ["tyrese-haliburton-1.html"];


// Formatting URL
// Adds functionality for names with duplicated in CBB database
// Matt Thomas caused this & his url has a 2 qualifier at the end instead of 1   
let url = "";
if (typeof(version) == "undefined") {
    url = "https://www.sports-reference.com/cbb/players/" + firstName + "-" + lastName + "-1.html";
} else {
    url = "https://www.sports-reference.com/cbb/players/" + firstName + "-" + lastName + "-" + version + ".html";
}

// url = url + player;


// ================================================================== //
// ====================== HTML Request ============================== //
// ================================================================== //
// players.forEach(function(player) {
request(url, (err, res, html) => {
    if (!err && res.statusCode == 200) {

        // Load page HTML and set as constant 
        const $ = cheerio.load(html); 
        //console.log($("#all_players_totals tbody").html());
        //console.log($.html())
        // Create empty player array to encapsulate individual player objects
        const person = [];
        const playerInfo = [];
        const stats = [];
        const totals = [];
        const careerStats = []
        const years = [];
        const season = ["Freshman", "Sophomore", "Junior", "Senior"]




        let test = $(".section-heading span");
        test = test.text();
        console.log("test:" + test);






        /****** Get Player Name  ******/
        // Player Names sit inside of div with id of meta as an H1
        let playerName = $("#meta h1");

        // Pull name text from h1 html
        playerName = playerName.text();


        //****** Get Player Bio Info *******/
        $("#meta p").each((i, el) => {
            const item = $(el).text().replace(/\s\s+/g, '');
            //console.log(item);
            playerInfo.push(item);
        });

        console.log(playerInfo);

        /****** Get Player Position ******/
        // Get position object from Player Info array
        let playerPosition = playerInfo[0];
        
        // Split 'Position: <POSITION>' at colon
        playerPosition = playerPosition.split(":");

        // Set actual position to variable
        playerPosition = playerPosition[1];


        /****** Format Hometown ******/ 
        // If hometown and country are not present on the page, skip for now
        if (playerInfo[2].includes("Hometown")) {

            if(playerInfo[2].includes("Canada")){
                // Example String: "Hometown: Dartmouth, Canada\n"
                // Split starter string at comma
                hometown = playerInfo[2].split(',');

                // Remove new line and white space from " Canada\n"
                country = hometown[1].replace(/\r?\n|\r/, '').trim();

                // Split "Hometown: Dartmouth" at space
                hometown = hometown[0].split(' ');
                
                // Pull "Dartmouth" out and stringify
                hometown = String(hometown[1]);

            } else {
                // Pull 3rd element of playerInfo array ("Hometown: City, State")
                hometown = String(playerInfo[2]);

                // Change data type from object to string
                hometown = String(hometown);

                // Remove "Hometown: " and new line from string
                hometown = hometown.substring(10, hometown.length).replace(/\r?\n|\r/, '');
                country = "USA";
            }
        } else {
            hometown = "";
            country = "";
        }


        
        /****** Format Height & Weight ******/
        // Pull "Height, Weight (Metric Height, Metric Weight" from playerInfo Array
        measureables = playerInfo[1].split(" ");

        // Stringify measureables object
        let height = String(measureables);

        // Split values at first space after height
        height = height.split(" ");

        // Split height in feet from height in inches (e.g. 6-5)
        height = height[0].split("-");

        // Stringify height_feet as first value (6) from height object
        let height_feet = String(height[0]);

        // Convert to integer
        height_feet = Number(height_feet);

        // Grab second object from height array (Everything after height in feet)
        let height_inches = height[1].split(",");

        // Set height in inches as variable 
        height_inches = height_inches[0];

        // Convert to integer
        height_inches = Number(height_inches);

        // Same starting point as three  above
        let weight = height[1].split(",");

        weight = String(weight[1]).trimLeft().substring(0, 3);

        // Convert to integer
        weight = Number(weight);


        /****** Get player Per Game stats ******/ 
        $("#players_per_game td").each((i ,el) => {
            const item = $(el).text();
            stats.push(item);
        });


        /****** Get Years Played for Player ******/
        // Get years played (e.g. 2019-2020) and create array of values
        // Iterates over many values in column header(G, GS, etc. etc.)
        // Narrow down to years only in array
        $("#players_per_game th").each((i ,el) => {

            // Iterate over each item and display the raw text instead of html
            const item = $(el).text();

            if (item.includes(0)){
                years.push(item);
            }            
        });

        
        /****** Get Player Totals ******/
        $(".table_outer_container #players_totals").each((i ,el) => {
            const item = $(el).text();
            totals.push(item);
            console.log(item);
        });
        console.log(totals)

        while (stats.length > 0) {
            substats = stats.splice(0, 28);

            if (substats[0].includes("Iowa State")) {
                careerStats.push({
                    year: "",
                    grade: "",
                    gp: substats[2],
                    gs: substats[3],
                    mpg: substats[4],
                    fg: substats[7],
                    tp: substats[13],
                    ft: substats[16],
                    rpg: substats[19],
                    apg: substats[20],
                    bpg: substats[21],
                    spg: substats[22],
                    ppg: substats[25]
                });

                // Logic included here for when a player transfers from a Non-Juco, 
                //    data is slightly different (Abdel Nader is good example)  
            } else if (substats[0].includes("Transfer") || (substats.length > 2 && substats[2].includes("Iowa State"))) {
                careerStats.push({
                    year: "",
                    grade: "",
                    gp: substats[4],
                    gs: substats[5],
                    mpg: substats[6],
                    fg: substats[9],
                    tp: substats[15],
                    ft: substats[18],
                    rpg: substats[21],
                    apg: substats[22],
                    bpg: substats[24],
                    spg: substats[23],
                    ppg: substats[27]
                });
            }
        }
        
        person.push(
            {
                name: playerName,
                image: "",
                position: playerPosition,
                description: "",
                dob: "",
                hometown: hometown,
                country: country,
                height_feet: height_feet,
                height_inches: height_inches,
                weight: weight,
                season: careerStats
            });

        const playerJSON = JSON.stringify(person, null, 2);
        console.log(playerJSON);
        //fs.writeFileSync('myjsonfile.json', playerJSON);
    }
});