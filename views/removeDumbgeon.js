async function removeDumbgeon(idString)
{
	const apiURL = "/api/removeDumbgeon?id=" + idString;

	const response = await fetch(apiURL,
		{
			method: "DELETE",
			headers: { "Accept": "application/json" }
		});

	if (response.ok)
	{
		return true;
	}
	else
	{
		console.log("Failed to remove the dumbgeon by ID");
		return false;
	}
}