const rcedit = require('rcedit');
const path = require('path');

async function main() {
    // __dirname CommonJS'de çalýþýr
    const exePath = path.resolve(__dirname, '../release/win-unpacked/Optik Deðerlendirme.exe');
    const iconPath = path.resolve(__dirname, '../public/icon.ico');

    console.log('--- Manuel Ýkon Testi (CJS) ---');
    console.log('Hedef EXE:', exePath);
    console.log('Ýkon:', iconPath);

    try {
        await rcedit(exePath, {
            icon: iconPath
        });
        console.log('? Ýþlem BAÞARILI! Ýkonun deðiþmiþ olmasý lazým.');
        console.log('Lütfen release/win-unpacked/Optik Deðerlendirme.exe dosyasýný kontrol edin.');
    } catch (error) {
        console.error('? Ýþlem BAÞARISIZ! Hata detayý:', error);
    }
}

main();
