const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const urlTemplate = "https://unisat.io/brc20-api-v2/inscriptions/category/text/search/v2?name={}&limit=32&start=0";

app.use(cors());
app.use(express.json());

app.post('/', (res) => {
    res.json("HELOOOOO");
});
app.post('/double', (req, res) => {
    const number = req.body.number;
    const result = number * 2;

    res.json({ result });
});

app.post('/search', async (req, res) => {
    const userInputNumber = req.body.number;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let results = [];

    for (let number = userInputNumber - 10; number <= userInputNumber; number++) {
        const word = "-" + number + ".bitmap";
        const formattedUrl = urlTemplate.replace("{}", word);

        // Navigating to the page
        await page.goto(formattedUrl);

        // Getting JSON response
        const jsonResponse = await page.evaluate(() => JSON.parse(document.body.innerText));
        const matchCount = jsonResponse.data.matchCount;

        let appendText;
        if (matchCount === 0) {
            appendText = 'AVAILABLE';
        } else {
            const timestamp = jsonResponse.data.detail[0].timestamp;
            const date = new Date(timestamp * 1000);
            appendText = ` ---> https://unisat.io/search?q=${word}&type=text&p=1 // ` + date.toLocaleString("en-US");
        }

        results.push(`${word} ${appendText}`);
    }

    await browser.close();
    console.log("SCAN " + (userInputNumber - 10) + " to " + userInputNumber);

    res.json({ results });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
