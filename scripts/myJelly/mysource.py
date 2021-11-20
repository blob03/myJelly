import sys
import os
import json

# load every key in the source language
# check the keys in all translations
# remove keys that only exist in translations

def sort(langdir, source):
	keysus = []
	orphans = []

	# Now that there is a myJelly subdir, we take care to load only files.
	# Also we now keep the source file in the list in order to have it sorted out with the lot.
	langlst = [f for f in os.listdir(langdir) if os.path.isfile(os.path.join(langdir, f))]
	print('Translation files: ')
	print(langlst)

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

	print('Number of orphans found: ' + str(len(orphans)))
	if str(len(orphans)):
		print(orphans)
		with open('orphans.txt', 'w') as out:
			for item in orphans:
				out.write(item + '\n')
			out.close()

	print('Done.')


cwd = os.getcwd()
langdir = cwd + '/../../src/strings/'
sort(langdir, 'en-us.json')
# Repeat the process for myJelly files.
langdir += 'myJelly/'
sort(langdir, 'en-us.json')
