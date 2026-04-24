import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getStatusBadgeClass } from "@/data/mockData";
import { ArrowLeft, MapPin, TrendingDown, ShieldAlert, Lightbulb, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function SpeciesDetail() {
  const { id } = useParams();
  const [sp, setSp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wikiData, setWikiData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/species?id=${id}`);
        // If the endpoint is /species and it returns an array, we find the one. 
        // Based on ExploreSpecies it's api.get("/species").
        const allRes = await api.get("/species");
        const found = allRes.data.find((s: any) => s.id === id || s.id === Number(id));

        if (found) {
          setSp(found);

          // Fetch additional info from Wikipedia
          const cleanName = found.scientificName?.split(' (')[0].split(',')[0].trim() || found.name;
          const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanName)}&prop=pageimages|extracts&exintro=1&explaintext=1&format=json&pithumbsize=1000&origin=*&redirects=1`;
          const wikiRes = await fetch(wikiUrl);
          const wikiJson = await wikiRes.json();
          const pages = wikiJson.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0] as any;
            if (page && page.pageid !== -1) {
              setWikiData({
                image: page.thumbnail?.source || null,
                description: page.extract || null,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch species detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-64 md:h-80 w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );

  if (!sp) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Species not found.</p>
      <Button asChild variant="ghost" className="mt-4"><Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
    </div>
  );

  const displayImage = sp.image || wikiData?.image;
  const displayDescription = wikiData?.description || sp.description;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6"><Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Back to Explore</Link></Button>

      <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
        <div className="relative aspect-video md:aspect-auto md:h-80 overflow-hidden bg-muted flex items-center justify-center">
          {displayImage ? (
            <img src={displayImage} alt={sp.name} className="w-full h-full object-cover" />
          ) : (
            <Leaf className="w-16 h-16 text-primary/20" />
          )}
          {wikiData?.url && (
            <a
              href={wikiData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-1 rounded transition-colors"
            >
              Source: Wikipedia
            </a>
          )}
        </div>

        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">{sp.name}</h1>
              <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full ${sp.status === 'Critically Endangered' ? 'bg-red-500/10 text-red-600' : sp.status === 'Endangered' ? 'bg-orange-500/10 text-orange-600' : sp.status === 'Vulnerable' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>{sp.status}</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground italic">{sp.scientificName}</p>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed">
            {displayDescription}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-1 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-semibold capitalize"><MapPin className="h-4 w-4 text-primary" /> Habitat</div>
              <p className="text-sm text-muted-foreground">{sp.habitat || "Various regions worldwide"}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 space-y-1 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-semibold capitalize"><TrendingDown className="h-4 w-4 text-primary" /> Population</div>
              <p className="text-sm text-muted-foreground">{sp.population || "Data currently being updated"}</p>
            </div>
          </div>

          {sp.threats && sp.threats.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-3"><ShieldAlert className="h-5 w-5 text-red-500" /> Threats</h3>
              <ul className="flex flex-wrap gap-2">
                {sp.threats.map((t: string) => <li key={t} className="bg-red-500/10 text-red-600 text-[11px] md:text-xs px-3 py-1 rounded-full font-medium">{t}</li>)}
              </ul>
            </div>
          )}

          {sp.conservationActions && sp.conservationActions.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-3"><Lightbulb className="h-5 w-5 text-amber-500" /> Conservation Actions</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sp.conservationActions.map((a: string) => <li key={a} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span> {a}
                </li>)}
              </ul>
            </div>
          )}

          {sp.populationTrend && sp.populationTrend.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Population Trend</h3>
              <div className="h-[200px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sp.populationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
