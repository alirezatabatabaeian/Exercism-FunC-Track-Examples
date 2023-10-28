import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItem } from 'ton-core';

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

    async get_flatten(provider: ContractProvider) {
        let _tuple: TupleItem[] = [];
        let inner_tuple: TupleItem[] = [];
        _tuple.push({ type: 'int', value: BigInt(1) });
        inner_tuple.push({ type: 'null' });
        inner_tuple.push({ type: 'int', value: BigInt(2) });
        inner_tuple.push({ type: 'null' });
        _tuple.push({ type: 'tuple', items: inner_tuple });
        const result = await provider.get('flatten', [{ type: 'tuple', items: _tuple }]);
        return result.stack.readTuple();
    }
}
