let dumbgeon = null;
let changed = false;
let selected = { active: false, row: null, col: null };

let pristineRandom = false; // This location was randomly generated and has not been saved yet

// Tiles
const tileSelection = [ "empty" ];
const tileVisibles = [ "- Пустой -" ];
let tileSelected = "empty";

// Objects
const objSelection = [ "remove" ];
const objVisibles = [ "- Удаление объекта -" ];
let objSelected = "remove";

// Interaction
let mode = "info"; // tile - obj - info
let brushMode = "single"; // single - rectangle

// Rectangle placement
const anchor = { set: false, row: null, col: null };

const dumbgeonContent = [];
function DumbgeonCell(tile, objects)
{
	this.tile = tile;
	this.objects = objects;
}
function DumbgeonObject(name, height)
{
	this.name = name;
	this.height = height;
	this.contains = "none";
}

function accessCell(row, col)
{
	return dumbgeonContent[row * dumbgeon.width + col];
}

let img = null;
let display = null;

async function fetchDumbgeon()
{
	if (window.location.toString().endsWith("random"))
	{
		dumbgeon = await randomDumbgeon();
		pristineRandom = true;
		regChange();
	}
	else
	{
		dumbgeon = await getDumbgeonByID(getID());
	}
}

async function init()
{
	await fetchDumbgeon();

	const content = await getContentList();
	img = await getImgMini(content);
	display = getDisplays(content);

	// Tiles
	for (const [name, disp] of display)
	{
		if (name.startsWith("tile_"))
		{
			tileSelection.push(name);
			tileVisibles.push(disp);
		}
	}

	for (let i = 0; i < tileSelection.length; i++)
	{
		const optionElement = document.createElement("option");
		if (tileSelection[i] === tileSelected) optionElement.setAttribute("selected", "selected");
		optionElement.innerHTML = tileVisibles[i];
		optionElement.value = tileSelection[i];

		document.getElementById("brushTile").appendChild(optionElement);
	}

	// Objects
	for (const [name, disp] of display)
	{
		if (name.startsWith("obj_"))
		{
			objSelection.push(name);
			objVisibles.push(disp);
		}
	}

	for (let i = 0; i < objSelection.length; i++)
	{
		const optionElement = document.createElement("option");
		if (objSelection[i] === objSelected) optionElement.setAttribute("selected", "selected");
		optionElement.innerHTML = objVisibles[i];
		optionElement.value = objSelection[i];

		document.getElementById("brushObj").appendChild(optionElement);
	}

	updateHeader();
	updateMeta();
	await createJSContent();
	updateContent();

	showEditor();
}

function showEditor()
{
	document.getElementById("loadedFalse").style.display = "none";
	document.getElementById("loadedTrue").style.display = "block";
}

async function createJSContent()
{
	let empty = dumbgeon.content === "";
	const content = !empty ? await JSON.parse(dumbgeon.content) : "";

	for (let i = 0; i < dumbgeon.height; i++)
	{
		for (let j = 0; j < dumbgeon.width; j++)
		{
			if (empty)
			{
				dumbgeonContent.push(new DumbgeonCell("empty", []));
				continue;
			}

			const index = i * dumbgeon.width + j;
			const tile = content[index].tile;
			const objects = content[index].objects;

			dumbgeonContent.push(new DumbgeonCell(tile, objects));
		}
	}
}

function updateHeader()
{
	document.getElementById("header").innerHTML = "Редактирование " + dumbgeon.name + (pristineRandom ? " (не сохранена)" : "");
}

function updateMeta()
{
	document.getElementById("metaName").value = dumbgeon.name;
	document.getElementById("metaDesc").value = dumbgeon.description;
	document.getElementById("metaWidth").innerHTML = dumbgeon.width.toString();
	document.getElementById("metaHeight").innerHTML = dumbgeon.height.toString();
}

