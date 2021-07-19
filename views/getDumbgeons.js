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
		const dumbgeons = await response.json();
		dumbgeons.sort((a, b) => { return b._id.localeCompare(a._id); });
		return dumbgeons;
	}
	else
	{
		console.log("Failed to fetch the dumbgeons");
		return null;
	}
}