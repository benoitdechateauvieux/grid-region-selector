import { Stack, StackProps } from 'aws-cdk-lib';
import { custom_resources as cr } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import zip_codes from './zipcode_to_egrid.json';

const DDB_BATCH_WRITE_ITEM_CHUNK_SIZE = 25;

export interface GridRegionSelectorReferenceDataStackProps extends StackProps {
    usaEgridTable: dynamodb.Table;
}

export class GridRegionSelectorReferenceDataStack extends Stack {
    constructor(scope: Construct, id: string, props: GridRegionSelectorReferenceDataStackProps) {
        super(scope, id, props);

        //Populate table with reference data
        for (let i = 0; i < zip_codes.length; i += DDB_BATCH_WRITE_ITEM_CHUNK_SIZE) {
            const chunk = zip_codes.slice(i, i + DDB_BATCH_WRITE_ITEM_CHUNK_SIZE);
            new cr.AwsCustomResource(this, `initCarbonLakeEmissionsFactorReferenceTable${i}`, {
                onCreate: {
                    service: 'DynamoDB',
                    action: 'batchWriteItem',
                    parameters: {
                        RequestItems: {
                            [props.usaEgridTable.tableName]: this.generateBatch(chunk),
                        },
                    },
                    physicalResourceId: cr.PhysicalResourceId.of(props.usaEgridTable.tableName + '_initialization')
                },
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: [props.usaEgridTable.tableArn] }),
            });
        }
    }

    private generateBatch = (chunk: IEgrid[]): { PutRequest: { Item: IDdbEgrid } }[] => {
        const result: { PutRequest: { Item: IDdbEgrid; }; }[] = [];
        chunk.forEach((zip_code) => {
            result.push({ PutRequest: { Item: this.generateItem(zip_code) } });
        });
        return result;
    };

    private generateItem = (zip_code: IEgrid): IDdbEgrid => {
        return {
            zip_character: { S: zip_code.zip_character },
            zip_numeric: { S: zip_code.zip_numeric },
            state: { S: zip_code.state },
            egrid_subregion_1: { S: zip_code.egrid_subregion_1 },
            egrid_subregion_2: { S: zip_code.egrid_subregion_2 },
            egrid_subregion_3: { S: zip_code.zip_character }
        };
    }
}


interface IDdbEgrid {
    zip_character: { S: string };
    zip_numeric: { S: string };
    state: { S: string };
    egrid_subregion_1: { S: string };
    egrid_subregion_2: { S: string };
    egrid_subregion_3: { S: string };
}

interface IEgrid {
    zip_character: string;
    zip_numeric: string;
    state: string;
    egrid_subregion_1: string;
    egrid_subregion_2: string;
    egrid_subregion_3: string;
}