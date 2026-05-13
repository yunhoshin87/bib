const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const bookMap = {
    "gen": "창세기", "exo": "출애굽기", "lev": "레위기", "num": "민수기", "deu": "신명기",
    "jos": "여호수아", "jdg": "사사기", "rut": "룻기", "1sa": "사무엘상", "2sa": "사무엘하",
    "1ki": "열왕기상", "2ki": "열왕기하", "1ch": "역대기상", "2ch": "역대기하", "ezr": "에스라",
    "neh": "느헤미야", "est": "에스더", "job": "욥기", "psa": "시편", "pro": "잠언",
    "ecc": "전도서", "sng": "아가", "isa": "이사야", "jer": "예레미야", "lam": "예레미야 애가",
    "ezk": "에스겔", "dan": "다니엘", "hos": "호세아", "jol": "요엘", "amo": "아모스",
    "oba": "오바댜", "jon": "요나", "mic": "미가", "nam": "나훔", "hab": "하박국",
    "zep": "스바냐", "hag": "학개", "zec": "스카랴", "mal": "말라기",
    "mat": "마태복음", "mrk": "마가복음", "luk": "누가복음", "jhn": "요한복음", "act": "사도행전",
    "rom": "로마서", "1co": "고린도전서", "2co": "고린도후서", "gal": "갈라디아서", "eph": "에베소서",
    "php": "빌립보서", "col": "골로새서", "1th": "데살로니가전서", "2th": "데살로니가후서", "1ti": "디모데전서",
    "2ti": "디모데후서", "tit": "디도서", "phm": "빌레몬서", "heb": "히브리서", "jas": "야고보서",
    "1pe": "베드로전서", "2pe": "베드로후서", "1jn": "요한1서", "2jn": "요한2서", "3jn": "요한3서",
    "jud": "유다서", "rev": "요한계시록"
};

const baseUrl = 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE';
const outputPath = path.join(__dirname, 'bible.md');

async function scrapeBible() {
    await fs.remove(outputPath);
    console.log('Scraping started...');

    for (const [code, name] of Object.entries(bookMap)) {
        console.log(`Scraping Book: ${name} (${code})...`);
        let chapter = 1;
        let hasContent = true;

        await fs.appendFile(outputPath, `\n# ${name}\n\n`);

        while (hasContent) {
            try {
                const url = `${baseUrl}&book=${code}&chap=${chapter}`;
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);

                // Correct selector identified by subagent
                const verses = $('#tdBible1 > span');
                
                if (verses.length === 0) {
                    hasContent = false;
                    break;
                }

                await fs.appendFile(outputPath, `## ${chapter}장\n\n`);

                verses.each((i, el) => {
                    const number = $(el).find('span.number').text().trim();
                    const text = $(el).clone().find('span.number').remove().end().text().trim();
                    if (number && text) {
                        fs.appendFileSync(outputPath, `${number}. ${text}\n`);
                    }
                });

                await fs.appendFile(outputPath, `\n`);
                console.log(`  - Chapter ${chapter} done.`);
                chapter++;
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`Error scraping ${name} chapter ${chapter}:`, error.message);
                hasContent = false;
            }
        }
    }

    console.log('Scraping completed. Saved to bible.md');
}

scrapeBible();
