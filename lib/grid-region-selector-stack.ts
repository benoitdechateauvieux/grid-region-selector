import { CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

export class GridRegionSelectorStack extends Stack {
  public readonly usaEgridTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.usaEgridTable = new dynamodb.Table(this, "GridRegiondSelectorEgridTable", {
      partitionKey: { name: "zip_code", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "GridRegiondSelectorPowertoolsLayer",
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:33`
    );

    const selectorFunction = new lambda.Function(this, 'GridRegiondSelectorFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: "selector_function.lambda_handler",
      layers: [powertoolsLayer],
      environment: {
        USA_EGRID_TABLE_NAME: this.usaEgridTable.tableName,
        POWERTOOLS_SERVICE_NAME: "grid_region_selector",
        POWERTOOLS_LOGGER_LOG_EVENT: "true"
      }
    });
    this.usaEgridTable.grantReadData(selectorFunction);

    const fnUrl = selectorFunction.addFunctionUrl({authType: lambda.FunctionUrlAuthType.NONE});
    new CfnOutput(this, 'Selector function url', {value: fnUrl.url});
  }
}
