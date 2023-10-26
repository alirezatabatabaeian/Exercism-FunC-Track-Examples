import { toNano } from 'ton-core';
import { Template } from '../wrappers/Template';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const template = provider.open(Template.createFromConfig({}, await compile('Template')));

    await template.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(template.address);

    // run methods on `template`
}
