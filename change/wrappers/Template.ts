import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItem, TupleReader } from 'ton-core';

export type TemplateConfig = {};

export function templateConfigToCell(config: TemplateConfig): Cell {
    return beginCell().endCell();
}

function nestedListIterator(arr: number[]): TupleItem[] {
    let tuple: TupleItem[] = []
    for (const element of arr) {
        tuple.push({ type: 'int', value: BigInt(element) })
    }
    return tuple;
}

function tupleReaderToList(tuple: TupleReader): number[] {
    let arr: number[] = []
    let length: number = tuple.remaining
    for (let i = 0; i < length; i++) {
        arr.push(Number(tuple.readBigNumber()))
    }
    return arr
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

    async get_find_fewest_coins(provider: ContractProvider, coins: number[], target: number) {
        const result = await provider.get('find_fewest_coins', [
            { type: 'tuple', items: nestedListIterator(coins) },
            { type: 'int', value: BigInt(target) }]);

        return tupleReaderToList(result.stack.readTuple());
    }
}
