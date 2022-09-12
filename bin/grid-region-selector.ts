#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GridRegionSelectorStack } from '../lib/grid-region-selector-stack';
import { GridRegionSelectorReferenceDataStack } from '../lib/grid-region-selector-reference-data';

const app = new cdk.App();
const gridRegionSelectorStack = new GridRegionSelectorStack(app, 'GridRegionSelectorStack');
new GridRegionSelectorReferenceDataStack(app, 'GridRegionSelectorRTeferenceDataStack', {
    usaEgridTable: gridRegionSelectorStack.usaEgridTable
});
