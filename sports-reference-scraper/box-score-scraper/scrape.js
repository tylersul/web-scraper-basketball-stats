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
    year       = inputArray[2]
    version    = inputArray[3];

let url = "";

if (typeof(version) == "undefined") {
    url = "https://www.sports-reference.com/cbb/players/" + firstName + "-" + lastName + "-1/gamelog/" + year + "/";
} else {
    url = "https://www.sports-reference.com/cbb/players/" + firstName + "-" + lastName + "-" + version + ".html";
}
    

// ================================================================== //
// ====================== HTML Request ============================== //
// ================================================================== //
request(url, (err, res, html) => {
    if (!err && res.statusCode == 200) {

        // Load page HTML and set as constant 
        const $ = cheerio.load(html); 
        
        // Placeholder for player stats
        const player = [];
        const playerInfo = [];

        let location = '';
        let gameDetail = '';
        let bigTwelve = ["TCU", "Kansas", "Baylor", "Oklahoma", "Oklahoma State", "Kansas State", "Texas", "Texas Tech", "West Virginia"]

        // Table body containing stats
        let test = $("tbody tr").text();


        // Page header inclusive of player name, split at year beginning (e.g. 2020)
        let pageHeader = $("h1").text().split('2');

        // In resulting array, player name will be first in array
        let playerName = pageHeader[0];

        // Get each individual entry from game log table and push to array
        // Result will be large array containing each data point from the year's game log
        $("tbody tr td").each((i, el) => {
            const item = $(el).text().replace(/\s\s+/g, '');
            playerInfo.push(item);
        });

        while (playerInfo.length > 0) {
            // Each game takes up 30 values in array
            // Splice and add game object to player array below
            game = playerInfo.splice(0, 29);

            // Format game location for easier readability
            if (game[2] == '') {
                 location = 'Home'
            } else if (game[2] == '@') {
                 location = 'Away'
            } else {
                 location = 'Neutral'
            }

            // Renaming regular season games against Big 12 opponents as "REG - CONF
            if (game[4] !== "CTOURN" && (game[3] == "Texas" || game[3] == "TCU" ||  game[3] == "Kansas" ||  game[3] == "Baylor" || 
                                            game[3] == "Oklahoma" || game[3] == "Oklahoma State" || game[3] == "Kansas State" || game[3] == "Texas Tech" || 
                                            game[3] == "West Virginia")) {
                gameDetail = "REG - CONF"
            } else {
                gameDetail = game[4];
            }

            player.push({
                date: game[0],
                season: year,
                location: location,
                opp: game[3],
                gameType: gameDetail,
                result: game[5],
                start: game[6],
                min: game[7],
                fgm: game[8],
                fga: game[9],
                fgp: game[10],
                twoPM: game[11],
                twoPA: game[12],
                twoP: game[13],
                threePM: game[14],
                threePA: game[15],
                threeP: game[16],
                ftm: game[17],
                fta: game[18],
                ftp: game[19],
                orb: game[20],
                drb: game[21],
                ast: game[23],
                stl: game[24],
                blk: game[25],
                to: game[26],
                pf: game[27],
                pts: game[28]
            });
        }
        
        console.log(JSON.stringify(player, null, 2));
    }
});