// Respawning the content table
function updateContent()
{
	const table = document.getElementById("content");
	table.innerHTML = "";

	for (let i = 0; i < dumbgeon.height; i++)
	{
		// Row
		const row = document.createElement("tr");
		row.id = "row" + i.toString();
		table.appendChild(row);

		for (let j = 0; j < dumbgeon.width; j++)
		{
			// Cell
			const cell = document.createElement("td");
			cell.id = "cell" + i.toString() + ":" + j.toString();
			cell.onclick = onCellClick;
			cell.className = "dumbgeonCell unselectable";
			row.appendChild(cell);

			// Cell content

			// Background tile
			setCellBg(cell, i, j);

			// Div for hover
			const cellDiv = document.createElement("div");
			cellDiv.className = "dumbgeonCellDiv";
			cellDiv.setAttribute("onmouseover", "rectangleSelPaint(" + i.toString() + ", " + j.toString() + ");");
			cellDiv.setAttribute("onmouseout", "rectangleSelDepaint();");
			cell.appendChild(cellDiv);

			// Top object image
			const cellImage = document.createElement("img");
			cellImage.style.width = "70%";
			cellDiv.appendChild(cellImage);

			setCellTopObj(cell, i, j);
		}
	}

	if (selected.active) cellSelectedPaint(selected.row, selected.col);
}

function setCellBg(cell, row, col)
{
	const tile = accessCell(row, col).tile;

	if (tile !== "empty")
	{
		cell.style.backgroundRepeat = "no-repeat";
		cell.style.backgroundSize = "100% 100%";

		if (img.has(tile))
		{
			cell.style.backgroundImage = "url(" + img.get(tile) + ")";
		}
		else
		{
			cell.style.backgroundImage = "url(" + img.get("null") + ")";
		}
	}
	else
	{
		cell.style.backgroundImage = "";
	}
}

function setCellTopObj(cell, row, col)
{
	const objects = accessCell(row, col).objects;
	const cellImage = cell.firstChild.firstChild;

	if (objects.length === 0)
	{
		cellImage.src = "";
	}
	else
	{
		if (img.has(objects[0].name))
		{
			cellImage.src = img.get(objects[0].name);
		}
		else
		{
			cellImage.src = img.get("null");
		}
	}
}

function updateSingleContent(row, col)
{
	const cell = document.getElementById("cell" + row.toString() + ":" + col.toString());

	setCellBg(cell, row, col);
	setCellTopObj(cell, row, col);
}

function clearCellInfo()
{
	document.getElementById("cellInfoPosition").innerHTML = "";
	document.getElementById("cellInfoTileImg").innerHTML = "";
	document.getElementById("cellInfoTile").innerHTML = "";
	document.getElementById("cellInfoObjects").innerHTML = "";

	selected.active = false;
	selected.row = null;
	selected.col = null;
}

