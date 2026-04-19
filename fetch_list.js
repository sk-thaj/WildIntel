async function fetchWiki(name) {
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.query?.search?.length > 0) {
            const title = searchData.query.search[0].title;
            const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=1000&format=json&origin=*&redirects=1`;
            const detailRes = await fetch(detailUrl);
            const detailData = await detailRes.json();
            const pages = detailData.query?.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];

            return {
                originalName: name,
                wikiTitle: title,
                description: page.extract || "No description found.",
                image: page.thumbnail?.source || null
            };
        }
    } catch (e) {
        console.error(`Failed to fetch ${name}`, e);
    }
    return { originalName: name, error: "Not found" };
}

(async () => {
    const list = [
        "Abrocoma boliviensis",
        "Silent grass mouse",
        "Alticola montosa",
        "Neamblysomus julianae",
        "Archboldomys luzonensis",
        "Long-headed hill rat",
        "northern free-tailed bat",
        "Solomons mastiff bat",
        "Greater long-tailed bat",
        "Coleura seychellensis",
        "Ansell's shrew"
    ];

    const results = [];
    for (const item of list) {
        results.push(await fetchWiki(item));
    }

    const fs = require('fs');
    fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
    console.log("Results saved to output.json");
})();
