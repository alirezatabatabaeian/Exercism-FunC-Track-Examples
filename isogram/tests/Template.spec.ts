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

    let True = -1;
    let False = 0;

    it('test empty string', async () => {
        expect(await template.get_is_isogram("")).toBe(True)
    });

    it('test isogram with only lower case characters', async () => {
        expect(await template.get_is_isogram("isogram")).toBe(True)
    });

    it('test word with one duplicated character', async () => {
        expect(await template.get_is_isogram("eleven")).toBe(False)
    });

    it('test word with one duplicated character from the end of the alphabet', async () => {
        expect(await template.get_is_isogram("zzyzx")).toBe(False)
    });

    it('test longest reported english isogram', async () => {
        expect(await template.get_is_isogram("subdermatoglyphic")).toBe(True)
    });

    it('test word with duplicated character in mixed case', async () => {
        expect(await template.get_is_isogram("Alphabet")).toBe(False)
    });

    it('test word with duplicated character in mixed case lowercase first', async () => {
        expect(await template.get_is_isogram("alphAbet")).toBe(False)
    });

    it('test hypothetical isogrammic word with hyphen', async () => {
        expect(await template.get_is_isogram("thumbscrew-japingly")).toBe(True)
    });

    it('test hypothetical word with duplicated character following hyphen', async () => {
        expect(await template.get_is_isogram("thumbscrew-jappingly")).toBe(False)
    });

    it('test isogram with duplicated hyphen', async () => {
        expect(await template.get_is_isogram("six-year-old")).toBe(True)
    });

    it('test made up name that is an isogram', async () => {
        expect(await template.get_is_isogram("Emily Jung Schwartzkopf")).toBe(True)
    });

    it('test duplicated character in the middle', async () => {
        expect(await template.get_is_isogram("accentor")).toBe(False)
    });

    it('test same first and last characters', async () => {
        expect(await template.get_is_isogram("angola")).toBe(False)
    });

    it('test word with duplicated character and with two hyphens', async () => {
        expect(await template.get_is_isogram("up-to-date")).toBe(False)
    });
});
