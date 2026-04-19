async function testApis(sciName) {
    console.log(`Testing APIs for: ${sciName}`);

    // 1. GBIF
    try {
        const gbifUrl = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(sciName)}&mediaType=StillImage&limit=5`;
        const res = await fetch(gbifUrl);
        const data = await res.json();
        console.log(`GBIF results: ${data.results?.length || 0}`);
        if (data.results?.[0]?.media?.[0]?.identifier) {
            console.log(`GBIF Image: ${data.results[0].media[0].identifier}`);
        }
    } catch (e) {
        console.error("GBIF failed", e);
    }

    // 2. Wikipedia
    try {
        const wikiImgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(sciName)}&prop=pageimages&format=json&pithumbsize=1000&origin=*&redirects=1`;
        const res = await fetch(wikiImgUrl);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
            if (page && pageId !== "-1" && page.thumbnail?.source) {
                console.log(`Wikipedia Image: ${page.thumbnail.source}`);
            } else {
                console.log("Wikipedia Image not found");
            }
        }
    } catch (e) {
        console.error("Wikipedia failed", e);
    }

    // 3. iNaturalist
    try {
        const iNatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&per_page=1`;
        const res = await fetch(iNatUrl);
        const data = await res.json();
        const photoUrl = data.results?.[0]?.default_photo?.medium_url;
        console.log(`iNaturalist Image: ${photoUrl}`);
    } catch (e) {
        console.error("iNaturalist failed", e);
    }
    console.log("-------------------");
}

const species = ["Panthera leo", "Loxodonta africana", "Ailuropoda melanoleuca"];
for (const s of species) {
    await testApis(s);
}
