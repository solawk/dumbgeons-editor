// Modules
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const fs = require("fs");

// Constants
const port = process.env.PORT || 4000;
const password = process.env.PASSWORD || "dumbgeon-password";
const defaultDumbgeonSize = 10;

const dumbgeonSchema = new mongoose.Schema
({
	name: String,
	description: String,
	width: Number,
	height: Number,
	content: String
});

let dumbgeonModel = null;

app.use(express.static(__dirname + "/views"));

app.listen(port, () =>
{
	console.log("Server up!");
	mongoConnect();
});

async function mongoConnect()
{
	try
	{
		const mongoConnection = await mongoose.connect("mongodb+srv://dumbgeon-admin:" + password + "@dumbgeons.potw0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});

		console.log("Mongo connection success!");

		dumbgeonModel = mongoConnection.model("dumbgeons", dumbgeonSchema);
	}
	catch (e)
	{
		console.log(e);
	}
}

async function addDumbgeon(name)
{
	if (dumbgeonModel == null)
	{
		console.log("Tried to add a dumbgeon, but dumbgeonModel is null!");
		return;
	}

	const newDumbgeon =
		{
			name: name,
			description: "Без описания",
			width: defaultDumbgeonSize,
			height: defaultDumbgeonSize,
			content: ""
		};

	await dumbgeonModel.create(newDumbgeon, (err, createdDumbgeon) =>
	{
		if (err)
		{
			console.log("Adding dumbgeon: " + err);
		}
	});
}

async function removeDumbgeon(id)
{

}

// Routing

// API

// getDumbgeons

app.get("/api/getDumbgeons", (request, response) =>
{
	if (!dumbgeonModel)
	{
		console.log("dumbgeonModel is null upon getDumbgeons!");
		response.send([]);
		return;
	}

	dumbgeonModel.find({}, (err, dumbgeons) =>
	{
		if (err)
		{
			console.log("Failed to get the dumbgeons from Mongo: " + err);
			response.send([]);
			return;
		}

		response.send(dumbgeons);
	});
});

// getDumbgeonByID

app.get("/api/getDumbgeon", (request, response) =>
{
	if (!dumbgeonModel)
	{
		console.log("dumbgeonModel is null upon getDumbgeonByID!");
		response.send({});
		return;
	}

	const id = request.query.id;

	if (!id || id === "undefined")
	{
		console.log("No query in a getDumbgeonByID call!");
		response.send({});
		return;
	}

	dumbgeonModel.findById(id, (err, dumbgeon) =>
	{
		if (err)
		{
			console.log("Failed to get the dumbgeon from Mongo: " + err);
			response.send({});
			return;
		}

		response.send(dumbgeon);
	});
});

// VIEWS

// List

app.get("/", (request, response) =>
{
	response.sendFile(__dirname + "/views/list.html");
});

// Remove

app.get("/remove", (request, response) =>
{
	if (!request.hasOwnProperty("query"))
	{
		console.log("No query in a remove call!");
		response.send("No query in the call!");
		return;
	}

	response.sendFile(__dirname + "/views/remove.html");
});