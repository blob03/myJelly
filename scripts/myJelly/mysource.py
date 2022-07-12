#!/usr/bin/env python3
import sys
import os
import json
import math
import re
from datetime import datetime

# Rename a static set of dictionaries so that their names match those returned by a call to /Localization/cultures.
# This saves a conversion at runtime.
def rename(subdir, flag):
	langlst = {'ur_PK': 'ur-PK', 'bg-bg': 'bg-BG', 'be-by': 'be-BY', 'bn_BD': 'bn-BD', 'en-gb': 'en-GB', 'en-us': 'en-US', 'fr-ca': 'fr-CA', 
	'hi-in': 'hi-IN', 'is-is': 'is-IS', 'lt-lt': 'lt-LT', 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'sl-si': 'sl-SI', 'zh-tw': 'zh-TW', 'zh-hk': 'zh-HK', 
	'zh': 'zh-ZH', 'zh-cn': 'zh-CN', 'es_DO': 'es-DO', 'es_419': 'es-419', 'es-ar': 'es-AR', 'es-mx': 'es-MX'}
	cwd = os.getcwd()
	basedir = cwd + "/../../src/strings/"
	langdir = basedir + subdir
	
	with open('renamed.txt', flag) as out:
		nbr = 0
		for filename, BCP47 in langlst.items():
			orig = filename + '.json'
			dest = BCP47 + '.json'
			if (os.path.isfile(langdir + orig)):
				if (os.path.isfile(langdir + dest)):
					os.remove(langdir + dest)
				print('Renaming \'' + orig + '\' as \'' + dest + '\'.')
				os.rename(langdir + orig, langdir + dest)
				nbr += 1
		out.close()
		print('Number of file renamed: ' + str(nbr) + '.')
		
# Load all the keys present in the source file.
# Check whether these keys are defined inside every translation.
# Delete keys which only exist in translations if any are found (so called 'orphans').
def sort(subdir, source, mod, langlst):
	cwd = os.getcwd()
	basedir = cwd + "/../../src/strings/"
	langdir = basedir + subdir
	metafilename = "metadata.json"
	metafile = basedir + metafilename
	metadata = ''
	indent = 4
	metatree = {}
	sourceFile = source + ".json"
	
	try:
		with open(metafile, 'r') as m:
			print('Reading existing metadata file \"metafile.json\".')
			metatree = json.load(m)
			m.close()
	except FileNotFoundError:
		print('No file \"metafile.json\" found.')
			
	with open(langdir + sourceFile) as en:
		langus = json.load(en)
		en.close()
			
	with open('cultures.json') as cdata:
		print('Loading database of cultures.')
		cultures = json.load(cdata)
		cdata.close()
			
	for lang in langlst:
		with open(langdir + lang, 'r+') as f:
			print('Checking dictionary: ' + langdir + lang)
			#lastm = datetime.fromtimestamp(os.path.getmtime(langdir + lang)).strftime('%Y-%m-%d %H:%M:%S')
			lastm = os.path.getmtime(langdir + lang)
			fsize = os.path.getsize(langdir + lang)
			print('Last modified: ' + str(lastm))
			orphans = []
			keys = 0
			okeys = 0
			dup = 0
			nbsp = 0
			trans_old = json.load(f)
			trans_new = {}
			for key in trans_old:
				if key in langus:
					if key not in trans_new:
						keys += 1
					else:
						dup += 1
					# For French dictionaries,
					# replace every found regular space or tabulation preceding a special set of punctuation marks 
					# with a non-breakable space.
					if lang == 'fr.json':
						x = len(re.findall("[\x20\t]+[:?!;]", trans_old[key]))
						if x > 0:
							trans_old[key] = re.sub("[\x20\t]+([:?!;])", '\xa0' + r'\1', trans_old[key])
							nbsp += x
					trans_new[key] = trans_old[key]
				elif key not in orphans:
					orphans.append(key)
					okeys += 1
			f.seek(0)
			f.write(json.dumps(trans_new, indent=indent, sort_keys=True, ensure_ascii=False))
			f.write('\n')
			f.truncate()
			f.close()

			if (dup):
				print('Duplicates: ' + str(dup))
			if (nbsp):
				print('Non breakable space replacement: ' + str(nbsp))
			if (okeys):
				print('Orphan keys removed: ' + str(okeys))
				
			ccode = lang.split('.json')[0];

			try:
				metatree[ccode]
			except KeyError:
				metatree[ccode] = {
					"ccode": ccode,
					"lastm": lastm,
					"fsize": fsize,
					"ccodeSrc": source,
					"displayName": "",
					"displayNativeName": "",
					"ISO6391": "",
					"ISO6392": "",
					"keys#": 0,
					"completed%": 0,
					"jellyfinWeb": {
						"filename": "",
						"keys#": 0,
						"orphans#": 0,
						#"orphans": [],
						"completed%": 0
					},
					"myJelly": {
						"filename": "",
						"keys#": 0,
						"orphans#": 0,
						#"orphans": [],
						"completed%": 0
					}
				}	
			metatree[ccode]['ccode'] = ccode
			metatree[ccode]['ccodeSrc'] = source
			if ccode in cultures:
				metatree[ccode]['displayName'] = cultures[ccode]['DisplayName']
				metatree[ccode]['displayNativeName'] = cultures[ccode]['DisplayNativeName']
				metatree[ccode]['ISO6391'] = cultures[ccode]['TwoLetterISOLanguageName']
				metatree[ccode]['ISO6392'] = cultures[ccode]['ThreeLetterISOLanguageName']
				
			metatree[ccode][mod]['filename'] = lang
			metatree[ccode][mod]['keys#'] = keys
			metatree[ccode]['keys#'] += keys
			metatree[ccode][mod]['orphans#'] = okeys
			#metatree[ccode][mod]['orphans'] = orphans
			metatree[ccode][mod]['completed%'] = float("{:,.2f}".format(keys*100/len(langus)).replace(".00",""))
			metatree[ccode]['completed%'] = float("{:,.2f}".format(metatree[ccode]['keys#']*100/metatree[source]['keys#']).replace(".00",""))
	
	with open(metafile, 'w+') as m:
		print('Overwriting metadata file \"metafile.json\".')
		m.write(json.dumps(metatree, indent=indent, sort_keys=False, ensure_ascii=False))
		m.close()


cwd = os.getcwd()
basedir = cwd + "/../../src/strings/"
metafile = basedir + "metadata.json"

if os.path.exists(metafile):
	os.remove(metafile)
	
subdir = ''
rename(subdir, 'w')

print('#######################################')
# We check the source file (en-US) first since we need this data to determine the progress of other dictionaries.
langlst = ["en-US.json"]
sort('', 'en-US', 'jellyfinWeb', langlst)
sort('myJelly/', 'en-US', 'myJelly', langlst)
print('#######################################')
print('#######################################')
# We take care to load only files and to remove the source file.
langlst = sorted([f for f in os.listdir(basedir) if (os.path.isfile(os.path.join(basedir, f)))])
langlst.remove("en-US.json")
langlst.remove("metadata.json")
sort('', 'en-US', 'jellyfinWeb', langlst)
langdir = basedir + 'myJelly/'
langlst = sorted([f for f in os.listdir(langdir) if (os.path.isfile(os.path.join(langdir, f)))])
langlst.remove("en-US.json")
sort('myJelly/', 'en-US', 'myJelly', langlst)
print('#######################################')
print('Done.')