function updateCellInfo(row, col)
{
	// Cell position
	const cellInfoPosition = document.getElementById("cellInfoPosition");

	cellInfoPosition.innerHTML = "Клетка (" + (row + 1).toString() + ":" + (col + 1).toString() + ")";

	// Tile
	const cellInfoTileImg = document.getElementById("cellInfoTileImg");
	const cellInfoTile = document.getElementById("cellInfoTile");
	cellInfoTileImg.innerHTML = "";
	cellInfoTile.innerHTML = "";

	const tile = accessCell(row, col).tile;

	if (tile !== "empty")
	{
		const cellTileImg = document.createElement("img");
		if (img.has(tile))
		{
			cellTileImg.src = img.get(tile);
		}
		else
		{
			cellTileImg.src = img.get("null");
		}
		cellTileImg.style.width = "4em";
		cellInfoTileImg.appendChild(cellTileImg);
	}

	cellInfoTile.innerHTML += "Тайл: ";

	const cellTileSelect = document.createElement("select");
	cellTileSelect.id = "cellTileSelect";
	cellTileSelect.setAttribute("onchange", "changeTile(" + row.toString() + "," + col.toString() + ", this.value)");
	cellTileSelect.style.width = "50%";

	cellInfoTile.appendChild(cellTileSelect);

	for (let i = 0; i < tileSelection.length; i++)
	{
		const optionElement = document.createElement("option");
		if (tileSelection[i] === tile) optionElement.setAttribute("selected", "selected");
		optionElement.innerHTML = tileVisibles[i];
		optionElement.value = tileSelection[i];

		cellTileSelect.appendChild(optionElement);
	}

	// Objects
	const cellInfoObjectsTable = document.createElement("table");
	cellInfoObjectsTable.style.width = "100%";
	cellInfoObjectsTable.innerHTML = "";
	document.getElementById("cellInfoObjects").innerHTML = "";
	document.getElementById("cellInfoObjects").appendChild(cellInfoObjectsTable);

	const objects = accessCell(row, col).objects;

	for (let i = 0; i < objects.length; i++)
	{
		const object = objects[i];

		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.className = "editorBordered editorHoverable";
		td.style.padding = "1em";

		cellInfoObjectsTable.appendChild(tr);
		tr.appendChild(td);

		const removeButton = document.createElement("button");
		removeButton.innerHTML = "X";
		removeButton.className = "actionButton";
		removeButton.style.width = "10%";
		removeButton.style.padding = "0";
		removeButton.style.backgroundColor = "#ffbbbb";
		removeButton.setAttribute("onclick", "accessCell(" + row.toString() + ", " +
			col.toString() + ").objects.splice(" + i + ", 1); updateSingleContent(" + row.toString() + ", " +
			col.toString() + "); updateCellInfo(" + row.toString() + ", " +
			col.toString() + "); regChange();");

		td.appendChild(removeButton);
		td.innerHTML += "&nbsp;"

		const heightInput = document.createElement("input");
		heightInput.setAttribute("value", object.height.toString());
		heightInput.title = "Высота над полем";
		heightInput.type = "number";
		heightInput.min = "0";
		heightInput.style.width = "15%";
		heightInput.setAttribute("onchange", "accessCell(" + row.toString() + ", " +
			col.toString() + ").objects[" + i + "].height = parseFloat(this.value); regChange();");
		td.appendChild(heightInput);
		td.innerHTML += "&nbsp;";

		const objImg = document.createElement("img");
		objImg.src = img.get(object.name);
		objImg.style.minHeight = "3em";
		objImg.style.height = "3em";
		objImg.style.verticalAlign = "middle";

		td.appendChild(objImg);
		td.innerHTML += "&nbsp;" + objVisibles[objSelection.indexOf(object.name)];

		if (object.contains !== "none")
		{
			// Add the contained objects
			td.innerHTML += "<br>Содержит:<br>";

			for (let oi = 0; oi < object.contains.length; oi++)
			{
				const objInside = object.contains[oi];

				const objInsideRemoveButton = document.createElement("button");
				objInsideRemoveButton.innerHTML = "X";
				objInsideRemoveButton.className = "actionButton";
				objInsideRemoveButton.style.width = "10%";
				objInsideRemoveButton.style.padding = "0";
				objInsideRemoveButton.style.backgroundColor = "#ffbbbb";
				objInsideRemoveButton.setAttribute("onclick", "accessCell(" + row.toString() + ", " +
					col.toString() + ").objects[" + i.toString() + "].contains.splice(" + oi + ", 1); regChange();" +
					"updateCellInfo(" + row.toString() + ", " + col.toString() + ");");
				td.appendChild(objInsideRemoveButton);

				td.innerHTML += "&nbsp;" + objVisibles[objSelection.indexOf(objInside.name)] + "<br>";
			}

			// The object adding menu

			const newObjToContainSelect = document.createElement("select");
			newObjToContainSelect.id = "newObjToContainIn" + i.toString();
			newObjToContainSelect.style.width = "50%";
			for (let o = 0; o < objSelection.length; o++)
			{
				if (objSelection[o] === "remove") continue;
				if (objSelection[o].startsWith("obj_container_")) continue;

				const optionElement = document.createElement("option");
				optionElement.innerHTML = objVisibles[o];
				optionElement.value = objSelection[o];

				newObjToContainSelect.appendChild(optionElement);
			}

			td.appendChild(newObjToContainSelect);

			const addObjButton = document.createElement("button");
			addObjButton.innerHTML = "+";
			addObjButton.className = "actionButton";
			addObjButton.style.width = "10%";
			addObjButton.style.padding = "0";
			addObjButton.setAttribute("onclick", "accessCell(" + row.toString() + ", " + col.toString() + ")." +
				"objects[" + i.toString() + "]." +
				"contains.push(new DumbgeonObject(" +
				"document.getElementById('newObjToContainIn" + i.toString() + "').value, 0));" +
				"regChange();" +
				"updateCellInfo(" + row.toString() + ", " + col.toString() + ")");

			td.appendChild(addObjButton);
			td.innerHTML += "&nbsp;"
		}
	}
}

