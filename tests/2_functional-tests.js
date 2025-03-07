describe("API Tests", () => {
	let testThreadId = null; // Guardamos el ID del thread creado

	it("should create a new thread", (done) => {
		chai
			.request(app)
			.post("/api/threads/test")
			.send({ text: "Test thread", delete_password: "123" })
			.end((err, res) => {
				console.log("Response body:", res.body);
				expect(res).to.have.status(200);
				expect(res.body).to.have.property("_id");
				expect(res.body).to.have.property("text", "Test thread");
				testThreadId = res.body._id; // Guardar el ID para futuros tests
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
				expect(res.body.length).to.be.at.most(10);
				done();
			});
	});

	it("should delete a thread with correct password", (done) => {
		chai
			.request(app)
			.delete("/api/threads/test")
			.send({ thread_id: testThreadId, delete_password: "123" })
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.text).to.equal("Success");
				done();
			});
	});

	it("should not delete a thread with incorrect password", (done) => {
		chai
			.request(app)
			.delete("/api/threads/test")
			.send({ thread_id: testThreadId, delete_password: "wrongpass" })
			.end((err, res) => {
				expect(res).to.have.status(401);
				expect(res.text).to.equal("Incorrect password");
				done();
			});
	});
});
