describe('parseSet', () => {
    const QuerySet = import('../lib/index.js');
    it('should parse built-in types', async () => {
        const { parseSet } = await QuerySet;
        expect(parseSet('1')).toBe(1);
        expect(parseSet('1.0')).toBe(1.0);
        expect(parseSet('true')).toBe(true);
        expect(parseSet('false')).toBe(false);
        expect(parseSet('null')).toBe(null);
        expect(parseSet('')).toBe('');
    });

    it('should parse range', async () => {
        const { parseSet } = await QuerySet;
        expect(parseSet('[1,)')).toEqual([['gte', 1]]);
        expect(parseSet('(1,)')).toEqual([['gt', 1]]);
        expect(parseSet('(,1)')).toEqual([['lt', 1]]);
        expect(parseSet('(,1]')).toEqual([['lte', 1]]);
        expect(parseSet('(1,3]')).toEqual([['gt', 1], ['lte', 3]]);
        expect(parseSet('[1,3)')).toEqual([['gte', 1], ['lt', 3]]);
    });

    it('should parse set', async () => {
        const { parseSet } = await QuerySet;
        expect(parseSet('1,2,3m')).toEqual([1, 2, '3m']);
        expect(parseSet('{1,2,3m}')).toEqual([['or', [1, 2, '3m']]]);
        expect(parseSet('|1,2,3m')).toEqual([['or', [1, 2, '3m']]]);
    });

    it('should parse not', async () => {
        const { parseSet } = await QuerySet;
        expect(parseSet('!true')).toEqual([['not', true]]);
        expect(parseSet('!1,2,3')).toEqual([['not', [1, 2, 3]]]);
        expect(parseSet('!')).toEqual([['not', '']]);
    });

    it('should parse pattern', async () => {
        const { parseSet } = await QuerySet;
        expect(parseSet('*')).toEqual([['like', '*']]);
        expect(parseSet('abc')).toEqual([['like', '*abc*']]);
        expect(parseSet('*abc*def*')).toEqual([['like', '*abc*def*']]);
        expect(parseSet('!*abc*def*')).toEqual([['not like', '*abc*def*']]);
        expect(parseSet('!a*,2*')).toEqual([['not', ['a*', '2*']]]);
        expect(parseSet('|a*,b*')).toEqual([['or', ['a*', 'b*']]]);
    });
});
