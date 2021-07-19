async function init()
{
	const id = getID();

	const dumbgeon = await getDumbgeonByID(id);

	if (!dumbgeon) // It's empty
	{
		document.getElementById("info").innerHTML = "Ошибка получения информации об этой локации!";
		return;
	}

	document.getElementById("info").innerHTML = "Вы действительно хотите удалить локацию " + dumbgeon.name + "?<br><br>";

	const cancelHref = document.createElement("a");
	const cancelButton = document.createElement("button");
	cancelHref.href = "/";
	cancelButton.className = "actionButton";
	cancelButton.innerHTML = "Нет, вернуться";

	cancelHref.appendChild(cancelButton);
	document.body.appendChild(cancelHref);

	document.body.innerHTML += "&nbsp;&nbsp;";

	const confirmButton = document.createElement("button");
	confirmButton.className = "actionButton";
	confirmButton.innerHTML = "Да, удалить";
	confirmButton.onclick = () => { removeAction(id); };

	document.body.appendChild(confirmButton);
}

async function removeAction(id)
{
	const success = await removeDumbgeon(id.toString());

	if (!success)
	{
		alert("Произошла ошибка удаления!");
		return;
	}

	window.location.assign("/");
}

init();