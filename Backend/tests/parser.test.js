import { parseSearchQuery } from "../utils/searchParser.js";

/**
 * Concepts Implemented:
 * 1. Static Checking and Testing: Unit Testing.
 *    This script tests the searchParser logic with various test cases (Partitioning).
 */

const runTests = () => {
    console.log("Running Parser Tests...\n");

    const testCases = [
        {
            name: "Simple Text Search",
            input: "vacation",
            expected: [{ type: 'TEXT', text: 'vacation' }]
        },
        {
            name: "Tag Filter",
            input: "tag:nature",
            expected: [{ type: 'FILTER', field: 'tag', value: 'nature' }]
        },
        {
            name: "Combined Filter and Text",
            input: "tag:fun trip",
            expected: [
                { type: 'FILTER', field: 'tag', value: 'fun' },
                { type: 'TEXT', text: 'trip' }
            ]
        },
        {
            name: "Quoted String",
            input: 'title:"My Best Trip"',
            expected: [{ type: 'FILTER', field: 'title', value: 'My Best Trip' }]
        }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach((test, index) => {
        try {
            const result = parseSearchQuery(test.input);
            const jsonResult = JSON.stringify(result);
            const jsonExpected = JSON.stringify(test.expected);

            if (jsonResult === jsonExpected) {
                console.log(`✅ Test ${index + 1}: ${test.name} PASSED`);
                passed++;
            } else {
                console.log(`❌ Test ${index + 1}: ${test.name} FAILED`);
                console.log(`   Expected: ${jsonExpected}`);
                console.log(`   Actual:   ${jsonResult}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1}: ${test.name} CRASHED`);
            console.error(error);
            failed++;
        }
    });

    console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);
};

runTests();
