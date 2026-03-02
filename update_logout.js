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
    // Skip explicitly the main admin page (which has the logout button), login page, and already-updated pages
    if (file.includes('login') || file === 'app/admin/page.tsx' || file === 'app\\admin\\page.tsx') continue;

    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('handleLogout')) {
        // 1. Add handleLogout function just before `return (`
        content = content.replace(/(\n\s*)(return \()/i,
            `$1const handleLogout = async () => {\n    await fetch('/api/admin/logout', { method: 'POST' });\n    window.location.href = '/admin/login';\n  };$1$2`
        );

        // 2. Add the logout button before `</nav>`
        content = content.replace(/(\n\s*)(<\/nav>)/i,
            `$1  <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>$1$2`
        );

        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
}