function selectBrushTile(tile)
{
	tileSelected = tile;

	const previewImg = document.getElementById("brushTilePreview");

	if (tileSelected !== "empty")
	{
		if (img.has(tileSelected))
		{
			previewImg.src = img.get(tile);
		}
		else
		{
			previewImg.src = img.get("null");
		}
	}
	else
	{
		previewImg.src = "";
	}
}

function reverseUpdateMeta()
{
	dumbgeon.name = document.getElementById("metaName").value;
}

async function editAction()
{
	if (document.getElementById("metaName").value.length === 0)
	{
		alert("Название не может быть пустым!");
		return;
	}

	const data = Object.assign({}, addMeta(), await addContent());

	if (pristineRandom)
	{
		const newDumbgeon = await addDumbgeon(data.name, data.width, data.height);

		if (typeof(newDumbgeon) === "number")
		{
			if (newDumbgeon === 409)
			{
				alert("Локация с таким названием уже существует!");
			}
			else
			{
				alert("Ошибка создания локации!");
			}

			return;
		}

		dumbgeon = newDumbgeon;
		pristineRandom = false;
	}

	const updateStatus = await updateDumbgeon(dumbgeon._id.toString(), data);

	if (updateStatus !== 200)
	{
		if (updateStatus === 409)
		{
			alert("Локация с таким названием уже существует!");
		}
		else
		{
			alert("Произошла ошибка сохранения!");
		}

		return;
	}

	document.getElementById("saveButton").style.backgroundColor = "#ffffff";
	changed = false;

	reverseUpdateMeta();
	updateHeader();
	document.getElementById("saveButton").animate([
		{
			background: "#22ee22"
		},
		{
			background: "#ffffff"
		}
	], 1000);
}

function addRow(side)
{
	if (side === "left")
	{
		dumbgeon.width++;
	}

	if (side === "right")
	{
		dumbgeon.width++;
	}

	if (side === "top")
	{
		dumbgeon.height++;
	}

	if (side === "bottom")
	{
		dumbgeon.height++;
	}

	if (dumbgeon.width > 65)
	{
		dumbgeon.width = 65;
		return;
	}

	if (dumbgeon.height > 50)
	{
		dumbgeon.height = 50;
		return;
	}

	updateMeta();
	resizeDumbgeon(side, true);
}

function removeRow(side)
{
	if (side === "left")
	{
		dumbgeon.width--;
	}

	if (side === "right")
	{
		dumbgeon.width--;
	}

	if (side === "top")
	{
		dumbgeon.height--;
	}

	if (side === "bottom")
	{
		dumbgeon.height--;
	}

	let resizing = true;

	if (dumbgeon.width < 1)
	{
		dumbgeon.width = 1;
		resizing = false;
	}

	if (dumbgeon.height < 1)
	{
		dumbgeon.height = 1;
		resizing = false;
	}

	updateMeta();
	if (resizing)
	{
		resizeDumbgeon(side, false);
		onMinusHover(side, true);
	}
}

