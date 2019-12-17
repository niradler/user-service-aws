import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");
import dynamodb = require("@aws-cdk/aws-dynamodb");

export class UserServiceAwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, "Users", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING }
    });

    const registerHandler = createLambda(this, "registerHandler", {
      handler: "register.handler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    const loginHandler = createLambda(this, "loginHandler", {
      handler: "login.handler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    const getUsersHandler = createLambda(this, "getUsersHandler", {
      handler: "get-users.handler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    const getUserHandler = createLambda(this, "getUserHandler", {
      handler: "get-user.handler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName
      }
    });

    usersTable.grantReadWriteData(registerHandler);
    usersTable.grantReadWriteData(loginHandler);
    usersTable.grantReadWriteData(getUsersHandler);
    usersTable.grantReadWriteData(getUserHandler);

    const userServiceApi = new apigw.RestApi(this, "userServiceApi", {
      restApiName: "Users Service"
    });
    const usersRootResource = userServiceApi.root.addResource("v1");

    const usersResource = usersRootResource.addResource("users");
    const getUsersIntegration = new apigw.LambdaIntegration(getUsersHandler);
    usersResource.addMethod("GET", getUsersIntegration);
    addCorsOptions(usersResource);

    const userResource = usersResource.addResource("{id}");
    const userIntegration = new apigw.LambdaIntegration(getUserHandler);
    userResource.addMethod("GET", userIntegration);
    addCorsOptions(userResource);

    const registerResource = usersRootResource.addResource("register");
    const registerIntegration = new apigw.LambdaIntegration(registerHandler);
    registerResource.addMethod("POST", registerIntegration);
    addCorsOptions(registerResource);

    const loginResource = usersRootResource.addResource("login");
    const loginIntegration = new apigw.LambdaIntegration(loginHandler);
    loginResource.addMethod("POST", loginIntegration);
    addCorsOptions(loginResource);
  }
}

export function addCorsOptions(apiResource: apigw.IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new apigw.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'"
          }
        }
      ],
      passthroughBehavior: apigw.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}'
      }
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true
          }
        }
      ]
    }
  );
}

export function createLambda(self: any, name: string, props?: any) {
  const _props = Object.assign(
    {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("../functions"),
      environment: {}
    },
    props || {}
  );

  return new lambda.Function(self, name, _props);
}
