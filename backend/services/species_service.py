import pandas as pd
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "dataset", "endangered_species.csv")

# In-memory cache
_species_cache = None

def get_species():
    global _species_cache
    
    if _species_cache is not None:
        return _species_cache

    try:
        df = pd.read_csv(DATA_PATH)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return []

    # remove duplicate species
    df = df.drop_duplicates(subset=["sci_name"])

    # map acronyms to full names
    status_map = {
        "CR": "Critically Endangered",
        "EN": "Endangered",
        "VU": "Vulnerable",
        "NT": "Near Threatened"
    }

    species_list = []
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    generated_dir = os.path.join(current_dir, '..', '..', 'frontend', 'public', 'generated_species')
    local_images_dir = os.path.join(current_dir, '..', '..', 'frontend', 'public', 'species_images')
    
    # Add coordinates so frontend can map them globally
    for idx, row in df.iterrows():
        cat = str(row.get("category", "")).strip()
        mapped_status = status_map.get(cat, cat)
        sci_name = str(row.get("sci_name", "")).strip()
        if sci_name:
            random.seed(sci_name) # Ensure consistent locations across reloads
            
            # Check for AI generated image
            ai_image_url = None
            if os.path.exists(generated_dir):
                if os.path.exists(os.path.join(generated_dir, f"{sci_name}.jpg")):
                    ai_image_url = f"/generated_species/{sci_name}.jpg"
                    
            # Check for local downloaded image
            local_image_url = None
            if os.path.exists(local_images_dir):
                if os.path.exists(os.path.join(local_images_dir, f"{sci_name}.jpg")):
                    local_image_url = f"/species_images/{sci_name}.jpg"
            
            # Generate random but consistent population trends
            trend_years = [2000, 2005, 2010, 2015, 2020, 2024]
            population_trend = []
            base_pop = random.randint(100, 1000)
            
            # Use categories to influence the trend
            multiplier = 0.8 if mapped_status == "Critically Endangered" else 0.9 if mapped_status == "Endangered" else 0.95
            
            for i, year in enumerate(trend_years):
                current_pop = int(base_pop * (multiplier ** i) * random.uniform(0.9, 1.1))
                population_trend.append({"year": year, "count": max(10, current_pop)})

            species_list.append({
                "id": f"sp-{idx}",
                "name": sci_name, # Fallback for map
                "scientificName": sci_name,
                "status": mapped_status,
                "region": "Global",
                "type": "Animal",
                "lat": random.uniform(-50, 60),
                "lng": random.uniform(-120, 150),
                "habitat": "Various native habitats",
                "population": f"{population_trend[-1]['count']} estimated individuals",
                "conservationActions": ["Active habitat protection efforts"],
                "aiGeneratedImage": ai_image_url,
                "localImage": local_image_url,
                "populationTrend": population_trend
            })

    _species_cache = species_list
    return _species_cache


