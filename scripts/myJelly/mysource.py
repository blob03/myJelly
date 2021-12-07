#!/usr/bin/env python3
import sys
import os
import json
import math

# Rename a static set of dictionaries so that their names match the codes returned by a call to /Localization/cultures.
# This saves a conversion at runtime.
def rename(langdir, flag):
	langlst = {'ur_PK': 'ur-PK', 'bg-bg': 'bg-BG', 'be-by': 'be-BY', 'bn_BD': 'bn-BD', 'en-gb': 'en-GB', 'en-us': 'en-US', 'fr-ca': 'fr-CA', 
	'hi-in': 'hi-IN', 'is-is': 'is-IS', 'lt-lt': 'lt-LT', 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'sl-si': 'sl-SI', 'zh-tw': 'zh-TW', 'zh-hk': 'zh-HK', 
	'zh': 'zh-ZH', 'zh-cn': 'zh-CN', 'es_DO': 'es-DO', 'es_419': 'es-419', 'es-ar': 'es-AR', 'es-mx': 'es-MX'}
	
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
		
# Load all the keys present in the source file.
# Check whether these keys are defined inside every other translation.
# Delete keys which only exist in translations if any are found (so called 'orphans').
def sort(langdir, source, flag):
	orphans = []
	metadata = '';

	# Since we are now using a subdir 'myJelly', we must take care to load only files.
	# Also we conveniently keep the source file (en-US) in the list in order to have it sorted out with the lot.
	langlst = sorted([f for f in os.listdir(langdir) if (os.path.isfile(os.path.join(langdir, f)) and f != 'metadata.json')])
	print('\nFiles found: ' + str(len(langlst)))
	input('\npress ENTER when ready.\n')
	
	with open(langdir + source) as en:
		langus = json.load(en)
		en.close()
		
	with open(langdir + 'metadata.json', 'w+') as md, open('cultures.json') as cdata:
		cultures = json.load(cdata)
		for lang in langlst:
			with open(langdir + lang, 'r+') as f:
				print('checking ... ' + langdir + lang)
				keys = 0
				okeys = 0
				inde = 2
				if '\n    \"' in f.read():
					inde = 4
				f.seek(0)
				langjson = json.load(f)
				langjnew = {}
				for key in langjson:
					if key in langus:
						if key not in langjnew:
							keys += 1
						langjnew[key] = langjson[key]
					elif key not in orphans:
						orphans.append(key)
						okeys += 1
				f.seek(0)
				f.write(json.dumps(langjnew, indent=inde, sort_keys=True, ensure_ascii=False))
				f.write('\n')
				f.truncate()
				f.close()
			isSource = False
			if lang == source:
				isSource = True
			cultureCode = lang.split('.json')[0];
			xtraInfo = ''
			if cultureCode in cultures:
				xtraInfo = cultures[cultureCode]
			metadata += json.dumps({cultureCode: {'Culture': cultureCode, 'Filename': lang, 'displayName': xtraInfo['DisplayName'], 'displayNativeName': xtraInfo['DisplayNativeName'], 'isSource': isSource, 'Keys#': keys, 'Orphans#': okeys, 'Completed%': math.floor((keys/len(langus))*100)}}, indent=inde, sort_keys=False, ensure_ascii=False)			
			
		metadata = metadata.replace('\n}{', ',')
		md.write(metadata);
		
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
sort(langdir, 'en-US.json', 'w')
print('#######################################')
# Repeat the process for myJelly's files.
langdir += 'myJelly/'
rename(langdir, 'a')
sort(langdir, 'en-US.json', 'a')
print('#######################################')
print('Done.')
