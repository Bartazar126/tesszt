const data = {
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_mocked123',
            amount_total: 6200,
            currency: 'eur',
            customer_details: {
                email: 'testcustomer@example.com'
            },
            metadata: {
                name: 'Louvre Museum - Standard Entry',
                date: '2024-05-20',
                time: '14:30',
                adult: '2',
                child: '1',
                fullName: 'John Doe Tester',
                email: 'testcustomer@example.com',
                phone: '+36301234567',
                price: '62'
            }
        }
    }
};

fetch('http://localhost:3000/api/webhook/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
    .then(res => res.json())
    .then(data => console.log('Response:', data))
    .catch(err => console.error('Request failed:', err));
