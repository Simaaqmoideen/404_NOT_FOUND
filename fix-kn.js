const fs = require('fs');
const path = 'src/translations/kn.json';
const d = JSON.parse(fs.readFileSync(path, 'utf8'));

d.app_name = 'BinWise';
d.home.why_smartwaste = 'BinWise \u0c8f\u0c95\u0cc6?';
d.home.footer_copy = '\u00a9 2024 BBMP BinWise \u0c89\u0caa\u0c95\u0ccd\u0cb0\u0c2e \u00b7 \u0c2c\u0cc6\u0c82\u0c97\u0cb3\u0cc2\u0cb0\u0cc1, \u0c95\u0cb0\u0ccd\u0ca8\u0cbe\u0c9f\u0c95';
d.auth.register_title = 'BinWise\u0c97\u0cc6 \u0cb8\u0cc7\u0cb0\u0cbf';
d.auth.bbmp_initiative = 'BinWise \u2014 BBMP \u0c89\u0caa\u0c95\u0ccd\u0cb0\u0c2e';
d.auth.join_community = 'BinWise \u0cb8\u0cae\u0cc1\u0ca6\u0cbe\u0caf\u0c95\u0ccd\u0c95\u0cc6 \u0cb8\u0cc7\u0cb0\u0cbf \ud83c\udf0d';
d.auth.welcome_success = 'BinWise\u0c97\u0cc6 \u0cb8\u0cc1\u0cb8\u0ccd\u0cb5\u0cbe\u0c97\u0ca4! \ud83c\udf89';

fs.writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
console.log('Kannada translations updated to BinWise successfully.');
