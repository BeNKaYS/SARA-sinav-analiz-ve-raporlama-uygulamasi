const path = require('path');
const { rcedit } = require('rcedit');

module.exports = async function (context) {
    const { electronPlatformName, appOutDir } = context;
    
    if (electronPlatformName !== 'win32') {
        return;
    }

    const exePath = path.join(appOutDir, context.packager.appInfo.productFilename + '.exe');
    const iconPath = path.resolve(__dirname, '../public/icon.ico');
    
    console.log('='.repeat(60));
    console.log('[AfterPack] Icon degistirme islemi basliyor...');
    console.log('[AfterPack] EXE Yolu:', exePath);
    console.log('[AfterPack] Icon Yolu:', iconPath);
    
    try {
        const fs = require('fs');
        
        if (!fs.existsSync(iconPath)) {
            throw new Error('Icon dosyasi bulunamadi: ' + iconPath);
        }
        
        if (!fs.existsSync(exePath)) {
            throw new Error('EXE dosyasi bulunamadi: ' + exePath);
        }
        
        console.log('[AfterPack] Dosyalar mevcut, rcedit calistiriliyor...');
        
        await rcedit(exePath, {
            icon: iconPath
        });
        
        console.log('[AfterPack] OK Icon basariyla degistirildi!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('[AfterPack] HATA: Icon degistirilemedi!');
        console.error('[AfterPack] Hata Detayi:', error.message);
        console.error('[AfterPack] Stack:', error.stack);
        console.log('='.repeat(60));
        throw error;
    }
};