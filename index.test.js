const app = require('./index') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
const mongoose = require("mongoose");

require("dotenv").config();
/* Connecting to the database before each test. */

beforeEach(async () => {
    try{
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }catch(e){

    }
});
  
  /* Closing database connection after each test. */
afterEach(async () => {
    try {
        await mongoose.connection.close();
    } catch (e) {
     
    }
});


it("Call /api/channels", async () => {
    try{
      const res = await request.get('/api/channels/getallchannels/');
      expect(res.status).toBe(200);
    }catch(err){
    }
    });

it('Call the /test endpoint', async () => {
    try {
        const res = await request.get('/test')
        expect(res.status).toBe(200)
        expect(res.text).toBe('Test Hello world')
    } catch (err) {
    }
});