import os
import csv

seen = set()
csvFilePath = os.path.join('../lib/dataloader', r'power_profiler_zipcode_tool_2018_3_09_20_v9.csv')
with open(csvFilePath, encoding='utf-8-sig') as csvf:
    csvReader = csv.DictReader(csvf) 
    for row in csvReader:
        zipcode = row['zip_character']
        if zipcode in seen:
            print("Duplicate value found :", zipcode)
        seen.add(zipcode)