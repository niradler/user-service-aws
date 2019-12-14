import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export class UserServiceAwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING }
    });

    const registerHandler = new lambda.Function(this, 'registerHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('../functions'),
      handler: 'register.handler',
      environment: {
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    usersTable.grantReadWriteData(registerHandler);

    new apigw.LambdaRestApi(this, 'registerEndpoint', {
      handler: registerHandler
    });

    const loginHandler = new lambda.Function(this, 'loginHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('../functions'),
      handler: 'login.handler'
    });

    new apigw.LambdaRestApi(this, 'loginEndpoint', {
      handler: loginHandler
    });



  }
}
