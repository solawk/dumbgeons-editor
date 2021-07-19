async function getContentList()
{
	const listURL = "/api/getContentList";

	const listResponse = await fetch(listURL,
		{
			method: "GET",
			headers: { "Accept": "application/json" }
		});

	if (!listResponse.ok)
	{
		console.log("Failed to fetch the content list");
		return null;
	}

	return await listResponse.json();
}