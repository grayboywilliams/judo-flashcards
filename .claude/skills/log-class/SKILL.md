---
name: log-class
description: Log a judo class session - update class notes, checklist, and technique files
disable-model-invocation: true
argument-hint: date - what we did
---

Log a judo class session. The user will provide what they did in class as $ARGUMENTS.

## Current level

- **Belt level**: yonkyu (orange)
- **Checklist file**: `notes/checklist.txt`
- **Technique CSV**: `study/yonkyu/technique.csv`

When advancing to the next belt, update these three values.

## Instructions

Ask the user the following questions (use AskUserQuestion):

1. **Date and summary**: If not provided in the arguments, ask for the date (M/D format) and a short summary of what was covered in class.
2. **Duration**: Ask how long the class was, defaulting to 1.5 hours.
3. **New techniques**: Ask if any new techniques for the current level were learned that should be checked off. Show the unchecked items (marked with ◦) from the checklist file as options.
4. **Technique details**: For any newly checked techniques, ask for a short description of how to perform them (for the technique CSV flashcard back).

## Files to update

### 1. Class log: `notes/classes.txt`

- Add a new date entry in the format: `M/D - summary of what was done`
- The entry goes after the last date entry in the current month's section
- If the class duration is NOT 1.5 hours, append ` (Xh)` to the entry
- Update the running totals at the bottom of the current month section in the format `(XXh YY)` where XX is total hours and YY is total classes
  - Add the class duration (default 1.5h) to the hours total
  - Add 1 to the class count
  - If a totals line already exists for the current month, update it. Otherwise create one.

### 2. Checklist (see current level above)

- Only update if new techniques were learned
- Change ◦ to ✓ for any techniques the user confirms they learned

### 3. Technique CSV (see current level above)

- Only update if new techniques were learned AND the user provides descriptions
- Add or update rows in CSV format: `"Front","Back"` with the technique name and description
- If the technique already exists with "(will add details later)", replace that placeholder with the real description

## Important notes

- Always read the current state of files before modifying them.
- Keep entries consistent with the existing format and style.
- Do NOT commit changes - just make the edits.
