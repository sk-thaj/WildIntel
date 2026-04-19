(async () => {
    async function testEOL(sciName) {
        console.log(`Testing EOL for: ${sciName}`);
        try {
            const searchUrl = `https://eol.org/api/search/1.0.json?q=${encodeURIComponent(sciName)}&page=1&exact=true`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.results?.length > 0) {
                const eolId = searchData.results[0].id;
                const pageUrl = `https://eol.org/api/pages/1.0/${eolId}.json?images_per_page=5&videos_per_page=0&sounds_per_page=0&maps_per_page=0&texts_per_page=0&details=true&licenses=all&vetted=1`;
                const pageRes = await fetch(pageUrl);
                const pageData = await pageRes.json();

                const images = pageData.dataObjects?.filter(obj => obj.mediaURL || obj.eolMediaURL);
                if (images?.length > 0) {
                    console.log(`EOL Image: ${images[0].eolMediaURL || images[0].mediaURL}`);
                } else {
                    console.log("No images found on this EOL page.");
                }
            } else {
                console.log("EOL search returned no results.");
            }
        } catch (e) {
            console.error("EOL failed", e);
        }
        console.log("-------------------");
    }

    const species = ["Panthera leo", "Loxodonta africana", "Ailuropoda melanoleuca"];
    for (const s of species) {
        await testEOL(s);
    }
})();
