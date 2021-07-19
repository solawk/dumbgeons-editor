// Modules
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const {createCanvas, loadImage} = require("canvas");

// Constants
const port = process.env.PORT || 4000;
const password = process.env.PASSWORD || "dumbgeon-password";
const contentData = JSON.parse(fs.readFileSync("data/contents.json"));
const canv = createCanvas(64, 64);
const canvasCTX = canv.getContext("2d");

const dumbgeonSchema = new mongoose.Schema
({
	name: String,
	description: String,
	width: Number,
	height: Number,
	content: String
});

let dumbgeonModel = null;

app.use(express.static(__dirname + "/views"), express.static(__dirname + "/data/img"),
	express.static(__dirname + "/data/img/objects"), express.static(__dirname + "/data/img/tiles"));
app.use(bodyParser.json());

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
	} catch (e)
	{
		console.log(e);
	}
}

async function duplicates(name, id)
{
	return await dumbgeonModel.exists({name: name, _id: {$ne: id}});
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
		response.sendStatus(400);
		return;
	}

	const id = request.query.id;

	if (id === "undefined")
	{
		console.log("No query in a getDumbgeonByID call!");
		response.sendStatus(400);
		return;
	}

	dumbgeonModel.findById(id, (err, dumbgeon) =>
	{
		if (err)
		{
			console.log("Failed to get the dumbgeon from Mongo: " + err);
			response.sendStatus(400);
			return;
		}

		response.send(dumbgeon);
	});
});

// addDumbgeon
app.put("/api/addDumbgeon", async (request, response) =>
{
	if (!dumbgeonModel)
	{
		console.log("dumbgeonModel is null upon addDumbgeon!");
		response.sendStatus(400);
		return;
	}

	const name = request.query.name;
	const width = request.query.w;
	const height = request.query.h;

	if (name === "undefined" || width === "undefined" || height === "undefined")
	{
		console.log("No query in a addDumbgeon call!");
		response.sendStatus(400);
		return;
	}

	if (await duplicates(name))
	{
		response.sendStatus(409);
		return;
	}

	const newDumbgeon =
		{
			name: name,
			description: "Без описания",
			width: width,
			height: height,
			content: ""
		};

	dumbgeonModel.create(newDumbgeon, (err, createdDumbgeon) =>
	{
		if (err)
		{
			console.log("Error adding a dumbgeon: " + err);
			response.sendStatus(400);
			return;
		}

		response.send(createdDumbgeon);
	});
});

// updateDumbgeon
app.patch("/api/updateDumbgeon", async (request, response) =>
{
	if (!dumbgeonModel)
	{
		console.log("dumbgeonModel is null upon updateDumbgeon!");
		response.sendStatus(400);
		return;
	}

	const id = request.query.id;

	if (id === "undefined")
	{
		console.log("No query in a updateDumbgeon call!");
		response.sendStatus(400);
		return;
	}

	if (await duplicates(request.body.name, id))
	{
		response.sendStatus(409);
		return;
	}

	dumbgeonModel.updateOne({_id: id}, request.body, (err) =>
	{
		if (err)
		{
			console.log("Failed to update the dumbgeon from Mongo: " + err);
			response.sendStatus(400);
			return;
		}

		response.sendStatus(200);
	});
});

// removeDumbgeon
app.delete("/api/removeDumbgeon", (request, response) =>
{
	if (!dumbgeonModel)
	{
		console.log("dumbgeonModel is null upon removeDumbgeon!");
		response.sendStatus(400);
		return;
	}

	const id = request.query.id;

	if (id === "undefined")
	{
		console.log("No query in a removeDumbgeon call!");
		response.sendStatus(400);
		return;
	}

	dumbgeonModel.deleteOne({_id: id}, (err) =>
	{
		if (err)
		{
			console.log("Failed to remove the dumbgeon from Mongo: " + err);
			response.sendStatus(400);
			return;
		}

		response.sendStatus(200);
	});
});

// getImgList
app.get("/api/getContentList", (request, response) =>
{
	response.send(contentData);
});

// getImg
app.get("/api/getImg", (request, response) =>
{
	const name = request.query.name;

	if (name === "undefined")
	{
		console.log("No name in a getImg call!");
		response.sendStatus(400);
		return;
	}

	const filename = __dirname + "/data/img/" + name + ".png";
	response.sendFile(filename);
});

// getImgMini (64х64)
app.get("/api/getImgMini", async (request, response) =>
{
	const name = request.query.name;

	if (name === "undefined")
	{
		console.log("No name in a getImg call!");
		response.sendStatus(400);
		return;
	}

	canvasCTX.clearRect(0, 0, 64, 64);
	const image = await loadImage(__dirname + "/data/img/" + name + ".png");
	canvasCTX.drawImage(image, 0, 0, 64, 64);

	//response.setHeader("Content-Type", "image/png");
	canv.createPNGStream().pipe(response);
});

app.get("/api/getContent", (request, response) =>
{
	const name = request.query.name;

	if (name === "undefined")
	{
		console.log("No name in a getContent call!");
		response.sendStatus(400);
		return;
	}

	dumbgeonModel.findOne({name: name}, (err, dumbgeon) =>
	{
		if (err || dumbgeon == null)
		{
			console.log("Failed to get the dumbgeon by name: " + err);
			response.sendStatus(400);
			return;
		}

		response.send({width: dumbgeon.width, height: dumbgeon.height, content: dumbgeon.content});
	});
});

app.get("/api/getMeta", (request, response) =>
{
	const name = request.query.name;

	if (name === "undefined")
	{
		console.log("No name in a getMeta call!");
		response.sendStatus(400);
		return;
	}

	let display = null;
	let desc = null;

	for (const contentThing of contentData)
	{
		if (contentThing.name === name)
		{
			display = contentThing.display;
			desc = contentThing.desc;
		}
	}

	if (display == null || desc == null)
	{
		console.log("Nothing found with name " + name + " in a getMeta call!");
		response.sendStatus(404);
	}
	else
	{
		response.send({name: display, desc: desc});
	}
});

app.get("/api/exists", async (request, response) =>
{
	const name = request.query.name;

	if (name === "undefined")
	{
		console.log("No name in a getContent call!");
		response.sendStatus(400);
		return;
	}

	if (await dumbgeonModel.exists({name: name}))
	{
		response.send("true");
	}
	else
	{
		response.send("false");
	}
});

// Test page
app.get("/test", async (request, response) =>
{
	response.sendStatus(404);
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
	if (!request.query.hasOwnProperty("id"))
	{
		console.log("No query in a remove call!");
		response.send("No id was specified!");
		return;
	}

	response.sendFile(__dirname + "/views/remove.html");
});

// Editor
app.get("/editor", (request, response) =>
{
	if (!request.query.hasOwnProperty("id"))
	{
		console.log("No id in an editor call!");
		response.send("No id was specified!");
		return;
	}

	response.sendFile(__dirname + "/views/editor.html");
});