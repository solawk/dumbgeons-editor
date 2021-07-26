async function randomDumbgeon(settings)
{
	const apiURL = "/api/random";

	const response = await fetch(apiURL,
		{
			method: "GET",
			headers:
				{
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
			body: JSON.stringify(settings)
		});

	if (response.ok)
	{
		return await response.json();
	}
	else
	{
		console.log("Failed to fetch a random dumbgeon!");
		return null;
	}
}