describe('createToken utility', () => {
    let createToken;
    let userId = "UDIHF7328gf87as";
    
    // ACT
    beforeAll(() => {
        process.env.JWT_SECRET = "ca458fe4fb106b59d6962738994ba2a02a4c299adb2cb5ecf879e58ff007d08fc067103f3b2cdcad869fa3f68d74db7cdfe8e727c24257b10c0aa62cb694ecc9";
        process.env.JWT_EXPIRES_IN = "7d";
        createToken = require("../../utils/createToken");
        jwt = require("jsonwebtoken");
    });

    it('token should be a string' , ()=>{
        const newToken = createToken(userId)
        expect(typeof newToken).toBe('string')      
    })

     it('token shoudl have two dots and follow teh normal token structure i.e fff.fff.ff' ,()=>{
        const newToken = createToken(userId)
        const parts = newToken.split('.')
        expect(parts).toHaveLength(3)
     })

    it('verify that the token returns teh correct uerId' , ()=>{
        const newToken = createToken(userId)
        const decode = jwt.verify(newToken , process.env.JWT_SECRET)
        expect(decode.userId).toBe(userId)
    }) 
   
});