function resizeDumbgeon(side, isAdding)
{
	regChange();

	if (isAdding)
	{
		if (side === "top")
		{
			for (let i = 0; i < dumbgeon.width; i++)
			{
				dumbgeonContent.unshift(new DumbgeonCell("empty", []));
			}
		}

		if (side === "bottom")
		{
			for (let i = 0; i < dumbgeon.width; i++)
			{
				dumbgeonContent.push(new DumbgeonCell("empty", []));
			}
		}

		if (side === "left")
		{
			for (let i = 0; i < dumbgeon.height; i++)
			{
				dumbgeonContent.splice(i * dumbgeon.width, 0, new DumbgeonCell("empty", []));
			}
		}

		if (side === "right")
		{
			for (let i = 0; i < dumbgeon.height; i++)
			{
				dumbgeonContent.splice((i + 1) * dumbgeon.width - 1, 0, new DumbgeonCell("empty", []));
			}
		}
	}
	else
	{
		if (side === "top")
		{
			if (selected.active)
			{
				selected.row--;
				if (selected.row < 0) clearCellInfo();
			}

			for (let i = 0; i < dumbgeon.width; i++)
			{
				dumbgeonContent.shift(new DumbgeonCell("empty", []));
			}
		}

		if (side === "bottom")
		{
			if (selected.active)
			{
				if (selected.row === dumbgeon.height) clearCellInfo();
			}

			for (let i = 0; i < dumbgeon.width; i++)
			{
				dumbgeonContent.pop(new DumbgeonCell("empty", []));
			}
		}

		if (side === "left")
		{
			if (selected.active)
			{
				selected.col--;
				if (selected.col < 0) clearCellInfo();
			}

			for (let i = 0; i < dumbgeon.height; i++)
			{
				dumbgeonContent.splice(i * dumbgeon.width, 1);
			}
		}

		if (side === "right")
		{
			if (selected.active)
			{
				if (selected.col === dumbgeon.width) clearCellInfo();
			}

			for (let i = 0; i < dumbgeon.height; i++)
			{
				dumbgeonContent.splice((i + 1) * dumbgeon.width, 1);
			}
		}
	}

	updateContent();
}

function resizeDumbgeonFont(value)
{
	document.getElementById("content").style.fontSize = value.toString() + "%";
}

function addMeta()
{
	const name = document.getElementById("metaName").value;

	let desc = document.getElementById("metaDesc").value;

	if (desc.length === 0)
	{
		desc = "Без описания";
	}

	const width = dumbgeon.width;
	const height = dumbgeon.height;

	return {
		name: name,
		description: desc,
		width: width,
		height: height
	};
}

async function addContent()
{
	return {
		content: await JSON.stringify(dumbgeonContent)
	};
}

function onCellClick()
{
	const row = parseInt(this.id.substring(4).split(":")[0]);
	const col = parseInt(this.id.substring(4).split(":")[1]);

	if (mode === "info")
	{
		cellClickInfo(row, col);
	}

	if (mode === "tile")
	{
		cellClickTile(row, col);
	}

	if (mode === "obj")
	{
		cellClickObj(row, col);
	}
}

function cellClickInfo(row, col)
{
	if (selected.active)
	{
		cellSelectedDepaint(selected.row, selected.col);
	}

	selected.active = true;
	selected.row = row;
	selected.col = col;

	cellSelectedPaint(row, col);
	updateCellInfo(row, col);
}

