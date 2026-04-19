import geopandas as gpd
import os

base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, "dataset", "data_0.shp")

data = gpd.read_file(file_path)

# Select useful columns
clean_data = data[["SCI_NAME", "PRESENCE", "ORIGIN", "SEASONAL"]]

# Rename column
clean_data = clean_data.rename(columns={
    "SCI_NAME": "species_name"
})

# Save cleaned dataset
output_path = os.path.join(base_dir, "dataset", "clean_species.csv")
clean_data.to_csv(output_path, index=False)

print("Dataset cleaned and saved successfully")