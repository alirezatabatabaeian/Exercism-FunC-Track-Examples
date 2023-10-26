import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type TemplateConfig = {};

export function templateConfigToCell(config: TemplateConfig): Cell {
    return beginCell().endCell();
}

export class Template implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Template(address);
    }

    static createFromConfig(config: TemplateConfig, code: Cell, workchain = 0) {
        const data = templateConfigToCell(config);
        const init = { code, data };
        return new Template(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async get_is_armstrong_number(provider: ContractProvider, number: number) {
        const result = await provider.get('is_armstrong_number', [{ type: 'int', value: BigInt(number) }]);
        return Number(result.stack.readBigNumber());
    }
}
