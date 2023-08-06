import * as fs from 'fs';

import { OldItems } from './oldItems'
import * as NewItems from './items.json';

const NewItemsById = invertObject(NewItems);

const inputContents = fs.readFileSync("input.txt", "utf-8");
let outputContents = inputContents;

// First find all existing "Item.UPPERCASE" entries. Reverse because we need to work backwards
const foundOldItems = [...inputContents.matchAll(/Items\.([A-Z0-9_]+)/g)].reverse();

for (const match of foundOldItems)
{
    const oldItemName = match[1];

    // If the old item exists in the new lookup, and not the old lookup, we've probably already updated it
    if (NewItems[oldItemName] && !OldItems[oldItemName])
    {
        continue;
    }

    // If the old and new items names are the same, we don't need to do anything
    const itemId = OldItems[oldItemName];
    const newItemName = NewItemsById[itemId];
    if (oldItemName == newItemName)
    {
        continue;
    }

    const start = match.index;
    const length = match[0].length;
    console.log(`Replacing ${match[0]} with Items.${newItemName} at ${start} length ${length}`);
    outputContents = replaceSubstr(outputContents, start, length, `Items.${newItemName}`);
}

// Next, find all 24-character quoted hex IDs
const foundItemIds = [...outputContents.matchAll(/"([a-f0-9]{24})"/g)].reverse();

for (const match of foundItemIds)
{
    const oldItemId = match[1];

    // If the old itemId doesn't exist in the new item lookup, log an error
    if (!NewItemsById[oldItemId])
    {
        console.error(`[ERROR] ${oldItemId} is not a valid Item ID`);
        continue;
    }

    const newItemName = NewItemsById[oldItemId];
    const start = match.index;
    const length = match[0].length;
    console.log(`Replacing ${match[0]} with Items.${newItemName} at ${start} length ${length}`);
    outputContents = replaceSubstr(outputContents, start, length, `Items.${newItemName}`);
}

fs.writeFileSync("output.txt", outputContents, "utf-8");

function invertObject(data): any
{
    return Object.fromEntries(
        Object.keys(data).map((key) => [data[key], key])
    );
}

function replaceSubstr(input: string, index: number, length: number, substr: string): string
{
    return input.substring(0, index) + substr + input.substring(index + length);
}
