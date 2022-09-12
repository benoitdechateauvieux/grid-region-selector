# this takes an emissions factors table as input and parses it to generate json of emissions factors outputs
# to run the script cd to the parent directory and run `python3 generate_emissions_factors.py`
# this will produce a new output emissions_factor_model_date file that you can now use to seed the database

import csv
import json
import os

csvFilePath = r'power_profiler_zipcode_tool_2018_3_09_20_v9.csv'
jsonFileName = rf'zipcode_to_egrid.json'
jsonFilePath = os.path.join(os.getcwd(), jsonFileName)

def parse_single_factor(row):
    return {
        "zip_character": row["zip_character"],
        "zip_numeric": row["zip_numeric"],
        "state": row["state"],
        "egrid_subregion_1": row["egrid_subregion_1"],
        "egrid_subregion_2": row["egrid_subregion_2"],
        "egrid_subregion_3": row["egrid_subregion_3"]
    }

def csv_to_json(csvFilePath, jsonFilePath):
    jsonArray = []
      
    #read csv file
    with open(csvFilePath, encoding='utf-8-sig') as csvf: 
        #load csv file data using csv library's dictionary reader
        csvReader = csv.DictReader(csvf) 

        #convert each csv row into python dict
        for row in csvReader:
            print(row)
            parsed_row = parse_single_factor(row)
            #add this python dict to json array
            jsonArray.append(parsed_row)
  
    #convert python jsonArray to JSON String and write to file
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf: 
        jsonString = json.dumps(jsonArray, indent=4)
        jsonf.write(jsonString)

csv_to_json(csvFilePath, jsonFilePath)