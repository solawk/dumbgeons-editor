async function addDumbgeon(name, width, height)
{
	const apiURL = "/api/addDumbgeon?name=" + name + "&w=" + width + "&h=" + height;

	const response = await fetch(apiURL,
		{
			method: "PUT",
			headers: { "Accept": "application/json" }
		});

	if (response.ok)
	{
		return await response.json();
	}
	else
	{
		console.log("Failed to add the dumbgeon");
		return response.status;
	}
}