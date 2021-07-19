function getID()
{
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	return params.id;
}

function sizeInputOnChange(element)
{
	const value = parseInt(element.value);

	if (!value)
	{
		element.value = 10;
	}

	if (value < element.min)
	{
		element.value = element.min;
	}

	if (value > element.max)
	{
		element.value = element.max;
	}
}