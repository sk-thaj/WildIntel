import { useEffect, useState } from "react";
import MapView from "../components/MapView";
import { getSpecies } from "../services/api";

type Species = {
  name: string;
  status: string;
};

export default function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([]);

  useEffect(() => {
    getSpecies().then(setSpecies);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Endangered Species</h1>

      <MapView species={species} />

      <ul>
        {species.slice(0, 20).map((sp, i) => (
          <li key={i}>
            {sp.name} - {sp.status}
          </li>
        ))}
      </ul>
    </div>
  );
}