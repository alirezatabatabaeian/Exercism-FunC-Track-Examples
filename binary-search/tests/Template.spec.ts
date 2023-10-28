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

    it('test finds a value in an array with one element', async () => {
        expect(await template.get_binary_search([6], 6)).toBe(0)
    });

    it('test finds a value in the middle of an array', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 6)).toBe(3)
    });

    it('test finds a value at the beginning of an array', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 1)).toBe(0)
    });

    it('test finds a value at the end of an array', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 11)).toBe(6)
    });

    it('test finds a value in an array of odd length', async () => {
        expect(await template.get_binary_search([1, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 634], 144)).toBe(9)
    });

    it('test finds a value in an array of even length', async () => {
        expect(await template.get_binary_search([1, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377], 21)).toBe(5)
    });

    it('test identifies that a value is not included in the array', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 7)).toBe(-1)
    });

    it('test a value smaller than the array\'s smallest value is not found', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 0)).toBe(-1)
    });

    it('test a value larger than the array\'s largest value is not found', async () => {
        expect(await template.get_binary_search([1, 3, 4, 6, 8, 9, 11], 13)).toBe(-1)
    });

    it('test nothing is found in an empty array', async () => {
        expect(await template.get_binary_search([], 1)).toBe(-1)
    });

    it('test nothing is found when the left and right bounds cross', async () => {
        expect(await template.get_binary_search([1, 2], 0)).toBe(-1)
    });
});
