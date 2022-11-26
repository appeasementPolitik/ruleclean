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

// Make list of all used css values including commons, and a count of their usage. 
// A new list entry is also introduced called Temp, which holds the raw css value of the currently used commons for later processing.
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

					rules[url]['temp'] = css;

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

// Sort the array based on its usage count in descending order.
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

// Re-adds the commons values to the rules based on the sorted count array and removes Temp entries.
for (const [url, ruleTypes] of Object.entries(rules)) {
	var commonsS = '';
	var commonsTemp = '';

	// In this entry, store new commons index of ruleType css values only if it exists in the new commons list.
	for (const [ruleType, value] of Object.entries(ruleTypes)) {
		if (ruleType == 's') {
			for (let i = 0; i < sortedCount.length; i++) {
				if (value == sortedCount[i][1]) {
					commonsS = i

					break;
				}
			}
		} else if (ruleType == 'temp') {
			for (let i = 0; i < sortedCount.length; i++) {
				if (value == sortedCount[i][1]) {
					commonsTemp = i
					delete rules[url]['temp'];

					break;
				}
			}
		}
	}

	// Remove and set rulesType based on if commons exist for css values,
	// and also andle the rare case where both Temp and S are set and both have commons.
	// In this case the longest css is used. If length is the same, commons for S is used.
	if (commonsS !== '' && commonsTemp !== '') {
		if (commonsS == commonsTemp) {
			delete rules[url]['s'];
		} else if (sortedCount[commonsS][1].length >= sortedCount[commonsTemp][1].length) {
			rules[url]['c'] = commonsS;
		} else {
			rules[url]['c'] = commonsTemp;
		}
	} else if (commonsS !== '') {

		rules[url]['c'] = commonsS;
		delete rules[url]['s'];

	} else if (commonsTemp !== '') {
		rules[url]['c'] = commonsTemp;
	}
}

// Convert sortedCount array to newCommons list
for (let i = 0; i < sortedCount.length; i++) {
	newCommons[i] = sortedCount[i][1];
}

// Uncomment one of these to generate either new commons or new rule entries
//console.log(newCommons);
//console.log(rules);
