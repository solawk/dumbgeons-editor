async function init()
{
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	const id = params.id;

	const dumbgeon = await getDumbgeonByID(id);

	if (!dumbgeon.hasOwnProperty("name")) // It's empty
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

	const confirmHref = document.createElement("a");
	const confirmButton = document.createElement("button");
	confirmHref.href = "/";
	confirmButton.className = "actionButton";
	confirmButton.innerHTML = "Да, удалить";

	confirmHref.appendChild(confirmButton);
	document.body.appendChild(confirmHref);
}

init();