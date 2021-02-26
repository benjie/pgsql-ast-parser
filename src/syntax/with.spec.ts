import 'mocha';
import 'chai';
import { checkStatement, checkInvalidExpr } from './spec-utils';
import { expect } from 'chai';
import { SelectedColumn } from './ast';


describe('With clause', () => {

    checkStatement([`WITH sel AS (select v from data)
        SELECT v from sel`], {
        type: 'with',
        bind: [
            {
                alias: { name: 'sel' },
                statement: {
                    type: 'select',
                    from: [{ type: 'table', name: 'data' }],
                    columns: [{ expr: { type: 'ref', name: 'v' } }],
                }
            }
        ],
        in: {
            type: 'select',
            from: [{ type: 'table', name: 'sel' }],
            columns: [{ expr: { type: 'ref', name: 'v' } }],
        }
    });

    checkStatement([`WITH sel1 AS (select v from data)
            , sel2 AS (select v from data)
        SELECT v from sel`], {
        type: 'with',
        bind: [
            {
                alias: { name: 'sel1' },
                statement: {
                    type: 'select',
                    from: [{ type: 'table', name: 'data' }],
                    columns: [{ expr: { type: 'ref', name: 'v' } }],
                }
            }, {
                alias: { name: 'sel2' },
                statement: {
                    type: 'select',
                    from: [{ type: 'table', name: 'data' }],
                    columns: [{ expr: { type: 'ref', name: 'v' } }],
                }
            }
        ],
        in: {
            type: 'select',
            from: [{ type: 'table', name: 'sel' }],
            columns: [{ expr: { type: 'ref', name: 'v' } }],
        }
    });

    checkStatement([`WITH sel AS (select v from data)
                        SELECT * from sel s union (select * from sel);`], {
        type: 'with',
        bind: [
            {
                alias: { name: 'sel' },
                statement: {
                    type: 'select',
                    from: [{ type: 'table', name: 'data' }],
                    columns: [{ expr: { type: 'ref', name: 'v' } }],
                }
            }
        ],
        in: {
            type: 'union',
            left: {
                type: 'select',
                from: [{ type: 'table', name: 'sel', alias: 's' }],
                columns: [{ expr: { type: 'ref', name: '*' } }],
            },
            right: {
                type: 'select',
                from: [{ type: 'table', name: 'sel' }],
                columns: [{ expr: { type: 'ref', name: '*' } }],
            },
        }
    });


    const star: SelectedColumn = { expr: { type: 'ref', name: '*' } };
    checkStatement(`with a as (
        with b as (
          select 1
        ) select * from b
      ) select * from a`, {
        type: 'with',
        in: {
            type: 'select',
            columns: [star],
            from: [{ type: 'table', name: 'a' }]
        },
        bind: [{
            alias: { name: 'a' },
            statement: {
                type: 'with',
                bind: [{
                    alias: { name: 'b' },
                    statement: {
                        type: 'select',
                        columns: [{
                            expr: {
                                type: 'integer',
                                value: 1,
                            }
                        }],
                    },
                }],
                in: {
                    type: 'select',
                    columns: [star],
                    from: [{ type: 'table', name: 'b' }]
                },
            }
        }],
    })
});