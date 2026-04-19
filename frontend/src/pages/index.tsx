import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export default function Index() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { }
    );
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Rainforest canopy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary-foreground/20">
              <Leaf className="h-4 w-4" /> Endangered Species Intelligence
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Protecting Wildlife<br />Through Data & Community
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              WildIntel connects researchers, conservationists, and citizens to monitor endangered species, visualize risks, and report wildlife sightings worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="text-base">
                <Link to="/explore">Explore Species <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Link to="/report">Report a Sighting <MapPin className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Leaf className="h-4 w-4 text-primary" /> WildIntel — Endangered Species Intelligence Platform © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
