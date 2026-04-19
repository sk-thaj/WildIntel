async function fetchINaturalist(name) {
    try {
        const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.results?.length > 0) {
            const result = data.results[0];
            return {
                originalName: name,
                scientificName: result.name,
                commonName: result.preferred_common_name || "N/A",
                image: result.default_photo?.medium_url || result.default_photo?.url || null,
                inatUrl: `https://www.inaturalist.org/taxa/${result.id}`
            };
        }
    } catch (e) {
        console.error(`Failed to fetch ${name}`, e);
    }
    return { originalName: name, error: "Not found" };
}

const list = [
    "Amorphochilus schnablii",
    "Anthops ornatus",
    "Aproteles bulmerae",
    "Cephalophus spadix",
    "Chaerephon tomensis",
    "Cremnomys elvira",
    "Crocidura raineyi"
];

(async () => {
    const results = [];
    for (const item of list) {
        results.push(await fetchINaturalist(item));
    }
    const fs = require('fs');
    fs.writeFileSync('inat_output.json', JSON.stringify(results, null, 2));
    console.log("Results saved to inat_output.json");
})();
