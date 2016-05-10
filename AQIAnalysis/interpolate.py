import arcpy
from arcpy import env

# Set environment settings
env.workspace = "C:/data"

# Set local variables
inPointFeatures = "F:/workspace/AQIAnalysis/Export_Output.shp"
zField = "aqi"
outRaster = "F:/workspace/AQIAnalysis/ddd"
cellSize = 2000.0
power = 2
searchRadius = 150000

# Check out the ArcGIS 3D Analyst extension license
arcpy.CheckOutExtension("3D")

# Execute IDW
arcpy.Idw_3d(inPointFeatures, zField, outRaster, cellSize, 
             power, searchRadius)
