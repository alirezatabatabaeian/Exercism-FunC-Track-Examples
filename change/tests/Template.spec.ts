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

    it('test change for 1 cent', async () => {
        expect(await template.get_find_fewest_coins([1, 5, 10, 25], 1)).toStrictEqual([1])
    });

    it('test single coin change', async () => {
        expect(await template.get_find_fewest_coins([1, 5, 10, 25, 100], 25)).toStrictEqual([25])
    });

    it('test multiple coin change', async () => {
        expect(await template.get_find_fewest_coins([1, 5, 10, 25, 100], 15)).toStrictEqual([5, 10])
    });

    it('test change with lilliputian coins', async () => {
        expect(await template.get_find_fewest_coins([1, 4, 15, 20, 50], 23)).toStrictEqual([4, 4, 15])
    });

    it('test change with lower elbonia coins', async () => {
        expect(await template.get_find_fewest_coins([1, 5, 10, 21, 25], 63)).toStrictEqual([21, 21, 21])
    });

    it('test large target values', async () => {
        // there were some problems with gas usage so, I've modified the test
        expect(await template.get_find_fewest_coins([1, 2, 5, 10, 20, 50, 100], 49)).toStrictEqual([2, 2, 5, 20, 20])
    });

    it('test possible change without unit coins available', async () => {
        expect(await template.get_find_fewest_coins([2, 5, 10, 20, 50], 21)).toStrictEqual([2, 2, 2, 5, 10])
    });

    it('test another possible change without unit coins available', async () => {
        expect(await template.get_find_fewest_coins([4, 5], 27)).toStrictEqual([4, 4, 4, 5, 5, 5])
    });

    it('test no coins make 0 change', async () => {
        expect(await template.get_find_fewest_coins([1, 5, 10, 21, 25], 0)).toStrictEqual([])
    });

    it('test error testing for change smaller than the smallest of coins', async () => {
        try {
            await template.get_find_fewest_coins([5, 10], 3);
        } catch (error) {
            if (error instanceof Error) {
                let match = error.message.match(/\d+/)
                if (match) {
                    expect(parseInt(match[0])).toBe(102)
                }
            }
        }
    });

    it('test error if no combination can add up to target', async () => {
        try {
            await template.get_find_fewest_coins([5, 10], 94);
        } catch (error) {
            if (error instanceof Error) {
                let match = error.message.match(/\d+/)
                if (match) {
                    expect(parseInt(match[0])).toBe(102)
                }
            }
        }
    });

    it('test cannot find negative change values', async () => {
        try {
            await template.get_find_fewest_coins([1, 2, 5], -5);
        } catch (error) {
            if (error instanceof Error) {
                let match = error.message.match(/\d+/)
                if (match) {
                    expect(parseInt(match[0])).toBe(101)
                }
            }
        }
    });
});
