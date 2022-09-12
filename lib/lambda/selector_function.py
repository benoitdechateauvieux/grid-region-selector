import boto3
import os
from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler import LambdaFunctionUrlResolver
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.event_handler.exceptions import NotFoundError
from aws_lambda_powertools.utilities.validation import validator

USA_EGRID_TABLE_NAME = os.environ.get('USA_EGRID_TABLE_NAME')

logger = Logger()
app = LambdaFunctionUrlResolver()

dynamodb = boto3.resource('dynamodb')

def __get_usa_egrid_subregion(zip_code):
    table = dynamodb.Table(USA_EGRID_TABLE_NAME)
    subregions = table.get_item(Key={'zip_code': zip_code})
    return subregions['subregion1']

'''
Input: {"country": "CA", "zipcode": "H3S1V6" }
Output: {"region": "Quebec"}
'''
@app.get("/")
def get_region():
    country: str = app.current_event.get_query_string_value('country')
    zipcode: str = app.current_event.get_query_string_value('zipcode')
    if (country=='US'):
        # TODO manage unknown zip code
        return {"region": __get_usa_egrid_subregion(zipcode)}
    else:
        raise NotFoundError
    return "Quebec"

@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    return app.resolve(event, context)
