// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { type ConservationStatus } from "@/data/mockData";
import SpeciesCard from "@/components/SpeciesCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const statuses: ConservationStatus[] = ["Critically Endangered", "Endangered", "Vulnerable", "Near Threatened"];

export default function ExploreSpecies() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wikiDataCache, setWikiDataCache] = useState<Record<string, any>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/species`)
      .then(res => res.json())
      .then(data => {
        setSpecies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch species:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return species.filter(s => {
      const sciNameMatch = s.scientificName?.toLowerCase().includes(search.toLowerCase());
      const nameMatch = s.name?.toLowerCase().includes(search.toLowerCase());
      const matchSearch = search ? sciNameMatch || nameMatch : true;
      const matchStatus = statusFilter !== "all" ? s.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, species]);

  const paginated = useMemo(() => {
    return filtered.slice(0, page * ITEMS_PER_PAGE);
  }, [filtered, page]);

  // Batch fetch Wikipedia metadata for the current page
  useEffect(() => {
    const titlesToFetch = paginated
      .filter(s => s.scientificName && !wikiDataCache[s.scientificName])
      .map(s => s.scientificName)
      .slice(0, 50); // Wikipedia limit

    if (titlesToFetch.length === 0) return;

    const fetchWikiBatch = async () => {
      try {
        const titlesParam = titlesToFetch.map(t => encodeURIComponent(t)).join('|');
        // Fetch thumbnails AND descriptions (extracts)
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titlesParam}&prop=pageimages|extracts&exintro=1&explaintext=1&format=json&pithumbsize=400&origin=*&redirects=1`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query?.pages;
        const redirects = data.query?.redirects || [];

        if (pages) {
          const newCacheData: Record<string, any> = {};

          // Create a map from redirected title (or original if not redirected) to page data
          const pageTitleMap: Record<string, any> = {};
          Object.values(pages).forEach((pg: any) => {
            if (pg.pageid !== -1) {
              pageTitleMap[pg.title] = {
                image: pg.thumbnail?.source || null,
                description: pg.extract || null,
                name: pg.title
              };
            }
          });

          // Map original titles to the fetched data using redirects info
          titlesToFetch.forEach(origTitle => {
            const redirect = redirects.find((r: any) => r.from === origTitle);
            const targetTitle = redirect ? redirect.to : origTitle;
            const fetchedData = pageTitleMap[targetTitle];

            if (fetchedData) {
              newCacheData[origTitle] = fetchedData;
            } else {
              // Mark as fetched so we don't keep trying, even if no data found
              newCacheData[origTitle] = { image: null, description: null, name: origTitle };
            }
          });

          setWikiDataCache(prev => ({ ...prev, ...newCacheData }));
        }
      } catch (e) {
        console.error("Wiki batch fetch failed", e);
      }
    };

    fetchWikiBatch();
  }, [paginated, wikiDataCache]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">Explore Species</h1>
      <p className="text-muted-foreground mb-8">Browse and filter endangered species around the world</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scientific name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin md:w-8 md:h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading species database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No species match your filters.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((sp, i) => (
              <SpeciesCard
                key={sp.id || i}
                species={sp}
                index={i}
                prefetchedData={wikiDataCache[sp.scientificName]}
              />
            ))}
          </div>


          {filtered.length > paginated.length && (
            <div className="w-full flex justify-center mt-10">
              <Button onClick={() => setPage(p => p + 1)} variant="outline" size="lg">
                Load More Species
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
