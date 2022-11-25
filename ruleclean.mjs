#!/usr/bin/env node
//
// Generate new commons based on amount of usage in rules, and alter rules to reflect new commons.
//
// Instructions:
//	- Go to directory where rules.js is located
//	- Rename rules.js to rules.mjs
//	- Go to the end of the script, and uncomment which option you want to generate
//	- Run script with node

import { commons } from './rules.mjs';
import { rules } from './rules.mjs';

// Stores css usage count
const count = {};

// Stores new commons list
const newCommons = {};

// Make list of all used css values including commons, and a count of their usage. Also replace existing
// commons values in the rules list with its raw css.
for (const [url, ruleTypes] of Object.entries(rules)) {
	for (const [ruleType, value] of Object.entries(ruleTypes)) {
		if (ruleType == 'c') {
			for (const[index, css] of Object.entries(commons)) {
				if (value == index) {
					if (count[css]) {
						count[css] += 1;
					} else {
						count[css] = 1;
					}

					rules[url]['t'] = css;

					break;
				}
			}
		} else if (ruleType == 's') {
			if (count[value]) {
				count[value] += 1;
			} else {
				count[value] = 1;
			}
		}
	}
}

// Make an array of count, keeping only css rules that are used at least 4 times.
const countArr = Object.keys(count).reduce((countArr, key) => {
 	if (count[key] >= 4) {
 		countArr.push([ count[key], key ]);
	}
	return countArr;
}, [])

// Sort the array based on its usage count, in descending order.
const sortedCount = countArr.sort((a, b) => b[0] - a[0]);

// Print whole sorted count array for debugging
/*
const debugCountArr = Object.keys(count).reduce((debugCountArr, key) => {
 	debugCountArr.push([ count[key], key ]);
	return debugCountArr;
}, [])

const sortedDebugCount = debugCountArr.sort((a, b) => b[0] - a[0]);

sortedDebugCount.forEach((element) => {
	console.log(element);
});
*/

// Re-adds the commons values based on the sorted count array.
for (const [url, ruleTypes] of Object.entries(rules)) {
	var commonsS = '';
	var commonsT = '';

	for (const [ruleType, value] of Object.entries(ruleTypes)) {
		if (ruleType == 's') {
			for (let i = 0; i < sortedCount.length; i++) {
				if (value == sortedCount[i][1]) {
					commonsS = i

					break;
				}
			}
		} else if (ruleType == 't') {
			for (let i = 0; i < sortedCount.length; i++) {
				if (value == sortedCount[i][1]) {
					commonsT = i

					break;
				}
			}
		}
	}

	// Also handle the rare case where both C and S are set and both have commons,
	// in this case the longest css is used. If length is the same, commons for S is used.
	if (commonsS !== '' && commonsT !== '') {
		if (sortedCount[commonsS][1].length >= sortedCount[commonsT][1].length) {
			rules[url]['c'] = commonsS;
		} else {
			rules[url]['c'] = commonsT;
		}

		if (sortedCount[commonsS][1] == sortedCount[rules[url]['c']][1]) {
			delete rules[url]['s'];
		}
	} else if (commonsS !== '') {

		rules[url]['c'] = commonsS;
		delete rules[url]['s'];

	} else if (commonsT !== '') {
		rules[url]['c'] = commonsT;
	}

	delete rules[url]['t'];
}

// Convert sortedCount array to newCommons list
for (let i = 0; i < sortedCount.length; i++) {
	newCommons[i] = sortedCount[i][1];
}

// Uncomment one of these to generate either new commons or new rule entries
//console.log(newCommons);
//console.log(rules);
