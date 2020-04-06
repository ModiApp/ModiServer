import { uniqueId, uniqueIds } from '../src/util';


describe('util tests:', () => {
    describe('uniqueId()', () => {
        test('generates a string of five random digits', () => {
            const id = uniqueId();
            expect(typeof id).toBe('string');
            expect(() => Number(id)).not.toThrow();
            expect(id.length).toBe(5);
        });
    });
    describe('uniqueId(["1","2","3"], 1)', () => {
        test('generates a random digit that is not 1, 2, or 3', () => {
            const call = () => uniqueId(["0", "1", "2", "3"], 1);
            expect(call().length).toBe(1);
            for (let i = 0; i < 1000; i++) {
                expect(Number(call())).toBeGreaterThan(3);
            }
        });
    });

    describe('uniqueIds(5)', () => {
        test('generates an array of 5 unique ids of ten random digits', () => {
            const ids = uniqueIds(5);
            expect(Array.from(new Set(ids))).toEqual(ids); // All unique
            expect(ids.length).toBe(5);
            expect(ids[0].length).toBe(10);
        });
    });
    describe('uniqueIds(5, 7)', () => {
        test('generates an array of 5 unique ids of seven random digits', () => {
            const ids = uniqueIds(5, 7);
            expect(Array.from(new Set(ids))).toEqual(ids); // All unique
            expect(ids.length).toBe(5);
            expect(ids[0].length).toBe(7);
        });
    });
});