process.env.JWT_SECRET = "cbiuadabcusidbv9024904h0f-this-is-a-long-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "1d";
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.FRONTEND_URL = "http://localhost:5173";

const request = require('supertest');
const mongoose = require('mongoose');
const app = require("../../app");
const UserModel = require("../../models/User");
const { connectTestDB, clearTestDB, closeTestDB } = require("../setup/database");

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
beforeEach(async () => { await clearTestDB(); });

describe("POST /auth/register - Register a new user", () => {
    const userData = {
        email: "john@email.com",
        password: "Password1@",
        firstName: "john",
        lastName: "doe"
    };

    it("should register a new user and return a token", async () => {
        const res = await request(app).post("/auth/register").send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.data.email).toBe(userData.email.toLowerCase());
    });

    it("should save the user to the database", async () => {
        await request(app).post("/auth/register").send(userData);

        const checkUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
        expect(checkUser.email).toBe(userData.email.toLowerCase());
    });

    it("should hash the password in database", async () => {
        await request(app).post("/auth/register").send(userData);

        const checkUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
        expect(checkUser.password).not.toBe(userData.password);
    });
});