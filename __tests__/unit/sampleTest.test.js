const addition = require("../../utils/addition")


describe("Basic Matchers --- test"  ,()=>{
  it("adds 1 + 2 + 3  equlas to 6" , ()=>{
      let result = addition(1,2,3)
      expect(result).toBe(6)
  })

  //checking wther teh objects are equal
 it("check equality between object" , ()=>{
    const user = {name: "alice" , age: 22}
    expect(user).toEqual({name:"alice" , age:22})
 })

it("check whther a value is thruthy" , ()=>{
    expect("hello").toBeTruthy()
    expect(3).toBeTruthy()
    expect([]).toBeTruthy()
})


it("check whther one of the number in addtion parameter(a,b,c) i greater than result" , ()=>{
const result = addition(1,2,3)
expect(result).toBeGreaterThan(1)
expect(result).toBeGreaterThan(2)
})
})
