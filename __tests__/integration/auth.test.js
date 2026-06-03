const request = require('supertest')
const mongoose = require('mongoose')

process.env.JWT_SECRET="cbiuadabcusidbv9024904h0f";
process.env.JWT_EXPIRES_IN="1d";

const app = require("../../app")
const UserModel = require("../../models/User")


const {connectTestDB , clearTestDB , closeTestDB} = require("../setup/database")

beforeAll(async()=> {await connectTestDB()})
afterAll(async()=> {await closeTestDB()})
beforeEach(async()=> {await clearTestDB()})


describe("/POST test on register request -- user sgning up" , ()=>{
// AAA
// arrange
// act
// asert
let userData;
beforeAll(()=>{
    userData={
        email:"John@email.com",
        password:"Password1@",
        firstName:"john",
        lastName:"doe"
    }
})

it("register a new user and return a token" , async()=>{
   //act
    const res =  await request(app).post("/auth/register").send(userData)
   

    //aserrt
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('newUserToken')
    expect(res.body.data.email).toBe(userData.email.toLowerCase())
})

it("the user was saved to teh database" , async()=>{
   const res =  await request(app).post("/auth/register").send(userData)

   const checkUser = await UserModel.findOne({email:userData.email.toLowerCase()})
   expect(checkUser.email).toBe(userData.email.toLowerCase())
})

it("to check if apssword in databse is hashed" , async()=>{
    const res =  await request(app).post("/auth/register").send(userData)

   const checkUser = await UserModel.findOne({email:userData.email.toLowerCase()})
expect(checkUser.password).not.toBe(userData.password)    
})
})
