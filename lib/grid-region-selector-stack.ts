import { CfnOutput, Stack, StackProps, RemovalPolicy, CustomResource, Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as customResources from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as path from 'path';

export class GridRegionSelectorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const usaEgridTable = new dynamodb.Table(this, "GridRegiondSelectorEgridTable", {
      partitionKey: { name: "zip_character", type: dynamodb.AttributeType.STRING },
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
        USA_EGRID_TABLE_NAME: usaEgridTable.tableName,
        POWERTOOLS_SERVICE_NAME: "grid_region_selector",
        POWERTOOLS_LOGGER_LOG_EVENT: "true"
      }
    });
    usaEgridTable.grantReadData(selectorFunction);

    const fnUrl = selectorFunction.addFunctionUrl({authType: lambda.FunctionUrlAuthType.NONE});
    new CfnOutput(this, 'Selector function url', {value: fnUrl.url});

    //Load reference data
    const dataLoader = new lambda.Function(this, 'GridRegiondSelectorDataLoaderFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './dataloader')),
      handler: "data_loader.on_event",
      timeout: Duration.minutes(5),
      environment: {
        USA_EGRID_TABLE_NAME: usaEgridTable.tableName,
      }
    });
    usaEgridTable.grantWriteData(dataLoader);
    const provider = new customResources.Provider(this, 'Provider', {
      onEventHandler: dataLoader,
    });
    const resource = new CustomResource(this, 'Resource', {
      serviceToken: provider.serviceToken,
    });
  }
}
