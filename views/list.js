let dumbgeonsList = null;

async function init()
{
	dumbgeonsList = await getDumbgeons();

	if (!dumbgeonsList)
	{
		document.getElementById("dumbgeonsListDiv").innerHTML = "Ошибка при получении списка, попробуйте ещё раз";
		return;
	}

	if (dumbgeonsList.length === 0)
	{
		document.getElementById("dumbgeonsListDiv").innerHTML = "Список локаций пуст!";
		return;
	}

	// Creating a table

	const listDiv = document.getElementById("dumbgeonsListDiv");
	listDiv.innerHTML = "";

	const table = document.createElement("table");
	table.style.width = "100%";
	listDiv.appendChild(table);

	// Filling a table

	for (const dumbgeon of dumbgeonsList)
	{
		const tableRow = document.createElement("tr");
		tableRow.className = "dumbgeonRow";

		const tableCell = document.createElement("td");
		tableCell.className = "dumbgeonCell";
		tableCell.style.width = "80%";

		const tableActionsCell = document.createElement("td");
		tableActionsCell.className = "dumbgeonCell";

		table.appendChild(tableRow);
		tableRow.appendChild(tableCell);
		tableRow.appendChild(tableActionsCell);

		appendDumbgeonInfo(tableCell, dumbgeon);
		appendDumbgeonActions(tableActionsCell, dumbgeon);
	}
}

function appendDumbgeonInfo(tableCell, dumbgeon)
{
	const name = dumbgeon.name;
	const desc = dumbgeon.description;
	const width = dumbgeon.width;
	const height = dumbgeon.height;

	const nameSpan = document.createElement("span");
	nameSpan.className = "dumbgeonName";
	nameSpan.innerHTML = name + "<br>";

	const sizeSpan = document.createElement("span");
	sizeSpan.innerHTML = "Размер: " + width.toString() + "x" + height.toString() + "<br>";

	const descSpan = document.createElement("span");
	descSpan.style.color = "#666666";
	descSpan.innerHTML = desc + "<br>";

	tableCell.appendChild(nameSpan);
	tableCell.appendChild(sizeSpan);
	tableCell.appendChild(descSpan);
}

function appendDumbgeonActions(tableActionsCell, dumbgeon)
{
	const id = dumbgeon._id.toString();

	const editHref = document.createElement("a");
	const editButton = document.createElement("button");
	editHref.href = "";
	editButton.className = "actionButton";
	editButton.style.width = "100%";
	editButton.innerHTML = "Редактировать";

	editHref.appendChild(editButton);
	tableActionsCell.appendChild(editHref);

	tableActionsCell.innerHTML += "<br><br>";

	const removeHref = document.createElement("a");
	const removeButton = document.createElement("button");
	removeHref.href = "remove?id=" + id;
	removeButton.className = "actionButton";
	removeButton.style.width = "100%";
	removeButton.innerHTML = "Удалить";

	removeHref.appendChild(removeButton);
	tableActionsCell.appendChild(removeHref);
}

init();