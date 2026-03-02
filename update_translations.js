const fs = require('fs');
const path = require('path');

const locales = {
    en: {
        reviews: {
            title: "Guest Reviews",
            count: "reviews",
            basedOn: "based on {count} reviews"
        }
    },
    fr: {
        reviews: {
            title: "Avis des clients",
            count: "avis",
            basedOn: "basé sur {count} avis"
        }
    },
    de: {
        reviews: {
            title: "Gästebewertungen",
            count: "Bewertungen",
            basedOn: "basierend auf {count} Bewertungen"
        }
    },
    es: {
        reviews: {
            title: "Opiniones de los huéspedes",
            count: "opiniones",
            basedOn: "basado en {count} opiniones"
        }
    },
    it: {
        reviews: {
            title: "Recensioni degli ospiti",
            count: "recensioni",
            basedOn: "basato su {count} recensioni"
        }
    }
};

const i18nPath = path.join(process.cwd(), 'i18n', 'locales');
const files = fs.readdirSync(i18nPath).filter(f => f.endsWith('.json'));

for (const file of files) {
    const lang = file.replace('.json', '');
    if (locales[lang]) {
        const filePath = path.join(i18nPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.reviews = locales[lang].reviews;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${file}`);
    }
}
