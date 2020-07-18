const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getCourse(urlCode) {
    const response = await axios.get(`https://eng.yeditepe.edu.tr/tr/makine-muhendisligi-bolumu/dersler/${urlCode}`);
    const $ = cheerio.load(response.data);

    const labels = $('div.field-label');

    let ders = {};

    for (let i = 0; i < labels.length; i++) {
        const label = $(labels[i]);

        if (label.text().trim().includes('Ders Kodu:')) {
            let item = label.parent().find('div.field-item');
            ders.kod = item.text().trim();
        }
        else if (label.text().trim().includes('Ders Dönemi:')) {
            let item = label.parent().find('div.field-item');
            ders.donem = item.text().trim();
        }
        else if (label.text().trim().includes('Ders Tipi:')) {
            let item = label.parent().find('div.field-item');
            ders.tip = item.text().trim();
        }
        else if (label.text().trim().includes('Teori Saati:')) {
            let item = label.parent().find('div.field-item');
            ders.teoriSaat = item.text().trim();
        }
        else if (label.text().trim().includes('Uygulama Saati:')) {
            let item = label.parent().find('div.field-item');
            ders.uygulamaSaat = item.text().trim();
        }
        else if (label.text().trim().includes('Kredi:')) {
            let item = label.parent().find('div.field-item');
            ders.kredi = item.text().trim();
        }
        else if (label.text().trim().includes('AKTS:')) {
            let item = label.parent().find('div.field-item');
            ders.akts = item.text().trim();
        }
        else if (label.text().trim().includes('Dersin Dili:')) {
            let item = label.parent().find('div.field-item');
            ders.dil = item.text().trim();
        }
        else if (label.text().trim().includes('Dersin Amacı:')) {
            let item = label.parent().find('div.field-item');
            ders.amac = item.text().trim().replace(/[^a-zA-Z0-9.,;:\/()\[\]\süöığçşİŞĞÜÇÖ'"]/gm, '');
        }
        else if (label.text().trim().includes('Dersin İçeriği:')) {
            let item = label.parent().find('div.field-item');
            ders.icerik = item.text().trim().replace(/[^a-zA-Z0-9.,;:\/()\[\]\süöığçşİŞĞÜÇÖ'"]/gm, '');
        }
    }

    return ders;
}

function serialize(ders) {
    return `\\begin{minipage}{\\textwidth}\\textbf{\\large{${ders.kod} - ${ders.isim}}}\\\\
    \\begin{tabular}{p{3.7cm} p{3.7cm} p{3.7cm} p{3.7cm}}
    \\textbf{Kod:} ${ders.kod} & ${ders.donem ? `\\textbf{Dönem:} ${ders.donem} &` : ''} \\textbf{Tip:} ${ders.tip} ${ders.teoriSaat ? `& \\textbf{Teori Saati:} ${ders.teoriSaat}\\\\` : ''}
    ${ders.uygulamaSaat ? `\\textbf{Uygulama Saati:} ${ders.uygulamaSaat} &` : ''} ${ders.dil ? `\\textbf{Dersin Dili:} ${ders.dil} &` : ''} \\textbf{Kredi:} ${ders.kredi} & \\textbf{AKTS:} ${ders.akts}
    \\end{tabular}\\\\${ders.amac ? `\\textbf{Dersin Amacı:} ${ders.amac}\\\\` : ''}
    \\textbf{Dersin İçeriği:} ${ders.icerik} \\end{minipage}\\newline\\newline\\newline`;
}

async function main() {
    const response = await axios.get('https://eng.yeditepe.edu.tr/tr/makine-muhendisligi-bolumu/dersler');
    const $ = cheerio.load(response.data);

    const tables = $('table');

    let content = '';

    for (let i = 0; i < tables.length; i++) {
        const rows = $(tables[i]).find('tbody > tr');

        for (let j = 0; j < rows.length; j++) {
            const cols = $(rows[j]).find('td');

            let kod = $(cols[0]).text().trim();
            let ders = $(cols[1]).text().trim();
            let urlParts = $(cols[1]).find('a').attr('href').split('/');
            let urlKod = urlParts[urlParts.length - 1];

            if (kod.includes('XX')) {
                continue;
            }

            let course = await getCourse(urlKod);
            course.isim = ders;

            let serialized = serialize(course);
            console.log(serialized);

            content += serialized;
        }
    }

    fs.writeFile('content.txt', content, (err, data) => {
        if (err) {
            console.log(err);
        }
    });
}

main();