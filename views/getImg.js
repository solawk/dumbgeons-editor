async function getImgMini(content)
{
	const imgMap = new Map;

	for (const contentThing of content)
	{
		const imgURL = "/api/getImgMini?name=" + contentThing.name;

		const imgResponse = await fetch(imgURL,
			{
				method: "GET",
				headers: { "Accept": "image/png" }
			});

		let image = null;

		if (!imgResponse.ok)
		{
			console.log("Failed to fetch the image " + contentThing.name);
		}

		image = URL.createObjectURL(await imgResponse.blob());

		imgMap.set(contentThing.name, image);
	}

	return imgMap;
}