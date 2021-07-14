async function getDumbgeons()
{
	const apiURL = "/api/getDumbgeons";

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
		console.log("Failed to fetch the dumbgeons");
		return null;
	}
}