function cellClickTile(row, col)
{
	const tileToSet = document.getElementById("brushTile").value;

	if (brushMode === "single")
	{
		regChange();

		accessCell(row, col).tile = tileToSet;

		updateSingleContent(row, col);
	}

	if (brushMode === "rectangle")
	{
		if (!anchor.set)
		{
			anchor.set = true;
			anchor.row = row;
			anchor.col = col;

			rectangleSelPaint(row, col);
		}
		else
		{
			regChange();

			anchor.set = false;

			const startRow = Math.min(anchor.row, row);
			const startCol = Math.min(anchor.col, col);

			const endRow = Math.max(anchor.row, row);
			const endCol = Math.max(anchor.col, col);

			for (let i = startRow; i <= endRow; i++)
			{
				for (let j = startCol; j <= endCol; j++)
				{
					accessCell(i, j).tile = tileToSet;
				}
			}

			updateContent();
		}
	}
}

function cellClickObj(row, col)
{
	const object = document.getElementById("brushObj").value;

	const objToSet = new DumbgeonObject(object, 0);

	if (object.startsWith("obj_container_"))
	{
		objToSet.contains = [];
	}

	if (brushMode === "single")
	{
		regChange();

		if (object !== "remove")
		{
			accessCell(row, col).objects.unshift(objToSet);
		}
		else
		{
			accessCell(row, col).objects.shift(objToSet);
		}

		updateSingleContent(row, col);
	}

	if (brushMode === "rectangle")
	{
		if (!anchor.set)
		{
			anchor.set = true;
			anchor.row = row;
			anchor.col = col;

			rectangleSelPaint(row, col);
		}
		else
		{
			regChange();

			anchor.set = false;

			const startRow = Math.min(anchor.row, row);
			const startCol = Math.min(anchor.col, col);

			const endRow = Math.max(anchor.row, row);
			const endCol = Math.max(anchor.col, col);

			for (let i = startRow; i <= endRow; i++)
			{
				for (let j = startCol; j <= endCol; j++)
				{
					if (object !== "remove")
					{
						accessCell(i, j).objects.unshift(objToSet);
					}
					else
					{
						accessCell(i, j).objects.shift(objToSet);
					}
				}
			}

			updateContent();
		}
	}
}

function cellSelectedPaint(row, col)
{
	document.getElementById("cell" + row.toString() + ":" + col.toString()).firstChild.className += " dumbgeonCellDivSelected";
}

function cellSelectedDepaint(row, col)
{
	const divClass = document.getElementById("cell" + row.toString() + ":" + col.toString()).firstChild.className;
	document.getElementById("cell" + row.toString() + ":" + col.toString()).firstChild.className = divClass.replace(" dumbgeonCellDivSelected", "");
}

function onMinusHover(side, up)
{
	if (side === "top")
	{
		for (let i = 0; i < dumbgeon.width; i++)
		{
			paintDumbgeonCell(0, i, up, false, false);
		}
	}

	if (side === "bottom")
	{
		for (let i = 0; i < dumbgeon.width; i++)
		{
			if (dumbgeon.height > 1) paintDumbgeonCell(dumbgeon.height - 2, i, up, true, false);
			paintDumbgeonCell(dumbgeon.height - 1, i, up, false, false);
		}
	}

	if (side === "left")
	{
		for (let i = 0; i < dumbgeon.height; i++)
		{
			paintDumbgeonCell(i, 0, up, false, false);
		}
	}

	if (side === "right")
	{
		for (let i = 0; i < dumbgeon.height; i++)
		{
			if (dumbgeon.width > 1) paintDumbgeonCell(i, dumbgeon.width - 2, up, false, true);
			paintDumbgeonCell(i, dumbgeon.width - 1, up, false, false);
		}
	}
}

function changeTile(row, col, selected)
{
	regChange();

	accessCell(row, col).tile = selected;

	updateContent();
	updateCellInfo(row, col);
}

