// tests/2_functional-tests.js

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const expect = chai.expect;

chai.use(chaiHttp);

describe("API Tests", () => {
	it("should create a new thread", (done) => {
		chai
			.request(app)
			.post("/api/threads/test")
			.send({ text: "Test thread", delete_password: "123" })
			.end((err, res) => {
				console.log("Response body:", res.body); // <-- Agrega esto
				expect(res).to.have.status(200);
				expect(res.body).to.have.property(
					"message",
					"Thread created successfully"
				);
				done();
			});
	});

	it("should get 10 most recent threads", (done) => {
		chai
			.request(app)
			.get("/api/threads/test")
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an("array");
				done();
			});
	});

	it("should delete a thread with correct password", (done) => {
		chai
			.request(app)
			.delete("/api/threads/test")
			.send({ thread_id: "valid_thread_id", delete_password: "123" })
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.text).to.equal("Success");
				done();
			});
	});
});
