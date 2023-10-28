import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

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

    async get_giga_second(provider: ContractProvider, year: number, month: number, day: number, hour: number, minute: number, second: number) {
        const result = await provider.get('giga_second', [
            { type: 'int', value: BigInt(year) },
            { type: 'int', value: BigInt(month) },
            { type: 'int', value: BigInt(day) },
            { type: 'int', value: BigInt(hour) },
            { type: 'int', value: BigInt(minute) },
            { type: 'int', value: BigInt(second) },]);

        return [
            Number(result.stack.readBigNumber()),
            Number(result.stack.readBigNumber()),
            Number(result.stack.readBigNumber()),
            Number(result.stack.readBigNumber()),
            Number(result.stack.readBigNumber()),
            Number(result.stack.readBigNumber())
        ];
    }
}
