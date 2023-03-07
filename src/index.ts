import type { Next, DefaultContext } from 'koa';

export type RangeOp = 'gt' | 'gte' | 'lt' | 'lte';
export type Value = string | number | boolean | null | undefined;
export type QueryRange = [RangeOp, string | number];
export type QuerySet = QueryRange | ['or' | 'not' | 'not like', Value | Value[]];

export function smartCast(value: any): Value {
    if (typeof value !== 'string') return value;

    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    if (value === 'null') {
        return null;
    }

    /*
     * match strings
     */
    const matches = value.match(/^['"](.*)['"]$/);
    if (matches) {
        return matches[1];
    }

    if (value === '') {
        return '';
    }

    const n = Number(value);
    if (!isNaN(n)) return n;

    return value;
}

function numberOrString(s: string) {
    const n = Number(s);
    return isNaN(n) ? s : n;
}

const REGEX_RANGE = /^\s*([\(\[])\s*([^,\s]*)\s*,\s*([^,\s]*)\s*([\)\]])\s*$/im;
const REGEX_COLLECTION = /^\s*\{\s*(.+)\s*\}\s*$/im;

export function parseSet(set: string) {
    let matches;

    matches = REGEX_RANGE.exec(set);
    if (matches) {
        const range: QueryRange[] = [];
        if (matches[2]) {
            const lop = matches[1] === '(' ? 'gt' : 'gte';
            range.push([lop, numberOrString(matches[2])]);
        }

        if (matches[3]) {
            const rop = matches[4] === ')' ? 'lt' : 'lte';
            range.push([rop, numberOrString(matches[3])]);
        }
        return range;
    }

    matches = REGEX_COLLECTION.exec(set);
    if (matches) {
        return [
            [
                'or',
                matches[1]
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s !== '')
                    .map((s) => smartCast(s)),
            ] as QuerySet,
        ];
    }

    if (set === '') return '';

    let not = false,
        or = false;

    if (set.startsWith('!')) {
        not = true;
        set = set.slice(1);
    } else if (set.startsWith('|')) {
        or = true;
        set = set.slice(1);
    }

    const items = set.split(',').map((s) => s.trim());
    let value: Value | Value[] = items.length > 1 ? items.map((s) => smartCast(s)) : smartCast(items[0]);
    if (typeof value === 'string' && value !== '') {
        const valueWithWildCard = value.indexOf('*') >= 0 ? value : `*${value}*`;
        return [[not ? 'not like' : 'like', valueWithWildCard] as QuerySet];
    }

    if (not) {
        return [['not', value] as QuerySet];
    }

    return or ? [['or', value] as QuerySet] : value;
}

export default function QuerySet<T = DefaultContext>() {
    return (ctx: T, next: Next) => {
        const query = (ctx as any).request.query;
        if (query) {
            Object.keys(query).forEach((k) => {
                const v = query[k];
                if (k.length > 1 && k.endsWith('$') && typeof v === 'string') {
                    query[k.slice(0, -1)] = parseSet(v);
                    delete query[k];
                }
            });
        }
        return next();
    };
}
