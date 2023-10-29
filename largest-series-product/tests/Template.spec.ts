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

    it('test finds the largest product if span equals length', async () => {
        expect(await template.get_largest_series_product("29", 2)).toBe(18)
    });

    it('test can find the largest product of 2 with numbers in order', async () => {
        expect(await template.get_largest_series_product("0123456789", 2)).toBe(72)
    });

    it('test can find the largest product of 2', async () => {
        expect(await template.get_largest_series_product("576802143", 2)).toBe(48)
    });

    it('test can find the largest product of 3 with numbers in order', async () => {
        expect(await template.get_largest_series_product("0123456789", 3)).toBe(504)
    });

    it('test can find the largest product of 3', async () => {
        expect(await template.get_largest_series_product("1027839564", 3)).toBe(270)
    });

    it('test can find the largest product of 5 with numbers in order', async () => {
        expect(await template.get_largest_series_product("0123456789", 5)).toBe(15120)
    });

    it('test can get the largest product of a big number', async () => {
        expect(await template.get_largest_series_product("73167176531330624919225119674426574742355349194934", 6)).toBe(23520)
    });

    it('test reports zero if the only digits are zero', async () => {
        expect(await template.get_largest_series_product("0000", 2)).toBe(0)
    });

    it('test reports zero if all spans include zero', async () => {
        expect(await template.get_largest_series_product("99099", 3)).toBe(0)
    });
});
