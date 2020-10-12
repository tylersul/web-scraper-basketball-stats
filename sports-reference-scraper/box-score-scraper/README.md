# College Basketball Box Score Scraper for Individual Players

NodeJS Web Scraper designed for getting individual player box score data from College Basketball Reference.  Gathers all rows from the box score page and returns an array of objects where each object corresponds to a single game.

## Usage
```shell
node scrape.js playerFirstName playerLastName year
```

## Example Command & Output
```shell
node scrape.js abdel nader 2015
```

### Output (Trimmed to one game)
```shell
[
  {
    "date": "2016-03-25",
    "season": "2016",
    "location": "Neutral",
    "opp": "Virginia",
    "gameType": "NCAA",
    "result": "L",
    "start": "1",
    "min": "32",
    "fgm": "1",
    "fga": "5",
    "fgp": ".200",
    "twoPM": "0",
    "twoPA": "3",
    "twoP": ".000",
    "threePM": "1",
    "threePA": "2",
    "threeP": ".500",
    "ftm": "1",
    "fta": "2",
    "ftp": ".500",
    "orb": "0",
    "drb": "5",
    "ast": "0",
    "stl": "1",
    "blk": "1",
    "to": "0",
    "pf": "4",
    "pts": "4"
  }
]
``` 
