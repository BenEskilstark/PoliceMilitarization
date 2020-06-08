# REQUIRES: httpie, GNU parallel, and all HTTP cookies served to the browser
# when logged into a trial account on Niinja (stored in 'niinja.cookie').

# Files involved:
# 'nsns.txt': A list of all NSNs in the DoD tx dataset, one per line, including
#   italics.
#
# 'niins.txt': (Generated) A list of all NIINs, produced from 'nsns.txt'. This
#   is really just the last 9 digits of an NSN.
#
# 'niinja.cookie': An example HTTP cookie from a trial account on Niinja. This
#   is neccessary to send in the header of the GET requests to Niinja's API
#   endpoints
#
# 'niinja.json': (Generated) The raw output of the API calls to Niinja. Not
#   valid JSON, but close.
#
# 'niinja.joblog': (Generated) GNU Parallel's joblog of the API calls. Enables
#   seeing which jobs failed, and allows the user to retry failed queries using
#   the '--resume' flag.
#
# 'niins.json': (Generated) The now-valid json object representing the 
#   result of the Niinja calls. It is a large object, keyed on NIIN.

# Halt if more than 20% of API queries fail, one process only, 1s between
# requests, use a joblog so that failed queries can be retried using
# GNU Parallel's --resume flag
P_OPTS = --halt soon,fail=20% -j1 --delay 1 --joblog niinja.joblog

all: niins.json

clean:
	@rm -rf niins.txt niinja.json niinja.joblog niins.json

# Convert the NSN's to NIIN's by removing hyphens and taking the last 9 digits
niins.txt: nsns.txt
	awk 'length($$0)==16{print $$0}' "$<" | cut -c 6-16 | tr -d '-' > $@

niinja.json: getNSN.sh niins.txt niinja.cookie
	parallel -v $(P_OPTS) ./getNSN.sh :::: niins.txt > "$@" 

# Take the API output, remove extraneous lines and failed queries,
# coalesce all the separate JSON objects into a large JSON object keyed on NIIN
niins.json: niinja.json
	grep -v 'getNSN\.sh' $< | grep -v '\[fail\]' | jq -s add > $@

.PRECIOUS: niinja.json niins.json # Don't delete these if a recipe fails

