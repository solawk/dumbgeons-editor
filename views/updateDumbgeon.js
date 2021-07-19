async function updateDumbgeon(idString, data)
{
	const apiURL = "/api/updateDumbgeon?id=" + idString;

	const response = await fetch(apiURL,
		{
			method: "PATCH",
			headers:
				{
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
			body: JSON.stringify(data)
		});

	if (!response.ok)
	{
		console.log("Failed to update the dumbgeon");
	}

	return response.status;
}