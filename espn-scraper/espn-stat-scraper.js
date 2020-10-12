// ================================================================== //
// ====================== Variable Instantiation ==================== //
// ================================================================== //
const cheerio = require('cheerio');
const request = require("request");

// ================================================================== //
// ====================== Process User Input ======================== //
// ================================================================== //
let season = process.argv[2];

let firstName = process.argv[3];
let lastName = process.argv[4];
let person   =  firstName+ " " + lastName;

let url = "https://www.espn.com/mens-college-basketball/team/stats/_/id/66/season/" + season;


    request(url, (err, res, html) => {
    if (!err && res.statusCode == 200) {
        const $ = cheerio.load(html); // set html as constant 
        const playerInfo = [];
        const playerSeasonTotal = [];
        let playerOverall = [];
        const teamInfo = [];

        let roster = [];

        const playerName = $(".PlayerHeader__Main_Aside")
        const playerStats = $(".Table__TR");
        
        const player = playerName.children("h1").text();


        /****** Get ALL team stats ******/
        $(".Table__TR td").each((i ,el) => {
            const item = $(el).text();
            teamInfo.push(item);
        });


        // Account for different roster sizes
        // "Total" is the first value in array after the last player
        teamSize = teamInfo.indexOf("Total")

        /****** Get Roster Player Names ******/
        roster = teamInfo.splice(0, teamSize);
        
        /****** Assign Each Player - Per Game Stats ******/
        roster.forEach(function(player) {
            playerPerGame = teamInfo.splice(1, 11)

            for (i = 0; i < playerPerGame.length; i++) {
                playerPerGame[i] = Number(playerPerGame[i])
            }

            playerInfo.push({
                name: player,
                year: season,
                gp: playerPerGame[0],
                perGame: {
                    mpg: playerPerGame[1],
                    fg: playerPerGame[8],
                    tp: playerPerGame[10],
                    ft: playerPerGame[9],
                    rpg: playerPerGame[3],
                    apg: playerPerGame[4],
                    bpg: playerPerGame[6],
                    spg: playerPerGame[5],
                    topg: playerPerGame[7],
                    ppg: playerPerGame[2]
                }
            });
        });

        let cut = roster[0];

        /****** Get Tean Per Game Averages */
        teamPerGame = teamInfo.splice(0, 12)

        rosterTotals = teamInfo.splice(0, teamSize);
        
        // Remove "Totals" from first position of array
        teamInfo.shift();
        
        rosterTotals.forEach(function(player) {


            playerTotals = teamInfo.splice(0, 15)
            
            for (i = 0; i < playerTotals.length; i++) {
                playerTotals[i] = Number(playerTotals[i])
            }

            playerSeasonTotal.push({
                totals: {
                    min: playerTotals[0],
                    fgm: playerTotals[1],
                    fga: playerTotals[2],
                    ftm: playerTotals[3],
                    fta: playerTotals[4],
                    tpm: playerTotals[5],
                    tpa: playerTotals[6],
                    pts: playerTotals[7],
                    orb: playerTotals[8],
                    drb: playerTotals[9],
                    trb: playerTotals[10],
                    ast: playerTotals[11],
                    to: playerTotals[12],
                    stl: playerTotals[13],
                    blk: playerTotals[14]
                }
            });
        });

        for (i = 0; i < playerInfo.length; i++) {
            playerInfo[i].gp = parseInt(playerInfo[i].gp, 10)
            //playerInfo[i].perGame = parseInt(playerInfo[i].perGame, 10)
            merged = {...playerInfo[i], ...playerSeasonTotal[i]}
            playerOverall.push(merged);
        }
        if (typeof(firstName) == "undefined") {
            console.log(playerOverall)
        } else {
            playerOverall.forEach(function(player){
                if (player.name.includes(person)) {
                    found = player;
                    const playerJSON = JSON.stringify(found, null, 2);
                    console.log(playerJSON);
                }
            });
        }
    }
});
