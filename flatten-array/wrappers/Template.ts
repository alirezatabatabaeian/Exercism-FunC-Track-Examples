import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItem, TupleReader } from 'ton-core';

export type TemplateConfig = {};

export function templateConfigToCell(config: TemplateConfig): Cell {
    return beginCell().endCell();
}

type NestedList = (number | null | NestedList)[];

function nestedListIterator(arr: NestedList): TupleItem[] {
    let tuple: TupleItem[] = []
    for (const element of arr) {
        if (Array.isArray(element)) {
            tuple.push({ type: 'tuple', items: nestedListIterator(element) })
        } else {
            if (element === null) {
                tuple.push({ type: 'null' })
            } else if (typeof element === "number") {
                tuple.push({ type: 'int', value: BigInt(element) })
            }
        }
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

    async get_flatten(provider: ContractProvider, arr: NestedList) {
        const result = await provider.get('flatten', [{ type: 'tuple', items: nestedListIterator(arr) }]);
        return tupleReaderToList(result.stack.readTuple());
    }
}
