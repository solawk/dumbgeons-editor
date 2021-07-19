function getDisplays(content)
{
	const displayMap = new Map;

	for (const contentThing of content)
	{
		displayMap.set(contentThing.name, contentThing.display);
	}

	return displayMap;
}