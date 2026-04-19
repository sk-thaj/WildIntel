// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Species, getStatusBadgeClass } from "@/data/mockData";
import { motion, useInView } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Flag } from "lucide-react";
import { ReportIssueModal } from "./ReportIssueModal";

// Persistent cache in localStorage
const CACHE_KEY = "species_explorer_cache_v1";
const getInitialCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};
const speciesCache: Record<string, any> = getInitialCache();

const updatePersistentCache = (sciName: string, data: any) => {
  speciesCache[sciName] = data;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(speciesCache));
  } catch (e) {
    // If quota exceeded, clear and start over or handle gracefully
    if (e.name === 'QuotaExceededError') {
      localStorage.clear();
    }
  }
};

export default function SpeciesCard({ species, index = 0, prefetchedData }: { species: any; index?: number; prefetchedData?: any }) {
  const [wikiData, setWikiData] = useState<{ image: string | null; name: string; description: string; sourceUrl: string | null }>({
    image: species.localImage || species.aiGeneratedImage || prefetchedData?.image || null,
    name: prefetchedData?.name || species.scientificName || "Unknown Species",
    description: prefetchedData?.description || "Loading information...",
    sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(prefetchedData?.name || species.scientificName)}`
  });
  const [loading, setLoading] = useState(!prefetchedData);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "400px 0px 400px 0px" // Start loading when card is 400px from viewport
  });

  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    const controller = new AbortController();

    const isValidImage = (url: string | null) => {
      if (!url) return false;
      const lower = url.toLowerCase();
      const invalidKeywords = [
        "map", "distribution", "range", "diagram", "chart", "book", "text",
        "scan", "document", "plot", "graph", "outline", "drawing", "illustration",
        "sketch", "habitat", "museum", "location", "area", "region", "path",
        "silhouette", "stencil", "icon", "logo", "symbol", "sign", "button",
        "skeleton", "skull", "bone", "fossil", "stuffed", "taxidermy", "sculpture",
        "statue", "cartoon", "comic", "infographic", "poster", "stamp", "coin",
        "specimen", "jar", "slide", "preparations", "anatomy", "morphology",
        "cladogram", "tree", "phylogeny", "label", "tag", "box", "drawer"
      ];

      const isInvalid = invalidKeywords.some(keyword => lower.includes(keyword));
      const isSvg = lower.endsWith(".svg");
      const isTooSmall = lower.includes("tiny") || lower.includes("thumb") && !lower.includes("original");

      return !isInvalid && !isSvg;
    };

    const fetchDescription = async (sciName: string) => {
      // Normalize name: remove anything in parentheses or after a comma (author metadata)
      const cleanName = sciName.split(' (')[0].split(',')[0].trim();

      // 1. Try Wikipedia direct title
      try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanName)}&prop=extracts&exintro=1&explaintext=1&format=json&origin=*&redirects=1`;
        const res = await fetch(wikiUrl, { signal: controller.signal });
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && pageId !== "-1" && page.extract) {
            return {
              description: page.extract,
              name: page.title
            };
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("Wikipedia direct fetch failed", e);
      }

      // 2. Try Wikipedia Search Fallback
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanName)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl, { signal: controller.signal });
        const searchData = await searchRes.json();
        if (searchData.query?.search?.length > 0) {
          const bestTitle = searchData.query.search[0].title;
          const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=extracts&exintro=1&explaintext=1&format=json&origin=*&redirects=1`;
          const res = await fetch(wikiUrl, { signal: controller.signal });
          const data = await res.json();
          const pages = data.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
            if (page && pageId !== "-1" && page.extract) {
              return {
                description: page.extract,
                name: page.title
              };
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("Wikipedia search fallback failed", e);
      }

      // 3. Try Encyclopedia of Life (EOL)
      try {
        const eolSearchUrl = `https://eol.org/api/search/1.0.json?q=${encodeURIComponent(cleanName)}&page=1&exact=true`;
        const searchRes = await fetch(eolSearchUrl, { signal: controller.signal });
        const searchData = await searchRes.json();

        if (searchData.results?.length > 0) {
          const eolId = searchData.results[0].id;
          const eolPageUrl = `https://eol.org/api/pages/1.0/${eolId}.json?details=true&texts_per_page=1`;
          const pageRes = await fetch(eolPageUrl, { signal: controller.signal });
          const pageData = await pageRes.json();
          const textObjects = pageData.dataObjects?.filter((obj: any) => obj.dataType === "http://purl.org/dc/dcmitype/Text");
          if (textObjects?.length > 0) {
            return {
              description: textObjects[0].description.replace(/<[^>]*>/g, '').split('References')[0].trim().substring(0, 600) + "...",
              name: cleanName
            };
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("EOL description fetch failed", e);
      }

      // 4. Try iNaturalist
      try {
        const iNatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(cleanName)}&per_page=1`;
        const iNatRes = await fetch(iNatUrl, { signal: controller.signal });
        const iNatData = await iNatRes.json();
        const result = iNatData.results?.[0];
        if (result && (result.wikipedia_summary || result.summary)) {
          return {
            description: (result.wikipedia_summary || result.summary).replace(/<[^>]*>/g, '').substring(0, 600) + "...",
            name: result.preferred_common_name || result.name || cleanName
          };
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("iNaturalist description fetch failed", e);
      }

      // 5. Try GBIF Species descriptions (Aggressive)
      try {
        const gbifMatchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(cleanName)}`;
        const matchRes = await fetch(gbifMatchUrl, { signal: controller.signal });
        const matchData = await matchRes.json();

        if (matchData.usageKey) {
          const descUrl = `https://api.gbif.org/v1/species/${matchData.usageKey}/descriptions`;
          const descRes = await fetch(descUrl, { signal: controller.signal });
          const descData = await descRes.json();

          if (descData.results?.length > 0) {
            // Sort to prefer longer/more descriptive records
            const results = descData.results.sort((a: any, b: any) => (b.description?.length || 0) - (a.description?.length || 0));
            const bestDesc = results.find((d: any) => d.description && d.description.length > 30);
            if (bestDesc?.description) {
              const typePrefix = bestDesc.type ? `${bestDesc.type}: ` : "";
              return {
                description: typePrefix + bestDesc.description.replace(/<[^>]*>/g, '').substring(0, 600) + "...",
                name: cleanName
              };
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("GBIF description fetch failed", e);
      }

      // 6. Try Catalogue of Life (CoL) fallback as final authority
      try {
        const colUrl = `https://api.catalogueoflife.org/taxon/search?q=${encodeURIComponent(cleanName)}&limit=1`;
        const colRes = await fetch(colUrl, { signal: controller.signal });
        const colData = await colRes.json();
        if (colData.result?.[0]) {
          const taxon = colData.result[0];
          return {
            description: `Biological record from Catalogue of Life. Status: ${taxon.status || "Unknown"}. Classification: ${taxon.classification?.map((c: any) => c.name).join(' > ') || "Various"}.`,
            name: cleanName
          };
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("CoL fetch failed", e);
      }

      return { description: "Brief scientific record exists. Click 'View More' for full museum and field data logs.", name: cleanName };
    };

    const fetchImage = async (sciName: string) => {
      // 1. Try GBIF
      try {
        const gbifUrl = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(sciName)}&mediaType=StillImage&limit=10`;
        const res = await fetch(gbifUrl, { signal: controller.signal });
        const data = await res.json();

        for (const result of data.results || []) {
          for (const media of result.media || []) {
            if (media.type === "StillImage" && media.identifier && isValidImage(media.identifier)) {
              return {
                image: media.identifier,
                sourceUrl: `https://www.gbif.org/occurrence/${result.key}`
              };
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("GBIF fetch failed", e);
      }

      // 2. Try Wikipedia PageImages
      try {
        const wikiImgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(sciName)}&prop=pageimages&format=json&pithumbsize=1000&origin=*&redirects=1`;
        const res = await fetch(wikiImgUrl, { signal: controller.signal });
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && pageId !== "-1" && page.thumbnail?.source) {
            if (isValidImage(page.thumbnail.source)) {
              return {
                image: page.thumbnail.source,
                sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
              };
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("Wikipedia image fetch failed", e);
      }

      // 3. Try EOL (Encyclopedia of Life)
      try {
        const eolSearchUrl = `https://eol.org/api/search/1.0.json?q=${encodeURIComponent(sciName)}&page=1&exact=true`;
        const searchRes = await fetch(eolSearchUrl, { signal: controller.signal });
        const searchData = await searchRes.json();

        if (searchData.results?.length > 0) {
          const eolId = searchData.results[0].id;
          const eolPageUrl = `https://eol.org/api/pages/1.0/${eolId}.json?images_per_page=5&videos_per_page=0&sounds_per_page=0&maps_per_page=0&texts_per_page=0&details=true&licenses=all&vetted=1`;
          const pageRes = await fetch(eolPageUrl, { signal: controller.signal });
          const pageData = await pageRes.json();

          const media = pageData.dataObjects?.filter((obj: any) => obj.mediaURL || obj.eolMediaURL);
          for (const item of media || []) {
            const url = item.eolMediaURL || item.mediaURL;
            if (url && isValidImage(url)) {
              return {
                image: url,
                sourceUrl: `https://eol.org/pages/${eolId}`
              };
            }
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("EOL fetch failed", e);
      }

      // 4. Fallback to iNaturalist
      try {
        const iNatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&per_page=1`;
        const res = await fetch(iNatUrl, { signal: controller.signal });
        const data = await res.json();
        const result = data.results?.[0];
        const photoUrl = result?.default_photo?.medium_url || result?.default_photo?.url;
        if (photoUrl && isValidImage(photoUrl)) {
          return {
            image: photoUrl,
            sourceUrl: `https://www.inaturalist.org/taxa/${result.id}`
          };
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("iNaturalist fetch failed", e);
      }

      return { image: null, sourceUrl: null };
    };

    const fetchData = async () => {
      const sciName = species.scientificName;
      if (!sciName) {
        setLoading(false);
        return;
      }

      // If we have prefetched data, we already set it in initial state and set loading=false
      // But if prefetchedData arrived later via props update, we handle it here or in a separate useEffect
      // If we have prefetched data with a description, we can use it.
      // If the description is missing, we still want to try our deep fallbacks.
      if (prefetchedData && prefetchedData.description && prefetchedData.description !== "No description available.") {
        setWikiData({
          image: species.localImage || species.aiGeneratedImage || prefetchedData.image,
          name: prefetchedData.name || sciName,
          description: prefetchedData.description,
          sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(prefetchedData.name || sciName)}`
        });
        setLoading(false);
        return;
      }

      // If we have a local image but no description, we still need to fetch the description
      // So we don't return early here unless we have both.

      try {
        // Determine if we already have a starting image from parent batch fetch
        let imgData = {
          image: species.localImage || species.aiGeneratedImage || prefetchedData?.image || null,
          sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(sciName)}`
        };

        // Fetch remaining data (description) and image (if missing) in parallel
        const promises = [
          fetchDescription(sciName)
        ];

        // Only search for image if we don't have it
        if (!imgData.image) {
          promises.push(fetchImage(sciName));
        }

        const results = await Promise.all(promises);
        const descData = results[0];
        if (!imgData.image) {
          imgData = results[1];
        }

        if (!isMounted) return;

        const finalData = {
          image: imgData.image,
          name: descData.name,
          description: descData.description,
          sourceUrl: imgData.sourceUrl
        };

        // Update cache
        updatePersistentCache(sciName, finalData);

        if (isMounted) {
          setWikiData(finalData);
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("Fetch data failed", e);
      } finally {
        if (isMounted) setLoading(false);
      }

    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [species.scientificName, prefetchedData, isInView]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 24) * 0.05, duration: 0.4 }}
    >
      <div className="group block overflow-hidden rounded-lg bg-card border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden relative bg-muted flex flex-col items-center justify-center">
          {loading ? (
            <Skeleton className="w-full h-full absolute inset-0" />
          ) : (
            <>
              {wikiData.image ? (
                <img
                  src={wikiData.image}
                  alt={wikiData.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">No image available</span>
                    <span className="text-[9px] text-primary font-semibold block">Click for more information</span>
                  </div>
                </div>
              )}
              {wikiData.sourceUrl && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(wikiData.sourceUrl!, '_blank');
                  }}
                >
                  <span className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                    View More
                    <Leaf className="w-4 h-4" />
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {loading ? <Skeleton className="h-6 w-32" /> : wikiData.name}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsReportModalOpen(true); }}
                className="text-muted-foreground hover:text-red-500 transition-colors bg-secondary p-1 rounded-full flex-shrink-0"
                title="Report Issue"
              >
                <Flag className="w-3 h-3" />
              </button>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${species.status === 'Critically Endangered' ? 'bg-red-500/10 text-red-600' : species.status === 'Endangered' ? 'bg-orange-500/10 text-orange-600' : species.status === 'Vulnerable' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                {species.status}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic font-medium">{species.scientificName}</p>
          <div className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
            {loading ? (
              <div className="space-y-1 mt-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[90%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
            ) : (
              wikiData.description
            )}
          </div>
        </div>
      </div>
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        speciesName={species.scientificName}
      />
    </motion.div>
  );
}