function modeSelected(newMode)
{
	anchor.set = false;

	const tileMode = document.getElementById("tileMode");
	const objMode = document.getElementById("objMode");
	const infoMode = document.getElementById("infoMode");

	if (mode === "tile") tileMode.className = tileMode.className.replace("editorSel", "editorUnsel");
	if (mode === "obj") objMode.className = objMode.className.replace("editorSel", "editorUnsel");
	if (mode === "info") infoMode.className = infoMode.className.replace("editorSel", "editorUnsel");

	if (newMode === "tile")
	{
		tileMode.className = tileMode.className.replace("editorUnsel", "editorSel");
	}

	if (newMode === "obj")
	{
		objMode.className = objMode.className.replace("editorUnsel", "editorSel");
	}

	if (newMode === "info")
	{
		infoMode.className = infoMode.className.replace("editorUnsel", "editorSel");
		document.getElementById("brushModeTable").style.display = "none";
	}
	else
	{
		if (selected.active)
		{
			cellSelectedDepaint(selected.row, selected.col);
		}

		clearCellInfo();

		document.getElementById("brushModeTable").style.display = "table";
	}

	mode = newMode;
}

function brushModeSelected(newMode)
{
	const singleMode = document.getElementById("singleMode");
	const rectangleMode = document.getElementById("rectangleMode");

	if (brushMode === "single") singleMode.className = singleMode.className.replace("editorSel", "editorUnsel");
	if (brushMode === "rectangle") rectangleMode.className = rectangleMode.className.replace("editorSel", "editorUnsel");

	if (newMode === "single")
	{
		singleMode.className = singleMode.className.replace("editorUnsel", "editorSel");
		anchor.set = false;
	}
	if (newMode === "rectangle")
	{
		rectangleMode.className = rectangleMode.className.replace("editorUnsel", "editorSel");
	}

	brushMode = newMode;
}

function rectangleSelDepaint()
{
	for (let i = 0; i < dumbgeon.height; i++)
	{
		for (let j = 0; j < dumbgeon.width; j++)
		{
			const cell = document.getElementById("cell" + i.toString() + ":" + j.toString()).firstChild;

			cell.className = cell.className.replace(" dumbgeonCellDivRectSel", "");
		}
	}
}

function rectangleSelPaint(hoverRow, hoverCol)
{
	if (mode === "info" || brushMode !== "rectangle" || !anchor.set) return;

	const startRow = Math.min(anchor.row, hoverRow);
	const startCol = Math.min(anchor.col, hoverCol);

	const endRow = Math.max(anchor.row, hoverRow);
	const endCol = Math.max(anchor.col, hoverCol);

	for (let i = 0; i < dumbgeon.height; i++)
	{
		for (let j = 0; j < dumbgeon.width; j++)
		{
			const cell = document.getElementById("cell" + i.toString() + ":" + j.toString()).firstChild;

			cell.className = cell.className.replace(" dumbgeonCellDivRectSel", "");

			if (i >= startRow && i <= endRow && j >= startCol && j <= endCol)
			{
				cell.className += " dumbgeonCellDivRectSel";
			}
		}
	}
}

// Register a change to then remind the user to save
function regChange()
{
	if (!changed)
	{
		changed = true;
		document.getElementById("saveButton").style.backgroundColor = "#e0e0ff";
	}
}

// Exit prompt if not saved
function toList()
{
	if (!changed)
	{
		window.location.assign("/");
	}
	else
	{
		if (confirm("Остались несохранённые изменения, вы уверены, что хотите покинуть редактор?"))
		{
			window.location.assign("/");
		}
	}
}

// Paint a cell's borders red
function paintDumbgeonCell(row, col, up, isBelow, isOnRight)
{
	const id = "cell" + row.toString() + ":" + col.toString();
	let className = " paintedCell";
	if (isBelow) className = " paintedCellBelow";
	if (isOnRight) className = " paintedCellOnRight";

	if (up)
	{
		document.getElementById(id).className += className;
	}
	else
	{
		document.getElementById(id).className = document.getElementById(id).className.replace(className, "");
	}
}

init();