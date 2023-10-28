import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Template } from '../wrappers/Template';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Template', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Template');
    });

    let blockchain: Blockchain;
    let template: SandboxContract<Template>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        template = blockchain.openContract(Template.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await template.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: template.address,
            deploy: true,
            success: true,
        });
    });

    it('test date only specification of time', async () => {
        expect(await template.get_giga_second(2011, 4, 25, 0, 0, 0)).toStrictEqual([2043, 1, 1, 1, 46, 40])
    });

    it('test second test for date only specification of time', async () => {
        expect(await template.get_giga_second(1977, 6, 13, 0, 0, 0)).toStrictEqual([2009, 2, 19, 1, 46, 40])
    });

    it('test third test for date only specification of time', async () => {
        expect(await template.get_giga_second(1959, 7, 19, 0, 0, 0)).toStrictEqual([1991, 3, 27, 1, 46, 40])
    });

    it('test full time specified', async () => {
        expect(await template.get_giga_second(2015, 1, 24, 22, 0, 0)).toStrictEqual([2046, 10, 2, 23, 46, 40])
    });

    it('test full time with day roll over', async () => {
        expect(await template.get_giga_second(2015, 1, 24, 23, 59, 59)).toStrictEqual([2046, 10, 3, 1, 46, 39])
    });
});
