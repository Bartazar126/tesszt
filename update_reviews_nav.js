const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('page.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walkDir('app/admin');

for (const file of files) {
    if (file === 'app/admin/reviews/page.tsx' || file === 'app\\admin\\reviews\\page.tsx' || file.includes('login')) continue;

    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('href="/admin/reviews"')) {
        // Add the reviews link before the /admin/terms link
        content = content.replace(/(<Link href="\/admin\/terms")/i,
            `<Link href="/admin/reviews" className={styles.menuItem}>Reviews</Link>\n                        $1`
        );

        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
}
