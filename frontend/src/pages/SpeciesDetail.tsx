// @ts-nocheck
import { useParams, Link } from "react-router-dom";
import { species, getStatusBadgeClass } from "@/data/mockData";
import { ArrowLeft, MapPin, TrendingDown, ShieldAlert, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SpeciesDetail() {
  const { id } = useParams();
  const sp = species.find(s => s.id === id);

  if (!sp) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Species not found.</p>
      <Button asChild variant="ghost" className="mt-4"><Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6"><Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Back to Explore</Link></Button>

      <div className="rounded-xl overflow-hidden border bg-card">
        <img src={sp.image} alt={sp.name} className="w-full h-64 md:h-80 object-cover" />
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold">{sp.name}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(sp.status)}`}>{sp.status}</span>
            </div>
            <p className="text-muted-foreground italic">{sp.scientificName}</p>
          </div>

          <p className="text-foreground">{sp.description}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" /> Habitat</div>
              <p className="text-sm text-muted-foreground">{sp.habitat}</p>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold"><TrendingDown className="h-4 w-4 text-primary" /> Population</div>
              <p className="text-sm text-muted-foreground">{sp.population}</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-3"><ShieldAlert className="h-5 w-5 text-status-endangered" /> Threats</h3>
            <ul className="flex flex-wrap gap-2">
              {sp.threats.map(t => <li key={t} className="bg-destructive/10 text-destructive text-sm px-3 py-1 rounded-full">{t}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-3"><Lightbulb className="h-5 w-5 text-accent" /> Conservation Actions</h3>
            <ul className="space-y-1">
              {sp.conservationActions.map(a => <li key={a} className="text-sm text-muted-foreground flex items-center gap-2">✅ {a}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Population Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sp.populationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(152, 45%, 28%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
