const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'tickets.json');
const tickets = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const fieldsToLocalize = ['name', 'duration', 'longDescription', 'included', 'notIncluded', 'important', 'meetingPoint'];

tickets.forEach(ticket => {
    fieldsToLocalize.forEach(field => {
        if (typeof ticket[field] === 'string') {
            ticket[field] = {
                en: ticket[field],
                fr: '',
                de: '',
                es: '',
                it: ''
            };
        }
    });
});

fs.writeFileSync(dataPath, JSON.stringify(tickets, null, 2), 'utf8');
console.log('Migration complete.');
