const app = require('./server') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)


it('Call the /youtube endpoint', async () => {
    try {
        const res = await request.get('/youtube')
        expect(res.status).toBe(200)
        expect(res.text).toBe('Hello, youtube indonesia! Fajar Soegi Hallo Good Morning Test Hei')
    } catch (err) {
    }
});
it('Call the / endpoint', async() => {
    // try {
    //     const res = await request.get('/')
    //     expect(res.status).toBe(200)
    //     expect(res.text).toBe('This App is running properly!')
    // } catch (err) {
    // }
    const res = await request
    .get('/')
        expect(res.status).toBe(200)
        expect(res.text).toBe('This App is running properly! TESTING')
})
it('Call the /pong endpoint', async() => {
    try {
        const res = await request.get('/ping')
        expect(res.status).toBe(200)
        expect(res.text).toBe('Pong! Soegidev')
    } catch (err) {
    }
})
it('Call the /hello/:name endpoint', async() => {
    try {
        const res = await request.get('/hello/Iqbal')
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Hello Iqbal')
    } catch (err) {
    }
})
it('Call the /say endpoint', async() => {
    try {
        const res = await request.get('/say')
        expect(res.status).toBe(200)
        expect(res.text).toBe('Say! Soegidev')
    } catch (err) {
    }
})