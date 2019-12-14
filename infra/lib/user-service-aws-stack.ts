import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');

export class UserServiceAwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const loginHandler = new lambda.Function(this, 'loginHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('../../functions'),
      handler: 'login.handler'
    });

    new apigw.LambdaRestApi(this, 'loginEndpoint', {
      handler: loginHandler
    });
  }
}
