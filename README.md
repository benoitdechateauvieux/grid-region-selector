# Grid Region selector

Select a grid region for GHG Scope 2 emissions calculation based on Country/Zip code.  
Grid region is used in the [GHG Emissions calculation tool](https://ghgprotocol.org/ghg-emissions-calculation-tool)

## Region selection
- USA: eGRID subregions obtained from the [Power Profiler ZIP Code Tool with eGRID2018 Data](https://www.epa.gov/egrid/power-profiler#/)

## How to deploy?
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## How to invoke?

### Input
Input parameter for the lambda function is a json document the following properties:
- `country`: 2 letters country code ([ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2))
- `zipcode`: alphanumeric, country-specific
    - For the USA: a 5-digits ZIP code with leading zeroes (ex: "38940" or "01742")
```json
{
    "country": "US",
    "zipcode": "38940"
}
```
### Output
A Grid region as defined in the Scope 2 "Purchased Electricity" Emission Factors table of the [GHG Emissions calculation tool](https://ghgprotocol.org/ghg-emissions-calculation-tool).
```json
{
    "region": "SRSO"
}
```
## Backlog
- USA: Include eGRID sub-regions #2 et #3 (currently, only subregion #1 is returned)
- Support other countries