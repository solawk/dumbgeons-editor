async function getDumbgeonByID(idString)
{
	const apiURL = "/api/getDumbgeon?id=" + idString;

	const response = await fetch(apiURL,
		{
			method: "GET",
			headers: { "Accept": "application/json" }
		});

	if (response.ok)
	{
		return await response.json();
	}
	else
	{
		console.log("Failed to fetch the dumbgeon by ID");
		return null;
	}
}