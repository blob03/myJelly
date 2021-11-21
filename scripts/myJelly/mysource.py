#!/usr/bin/env python3
import sys
import os
import json

# Rename a set of dictionaries in order to have them match the codes return by a call to /Localization/cultures
# This allows to avoid converting them at runtime which is a waste of memory and cycles.
def rename(langdir, flag):
	langlst = {'ur_PK': 'ur', 'bg-bg': 'bg', 'be-by': 'be', 'bn_BD': 'bn', 'en-us': 'en', 'hi-in': 'hi', 'lt-lt': 'lt', 'nb': 'no', 'sl-si': 'sl', 'zh-cn': 'zh', 'es_DO': 'es-do', 'es_419': 'es-419'}
	
	with open('renamed.txt', flag) as out:
		nbr = 0
		for filename, BCP47 in langlst.items():
			orig = filename + '.json'
			dest = BCP47 + '.json'
			if (os.path.isfile(langdir + orig)):
				if (os.path.isfile(langdir + dest)):
					os.remove(langdir + dest)
				os.rename(langdir + orig, langdir + dest)			
				out.write(orig + ' renamed as ' + dest + '\n')
				nbr += 1
		out.close()
		print('Number of file renamed: ' + str(nbr))
		
# load every key in the source language
# check the keys in all translations
# remove keys that only exist in translations
def sort(langdir, source, flag):
	keysus = []
	orphans = []

	# Now that there is a myJelly subdir, we take care to load only files.
	# Also we now keep the source file in the list in order to have it sorted out with the lot.
	langlst = [f for f in os.listdir(langdir) if os.path.isfile(os.path.join(langdir, f))]
	print('\nFiles found: ' + str(len(langlst)))
	input('\npress ENTER when ready.\n')
	
	with open(langdir + source) as en:
		langus = json.load(en)
		for key in langus:
			keysus.append(key)

	for lang in langlst:
		with open(langdir + lang, 'r') as f:
			inde = 2
			if '\n    \"' in f.read():
				inde = 4
			f.close()
		with open(langdir + lang, 'r+') as f:
			langjson = json.load(f)
			langjnew = {}
			for key in langjson:
				if key in keysus:
					langjnew[key] = langjson[key]
				elif key not in orphans:
					orphans.append(key)
			f.seek(0)
			f.write(json.dumps(langjnew, indent=inde, sort_keys=True, ensure_ascii=False))
			f.write('\n')
			f.truncate()
			f.close()

	print('Orphans found: ' + str(len(orphans)))
	if len(orphans):
		print(orphans)
		with open('orphans.txt', flag) as out:
			for item in orphans:
				out.write(item + '\n')
			out.close()

cwd = os.getcwd()
print('#######################################')
langdir = cwd + '/../../src/strings/'
rename(langdir, 'w')
sort(langdir, 'en.json', 'w')
print('#######################################')
# Repeat the process for myJelly files.
langdir += 'myJelly/'
rename(langdir, 'a')
sort(langdir, 'en.json', 'a')
print('#######################################')
print('Done.')
