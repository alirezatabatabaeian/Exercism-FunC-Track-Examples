import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItem } from 'ton-core';

export type TemplateConfig = {};

export function templateConfigToCell(config: TemplateConfig): Cell {
    return beginCell().endCell();
}

export class Template implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

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

    async get_binary_search(provider: ContractProvider, element_list: number[], value: number) {
        let search_list: TupleItem[] = []
        for (var element of element_list) { search_list.push({ type: 'int', value: BigInt(element) }) }

        const result = await provider.get('binary_search',
            [{ type: 'tuple', items: search_list },
            { type: 'int', value: BigInt(value) }]);

        return Number(result.stack.readBigNumber());
    }

}
