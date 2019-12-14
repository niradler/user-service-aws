#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { UserServiceAwsStack } from '../lib/user-service-aws-stack';

const app = new cdk.App();
new UserServiceAwsStack(app, 'UserServiceAwsStack');