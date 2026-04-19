import geopandas as gpd
import os

base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, "dataset", "MAMMALS_TERRESTRIAL_ONLY.shp")

data = gpd.read_file(file_path)

print("Total rows:", len(data))

print(data[["sci_name","category"]].head(10))

# filter endangered species
endangered = data[data["category"].isin(["CR","EN","VU"])]

print("Endangered species count:", len(endangered))

# save CSV
output_path = os.path.join(base_dir,"dataset","endangered_species.csv")

endangered[["sci_name","category"]].to_csv(output_path,index=False)

print("CSV file created successfully")