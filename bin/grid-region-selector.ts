#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GridRegionSelectorStack } from '../lib/grid-region-selector-stack';

const app = new cdk.App();
new GridRegionSelectorStack(app, 'GridRegionSelectorStack');
